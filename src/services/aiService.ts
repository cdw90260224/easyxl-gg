import axios from 'axios';

console.log("%c[SYSTEM] Gemini 2.5 Logic - ACTIVE", "color: #10b981; font-weight: bold; font-size: 14px;");

const getGeminiConfig = (model: 'flash' | 'flash-lite' = 'flash') => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    const modelName = model === 'flash-lite' ? 'gemini-2.5-flash-lite' : 'gemini-2.5-flash';
    console.log(`[DEBUG] Gemini Config - API Version: v1beta, Switch Model: ${modelName}`);
    return {
        key,
        url: `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`
    };
};

const extractJson = (text: string): any => {
    try {
        // Try direct parse first
        return JSON.parse(text);
    } catch (e) {
        // Find the first { and last }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
            const jsonPart = text.substring(start, end + 1);
            try {
                return JSON.parse(jsonPart);
            } catch (innerError: any) {
                console.error('[JSON Extraction Error]', innerError.message);
                throw new Error(`JSON 파싱 실패: ${innerError.message}`);
            }
        }
        throw new Error('유효한 JSON 형식을 찾을 수 없습니다.');
    }
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
    intent: 'calculation' | 'filtering' | 'generation' | 'update' | 'chart' | 'join' | 'sort' | 'chat' | 'error';
    explanation: string;
    formula?: string;
    operation?: 'sum' | 'count' | 'average' | 'max' | 'min' | 'none';
    targetColumn?: string;
    filterColumn?: string;
    filterValue?: string;
    filterOperator?: 'equals' | 'contains' | 'greater' | 'less';
    generatedData?: any[];
    updates?: Array<{ row: number; columnName?: string; col?: number; value: any }>;
    textReplace?: { from: string; to: string }; // 클라이언트측 전체 탐색 치환용
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
    sortConfig?: {
        column: string;
        direction: 'asc' | 'desc';
    };
}

export interface SheetContext {
    id: string;
    name: string;
    columns: string[];
    dataSample?: any[];
}

