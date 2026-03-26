import * as XLSX from 'xlsx';

export interface TableInfo {
    id: string;
    name: string;
    range: string;
    data: any[];
    columns: string[];
    rawRows: any[][];
    addressMap: Record<string, string>; // "row,col" -> "A1"

    isHeaderDetected: boolean;
    isAmbiguous: boolean;
}

export interface ParsedSheet {
    id: string;
    name: string;
    data: any[]; // Default to first table's data for compatibility
    columns: string[];
    tables: TableInfo[];
    isHeaderDetected: boolean;
    isAmbiguous: boolean;
    originalWorksheet?: any;
}


/**
 * Detects if the first non-empty row of the spreadsheet is likely a header.
 * Logic:
 * 1. Find the first row with data.
 * 2. Check if that row consists mostly of strings.
 * 3. Compare data types with subsequent rows (if row 0 is string and row 1+ are number/date, it's a header).
 */
export function detectHeader(rawRows: any[][]): { 
    headerIndex: number, 
    isHeader: boolean, 
    isAmbiguous: boolean 
} {
    if (!rawRows || rawRows.length === 0) return { headerIndex: -1, isHeader: false, isAmbiguous: false };

    // Find first non-empty row
    let firstDataRowIndex = -1;
    for (let i = 0; i < rawRows.length; i++) {
        if (rawRows[i].some(cell => cell !== "" && cell !== null && cell !== undefined)) {
            firstDataRowIndex = i;
            break;
        }
    }

    if (firstDataRowIndex === -1) return { headerIndex: -1, isHeader: false, isAmbiguous: false };

    const firstRow = rawRows[firstDataRowIndex];
    const secondRow = rawRows[firstDataRowIndex + 1];

    // Basic heuristic: Is the first row all strings?
    const firstRowTypes: string[] = firstRow.map(cell => typeof cell);
    const isFirstRowAllStrings = firstRow.every(cell => cell === "" || typeof cell === 'string');

    // Heuristic 2: Compare with second row
    if (secondRow) {
        const hasTypeDiff = firstRowTypes.some((firstType: string, idx: number) => {
            const val1 = firstRow[idx];
            const val2 = secondRow[idx];
            if (val1 === "" || val2 === "") return false;
            // If first is string and second is number or date-like string
            if (firstType === 'string' && (typeof val2 === 'number' || val2 instanceof Date)) return true;
            return false;
        });

        if (hasTypeDiff) return { headerIndex: firstDataRowIndex, isHeader: true, isAmbiguous: false };
    }

    // Heuristic 3: If many rows share the same type (e.g. all numbers), then first row is likely data
    const sampleRows = rawRows.slice(firstDataRowIndex, firstDataRowIndex + 5);
    const allSameTypeForCol0 = sampleRows.every(row => typeof row[0] === typeof firstRow[0]);
    if (sampleRows.length > 1 && allSameTypeForCol0 && typeof firstRow[0] !== 'string') {
        return { headerIndex: firstDataRowIndex, isHeader: false, isAmbiguous: false };
    }

    // Default to ambiguous if it's all strings but no clear type shift
    if (isFirstRowAllStrings) {
        return { headerIndex: firstDataRowIndex, isHeader: true, isAmbiguous: true };
    }

    return { headerIndex: firstDataRowIndex, isHeader: false, isAmbiguous: false };
}

export function parseExcelData(
    rawRows: any[][], 
    useFirstRowAsHeader?: boolean, 
    startRowOffset = 0, 
    startColOffset = 0,
    worksheet?: XLSX.WorkSheet
): { 
    data: any[], 
    headers: string[], 
    isHeaderDetected: boolean, 
    isAmbiguous: boolean,
    addressMap: Record<string, string>
} {
    if (!rawRows || rawRows.length === 0) return { data: [], headers: [], isHeaderDetected: false, isAmbiguous: false, addressMap: {} };

    const detection = detectHeader(rawRows);
    const isHeader = useFirstRowAsHeader !== undefined ? useFirstRowAsHeader : detection.isHeader;
    const headerRowIdx = detection.headerIndex;

    const getMergeAnchor = (r: number, c: number) => {
        if (worksheet && worksheet['!merges']) {
            for (const merge of worksheet['!merges']) {
                if (r >= merge.s.r && r <= merge.e.r && c >= merge.s.c && c <= merge.e.c) {
                    return XLSX.utils.encode_cell(merge.s);
                }
            }
        }
        return XLSX.utils.encode_cell({ r, c });
    };

    let finalHeaders: string[] = [];
    let startDataIdx = 0;

    if (isHeader && headerRowIdx !== -1) {
        const headerRow = rawRows[headerRowIdx];
        finalHeaders = headerRow.map((h, i) => String(h).trim() || `Column ${i + 1}`);
        startDataIdx = headerRowIdx + 1;
    } else {
        let maxCols = 0;
        rawRows.forEach(row => {
            if (row.length > maxCols) maxCols = row.length;
        });
        for (let i = 0; i < Math.max(1, maxCols); i++) {
            finalHeaders.push(`Column ${i + 1}`);
        }
        startDataIdx = headerRowIdx === -1 ? 0 : headerRowIdx;
    }

    const addressMap: Record<string, string> = {};

    const jsonData = rawRows.slice(startDataIdx).map((row, ri) => {
        const obj: any = {};
        finalHeaders.forEach((h, ci) => {
            let val = row[ci];
            if (val instanceof Date) {
                const year = val.getFullYear();
                const month = String(val.getMonth() + 1).padStart(2, '0');
                const day = String(val.getDate()).padStart(2, '0');
                val = `${year}-${month}-${day}`;
            }
            obj[h] = val === undefined ? "" : val;

            const absR = startRowOffset + startDataIdx + ri;
            const absC = startColOffset + ci;
            addressMap[`${ri},${ci}`] = getMergeAnchor(absR, absC);
        });
        return obj;
    });

    return { 
        data: jsonData, 
        headers: finalHeaders, 
        isHeaderDetected: isHeader, 
        isAmbiguous: detection.isAmbiguous,
        addressMap
    };
}


