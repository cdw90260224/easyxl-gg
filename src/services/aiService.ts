import axios from 'axios';

const getGeminiConfig = (model: 'flash' | 'flash-lite' = 'flash') => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    const modelName = model === 'flash-lite' ? 'gemini-2.0-flash-lite-preview-02-05' : 'gemini-2.0-flash';
    console.log(`[DEBUG] Gemini Config - Model: ${modelName}`);
    return {
        key,
        url: `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`
    };
};

export interface SelectionContext {
    selectedData: any[][];
    rangeCoords: {
        startRow: number;
        startCol: number;
        endRow: number;
        endCol: number;
    } | null;
}

export interface ChartConfig {
    chartType: 'bar' | 'pie' | 'line' | 'area';
    xAxis: string;
    yAxis: string;
    title: string;
}

export interface AIAnalysisResult {
    intent: 'calculation' | 'filtering' | 'generation' | 'update' | 'chart' | 'join';
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
    chartConfig?: ChartConfig;
    joinConfig?: {
        sourceSheetId: string;
        targetSheetId: string;
        sourceKey: string;
        targetKey: string;
        columnsToCopy: string[];
    };
}

export interface SheetContext {
    id: string;
    name: string;
    columns: string[];
}

export const processNaturalLanguageQuery = async (
    query: string,
    columns: string[],
    fullData: any[],
    selection?: SelectionContext,
    allSheets?: SheetContext[]
): Promise<AIAnalysisResult> => {

    // ── 휴리스틱 라우터 (모델 선택) ──
    // 복잡한 작업(조인, 생성, 차트) 키워드 
    const lq = query.toLowerCase();
    const isComplexQuery = 
        lq.includes('합쳐줘') || lq.includes('병합해') || lq.includes('vlookup') || lq.includes('조인') || lq.includes('참조') ||
        lq.includes('차트') || lq.includes('그려줘') || lq.includes('시각화') || lq.includes('그래프') ||
        lq.includes('만들어줘') || lq.includes('생성해') || lq.includes('데이터 생성');
    
    // 단순 작업은 매우 빠른 flash-lite로, 복잡한 추론은 flash 모델로 배차
    const selectedModel = isComplexQuery ? 'flash' : 'flash-lite';
    
    const { key: GEMINI_API_KEY, url: GEMINI_API_URL } = getGeminiConfig(selectedModel);
    console.log(`[AI Router] 🚀 Selected Model: ${selectedModel.toUpperCase()} for query: "${query}"`);

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here' || GEMINI_API_KEY === '') {
        console.error('[CRITICAL] Gemini API Key is missing or default. Please check your .env file.');
        throw new Error('VITE_GEMINI_API_KEY가 설정되지 않았습니다. .env 파일에 실제 API 키를 입력해주세요.');
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
    const hasContext = columns.length > 0;
    
    // 모델별 특화 프롬프트
    const agentRole = selectedModel === 'flash' 
        ? '수석 엑셀 AI 및 데이터 사이언티스트로서, 여러 시트 간의 연관성을 파악하거나, 새로운 데이터를 창의적이고 일관성 있게 생성하며, 데이터의 특징을 파악하여 최적의 차트를 기획하세요.' 
        : '초고속 데이터 제어 에이전트로서, 필터링, 사칙연산, 데이터 업데이트 등 단일 시트 내의 구체적인 작업을 명확하고 빠르게 처리하세요.';

    const systemPrompt = `당신은 EasyXL.GG의 ${agentRole} "Multi-Sheet IQ" 기능이 활성화되어 여러 시트를 동시에 분석할 수 있습니다.
사용자의 자연어 쿼리를 분석하여 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

응답 JSON 형식:
{
  "intent": "calculation" | "filtering" | "generation" | "update" | "chart" | "join",
  "explanation": "한국어 설명",
  "formula": "엑셀 수식 (선택)",
  "operation": "sum" | "count" | "average" | "max" | "min" | "none",
  "targetColumn": "계산 대상 열 이름",
  "filterColumn": "필터 열 이름",
  "filterValue": "필터 값",
  "filterOperator": "equals" | "contains" | "greater" | "less",
  "generatedData": [{"열이름": "값", "열이름2": "값2"}],
  "updates": [{"row": 숫자, "col": 숫자, "value": 값}],
  "unit": "단위",
  "calculatedValue": 숫자,
  "chartConfig": {"chartType": "bar|pie|line|area", "xAxis": "X축 열이름", "yAxis": "Y축 열이름", "title": "차트 제목"},
  "joinConfig": { "sourceSheetId": "ID", "targetSheetId": "ID", "sourceKey": "열이름", "targetKey": "열이름", "columnsToCopy": ["열이름"] }
}

규칙:
- 멀티 시트 작업(VLOOKUP, 데이터 병합) 요청 → intent: "join", joinConfig 명시
- 데이터 생성 요청 (예: "~ 데이터를 만들어줘", "~ 매장 리스트 생성") → intent: "generation"
  - ${hasContext ? '기존 데이터의 열 구조를 따르거나 필요시 새 구조를 만드세요.' : '새로운 데이터 구조(열 이름들)를 정의하고 데이터를 생성하세요.'}
  - generatedData 배열에 객체들을 5개 이상(명시적 요청 없으면) 포함시키세요.
- 차트/시각화 요청 (예: "~ 차트로 보여줘", "~ 그래프 그려줘", "시각화") → intent: "chart"
  - chartConfig에 chartType(bar/pie/line/area), xAxis(카테고리 열), yAxis(수치 열), title 설정
  - xAxis와 yAxis는 반드시 현재 데이터의 열 이름 중에서 선택하세요.
- 필터링 요청 → intent: "filtering", filterColumn/filterValue/filterOperator 설정
- 계산 요청 → intent: "calculation", operation/targetColumn 설정
- 수정 요청 → intent: "update", updates 배열 설정

현재 로드된 전체 시트 정보:
${allSheets && allSheets.length > 0 ? allSheets.map(s => `- ID: ${s.id}, 시트명: ${s.name}, 열: [${s.columns.join(', ')}]`).join('\n') : '- 없음'}

데이터 컨텍스트:
${hasContext ? `- 활성 시트 열 목록: ${columns.join(', ')}
- 전체 행 수: ${fullData.length}
- 데이터 샘플(첫 3행): ${JSON.stringify(fullData.slice(0, 3))}
${selection?.rangeCoords ? `- 선택 범위: Row ${selection.rangeCoords.startRow + 1}~${selection.rangeCoords.endRow + 1}` : ''}
${selection?.selectedData?.length ? `- 선택 데이터: ${JSON.stringify(selection.selectedData.slice(0, 5))}` : ''}` : '- 현재 로드된 데이터가 없습니다. 사용자의 요청에 기반하여 새로운 데이터를 생성하세요.'}`;

    // v1 API와의 호환성을 위해 system_instruction 대신 첫 번째 메시지에 지시사항을 통합
    const combinedPrompt = `${systemPrompt}\n\n사용자 쿼리: ${query}`;

    const response = await axios.post(
        GEMINI_API_URL,
        {
            contents: [
                { role: 'user', parts: [{ text: combinedPrompt }] }
            ],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048
            }
        },
        {
            headers: { 'Content-Type': 'application/json' },
            timeout: 20000
        }
    );

    let rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Gemini API 응답이 비어있습니다.');

    // 마크다운 코드 블록(```json ... ```) 제거 로직 추가
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

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
