import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

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

    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
        throw new Error('VITE_OPENAI_API_KEY가 설정되지 않았습니다. .env 파일에 실제 API 키를 입력해주세요.');
    }

    // ── 선택 영역 계산은 클라이언트에서 직접 처리 (API 비용 절감 + 속도 향상) ──
    if (selection?.selectedData && selection.selectedData.length > 0) {
        const lq = query.toLowerCase();
        const flatNums = selection.selectedData.flat()
            .map(v => parseFloat(String(v).replace(/[^0-9.-]/g, '')))
            .filter(v => !isNaN(v));

        if (flatNums.length > 0) {
            // 합계
            if (lq.includes('합계') || lq.includes('sum') || lq.includes('합산') || lq.includes('더해')) {
                const total = flatNums.reduce((a, b) => a + b, 0);
                return { intent: 'calculation', operation: 'sum', calculatedValue: total, explanation: `선택한 ${flatNums.length}개 셀의 합계입니다.`, unit: '' };
            }
            // 평균
            if (lq.includes('평균') || lq.includes('average') || lq.includes('avg')) {
                const avg = flatNums.reduce((a, b) => a + b, 0) / flatNums.length;
                return { intent: 'calculation', operation: 'average', calculatedValue: Math.round(avg * 100) / 100, explanation: `선택한 ${flatNums.length}개 셀의 평균입니다.`, unit: '' };
            }
            // 최대
            if (lq.includes('최대') || lq.includes('최고') || lq.includes('max')) {
                return { intent: 'calculation', operation: 'max', calculatedValue: Math.max(...flatNums), explanation: `선택한 범위의 최댓값입니다.`, unit: '' };
            }
            // 최소
            if (lq.includes('최소') || lq.includes('최저') || lq.includes('min')) {
                return { intent: 'calculation', operation: 'min', calculatedValue: Math.min(...flatNums), explanation: `선택한 범위의 최솟값입니다.`, unit: '' };
            }
            // 개수
            if (lq.includes('개수') || lq.includes('count') || lq.includes('몇 개') || lq.includes('몇개')) {
                return { intent: 'calculation', operation: 'count', calculatedValue: flatNums.length, explanation: `선택한 범위의 숫자 셀 개수입니다.`, unit: '개' };
            }
            // 퍼센트 인상 (예: "10% 인상", "2배")
            const percentMatch = lq.match(/(\d+(?:\.\d+)?)\s*%\s*(인상|올려|증가|up)/);
            const multipleMatch = lq.match(/(\d+(?:\.\d+)?)\s*(배|times)/);
            if (percentMatch || multipleMatch) {
                const multiplier = percentMatch
                    ? 1 + parseFloat(percentMatch[1]) / 100
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
                return {
                    intent: 'update',
                    updates,
                    explanation: `선택한 셀 ${updates.length}개를 ${percentMatch ? percentMatch[1] + '% 인상' : multipleMatch![1] + '배'}했습니다.`
                };
            }
        }
    }

    // ── GPT-4o API 호출 (복잡한 명령 처리) ──
    const systemPrompt = `당신은 EasyXL.GG의 AI 엑셀 에이전트입니다. 사용자의 자연어 쿼리를 분석하여 다음 JSON 형식으로만 응답하세요:

{
  "intent": "calculation" | "filtering" | "generation" | "update",
  "explanation": "한국어로 된 짧은 설명",
  "formula": "적용된 엑셀 수식 (해당 시)",
  "operation": "sum" | "count" | "average" | "max" | "min" | "none",
  "targetColumn": "계산 대상 열 이름 (전체 데이터 계산 시)",
  "filterColumn": "필터링할 열 이름",
  "filterValue": "필터링할 값",
  "filterOperator": "equals" | "contains" | "greater" | "less",
  "generatedData": [{"열이름": "값"}],
  "updates": [{"row": 행인덱스, "col": 열인덱스, "value": 새값}],
  "unit": "단위 (원, 명, % 등)",
  "calculatedValue": 계산된 숫자값
}

## 규칙:
- 필터링 요청 → intent: "filtering", filterColumn/filterValue/filterOperator 채우기
- 계산 요청 → intent: "calculation", operation/targetColumn/calculatedValue 채우기
- 셀 수정 요청 → intent: "update", updates 배열에 정확한 row/col/value 채우기
- 데이터 생성 요청 → intent: "generation", generatedData 채우기
- 선택 영역이 있으면 해당 데이터 우선 참조
- 항상 한국어로 explanation 작성

## 데이터 컨텍스트:
열 목록: ${columns.join(', ')}
${selection?.rangeCoords ? `선택 범위: Row ${selection.rangeCoords.startRow + 1}~${selection.rangeCoords.endRow + 1}, Col ${selection.rangeCoords.startCol + 1}~${selection.rangeCoords.endCol + 1}` : '선택 없음'}
${selection?.selectedData?.length ? `선택 데이터 (처음 5행): ${JSON.stringify(selection.selectedData.slice(0, 5))}` : ''}
전체 데이터 샘플 (처음 3행): ${JSON.stringify(fullData.slice(0, 3))}
전체 행 수: ${fullData.length}`;

    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: 'gpt-4o-mini',  // 비용 효율적인 모델 사용
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,  // 결정론적 응답
            max_tokens: 1000
        },
        {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000  // 15초 타임아웃
        }
    );

    const result = JSON.parse(response.data.choices[0].message.content) as AIAnalysisResult;

    // ── 계산 결과 클라이언트 검증: AI가 계산값을 못 줬을 때 직접 계산 ──
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
