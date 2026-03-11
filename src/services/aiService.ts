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
    formula?: string;
    explanation: string;
    plan?: string;
    references?: string[];
    operation?: 'sum' | 'count' | 'average' | 'max' | 'min' | 'none';
    targetColumn?: string;
    filterColumn?: string;
    filterValue?: string;
    filterOperator?: 'equals' | 'contains' | 'greater' | 'less';
    generatedData?: any[];
    updates?: Array<{ row: number; col: number; value: any }>;
    unit?: string;
    calculatedValue?: any;
}

export const processNaturalLanguageQuery = async (
    query: string,
    columns: string[],
    fullData: any[],
    selection?: SelectionContext
): Promise<AIAnalysisResult> => {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API Key is required for this operation.');
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `You are an AI Excel Agent for EasyXL.GG. 
Analyze the user's natural language query and context to perform data tasks.
Return a JSON object in the following format:
{
  "intent": "calculation" | "filtering" | "generation" | "update",
  "explanation": "Brief Korean explanation",
  "formula": "Excel-style formula (if applicable)",
  "operation": "sum" | "count" | "average" | "max" | "min" | "none",
  "targetColumn": "Mapped column name",
  "filterColumn": "Column for filtering",
  "filterValue": "Value for filtering",
  "filterOperator": "equals" | "contains" | "greater" | "less",
  "generatedData": [{"col": "val"}],
  "updates": [{"row": 0, "col": 0, "value": 123}],
  "unit": "Unit like 원, 명, %",
  "calculatedValue": "Inferred value (for reference)"
}

**Selection Awareness**:
If selection is provided, assume the user is referring to the selected range.
For "Update" intent: return a list of specific cells to change in "updates".
Example: "이 구간 10% 인상" -> Find current values in selection and return new values at those specific row/col indices.

Columns: ${columns.join(', ')}
Current Selection Coords: ${JSON.stringify(selection?.rangeCoords)}
Selection Data Snippet: ${JSON.stringify(selection?.selectedData?.slice(0, 3))}
Full Data Snippet (first 2): ${JSON.stringify(fullData.slice(0, 2))}
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

        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        console.error('AI Processing Error:', error);
        throw error;
    }
};
