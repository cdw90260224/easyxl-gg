import * as XLSX from 'xlsx';

export interface ParsedSheet {
    id: string;
    name: string;
    data: any[];
    columns: string[];
}

export function parseExcelData(rawRows: any[][]): { data: any[], headers: string[] } {
    if (!rawRows || rawRows.length === 0) return { data: [], headers: [] };

    let maxCols = 0;
    rawRows.forEach(row => {
        if (row.length > maxCols) maxCols = row.length;
    });

    const finalHeaders: string[] = [];
    for (let i = 0; i < Math.max(1, maxCols); i++) {
        finalHeaders.push(String.fromCharCode(65 + i));
    }

    const jsonData = rawRows.map(row => {
        const obj: any = {};
        finalHeaders.forEach((h, idx) => {
            let val = row[idx];
            if (val instanceof Date) {
                const year = val.getFullYear();
                const month = String(val.getMonth() + 1).padStart(2, '0');
                const day = String(val.getDate()).padStart(2, '0');
                val = `${year}-${month}-${day}`;
            }
            obj[h] = val === undefined ? "" : val;
        });
        return obj;
    });

    return { data: jsonData, headers: finalHeaders };
}

export function parseExcelWorkbook(workbook: XLSX.WorkBook): ParsedSheet[] {
    const sheets: ParsedSheet[] = [];
    
    workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        const { data, headers } = parseExcelData(rawRows);
        
        if (data.length > 0) {
            sheets.push({
                id: `sheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: sheetName,
                data: data.map((row, idx) => ({ ...row, _id: `row_${idx}_${Date.now()}` })),
                columns: headers
            });
        }
    });
    
    console.log(`[PARSER] Multi-Sheet Mode: Extracted ${sheets.length} sheets.`);
    return sheets;
}
