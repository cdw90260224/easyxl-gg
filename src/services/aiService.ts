import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface AIAnalysisResult {
    formula: string;
    plan: string;
    references: string[];
    filterCriteria?: (row: any) => boolean;
}

export const processNaturalLanguageQuery = async (
    query: string,
    columns: string[],
    sampleData: any[]
): Promise<AIAnalysisResult> => {
    if (!OPENAI_API_KEY) {
        // Fallback to basic keyword matching if no API key is provided
        const keywords = query.toLowerCase().split(/and|&|,|\s+/).filter(k => k.length > 0);
        return {
            formula: `=FILTER(A:Z, AND(${keywords.map(k => `SEARCH("${k}", A:Z)>0`).join(', ')}))`,
            plan: `[${keywords.join(', ')}] 키워드를 포함하는 데이터를 필터링합니다. (API 키를 등록하면 더 복잡한 분석이 가능합니다.)`,
            references: ["전체 열(All Columns)"],
            filterCriteria: (row: any) => {
                const rowString = Object.values(row).map(String).join(' ').toLowerCase();
                return keywords.every(kw => rowString.includes(kw));
            }
        };
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an Excel and Data Analysis expert. 
            Analyze the user's natural language query based on the provided column names and sample data.
            Return a JSON object with:
            - formula: A valid Excel formula to perform this task.
            - plan: A brief explanation (in Korean) of how you interpreted the request.
            - references: The columns used for this analysis.
            - filterLogic: A simple string representing the logical condition (e.g., "row['Name'] === 'John'").
            
            Column Names: ${columns.join(', ')}
            Sample Data (first 2 rows): ${JSON.stringify(sampleData.slice(0, 2))}
            `
                    },
                    { role: 'user', content: query }
                ],
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = JSON.parse(response.data.choices[0].message.content);

        return {
            formula: result.formula,
            plan: result.plan,
            references: result.references,
        };
    } catch (error) {
        console.error('AI Processing Error:', error);
        throw error;
    }
};