/**
 * Finds continuous data blocks separated by completely empty rows.
 */
function findTableRanges(worksheet: XLSX.WorkSheet): XLSX.Range[] {
    const ref = worksheet['!ref'];
    if (!ref) return [];
    const range = XLSX.utils.decode_range(ref);
    const tables: XLSX.Range[] = [];
    
    let currentTable: XLSX.Range | null = null;
    
    for (let R = range.s.r; R <= range.e.r; R++) {
        let isRowEmpty = true;
        let rowStartCol = -1;
        let rowEndCol = -1;
        
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = worksheet[cellAddress];
            if (cell && cell.v !== undefined && cell.v !== null && String(cell.v).trim() !== "") {
                isRowEmpty = false;
                if (rowStartCol === -1 || C < rowStartCol) rowStartCol = C;
                if (C > rowEndCol) rowEndCol = C;
            }
        }
        
        if (!isRowEmpty) {
            if (!currentTable) {
                currentTable = { s: { r: R, c: rowStartCol }, e: { r: R, c: rowEndCol } };
            } else {
                currentTable.s.c = Math.min(currentTable.s.c, rowStartCol);
                currentTable.e.c = Math.max(currentTable.e.c, rowEndCol);
                currentTable.e.r = R;
            }
        } else {
            if (currentTable) {
                tables.push(currentTable);
                currentTable = null;
            }
        }
    }
    if (currentTable) tables.push(currentTable);
    
    // Filter out very small tables (e.g., 1x1)
    return tables.filter(t => {
        const rowCount = t.e.r - t.s.r + 1;
        const colCount = t.e.c - t.s.c + 1;
        return rowCount * colCount > 1; // At least 2 cells
    });
}



export function parseExcelWorkbook(workbook: XLSX.WorkBook): ParsedSheet[] {
    const sheets: ParsedSheet[] = [];
    
    workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const tableRanges = findTableRanges(worksheet);
        
        // --- [Merged Cells Handling] ---
        // If there are merged cells, we'll handle them when parsing raw blocks.
        
        const tables: TableInfo[] = tableRanges.map((range, idx) => {
            const rangeStr = XLSX.utils.encode_range(range);
            const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                defval: "", 
                range: rangeStr 
            });

            // Handle merged cells within this range
            if (worksheet['!merges']) {
                worksheet['!merges'].forEach(merge => {
                    // Check if merge overlaps with current range
                    const overlap = {
                        s: { r: Math.max(merge.s.r, range.s.r), c: Math.max(merge.s.c, range.s.c) },
                        e: { r: Math.min(merge.e.r, range.e.r), c: Math.min(merge.e.c, range.e.c) }
                    };

                    if (overlap.s.r <= overlap.e.r && overlap.s.c <= overlap.e.c) {
                        const startCell = worksheet[XLSX.utils.encode_cell(merge.s)];
                        if (startCell && startCell.v !== undefined) {
                            for (let r = overlap.s.r; r <= overlap.e.r; r++) {
                                for (let c = overlap.s.c; c <= overlap.e.c; c++) {
                                    // Local coordinates in rawRows
                                    const localR = r - range.s.r;
                                    const localC = c - range.s.c;
                                    if (rawRows[localR]) rawRows[localR][localC] = startCell.v;
                                }
                            }
                        }
                    }
                });
            }

            const { data, headers, isHeaderDetected, isAmbiguous, addressMap } = parseExcelData(
                rawRows, 
                undefined, 
                range.s.r, 
                range.s.c,
                worksheet
            );


            const dataWithIds = data.map((row, rIdx) => ({ 
                ...row, 
                _id: `table_${idx}_row_${rIdx}_${Date.now()}` 
            }));

            return {
                id: `table_${idx}_${Date.now()}`,
                name: `Table ${idx + 1} (${rangeStr})`,
                range: rangeStr,
                data: dataWithIds,
                columns: headers,
                rawRows,
                addressMap,
                isHeaderDetected,

                isAmbiguous
            };
        });
        
        if (tables.length > 0) {
            sheets.push({
                id: `sheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: sheetName,
                data: tables[0].data,
                columns: tables[0].columns,
                tables: tables,
                isHeaderDetected: tables[0].isHeaderDetected,
                isAmbiguous: tables[0].isAmbiguous,
                originalWorksheet: worksheet
            });
        }
    });
    
    console.log(`[PARSER] Multi-Sheet/Multi-Table Mode: Extracted ${sheets.length} sheets.`);
    return sheets;
}
