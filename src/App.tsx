import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import AnalysisCard from './components/AnalysisCard';
import DataGrid from './components/DataGrid';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PrivacyModal from './components/PrivacyModal';
import { Toaster, toast } from 'sonner';
import * as XLSX from 'xlsx';
import { processNaturalLanguageQuery, type AIAnalysisResult } from './services/aiService';
import { FileEdit, FilePlus, Share2, Download } from 'lucide-react';

export default function App() {
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [isPrivacyMode] = useState(true);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(true);
    const [track, setTrack] = useState<'home' | 'modify' | 'create'>('home');
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
        } else if (track === 'home') {
            setShowUpload(true);
        }
    }, [data, track]);

    // NLP Helper: Local Parsing Fallback
    const parseLocalFiltering = (query: string, columns: string[]) => {
        const cleanQuery = query.replace(/(필터링|해줘|보여줘|찾아줘|조건|검색|행)/g, '').trim();
        // Simple "Column is Value" check
        for (const col of columns) {
            if (cleanQuery.includes(col)) {
                const val = cleanQuery.replace(col, '').replace(/[:=]|이(인|인것)/g, '').trim();
                if (val) return { col, val };
            }
        }
        return null;
    };

    const handleSearch = async (query: string) => {
        if (!query) {
            setFilteredData(data);
            setAnalysis(null);
            return;
        }

        setIsLoading(true);
        // Requirement 3: Mandatory screen transition
        setShowUpload(false);
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        try {
            const columns = data.length > 0 ? Object.keys(data[0]) : [];
            const result = await processNaturalLanguageQuery(query, columns, data);

            setAnalysis(result);

            if (result.intent === 'generation' && result.generatedData) {
                setData(result.generatedData);
                setFilteredData(result.generatedData);
                setAnalysis(null);
                toast.success('데이터가 성공적으로 생성되었습니다.');
            } else if (result.intent === 'calculation' && result.operation && result.operation !== 'none') {
                const col = result.targetColumn;
                if (!col || !columns.includes(col)) {
                    toast.error(`해당하는 열('${col || '알 수 없음'}')을 찾을 수 없습니다.`);
                    result.calculatedValue = "N/A";
                } else {
                    const values = data.map(row => {
                        const val = row[col];
                        return typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
                    }).filter(v => !isNaN(v));

                    let calcResult: number = 0;
                    switch (result.operation) {
                        case 'sum': calcResult = values.reduce((a, b) => a + b, 0); break;
                        case 'average': calcResult = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
                        case 'count': calcResult = values.length; break;
                        case 'max': calcResult = Math.max(...values); break;
                        case 'min': calcResult = Math.min(...values); break;
                    }
                    result.calculatedValue = calcResult;
                    toast.success('전체 데이터를 기반으로 계산을 완료했습니다.');
                }
            } else if (result.intent === 'filtering') {
                const { filterColumn, filterValue, filterOperator } = result;
                let filtered = data;

                if (filterColumn && filterValue && columns.includes(filterColumn)) {
                    filtered = data.filter(row => {
                        const cellValue = String(row[filterColumn]).toLowerCase();
                        const targetValue = String(filterValue).toLowerCase();
                        switch (filterOperator) {
                            case 'equals': return cellValue === targetValue;
                            case 'contains': return cellValue.includes(targetValue);
                            case 'greater': return parseFloat(cellValue) > parseFloat(targetValue);
                            case 'less': return parseFloat(cellValue) < parseFloat(targetValue);
                            default: return cellValue.includes(targetValue);
                        }
                    });
                } else {
                    // Fallback to simpler keyword search across all columns
                    const keyword = filterValue || query.replace(/(필터링|해줘|찾아줘|행)/g, '').trim();
                    filtered = data.filter(row =>
                        Object.values(row).some(val => String(val).toLowerCase().includes(keyword.toLowerCase()))
                    );
                }

                setFilteredData(filtered);
                if (filtered.length === 0) {
                    toast.info('검색 결과가 없습니다. 조건을 확인해주세요.');
                } else {
                    toast.success(`${filtered.length}건이 필터링되었습니다.`);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error('분석 중 오류가 발생했습니다. AI 서비스 연결을 확인해주세요.');
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
        "이름이 '차도운'인 행 필터링",
        "매출 합계 계산",
        "영화명, 장르 열을 가진 샘플 10행 만들어줘"
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f0f12] transition-colors duration-500 font-sans">
            <Toaster position="bottom-right" richColors theme={isDark ? 'dark' : 'light'} />
            <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />

            <Header
                isDark={isDark}
                toggleDark={() => setIsDark(!isDark)}
                isPrivacyMode={isPrivacyMode}
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
                                if (data.length === 0 && track !== 'create') {
                                    toast.error('먼저 엑셀 파일을 업로드하거나 생성 모드를 선택해주세요.');
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
                                    onClick={() => {
                                        setSearchQuery(q);
                                        if (data.length > 0 || track === 'create') handleSearch(q);
                                        else toast.error('먼저 트랙을 선택해주세요.');
                                    }}
                                    className="px-4 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-500 transition-all shadow-sm"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {track === 'home' && data.length === 0 && (
                        <div className="grid md:grid-cols-2 gap-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <button
                                onClick={() => setTrack('modify')}
                                className="group p-8 bg-white dark:bg-[#1a1a1a] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left space-y-4"
                            >
                                <div className="p-3 bg-indigo-500/10 rounded-2xl w-fit group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <FileEdit className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">기존 파일 업로드</h3>
                                    <p className="text-gray-500 dark:text-gray-400">엑셀 파일을 올려서 분석하고 수정해보세요.</p>
                                </div>
                            </button>
                            <button
                                onClick={() => { setTrack('create'); setData([]); setFilteredData([]); }}
                                className="group p-8 bg-white dark:bg-[#1a1a1a] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left space-y-4"
                            >
                                <div className="p-3 bg-indigo-500/10 rounded-2xl w-fit group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <FilePlus className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">새 시트 생성</h3>
                                    <p className="text-gray-500 dark:text-gray-400">빈 시트에서 자연어로 데이터를 만들어보세요.</p>
                                </div>
                            </button>
                        </div>
                    )}

                    <div className={`transition-all duration-700 overflow-hidden ${track === 'modify' && data.length === 0 && showUpload ? 'max-h-[500px] opacity-100 mt-8' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                        <UploadZone onDataLoaded={(d) => { setData(d); setFilteredData(d); toast.success('파일이 성공적으로 로드되었습니다!'); }} />
                    </div>
                </div>

                <div ref={resultsRef} className="w-full max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-24 space-y-6 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
                            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <div className="space-y-2 text-center">
                                <p className="text-xl font-bold text-gray-900 dark:text-white">데이터 분석 및 처리 중...</p>
                                <p className="text-gray-500 dark:text-gray-400 animate-pulse">잠시만 기다려주세요.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {analysis && analysis.intent === 'calculation' && analysis.calculatedValue !== undefined && (
                                <ResultCard
                                    value={analysis.calculatedValue}
                                    unit={analysis.unit}
                                    explanation={analysis.explanation}
                                />
                            )}

                            {analysis && analysis.intent === 'filtering' && (
                                <AnalysisCard analysis={analysis} />
                            )}

                            {data.length > 0 && (
                                <>
                                    <AnalyticsDashboard data={filteredData} />
                                    <div className="relative group shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                Processed Results
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toast.info('준비 중입니다.')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl"><Share2 className="w-4 h-4" /> Google Sheets</button>
                                                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl"><Download className="w-4 h-4" /> Excel Download</button>
                                            </div>
                                        </div>
                                        <div className="max-h-[600px] overflow-auto">
                                            <DataGrid data={filteredData} isPrivacyMode={isPrivacyMode} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
