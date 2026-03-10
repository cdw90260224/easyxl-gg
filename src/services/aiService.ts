import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface AIAnalysisResult {
    intent: 'calculation' | 'filtering' | 'generation';
    explanation: string;
    formula: string;
    plan: string[];
    calculatedValue?: string | number;
    unit?: string;
    generatedData?: any[];
    fuzzyColumnMatch?: Record<string, string>;
    operation?: 'sum' | 'count' | 'average' | 'max' | 'min' | 'none'; // Added
    targetColumn?: string; // Added
}

export const processNaturalLanguageQuery = async (
    query: string,
    columns: string[],
    data: any[]
): Promise<AIAnalysisResult> => {
    if (!OPENAI_API_KEY) {
        throw new Error("OpenAI API Key가 설정되지 않았습니다.");
    }

    try {
        const systemPrompt = `당신은 초정밀 엑셀 데이터 분석 및 생성 전문가입니다.
사용자의 요청에 따라 다음 세 가지 중 하나를 수행합니다:
1. **분석(calculation)**: 데이터 결과값 계산 (합계, 평균 등)
2. **필터링(filtering)**: 조건에 맞는 데이터 추출
3. **생성(generation)**: 새로운 샘플 데이터 생성

**데이터 정보**:
- 현재 로드된 열(Category): ${columns.join(', ')}

**응답 형식(JSON)**:
{
  "intent": "calculation" | "filtering" | "generation",
  "explanation": "사용자에게 보여줄 짧고 친절한 설명",
  "formula": "사용된 수식이나 로직 설명",
  "plan": ["단계별 작업 내용"],
  "calculatedValue": "추론된 결과값 (참고용)",
  "unit": "단위 (원, 명, 개 등)",
  "operation": "sum" | "count" | "average" | "max" | "min" | "none",
  "targetColumn": "매핑된 실제 열 이름",
  "generatedData": [{"열이름": "값"}], // 생성 인텐트일 때만
  "fuzzyColumnMatch": {"사용자단어": "실제열이름"} // 열 이름이 불일치할 때 매핑
}

**주의사항**:
- '매출', '금액', '가격' 등 유사한 의미를 가진 열은 자동으로 매핑하여 "targetColumn"에 실제 열 이름을 넣으세요.
- 만약 열을 도저히 찾을 수 없다면 "operation"을 "none"으로 하고 explanation에 친절한 오류 메시지를 적으세요.
- 계산/필터링 요청 시, 제공된 데이터 컬럼 정보를 참고하세요.
- 생성 요청 시, 자연스러운 샘플 데이터 5개 이상을 생성하여 "generatedData"에 담아주세요.`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `요청: "${query}"` }
                ],
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const result: AIAnalysisResult = JSON.parse(response.data.choices[0].message.content);
        return result;
    } catch (error) {
        console.error('AI Processing Error:', error);
        throw error;
    }
};
