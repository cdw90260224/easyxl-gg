import { useState, useEffect } from 'react';
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
    const [selectedRange, setSelectedRange] = useState<SelectionContext['rangeCoords']>(null);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDark]);

    const handleDataLoaded = (d: any[]) => {
        setData(d);
        setFilteredData(d);
        setAnalysis(null);
        toast.success(`✅ ${d.length}행의 데이터가 로드되었습니다!`);
    };

    const handleSearch = async (query: string) => {
        if (!query) { setFilteredData(data); setAnalysis(null); return; }
        setIsLoading(true);
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
            const result = await processNaturalLanguageQuery(query, columns, data, selectionContext);
            setAnalysis(result);
            if (result.intent === 'generation' && result.generatedData) {
                setData(result.generatedData); setFilteredData(result.generatedData);
                toast.success('데이터를 생성했습니다.');
            } else if (result.intent === 'update' && result.updates) {
                const newData = data.map((row, ri) => {
                    const upd = result.updates!.find(u => u.row === ri);
                    if (!upd) return row;
                    const updated = { ...row };
                    updated[columns[upd.col]] = upd.value;
                    return updated;
                });
                setData(newData); setFilteredData(newData);
                toast.success('선택 영역이 업데이트되었습니다.');
            } else if (result.intent === 'filtering') {
                const { filterColumn, filterValue, filterOperator } = result;
                let filtered = data;
                if (filterColumn && filterValue && columns.includes(filterColumn)) {
                    filtered = data.filter(row => {
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
                    filtered = data.filter(row =>
                        Object.values(row).some(v => String(v).toLowerCase().includes(kw.toLowerCase()))
                    );
                }
                setFilteredData(filtered);
                filtered.length === 0
                    ? toast.info('검색 결과가 없습니다.')
                    : toast.success(`${filtered.length}건 필터링되었습니다.`);
            } else if (result.intent === 'calculation') {
                toast.success('분석이 완료되었습니다.');
            }
        } catch (err: any) {
            // 에러 종류 별로 구체적인 메시지 표시
            if (err?.message?.includes('VITE_OPENAI_API_KEY')) {
                toast.error('❌ API 키 미설정: .env 파일에 VITE_OPENAI_API_KEY를 입력해주세요.');
            } else if (err?.response?.status === 401) {
                toast.error('❌ API 키 오류 (401): OpenAI 키가 유효하지 않습니다. 키를 다시 확인해주세요.');
            } else if (err?.response?.status === 429) {
                toast.error('⚠️ 요금 한도 초과 (429): OpenAI 플랜 한도에 도달했습니다.');
            } else if (err?.response?.data?.error?.message) {
                toast.error(`OpenAI 오류: ${err.response.data.error.message}`);
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
            if (filteredData.length === 0) { toast.warning('내보낼 데이터가 없습니다.'); return; }
            const exportData = filteredData.map(row => {
                const newRow: any = { ...row };
                if (isPrivacyMode) {
                    Object.keys(newRow).forEach(key => {
                        const lc = key.toLowerCase();
                        if (lc.includes('이름') || lc.includes('name') || lc.includes('담당자')) newRow[key] = '[NAME_HIDDEN]';
                        else if (lc.includes('연락처') || lc.includes('phone') || lc.includes('전화')) newRow[key] = '[PHONE_HIDDEN]';
                        else if (lc.includes('email') || lc.includes('이메일')) newRow[key] = '[EMAIL_HIDDEN]';
                        else if (lc.includes('주소') || lc.includes('address')) newRow[key] = '[ADDRESS_HIDDEN]';
                    });
                }
                return newRow;
            });
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            XLSX.writeFile(wb, 'easyxl_export.xlsx');
            toast.success('엑셀 파일로 내보냈습니다!');
        } catch { toast.error('내보내기 중 오류가 발생했습니다.'); }
    };

    const suggestedQueries = [
        "이름이 '차도운'인 행 필터링",
        "매출 합계 계산",
        "선택한 영역 10% 인상해줘",
    ];

    const hasData = data.length > 0;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f0f12] transition-colors duration-500 font-sans">
            <Toaster position="bottom-right" richColors theme={isDark ? 'dark' : 'light'} />
            <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />

            <Header
                isDark={isDark}
                toggleDark={() => setIsDark(!isDark)}
                isPrivacyMode={isPrivacyMode}
                togglePrivacyMode={() => setIsPrivacyMode(!isPrivacyMode)}
                onShowPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
            />

            <main className="flex-1 flex flex-col items-center pt-12 px-4 pb-20 space-y-8">
                {/* ── 상단: 타이틀 + 검색바 (항상 표시) ── */}
                <div className="w-full max-w-4xl space-y-6 text-center">
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            당신의 엑셀, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">일상언어로 완벽하게 제어하세요</span>
                        </h2>
                        <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            파일을 업로드하고 원하는 작업을 자연어로 입력만 하세요.
                        </p>
                    </div>

                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={(q) => {
                            if (!hasData) { toast.error('먼저 엑셀 파일을 업로드해주세요.'); return; }
                            handleSearch(q);
                        }}
                    />

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-2 uppercase tracking-wider">Suggested:</span>
                        {suggestedQueries.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setSearchQuery(q); if (hasData) handleSearch(q); else toast.error('먼저 파일을 업로드해주세요.'); }}
                                className="px-4 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 transition-all shadow-sm"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── 업로드존: 데이터가 없을 때만 표시 ── */}
                {!hasData && (
                    <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 duration-500">
                        <UploadZone onDataLoaded={handleDataLoaded} />
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
                                <div className="flex items-center gap-2">
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
                                </div>
                            </div>

                            <InteractiveGrid
                                data={filteredData}
                                onSelection={(r, c, r2, c2) => setSelectedRange({ startRow: r, startCol: c, endRow: r2, endCol: c2 })}
                                onDataChange={(newData) => { setData(newData); setFilteredData(newData); }}
                            />
                        </div>

                        {/* 다시 업로드하기 */}
                        <div className="text-center">
                            <button
                                onClick={() => { setData([]); setFilteredData([]); setAnalysis(null); setSelectedRange(null); setSearchQuery(''); }}
                                className="text-sm text-gray-400 hover:text-indigo-500 transition-colors underline underline-offset-4"
                            >
                                다른 파일 업로드하기
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
