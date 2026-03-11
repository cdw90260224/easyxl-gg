import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import SearchBar from './components/SearchBar';
import AnalysisCard from './components/AnalysisCard';
import InteractiveGrid from './components/InteractiveGrid';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PrivacyModal from './components/PrivacyModal';
import { Toaster, toast } from 'sonner';
import * as XLSX from 'xlsx';
import { processNaturalLanguageQuery, type AIAnalysisResult, type SelectionContext } from './services/aiService';

export default function App() {
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [isPrivacyMode, setIsPrivacyMode] = useState(true);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(true);

    // Selection state
    const [selectedRange, setSelectedRange] = useState<SelectionContext['rangeCoords']>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Theme state
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDark]);

    useEffect(() => {
        if (data.length > 0) {
            const timer = setTimeout(() => setShowUpload(false), 500);
            return () => clearTimeout(timer);
        } else {
            setShowUpload(true);
        }
    }, [data]);

    const handleSearch = async (query: string) => {
        if (!query) {
            setFilteredData(data);
            setAnalysis(null);
            return;
        }

        setIsLoading(true);
        try {
            const columns = data.length > 0 ? Object.keys(data[0]) : [];

            // Construct selection context if available
            let selectionContext: SelectionContext | undefined;
            if (selectedRange) {
                const selectedData: any[][] = [];
                for (let r = selectedRange.startRow; r <= selectedRange.endRow; r++) {
                    const rowData: any[] = [];
                    for (let c = selectedRange.startCol; c <= selectedRange.endCol; c++) {
                        const rowObj = data[r];
                        if (rowObj) {
                            const colKey = columns[c];
                            rowData.push(rowObj[colKey]);
                        }
                    }
                    selectedData.push(rowData);
                }
                selectionContext = { selectedData, rangeCoords: selectedRange };
            }

            const result = await processNaturalLanguageQuery(query, columns, data, selectionContext);
            setAnalysis(result);

            // 1. Handle Generation
            if (result.intent === 'generation' && result.generatedData) {
                setData(result.generatedData);
                setFilteredData(result.generatedData);
                toast.success('데이터를 생성했습니다.');
            }
            // 2. Handle Update (Cell-level mutation)
            else if (result.intent === 'update' && result.updates) {
                const newData = [...data];
                result.updates.forEach(upd => {
                    if (newData[upd.row]) {
                        const colKey = columns[upd.col];
                        newData[upd.row][colKey] = upd.value;
                    }
                });
                setData(newData);
                setFilteredData(newData);
                toast.success('데이터가 업데이트되었습니다.');
            }
            // 3. Handle Filtering
            else if (result.intent === 'filtering') {
                const keywords = query.toLowerCase().split(/and|&|,|\s+/).filter(k => k.length > 0);
                setFilteredData(data.filter(row => {
                    const rowString = Object.values(row).map(String).join(' ').toLowerCase();
                    return keywords.every(kw => rowString.includes(kw));
                }));
                toast.success('데이터를 필터링했습니다.');
            }
            // 4. Handle Calculation
            else if (result.intent === 'calculation') {
                toast.success('분석이 완료되었습니다.');
            }

            // Scroll to results
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });

        } catch (err) {
            toast.error('AI 분석 중 오류가 발생했습니다. API 키를 확인해주세요.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        try {
            if (filteredData.length === 0) {
                toast.warning('내보낼 데이터가 없습니다.');
                return;
            }

            const exportData = filteredData.map(row => {
                const newRow: any = { ...row };
                if (isPrivacyMode) {
                    Object.keys(newRow).forEach(key => {
                        const lowerCol = key.toLowerCase();
                        if (lowerCol.includes('이름') || lowerCol.includes('name') || lowerCol.includes('담당자')) {
                            newRow[key] = '[NAME_HIDDEN]';
                        } else if (lowerCol.includes('연락처') || lowerCol.includes('phone') || lowerCol.includes('tel') || lowerCol.includes('전화')) {
                            newRow[key] = '[PHONE_HIDDEN]';
                        } else if (lowerCol.includes('email') || lowerCol.includes('이메일') || lowerCol.includes('메일')) {
                            newRow[key] = '[EMAIL_HIDDEN]';
                        } else if (lowerCol.includes('주소') || lowerCol.includes('address')) {
                            newRow[key] = '[ADDRESS_HIDDEN]';
                        }
                    });
                }
                return newRow;
            });

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "easyxl_export.xlsx");
            toast.success('데이터가 성공적으로 엑셀로 내보내졌습니다!');
        } catch (err) {
            toast.error('내보내기 중 오류가 발생했습니다.');
        }
    };

    const suggestedQueries = [
        "선택한 영역 10% 인상해줘",
        "이름이 '차도운'인 행 필터링",
        "매출 합계 계산",
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f0f12] transition-colors duration-500">
            <Toaster position="bottom-right" richColors theme={isDark ? 'dark' : 'light'} />
            <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />

            <Header
                isDark={isDark}
                toggleDark={() => setIsDark(!isDark)}
                isPrivacyMode={isPrivacyMode}
                togglePrivacyMode={() => setIsPrivacyMode(!isPrivacyMode)}
                onShowPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
            />

            <main className="flex-1 flex flex-col items-center pt-12 px-4 space-y-12">
                <div className="w-full max-w-4xl space-y-8 text-center">
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-all">
                            당신의 엑셀, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">일상언어로 완벽하게 제어하세요</span>
                        </h2>
                        <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            파일을 업로드하고 원하는 작업을 자연어로 입력만 하세요.
                        </p>
                    </div>

                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSearch={(q) => {
                                if (data.length === 0) {
                                    toast.error('먼저 엑셀 파일을 업로드해주세요.');
                                    return;
                                }
                                handleSearch(q);
                            }}
                        />

                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-2 uppercase tracking-wider">Suggested:</span>
                            {suggestedQueries.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setSearchQuery(q); if (data.length > 0) handleSearch(q); else toast.error('먼저 파일을 업로드해주세요.'); }}
                                    className="px-4 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-500 transition-all shadow-sm"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`transition-all duration-700 overflow-hidden ${showUpload ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                        <UploadZone onDataLoaded={(d) => {
                            setData(d);
                            setFilteredData(d);
                            toast.success(`${d.length}행의 데이터가 로드되었습니다!`);
                            // Scroll to grid after short delay for animation
                            setTimeout(() => {
                                document.getElementById('data-grid-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 600);
                        }} />
                    </div>
                </div>

                <div id="data-grid-section" className="w-full max-w-6xl space-y-8 pb-20">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-gray-500 font-medium animate-pulse">AI가 맥락과 영역을 분석하는 중입니다...</p>
                        </div>
                    )}

                    {!isLoading && analysis && <AnalysisCard analysis={analysis} />}

                    {data.length > 0 && <AnalyticsDashboard data={data} />}

                    <div className="relative group shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#1a1a1a] transition-all duration-500">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${data.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'}`} />
                                    {data.length > 0 ? 'Interactive AI Grid' : 'Data Preview'}
                                </h3>
                                {selectedRange && (
                                    <span className="text-[10px] text-indigo-500 font-mono">Selection: Row {selectedRange.startRow + 1}-{selectedRange.endRow + 1}</span>
                                )}
                            </div>
                            {data.length > 0 && (
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-green-600/30 hover:shadow-green-600/50 hover:scale-[1.02] active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                    Export Data
                                </button>
                            )}
                        </div>

                        <InteractiveGrid
                            data={filteredData}
                            onSelection={(r, c, r2, c2) => setSelectedRange({ startRow: r, startCol: c, endRow: r2, endCol: c2 })}
                            onDataChange={(newData) => { setData(newData); setFilteredData(newData); }}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
