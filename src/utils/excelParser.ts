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

    // 1행 내용 확인 (헤더로 쓸 만한 글자가 있는지)
    const firstRow = rawRows[0] || [];
    const hasHeaderContent = firstRow.some(cell => {
        if (cell === undefined || cell === null) return false;
        return String(cell).trim().length > 0;
    });

    let headers: string[] = [];
    if (hasHeaderContent) {
        // 1행을 헤더로 사용
        for (let i = 0; i < maxCols; i++) {
            const val = firstRow[i];
            const headerName = (val !== undefined && val !== null && String(val).trim() !== "")
                ? String(val).trim()
                : `Column ${i + 1}`;
            headers.push(headerName);
        }
    } else {
        // 1행이 비어있으면 'Column 1, 2...' 사용
        for (let i = 0; i < maxCols; i++) {
            headers.push(`Column ${i + 1}`);
        }
    }

    // 헤더 중복 방지 (객체 키로 쓰기 위함)
    const seen: Record<string, number> = {};
    const finalHeaders = headers.map(h => {
        if (!seen[h]) {
            seen[h] = 1;
            return h;
        } else {
            seen[h]++;
            return `${h}_${seen[h]}`;
        }
    });

    // 데이터 영역은 2행부터 시작 (1행 제외)
    // 단, 원본 데이터가 아예 없는데 1행만 있는 경우도 고려
    const dataRows = rawRows.slice(1);

    const jsonData = dataRows.map(row => {
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