export const processNaturalLanguageQuery = async (
    query: string,
    columns: string[],
    fullData: any[],
    selection?: SelectionContext,
    allSheets?: SheetContext[]
): Promise<AIAnalysisResult> => {

    // ── 휴리스틱 라우터 (모델 선택) ──
    // 복잡한 작업(조인, 생성, 차트, PDF 추출) 키워드 
    const lq = query.toLowerCase();
    const isComplexQuery = 
        lq.includes('합쳐줘') || lq.includes('병합해') || lq.includes('vlookup') || lq.includes('조인') || lq.includes('참조') ||
        lq.includes('차트') || lq.includes('그려줘') || lq.includes('시각화') || lq.includes('그래프') ||
        lq.includes('만들어줘') || lq.includes('생성해') || lq.includes('데이터 생성') ||
        lq.includes('pdf') || lq.includes('추출');
    
    // 단순 작업은 매우 빠른 flash-lite로, 복잡한 추론은 flash 모델로 배차
    const selectedModel = isComplexQuery ? 'flash' : 'flash-lite';
    
    const { key: GEMINI_API_KEY, url: GEMINI_API_URL } = getGeminiConfig(selectedModel);
    console.log(`[AI Router] 🚀 Selected Gemini 2.5 Model: ${selectedModel.toUpperCase()} for query: "${query.substring(0, 50)}..."`);

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
        ? '수석 엑셀 AI 및 데이터 사이언티스트로서, 여러 시트 간의 연관성을 파악하거나, 비정형 문서(PDF 등)에서 핵심 데이터를 추출하여 정형화된 표로 바꾸는 고도의 추론을 수행하세요.' 
        : '초고속 데이터 제어 에이전트로서, 필터링, 사칙연산, 데이터 업데이트 등 단일 시트 내의 구체적인 작업을 명확하고 빠르게 처리하세요.';

    const systemPrompt = `당신은 EasyXL.GG의 ${agentRole} "Document Intelligence" 기능이 활성화되어 PDF 등에서 데이터를 추출할 수 있습니다.
사용자의 자연어 쿼리를 분석하여 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

[CRITICAL - 최우선 규칙: 스키마·구조 보존 의무]
기존 데이터가 로드된 상태에서 "수정", "변경", "바꿔줘", "고쳐줘", "업데이트" 등의 요청이 오면:
1. 절대로 generatedData로 전체 데이터를 새로 만들어 덮어쓰지 마세요.
2. 컬럼 순서, 컬럼 이름, 행 위치, 데이터 타입을 변경하지 마세요.
3. 오직 요청받은 특정 셀의 값(Value)만 교체하는 "부분 패치(Patch)" 방식으로 응답해야 합니다.
4. textReplace 또는 updates[] 중 하나만 사용하여 최소한의 변경만 명시하세요.
이 규칙은 어떤 상황에서도 최우선입니다.

응답 JSON 형식:
{
  "intent": "calculation" | "filtering" | "generation" | "update" | "chart" | "join" | "chat",
  "explanation": "한국어 설명",
  "formula": "엑셀 수식 (선택)",
  "operation": "sum" | "count" | "average" | "max" | "min" | "none",
  "targetColumn": "계산 대상 열 이름",
  "filterColumn": "필터 열 이름",
  "filterValue": "필터 값",
  "filterOperator": "equals" | "contains" | "greater" | "less",
  "generatedData": [{"열이름": "값", "열이름2": "값2"}],
  "updates": [{"row": "배열 인덱스(0부터 시작하는 숫자)", "columnName": "수정할 열 이름", "value": "값"}],
  "textReplace": {"from": "원래 텍스트", "to": "새 텍스트"},
  "unit": "단위",
  "calculatedValue": 숫자,
  "chartConfig": {"chartType": "bar|pie|line|area", "xAxis": "X축 열이름", "yAxis": "Y축 열이름", "title": "차트 제목"},
  "joinConfig": { "sourceSheetId": "ID", "targetSheetId": "ID", "sourceKey": "열이름", "targetKey": "열이름", "columnsToCopy": ["열이름"] },
  "sortConfig": { "column": "열이름", "direction": "asc" | "desc" }
}

규칙:
- [generation 엄격 제한] 아래 두 경우에만 intent: "generation" 사용:
  a) 기존 데이터가 없고 새 표를 처음 만드는 경우
  b) 기존 데이터가 있고, 사용자가 명시적으로 "새 열 추가", "열 확장", "새 시트 생성"을 요청한 경우
  c) 기존 데이터가 있고 열 확장이 필요하면, 기존 모든 열+값을 그대로 유지한 채 새 열만 추가해야 합니다.
  ⚠️ 기존 데이터 수정 요청에는 절대로 generation을 쓰지 마세요.
- 데이터 생성 또는 추출 요청 (예: "~ 데이터 추출", "~ 내용을 표로 만들어줘") → intent: "generation"
  - PDF 텍스트나 이미지가 주어진 경우, 해당 맥락에서 누락된 정보를 최대한 유추하거나 찾아서 표 형태로 반환하세요.
  - ${hasContext ? '기존 데이터의 열 구조를 따르거나 필요시 새 열을 만들어 합치세요.' : '새로운 데이터 구조(열 이름들)를 정의하고 데이터를 생성하세요.'}
- 멀티 시트 작업(VLOOKUP, 데이터 병합) 요청 → intent: "join", joinConfig 명시
- 차트/시각화 요청 → intent: "chart"
- 행 필터링 요청 → intent: "filtering"
- 데이터 정렬 요청 → intent: "sort"
- 사칙연산 등 수치 계산 요청 → intent: "calculation"
- 특정 텍스트 치환 요청 (예: "10월 대만여행을 9월로 바꿔줘", "OO을 XX로 변경", "모든 ~를 ~로") → intent: "update" + textReplace 사용
  - **최우선**: textReplace를 쓸 때는 updates 배열은 비워두세요. 클라이언트가 전체 데이터를 직접 스캔하여 수정합니다.
  - from에는 바꿔야 할 정확한 원본 단어/문장을, to에는 바꿔줘야 할 새 단어/문장을 넣으세요.
- 특정 행의 셀 값 직접 수정 (행 번호/위치가 명확할 때) → intent: "update" + updates 배열 사용
  - \`columnName\`에는 현재 표의 열 이름 중 정확히 일치하는 문자열을 넣고, \`row\`에는 대상 행의 0부터 시작하는 인덱스(0=첫행) 숫자를 넣으세요.
- 엑셀 제어와 무관한 일반적인 질문이나 대화 (예: 인사, 최저임금 등 상식 질문) → intent: "chat"
  - 친절한 텍스트 답변은 오직 \`explanation\`에만 작성하세요. 
  - [최신 사전 지식 업데이트]: 2026년 대한민국의 최저임금은 10,300원입니다. 이를 반영하여 답변하세요.

현재 로드된 전체 시트 정보:
${allSheets && allSheets.length > 0 ? allSheets.map(s => `- ID: ${s.id}, 시트명: ${s.name}, 열: [${s.columns.join(', ')}], 샘플: ${JSON.stringify(s.dataSample || [])}`).join('\n') : '- 없음'}

데이터 컨텍스트:
${hasContext ? `- 활성 시트 열 목록: ${columns.join(', ')}
- 전체 행 수: ${fullData.length}
- 데이터 샘플(첫 3행): ${JSON.stringify(fullData.slice(0, 3))}
${selection?.rangeCoords ? `- 선택 범위: Row ${selection.rangeCoords.startRow + 1}~${selection.rangeCoords.endRow + 1}` : ''}
${selection?.selectedData?.length ? `- 선택 데이터: ${JSON.stringify(selection.selectedData.slice(0, 5))}` : ''}` : '- 현재 로드된 데이터가 없습니다. 사용자가 엑셀과 무관한 일반적인 질문을 한다면 intent를 chat으로 설정하여 답변하고, 데이터 생성을 원한다면 intent를 generation으로 설정하여 새로운 구조(열 이름들)를 정의하고 데이터를 생성하세요.'}`;

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
                maxOutputTokens: 8192,
                responseMimeType: "application/json"
            }
        },
        {
            headers: { 'Content-Type': 'application/json' },
            timeout: 180000
        }
    );

    let rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Gemini API 응답이 비어있습니다.');

    const result = extractJson(rawText) as AIAnalysisResult;

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

