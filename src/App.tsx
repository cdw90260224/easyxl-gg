import { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import SearchBar from './components/SearchBar';
import AnalysisCard from './components/AnalysisCard';
import InteractiveGrid from './components/InteractiveGrid';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AIChartPanel from './components/AIChartPanel';
import PrivacyModal from './components/PrivacyModal';
import { Toaster, toast } from 'sonner';
import * as XLSX from 'xlsx-js-style';
import { 
    processNaturalLanguageQuery, 
    processImagesToGrid,
    type AIAnalysisResult, 
    type SelectionContext, 
    type ChartConfig 
} from './services/aiService';
import { saveSheet, listSheets, getSheet, deleteSheet, type SheetRecord } from './services/sheetService';
import SheetTabs from './components/SheetTabs';
import { parseExcelWorkbook } from './utils/excelParser';
import ErrorBoundary from './components/ErrorBoundary';
import { Routes, Route, Link } from 'react-router-dom';
import Guide from './pages/Guide';
import Privacy from './pages/Privacy';

export default function App() {
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [isPrivacyMode, setIsPrivacyMode] = useState(true);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRange, setSelectedRange] = useState<SelectionContext['rangeCoords']>(null);
    const [isDark, setIsDark] = useState(false);
    const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
    const [savedSheets, setSavedSheets] = useState<SheetRecord[]>([]);
    const [showSavedSheets, setShowSavedSheets] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');
    const [isGlobalDragging, setIsGlobalDragging] = useState(false);

    // Multi-Sheet State
    const [sheets, setSheets] = useState<{ id: string; name: string; data: any[]; columns: string[] }[]>([]);
    const [activeSheetIndex, setActiveSheetIndex] = useState(0);

    const handleDeleteSheet = (index: number) => {
        setSheets(prev => {
            const newSheets = prev.filter((_, i) => i !== index);
            if (newSheets.length === 0) {
                setData([]); setFilteredData([]); setAnalysis(null); setChartConfig(null); setSelectedRange(null);
                setActiveSheetIndex(0);
            } else {
                let nextIdx = activeSheetIndex;
                if (index < activeSheetIndex) nextIdx = activeSheetIndex - 1;
                else if (index === activeSheetIndex) nextIdx = 0;
                setActiveSheetIndex(nextIdx);
                setData(newSheets[nextIdx].data);
                setFilteredData(newSheets[nextIdx].data);
                setAnalysis(null);
                setChartConfig(null);
                setSelectedRange(null);
            }
            return newSheets;
        });
    };

    useEffect(() => {
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDark]);

    const handlePDFLoaded = (text: string) => {
        toast.info("PDF 텍스트 추출 완료! AI가 데이터를 구조화합니다.", { icon: '📄' });
        // Automatically trigger AI search with the PDF context
        handleSearch(`다음 PDF 텍스트 내용을 바탕으로 핵심 데이터를 추출해서 표(Table) 형태로 만들어줘:\n\n${text}`);
    };

    const handleImagesLoaded = async (images: {base64: string, mimeType: string}[]) => {
        setIsLoading(true);
        setAnalysis(null);
        try {
            toast.loading(`${images.length}장의 이미지 통합 분석 진행 중...`, { id: 'image-ocr' });
            const result = await processImagesToGrid(images);
            toast.dismiss('image-ocr');
            
            if (result.intent === 'generation' && result.generatedData) {
                const dataWithIds = result.generatedData.map((row: any, idx: number) => ({
                    ...row,
                    _id: `img_${idx}_${Date.now()}`
                }));
                
                // Add as a new sheet
                const cols = Object.keys(result.generatedData[0] || {}).filter(k => k !== '_id');
                const newSheet = { 
                    id: `sheet_${Date.now()}`, 
                    name: `Merged Image Data ${sheets.length + 1}`, 
                    data: dataWithIds, 
                    columns: cols 
                };
                
                handleMultiSheetsLoaded([newSheet]);
                setAnalysis(result);
                // Removed setActiveTab('edit') to keep user in current tab and show inline preview
                toast.success(`✨ ${images.length}장의 이미지 병합 데이터를 성공적으로 표로 반환했습니다!`);
            } else {
                toast.error("이미지에서 유효한 표 데이터를 찾지 못했습니다.");
            }
        } catch (err: any) {
            console.error('[Image OCR Error]', err);
            toast.error(`병합 분석 실패: ${err.message || '알 수 없는 오류'}`);
        } finally {
            setIsLoading(false);
            toast.dismiss('image-ocr');
        }
    };

    const handleMultiSheetsLoaded = (newSheets: { id: string; name: string; data: any[]; columns: string[] }[]) => {
        setSheets(prev => {
            // Append new sheets, but if the current active sheet is empty, replace it
            const currentSheet = prev[activeSheetIndex];
            if (currentSheet && (!currentSheet.data || currentSheet.data.length === 0)) {
                const arr = [...prev];
                arr.splice(activeSheetIndex, 1, ...newSheets);
                return arr;
            }
            return [...prev, ...newSheets];
        });

        // Set the first of the new sheets as active
        const newIndex = sheets.length; 
        setActiveSheetIndex(newIndex);
        setData(newSheets[0].data);
        setFilteredData(newSheets[0].data);
        setAnalysis(null);
        setSelectedRange(null);
        toast.success(`✅ ${newSheets.length}개의 시트 로드 완료!`);
    };

    const handleSearch = async (query: string) => {
        if (!query) { setFilteredData(data); setAnalysis(null); setChartConfig(null); return; }
        setIsLoading(true);
        setAnalysis(null);
        setChartConfig(null);
        try {
            const columns = data.length > 0 ? Object.keys(data[0]) : [];
            let selectionContext: SelectionContext | undefined;
            if (selectedRange) {
                const selectedData: any[][] = [];
                for (let r = selectedRange.startRow; r <= selectedRange.endRow; r++) {
                    const rowData: any[] = [];
                    for (let c = selectedRange.startCol; c <= selectedRange.endCol; c++) {
                        const rowObj = data[r];
                        if (rowObj) rowData.push(rowObj[columns[c]]);
                    }
                    selectedData.push(rowData);
                }
                selectionContext = { selectedData, rangeCoords: selectedRange };
            }
            const sheetContexts = sheets.map((s: { id: string; name: string; columns: string[]; data: any[] }) => ({ 
                id: s.id, 
                name: s.name, 
                columns: s.columns,
                dataSample: s.data.slice(0, 3) // Pass first 3 rows as sample
            }));
            const result = await processNaturalLanguageQuery(query, columns, data, selectionContext, sheetContexts);
            setAnalysis(result);
            setChartConfig(null); // 새 분석 시 이전 차트 초기화
            if (result.intent === 'generation' && result.generatedData) {
                if (!Array.isArray(result.generatedData)) {
                    throw new Error("AI가 유효한 배열 형태의 데이터를 반환하지 않았습니다.");
                }

                let finalData = result.generatedData;
                
                // Partial Update Logic
                const isPartialMerge = data.length > 0 && finalData.length === data.length;

                if (isPartialMerge) {
                    finalData = data.map((existingRow: any, idx: number) => {
                        const newRowData = finalData[idx] || {};
                        return { ...existingRow, ...newRowData };
                    });
                }

                const dataWithIds = finalData.map((row: any, idx: number) => ({
                    ...row,
                    _id: row._id || `gen_${idx}_${Date.now()}`
                }));

                setData(dataWithIds); setFilteredData(dataWithIds);
                setSheets(prev => {
                    const arr = [...prev];
                    const cols = Object.keys(dataWithIds[0] || {}).filter(k => k !== '_id');
                    arr[activeSheetIndex] = { ...arr[activeSheetIndex], data: dataWithIds, columns: cols };
                    return arr;
                });
                
                if (isPartialMerge) {
                    toast.success(`✨ 기존 데이터에 누락된 컬럼/조건이 성공적으로 병합되었습니다.`);
                } else {
                    toast.success(`✨ ${result.generatedData.length}행의 데이터를 AI가 생성했습니다.`);
                }
            } else if (result.intent === 'chart' && result.chartConfig) {
                setChartConfig(result.chartConfig);
                toast.success(`📊 ${result.chartConfig.chartType.toUpperCase()} 차트를 생성했습니다.`);
            } else if (result.intent === 'join' && result.joinConfig) {
                const { targetSheetId, sourceSheetId, targetKey, sourceKey, columnsToCopy } = result.joinConfig;
                const sourceSheet = sheets.find((s: { id: string; name: string; data: any[]; columns: string[] }) => s.id === sourceSheetId);
                const targetSheet = sheets.find((s: { id: string; name: string; data: any[]; columns: string[] }) => s.id === targetSheetId);
                
                if (sourceSheet && targetSheet) {
                    const lookupMap = new Map();
                    sourceSheet.data.forEach((row: any) => {
                        const keyVal = String(row[sourceKey]).trim().toLowerCase();
                        lookupMap.set(keyVal, row);
                    });

                    const newData = data.map((row: any) => {
                        const keyVal = String(row[targetKey]).trim().toLowerCase();
                        const sourceRow = lookupMap.get(keyVal);
                        if (sourceRow) {
                            const newRow = { ...row };
                            columnsToCopy.forEach((col: string) => { if(sourceRow[col] !== undefined) newRow[col] = sourceRow[col]; });
                            return newRow;
                        }
                        return row;
                    });
                    
                    setData(newData); setFilteredData(newData);
                    
                    setSheets(prev => {
                        const arr = [...prev];
                        arr[activeSheetIndex] = { ...arr[activeSheetIndex], data: newData };
                        return arr;
                    });
                    
                    toast.success(`✨ VLOOKUP 완료: ${sourceSheet.name} 데이터 병합됨`);
                } else {
                    toast.error('지정된 시트를 찾을 수 없습니다.');
                }
            } else if (result.intent === 'update' && result.updates) {
                const newData = data.map((row: any, ri: number) => {
                    const rowUpdates = result.updates!.filter(u => u.row === ri);
                    if (rowUpdates.length === 0) return row;
                    
                    const updated = { ...row };
                    rowUpdates.forEach((upd: { col?: number; columnName?: string; value: any }) => {
                        const colName = upd.columnName || (upd.col !== undefined ? columns[upd.col] : undefined);
                        if (colName && columns.includes(colName)) {
                            updated[colName] = upd.value;
                        }
                    });
                    return updated;
                });
                setData(newData); setFilteredData(newData);
                setSheets(prev => {
                    const arr = [...prev];
                    arr[activeSheetIndex] = { ...arr[activeSheetIndex], data: newData };
                    return arr;
                });
                toast.success('✨ 선택 영역이 성공적으로 업데이트되었습니다.');
                setAnalysis(result);
            } else if (result.intent === 'filtering') {
                const { filterColumn, filterValue, filterOperator } = result;
                let filtered = data;
                if (filterColumn && filterValue && columns.includes(filterColumn)) {
                    filtered = data.filter((row: any) => {
                        const cell = String(row[filterColumn]).toLowerCase();
                        const target = String(filterValue).toLowerCase();
                        switch (filterOperator) {
                            case 'equals': return cell === target;
                            case 'contains': return cell.includes(target);
                            case 'greater': return parseFloat(cell) > parseFloat(target);
                            case 'less': return parseFloat(cell) < parseFloat(target);
                            default: return cell.includes(target);
                        }
                    });
                } else {
                    const kw = filterValue || query.replace(/(필터링|해줘|찾아줘|행)/g, '').trim();
                    filtered = data.filter((row: any) =>
                        Object.values(row).some((v: any) => String(v).toLowerCase().includes(kw.toLowerCase()))
                    );
                }
                setFilteredData(filtered);
                filtered.length === 0
                    ? toast.info('검색 결과가 없습니다.')
                    : toast.success(`✨ ${filtered.length}건 필터링되었습니다.`);
                setAnalysis(result);
            } else if (result.intent === 'sort' && result.sortConfig) {
                const { column, direction } = result.sortConfig;
                if (columns.includes(column)) {
                    const sorted = [...data].sort((a: any, b: any) => {
                        const valA = String(a[column] ?? '').replace(/,/g, '');
                        const valB = String(b[column] ?? '').replace(/,/g, '');
                        const numA = parseFloat(valA);
                        const numB = parseFloat(valB);
                        
                        if (!isNaN(numA) && !isNaN(numB)) {
                            return direction === 'asc' ? numA - numB : numB - numA;
                        }
                        return direction === 'asc' 
                            ? String(valA).localeCompare(String(valB))
                            : String(valB).localeCompare(String(valA));
                    });
                    
                    setData(sorted);
                    setFilteredData(sorted);
                    setSheets(prev => {
                        const arr = [...prev];
                        arr[activeSheetIndex] = { ...arr[activeSheetIndex], data: sorted };
                        return arr;
                    });
                    toast.success(`✨ ${column} 기준 ${direction === 'asc' ? '오름차순' : '내림차순'} 정렬 완료`);
                } else {
                    toast.error(`❌ 정렬할 대상 열("${column}")을 찾을 수 없습니다.`);
                }
                setAnalysis(result);
            } else if (result.intent === 'calculation') {
                toast.success('✨ 분석이 완료되었습니다.');
                setAnalysis(result);
            }
        } catch (err: any) {
            console.error('[AI Error]', err);
            setAnalysis({
                intent: 'error',
                explanation: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            });
            toast.error('❌ 정렬 또는 분석 중 오류가 발생했습니다.');
            // 에러 종류 별로 구체적인 메시지 표시
            if (err?.message?.includes('VITE_GEMINI_API_KEY')) {
                toast.error('❌ API 키 미설정: .env 파일에 VITE_GEMINI_API_KEY를 입력해주세요.');
            } else if (err?.response?.status === 401) {
                toast.error('❌ API 키 오류 (401): Gemini 키가 유효하지 않습니다. 키를 다시 확인해주세요.');
            } else if (err?.response?.status === 429) {
                const geminiMsg = err.response.data?.error?.message || '';
                toast.error(`⚠️ 요금 한도 초과 (429): ${geminiMsg || 'Gemini 플랜 한도에 도달했습니다. 1분만 기다려주세요.'}`);
            } else if (err?.response?.data?.error?.message) {
                toast.error(`Gemini 오류: ${err.response.data.error.message}`);
            } else {
                toast.error(`오류: ${err?.message || '알 수 없는 오류'}`);
            }
            console.error('AI Error details:', err?.response?.data || err?.message || err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        try {
            if (data.length === 0) { toast.warning('내보낼 데이터가 없습니다.'); return; }
            
            const keys = Object.keys(data[0]).filter(k => k !== '_id');
            const isAutoGeneratedHeader = keys.length > 0 && keys.every((k: string) => k.match(/^[A-Z]$/));
            
            const aoa: any[][] = [];
            const headerRows: number[] = [];

            // Add keys as header row if not auto-generated (e.g., [A, B, C...])
            if (!isAutoGeneratedHeader) {
                aoa.push(keys);
                // The first row (keys) is technically a header, but maybe not a "section header"
                // Usually we want the real headers to be styled too
                headerRows.push(0); 
            }

            // Helper to check if a row is a section header (consistent with InteractiveGrid)
            const isHeaderRow = (row: any) => {
                const cellValue = String(row[keys[0]] || '');
                const hasOnlyOneValue = keys.filter((k: string) => String(row[k] || '').trim() !== '').length === 1;
                return hasOnlyOneValue || 
                       cellValue.includes('전월대비') || 
                       cellValue.includes('일별') || 
                       cellValue.includes('성과') || 
                       cellValue.includes('요약') || 
                       cellValue.includes('제안') || 
                       cellValue.includes('키워드');
            };

            data.forEach((row: any, i: number) => {
                const isSectionHeader = isHeaderRow(row);
                
                // Insert 2 empty rows before a section header, except for the very first row of the data
                // If we already have a header row (aoa.length > 0), i > 0 is still correct
                if (isSectionHeader && i > 0) {
                    aoa.push(Array(keys.length).fill(''));
                    aoa.push(Array(keys.length).fill(''));
                }

                if (isSectionHeader) {
                    headerRows.push(aoa.length);
                }

                const rowData = keys.map((k: string) => row[k]);
                aoa.push(rowData);
            });

            const ws = XLSX.utils.aoa_to_sheet(aoa);

            // Apply Styles
            const range = XLSX.utils.decode_range(ws['!ref']!);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                const isHeader = headerRows.includes(R);
                const isRowEmpty = aoa[R].every((v: any) => String(v || '').trim() === '');

                if (isRowEmpty) continue;

                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const address = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[address]) ws[address] = { t: 's', v: '' }; // Ensure cell object exists

                    ws[address].s = {
                        alignment: { 
                            wrapText: true, 
                            vertical: 'center',
                            horizontal: 'left',
                            indent: 1 // Add slight horizontal indent for readability
                        },
                        border: {
                            top: { style: 'thin', color: { rgb: "000000" } },
                            bottom: { style: 'thin', color: { rgb: "000000" } },
                            left: { style: 'thin', color: { rgb: "000000" } },
                            right: { style: 'thin', color: { rgb: "000000" } }
                        }
                    };

                    if (isHeader) {
                        ws[address].s.font = { bold: true, color: { rgb: "000000" }, sz: 12 };
                        ws[address].s.fill = { fgColor: { rgb: "E0E0E0" } }; // Light gray background
                        ws[address].s.border = {
                            top: { style: 'thin', color: { rgb: "000000" } },
                            bottom: { style: 'thin', color: { rgb: "000000" } },
                            left: { style: 'thin', color: { rgb: "000000" } },
                            right: { style: 'thin', color: { rgb: "000000" } }
                        };
                    }
                }
            }

            // Autofit & Column Widths
            const colWidths = keys.map((_: string, C: number) => {
                let maxLen = 10;
                for (let R = range.s.r; R <= range.e.r; ++R) {
                    const cell = aoa[R][C];
                    if (cell) {
                        const len = String(cell).length;
                        if (len > maxLen) maxLen = len;
                    }
                }
                return { wch: Math.min(maxLen + 5, 60) }; // Max width 60
            });
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Report');
            XLSX.writeFile(wb, `easyxl_report_${new Date().getTime()}.xlsx`);
            
            toast.success('✨ 가독성이 개선된 엑셀 보고서를 내보냈습니다!');
        } catch (err) { 
            console.error('Export error:', err);
            toast.error('내보내기 중 오류가 발생했습니다.'); 
        }
    };

    const handleSaveToDb = async () => {
        if (filteredData.length === 0) { toast.warning('저장할 데이터가 없습니다.'); return; }
        const title = prompt('시트 제목을 입력하세요:', `EasyXL 시트 ${new Date().toLocaleDateString('ko-KR')}`);
        if (!title) return;
        setIsSaving(true);
        try {
            const columns = Object.keys(filteredData[0]).map((key: string) => ({ field: key, headerName: key }));
            await saveSheet(title, columns, filteredData);
            toast.success(`✅ "${title}" 시트가 DB에 저장되었습니다!`);
        } catch (err: any) {
            toast.error(`DB 저장 실패: ${err?.message || '알 수 없는 오류'}`);
            console.error('Save error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoadSheetList = async () => {
        try {
            const sheets = await listSheets();
            setSavedSheets(sheets);
            setShowSavedSheets(true);
            if (sheets.length === 0) toast.info('저장된 시트가 없습니다.');
        } catch (err: any) {
            toast.error(`시트 목록 조회 실패: ${err?.message || '알 수 없는 오류'}`);
        }
    };

    const handleLoadSheet = async (id: string) => {
        try {
            const sheet = await getSheet(id);
            const dataWithIds = sheet.rows.map((row: any, idx: number) => ({
                ...row,
                _id: row._id || `db_${idx}_${Date.now()}`
            }));
            const columns = dataWithIds.length > 0 ? Object.keys(dataWithIds[0]).filter((k: string) => k !== '_id') : [];
            let newActiveIndex = activeSheetIndex;

            setSheets(prev => {
                const arr = [...prev];
                if (arr[activeSheetIndex] && arr[activeSheetIndex].data.length > 0) {
                    arr.push({ id: `sheet_${Date.now()}`, name: sheet.title, data: dataWithIds, columns });
                    newActiveIndex = arr.length - 1;
                } else {
                    if (arr[activeSheetIndex]) {
                        arr[activeSheetIndex] = { ...arr[activeSheetIndex], name: sheet.title, data: dataWithIds, columns };
                    } else {
                        arr.push({ id: `sheet_${Date.now()}`, name: sheet.title, data: dataWithIds, columns });
                        newActiveIndex = arr.length - 1;
                    }
                }
                return arr;
            });

            if (newActiveIndex !== activeSheetIndex) {
                setActiveSheetIndex(newActiveIndex);
            }

            setData(dataWithIds);
            setFilteredData(dataWithIds);
            setAnalysis(null);
            setChartConfig(null);
            setSelectedRange(null);
            setShowSavedSheets(false);
            toast.success(`📂 "${sheet.title}" 시트를 불러왔습니다!`);
        } catch (err: any) {
            toast.error(`시트 불러오기 실패: ${err?.message || '알 수 없는 오류'}`);
        }
    };

    const hasData = data.length > 0;

    const suggestedQueries = activeTab === 'create'
        ? [
            "커피 브랜드 매출 데이터 5개 생성",
            "서울 주요 구 인구수 표 만들어줘",
            "세계 주요 도시 날씨 정보 생성",
        ]
        : [
            "중복된 데이터 제거해줘",
            "매출액 기준 내림차순 정렬",
            "매출 합계 계산",
        ];

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsGlobalDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsGlobalDragging(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsGlobalDragging(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) handleFilesSelected(files);
    };

    const handleFilesSelected = (files: File[]) => {
        const imageFiles = files.filter((f: File) => f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(f.name));
        const pdfFiles = files.filter((f: File) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
        const excelFiles = files.filter((f: File) => !imageFiles.includes(f) && !pdfFiles.includes(f));

        if (imageFiles.length > 0) {
            handleImagesLoadedFromFiles(imageFiles);
        } else if (pdfFiles.length > 0) {
            handlePDFLoadedFromFile(pdfFiles[0]);
        } else if (excelFiles.length > 0) {
            handleExcelLoadedFromFile(excelFiles[0]);
        }
    };

    const handlePDFLoadedFromFile = async (file: File) => {
        try {
            toast.loading('PDF에서 텍스트를 추출하는 중...');
            const { extractTextFromPDF } = await import('./utils/pdfParser');
            const text = await extractTextFromPDF(file);
            handlePDFLoaded(text);
            toast.dismiss();
        } catch (err) {
            toast.error("PDF 처리 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    const handleImagesLoadedFromFiles = async (files: File[]) => {
        try {
            toast.loading(`${files.length}장의 이미지를 병합 준비 중...`);
            const promises = files.map((file: File) => {
                return new Promise<{base64: string, mimeType: string}>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const result = e.target?.result as string;
                        const base64 = result.split(',')[1];
                        resolve({ base64, mimeType: file.type || 'image/jpeg' });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });
            const imageDataArray = await Promise.all(promises);
            toast.dismiss();
            handleImagesLoaded(imageDataArray);
        } catch (err) {
            toast.error("다중 이미지 파일들을 읽는 중 오류가 발생했습니다.");
            toast.dismiss();
        }
    };

    const handleExcelLoadedFromFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheets = parseExcelWorkbook(workbook);
                if (sheets.length > 0) handleMultiSheetsLoaded(sheets);
                else toast.error("엑셀 파일이 비어있습니다.");
            } catch (err) { toast.error("파일 처리 오류"); }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div 
            className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f0f12] transition-colors duration-500 font-sans relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isGlobalDragging && (
                <div className="absolute inset-0 z-[100] bg-deepblue-900/50 backdrop-blur-sm flex items-center justify-center transition-all">
                    <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border-[3px] border-dashed border-deepblue-500 animate-in zoom-in-95 duration-200 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-deepblue-500 animate-bounce"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">여기에 파일을 내려놓으세요</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">이미지, 엑셀, PDF를 즉시 분석합니다</p>
                        </div>
                    </div>
                </div>
            )}
            <Toaster position="bottom-right" richColors theme={isDark ? 'dark' : 'light'} />
            <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />

            <Header
                isDark={isDark}
                toggleDark={() => setIsDark(!isDark)}
                isPrivacyMode={isPrivacyMode}
                togglePrivacyMode={() => setIsPrivacyMode(!isPrivacyMode)}
                onShowPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
            />

            <Routes>
                <Route path="/" element={
                    <main className="flex-1 flex flex-col items-center pt-12 px-4 pb-20 space-y-8">
                {/* ── 상단: 타이틀 + 검색바 (항상 표시) ── */}
                <div className="w-full max-w-4xl space-y-8 text-center">
                    {/* Center Tab Bar */}
                    <div className="flex justify-center animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner">
                            <button
                                onClick={() => setActiveTab('create')}
                                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'create'
                                    ? 'bg-white dark:bg-[#1a1a1a] text-deepblue-600 shadow-md transform scale-[1.02]'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                엑셀 생성
                            </button>
                            <button
                                onClick={() => setActiveTab('edit')}
                                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'edit'
                                    ? 'bg-white dark:bg-[#1a1a1a] text-deepblue-600 shadow-md transform scale-[1.02]'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                                엑셀 수정
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            당신의 엑셀, <span className="text-deepblue-600 dark:text-deepblue-400">일상언어로 완벽하게 제어하세요</span>
                        </h2>
                        <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            {activeTab === 'create'
                                ? "파일 없이도 당신이 원하는 데이터를 AI가 즉시 생성하고 구성해 드립니다."
                                : "기존 엑셀 데이터를 업로드하고 복잡한 수식 없이 말로만 데이터를 가공하세요."}
                        </p>
                    </div>

                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={(q) => {
                            handleSearch(q);
                        }}
                        onFilesSelected={handleFilesSelected}
                    />

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-2 uppercase tracking-wider">Suggested:</span>
                        {suggestedQueries.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setSearchQuery(q); handleSearch(q); }}
                                className="px-4 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 transition-all shadow-sm"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── 멀티 시트 탭 (시트가 1개 이상이거나 빈 새 시트를 대기중일 때 항상 표시) ── */}
                {sheets.length > 0 && (
                    <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <SheetTabs 
                            sheets={sheets} 
                            activeSheetIndex={activeSheetIndex} 
                            onSelect={(i) => {
                                // 1. 즉각적인 데이터 반영 (0.1초 미만)
                                setSheets(prev => { 
                                    const arr = [...prev]; 
                                    if(arr[activeSheetIndex]) arr[activeSheetIndex].data = data; 
                                    return arr; 
                                });
                                setActiveSheetIndex(i); 
                                setData(sheets[i].data); 
                                setFilteredData(sheets[i].data);
                                
                                // 2. AI 브레인 동기화 알림
                                setAnalysis(null); 
                                setChartConfig(null); 
                                setSelectedRange(null);
                                toast.info(`🤖 AI 브레인이 '${sheets[i].name}' 시트로 이동했습니다.`, { icon: '🧠' });
                            }} 
                            onDelete={handleDeleteSheet} 
                            onAdd={() => {
                                const nextIndex = sheets.length;
                                setSheets(prev => { 
                                    const arr = [...prev]; 
                                    if(arr[activeSheetIndex]) arr[activeSheetIndex].data = data; 
                                    arr.push({ id: `sheet_${Date.now()}`, name: `Sheet ${arr.length + 1}`, data: [], columns: [] });
                                    return arr; 
                                });
                                setActiveSheetIndex(nextIndex);
                                setData([]); setFilteredData([]); setAnalysis(null); setChartConfig(null); setSelectedRange(null);
                            }} 
                        />
                    </div>
                )}

                {/* ── 업로드존: '수정' 모드이면서 데이터가 없을 때만 표시 ── */}
                {activeTab === 'edit' && !hasData && (
                    <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 duration-500">
                        <UploadZone 
                            onSheetsLoaded={handleMultiSheetsLoaded} 
                            onPDFLoaded={handlePDFLoaded} 
                            onImagesLoaded={handleImagesLoaded}
                        />
                    </div>
                )}

                {/* ── 생성 모드 안내 (데이터가 없을 때) ── */}
                {activeTab === 'create' && !hasData && (
                    <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="w-16 h-16 bg-deepblue-50 dark:bg-deepblue-500/10 rounded-3xl flex items-center justify-center mb-2">
                             <span className="text-3xl">✨</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI와 함께 새로운 엑셀을 만들어보세요</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md">
                            검색창에 만들고 싶은 데이터를 입력하거나,<br/>아래의 추천 키워드를 클릭해보세요.
                        </p>
                    </div>
                )}

                {/* ── 로딩 스피너 ── */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-gray-500 font-medium animate-pulse">AI가 데이터를 분석하는 중입니다...</p>
                    </div>
                )}

                {/* ── 분석 결과 카드 ── */}
                {!isLoading && analysis && (
                    <div className="w-full max-w-6xl animate-in fade-in zoom-in-95 duration-500">
                        <AnalysisCard analysis={analysis} />
                    </div>
                )}

                {/* ── Talk-to-Chart 패널 ── */}
                {!isLoading && chartConfig && hasData && (
                    <div className="w-full max-w-6xl animate-in fade-in zoom-in-95 duration-500">
                        <AIChartPanel
                            data={filteredData}
                            chartConfig={chartConfig}
                            onClose={() => setChartConfig(null)}
                        />
                    </div>
                )}

                {/* ── 데이터가 있을 때만: AI 인사이트 + 그리드 ── */}
                {hasData && (
                    <div className="w-full max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AnalyticsDashboard data={filteredData} />

                        <div className="shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Interactive AI Grid
                                        <span className="text-xs font-normal text-gray-400 ml-1">
                                            ({filteredData.length}행 / 전체 {data.length}행)
                                        </span>
                                    </h3>
                                    {selectedRange && (
                                        <span className="text-[10px] text-indigo-500 font-mono">
                                            Selection: Row {selectedRange.startRow + 1}–{selectedRange.endRow + 1}, Col {selectedRange.startCol + 1}–{selectedRange.endCol + 1}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-[10px] text-amber-700 dark:text-amber-400 font-medium animate-in fade-in slide-in-from-right-2 duration-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                                        내보내기 시 원본 데이터가 모두 포함됩니다
                                    </div>
                                    {filteredData.length < data.length && (
                                        <button
                                            onClick={() => { setFilteredData(data); setAnalysis(null); toast.info('필터가 해제되었습니다.'); }}
                                            className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:text-indigo-500 transition-all"
                                        >
                                            필터 해제
                                        </button>
                                    )}
                                    <button
                                        onClick={handleExport}
                                        className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-green-600/30 active:scale-95"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                        Export Excel
                                    </button>
                                    <button
                                        onClick={handleSaveToDb}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                                        {isSaving ? '저장 중...' : 'DB 저장'}
                                    </button>
                                    <button
                                        onClick={handleLoadSheetList}
                                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-purple-600/30 active:scale-95"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                        내 시트
                                    </button>
                                </div>
                            </div>

                            <ErrorBoundary>
                                <InteractiveGrid
                                    data={filteredData}
                                    onSelectionChange={(r: number, c: number, r2: number, c2: number) => setSelectedRange({ startRow: r, startCol: c, endRow: r2, endCol: c2 })}
                                    onDataChange={(updatedFilteredData: any[]) => {
                                        // 필터링된 데이터의 변경사항을 원본 데이터(data)에 병합
                                        const newData = data.map(originalRow => {
                                            const found = updatedFilteredData.find(u => u._id === originalRow._id);
                                            return found ? found : originalRow;
                                        });
                                        setData(newData); 
                                        setFilteredData(updatedFilteredData); 
                                    }}
                                />
                            </ErrorBoundary>

                        </div>

                        {/* 하단 여백용 */}
                        <div className="h-4"></div>

                        {/* ── 저장된 시트 목록 ── */}
                        {showSavedSheets && savedSheets.length > 0 && (
                            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xl animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                        저장된 시트 ({savedSheets.length})
                                    </h3>
                                    <button onClick={() => setShowSavedSheets(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {savedSheets.map(sheet => (
                                        <div key={sheet.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#262626] hover:bg-gray-100 dark:hover:bg-[#333] transition-colors">
                                            <button
                                                onClick={() => handleLoadSheet(sheet.id)}
                                                className="flex-1 text-left"
                                            >
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{sheet.title}</span>
                                                <span className="block text-xs text-gray-400 mt-0.5">
                                                    {new Date(sheet.created_at).toLocaleString('ko-KR')}
                                                </span>
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await deleteSheet(sheet.id);
                                                        setSavedSheets(prev => prev.filter(s => s.id !== sheet.id));
                                                        toast.success('시트가 삭제되었습니다.');
                                                    } catch { toast.error('삭제 실패'); }
                                                }}
                                                className="ml-3 p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        } />
        <Route path="/guide" element={<Guide />} />
        <Route path="/privacy" element={<Privacy />} />
    </Routes>

    {/* Global Footer */}
    <footer className="w-full py-8 border-t border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-[#0f0f12]">
        <div className="container mx-auto px-4 text-center">
            <Link to="/privacy" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                개인정보처리방침
            </Link>
        </div>
    </footer>
</div>
    );
}
