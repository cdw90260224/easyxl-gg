import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export interface SelectionContext {
    selectedData: any[][];
    rangeCoords: {
        startRow: number;
        startCol: number;
        endRow: number;
        endCol: number;
    } | null;
}

export interface AIAnalysisResult {
    intent: 'calculation' | 'filtering' | 'generation' | 'update';
    explanation: string;
    formula?: string;
    operation?: 'sum' | 'count' | 'average' | 'max' | 'min' | 'none';
    targetColumn?: string;
    filterColumn?: string;
    filterValue?: string;
    filterOperator?: 'equals' | 'contains' | 'greater' | 'less';
    generatedData?: any[];
    updates?: Array<{ row: number; col: number; value: any }>;
    unit?: string;
    calculatedValue?: number | string;
}

export const processNaturalLanguageQuery = async (
    query: string,
    columns: string[],
    fullData: any[],
    selection?: SelectionContext
): Promise<AIAnalysisResult> => {

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
        throw new Error('VITE_GEMINI_API_KEY가 설정되지 않았습니다.');
    }

    // ── 선택 영역 계산은 클라이언트에서 직접 처리 (무료 + 빠름) ──
    if (selection?.selectedData && selection.selectedData.length > 0) {
        const lq = query.toLowerCase();
        const flatNums = selection.selectedData.flat()
            .map(v => parseFloat(String(v).replace(/[^0-9.-]/g, '')))
            .filter(v => !isNaN(v));

        if (flatNums.length > 0) {
            if (lq.includes('합계') || lq.includes('sum') || lq.includes('합산') || lq.includes('더해')) {
                const total = flatNums.reduce((a, b) => a + b, 0);
                return { intent: 'calculation', operation: 'sum', calculatedValue: Math.round(total * 100) / 100, explanation: `선택한 ${flatNums.length}개 셀의 합계입니다.`, unit: '' };
            }
            if (lq.includes('평균') || lq.includes('average') || lq.includes('avg')) {
                const avg = flatNums.reduce((a, b) => a + b, 0) / flatNums.length;
                return { intent: 'calculation', operation: 'average', calculatedValue: Math.round(avg * 100) / 100, explanation: `선택한 ${flatNums.length}개 셀의 평균입니다.`, unit: '' };
            }
            if (lq.includes('최대') || lq.includes('최고') || lq.includes('max')) {
                return { intent: 'calculation', operation: 'max', calculatedValue: Math.max(...flatNums), explanation: `선택한 범위의 최댓값입니다.`, unit: '' };
            }
            if (lq.includes('최소') || lq.includes('최저') || lq.includes('min')) {
                return { intent: 'calculation', operation: 'min', calculatedValue: Math.min(...flatNums), explanation: `선택한 범위의 최솟값입니다.`, unit: '' };
            }
            if (lq.includes('개수') || lq.includes('count') || lq.includes('몇')) {
                return { intent: 'calculation', operation: 'count', calculatedValue: flatNums.length, explanation: `선택한 범위의 숫자 셀 개수입니다.`, unit: '개' };
            }
            const percentMatch = lq.match(/(\d+(?:\.\d+)?)\s*%\s*(인상|올려|증가|up)/);
            const percentDownMatch = lq.match(/(\d+(?:\.\d+)?)\s*%\s*(인하|내려|감소|down)/);
            const multipleMatch = lq.match(/(\d+(?:\.\d+)?)\s*(배|times)/);
            if (percentMatch || percentDownMatch || multipleMatch) {
                const multiplier = percentMatch
                    ? 1 + parseFloat(percentMatch[1]) / 100
                    : percentDownMatch
                        ? 1 - parseFloat(percentDownMatch[1]) / 100
                        : parseFloat(multipleMatch![1]);
                const updates: Array<{ row: number; col: number; value: any }> = [];
                selection.selectedData.forEach((rowArr, ri) => {
                    rowArr.forEach((val, ci) => {
                        const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
                        if (!isNaN(num) && selection.rangeCoords) {
                            updates.push({
                                row: selection.rangeCoords.startRow + ri,
                                col: selection.rangeCoords.startCol + ci,
                                value: Math.round(num * multiplier * 100) / 100
                            });
                        }
                    });
                });
                const label = percentMatch ? `${percentMatch[1]}% 인상` : percentDownMatch ? `${percentDownMatch[1]}% 인하` : `${multipleMatch![1]}배`;
                return { intent: 'update', updates, explanation: `선택한 셀 ${updates.length}개를 ${label}했습니다.` };
            }
        }
    }

    // ── Gemini API 호출 (복잡한 명령) ──
    const systemPrompt = `당신은 EasyXL.GG의 AI 엑셀 에이전트입니다.
사용자의 자연어 쿼리를 분석하여 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

응답 JSON 형식:
{
  "intent": "calculation" | "filtering" | "generation" | "update",
  "explanation": "한국어 설명",
  "formula": "엑셀 수식 (선택)",
  "operation": "sum" | "count" | "average" | "max" | "min" | "none",
  "targetColumn": "계산 대상 열 이름",
  "filterColumn": "필터 열 이름",
  "filterValue": "필터 값",
  "filterOperator": "equals" | "contains" | "greater" | "less",
  "generatedData": [{"열이름": "값"}],
  "updates": [{"row": 숫자, "col": 숫자, "value": 값}],
  "unit": "단위",
  "calculatedValue": 숫자
}

규칙:
- 필터링 요청 → intent:"filtering", filterColumn/filterValue/filterOperator 설정
- 계산 요청 → intent:"calculation", operation/targetColumn 설정
- 수정 요청 → intent:"update", updates 배열 설정
- 데이터 생성 → intent:"generation", generatedData 설정

데이터 컨텍스트:
열 목록: ${columns.join(', ')}
전체 행 수: ${fullData.length}
데이터 샘플(첫 3행): ${JSON.stringify(fullData.slice(0, 3))}
${selection?.rangeCoords ? `선택 범위: Row ${selection.rangeCoords.startRow + 1}~${selection.rangeCoords.endRow + 1}` : ''}
${selection?.selectedData?.length ? `선택 데이터: ${JSON.stringify(selection.selectedData.slice(0, 5))}` : ''}`;

    const response = await axios.post(
        GEMINI_API_URL,
        {
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: [
                { role: 'user', parts: [{ text: query }] }
            ],
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
                maxOutputTokens: 1024
            }
        },
        {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        }
    );

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Gemini API 응답이 비어있습니다.');

    const result = JSON.parse(rawText) as AIAnalysisResult;

    // 클라이언트에서 계산값 보정
    if (result.intent === 'calculation' && result.operation && result.operation !== 'none' && result.targetColumn) {
        const col = result.targetColumn;
        if (columns.includes(col)) {
            const vals = fullData
                .map(row => parseFloat(String(row[col]).replace(/[^0-9.-]/g, '')))
                .filter(v => !isNaN(v));
            if (vals.length > 0) {
                switch (result.operation) {
                    case 'sum': result.calculatedValue = Math.round(vals.reduce((a, b) => a + b, 0) * 100) / 100; break;
                    case 'average': result.calculatedValue = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100; break;
                    case 'count': result.calculatedValue = vals.length; break;
                    case 'max': result.calculatedValue = Math.max(...vals); break;
                    case 'min': result.calculatedValue = Math.min(...vals); break;
                }
            }
        }
    }

    return result;
};