export const processImagesToGrid = async (
    images: { base64: string; mimeType: string }[]
): Promise<AIAnalysisResult> => {
    const { key: GEMINI_API_KEY, url: GEMINI_API_URL } = getGeminiConfig('flash');

    if (!GEMINI_API_KEY) {
        throw new Error('VITE_GEMINI_API_KEY가 설정되지 않았습니다.');
    }

    const systemPrompt = `당신은 여러 장의 이미지(표, 영수증, 문서 등)를 분석하여 하나의 정형화된 데이터셋으로 변환하는 통합 데이터 전문가입니다.
사용자가 한 장 또는 여러 장의 이미지를 제공할 것입니다. 이 모든 이미지에서 데이터를 추출하여, 문서 형식이 서로 조금 다르더라도 **반드시 공통된 하나의 표준 열 이름(Standardized Headers)을 가진 엑셀용 JSON 리스트**로 합쳐서 응답하세요.

응답 JSON 형식:
{
  "intent": "generation",
  "explanation": "이미지 분석 및 병합 결과에 대한 한국어 설명",
  "generatedData": [{"표준열이름1": "값", "표준열이름2": "값2", ...}]
}

규칙:
- 제공된 모든 이미지의 행과 열 데이터를 스캔하고 누락 없이 통합하세요.
- 각 이미지마다 열 이름(Header)이 다르더라도(예: '금액', '가격', '총액'), 의미가 같다면 가장 적절한 '표준 열 이름' 하나로 통일하세요.
- 오직 JSON 형식으로만 응답하세요.`;

    const response = await axios.post(
        GEMINI_API_URL,
        {
            contents: [
                {
                    parts: [
                        { text: systemPrompt },
                        ...images.map(img => ({
                            inline_data: {
                                mime_type: img.mimeType,
                                data: img.base64
                            }
                        }))
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 8192,
                responseMimeType: "application/json"
            }
        },
        {
            headers: { 'Content-Type': 'application/json' },
            timeout: 180000
        }
    );

    let rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Gemini API 응답이 비어있습니다.');

    console.log('[AI Raw Image Response]', rawText);

    try {
        const result = extractJson(rawText) as AIAnalysisResult;
        return result;
    } catch (err: any) {
        console.error('[JSON Parse Error Source]', rawText);
        throw err;
    }
};
