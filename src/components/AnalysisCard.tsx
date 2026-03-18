import { useState } from 'react';
import { Sparkles, TrendingUp, Filter, Edit3, SortDesc, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const intentIcon: Record<string, any> = {
    calculation: TrendingUp,
    filtering: Filter,
    update: Edit3,
    generation: Sparkles,
    join: Sparkles,
    sort: SortDesc,
    error: AlertCircle
};

const intentLabel: Record<string, string> = {
    calculation: '계산 결과',
    filtering: '필터링 완료',
    update: '데이터 수정 완료',
    generation: '데이터 생성 완료',
    join: '데이터 병합(Join) 완료',
    sort: '데이터 정렬 완료',
    error: '분석 오류',
};

const intentColor: Record<string, string> = {
    calculation: 'from-[#0f172a] to-[#1e1b4b]',
    filtering: 'from-[#0c4a6e] to-[#075985]',
    update: 'from-[#064e3b] to-[#065f46]',
    generation: 'from-[#1e1b4b] to-[#312e81]',
    join: 'from-[#4c1d95] to-[#5b21b6]',
    sort: 'from-[#334155] to-[#475569]',
    error: 'from-[#991b1b] to-[#b91c1c]',
};

export default function AnalysisCard({ analysis }: { analysis: any }) {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!analysis) return null;

    const Icon = intentIcon[analysis.intent] ?? Sparkles;
    const label = intentLabel[analysis.intent] ?? 'AI 분석';
    const gradient = intentColor[analysis.intent] ?? 'from-indigo-500 to-purple-600';

    return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xl dark:shadow-none flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{label}</h3>
                    <div className="relative">
                        <p className={`text-sm text-gray-500 dark:text-gray-400 transition-all duration-300 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                            {analysis.explanation}
                        </p>
                        {analysis.explanation && analysis.explanation.length > 100 && (
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-0.5"
                            >
                                {isExpanded ? (
                                    <>접기 <ChevronUp className="w-3 h-3" /></>
                                ) : (
                                    <>더 보기 <ChevronDown className="w-3 h-3" /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {analysis.intent === 'calculation' && analysis.calculatedValue !== undefined && (
                <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-8 text-center shadow-2xl border border-white/10`}>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">
                        {analysis.operation === 'sum' ? '합계' :
                            analysis.operation === 'average' ? '평균' :
                                analysis.operation === 'max' ? '최댓값' :
                                    analysis.operation === 'min' ? '최솟값' :
                                        analysis.operation === 'count' ? '개수' : '결과'}
                    </p>
                    <p className="text-white text-5xl font-black tracking-tighter drop-shadow-2xl">
                        {typeof analysis.calculatedValue === 'number'
                            ? analysis.calculatedValue.toLocaleString()
                            : analysis.calculatedValue}
                        <span className="text-2xl font-bold ml-1 text-white">{analysis.unit}</span>
                    </p>
                </div>
            )}

            {analysis.intent === 'generation' && analysis.generatedData && (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-4">
                    <p className="text-indigo-700 dark:text-indigo-400 text-sm font-semibold">
                        ✨ {analysis.generatedData.length}행의 새로운 데이터가 생성되었습니다.
                    </p>
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {Object.keys(analysis.generatedData[0] || {}).map(col => (
                            <span key={col} className="px-2 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 font-bold">
                                {col}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {analysis.intent === 'join' && analysis.joinConfig && (
                <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800/30 rounded-xl p-4">
                    <p className="text-violet-700 dark:text-violet-400 text-sm">
                         🔗 <span className="font-bold">"{analysis.joinConfig.sourceSheetId}"</span> 시트의 데이터를 기반으로 현재 시트에 병합을 완료했습니다.
                    </p>
                </div>
            )}

            {analysis.intent === 'sort' && analysis.sortConfig && (
                <div className="bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800/30 rounded-xl p-4">
                    <p className="text-slate-700 dark:text-slate-400 text-sm">
                        정렬 기준: <span className="font-bold">"{analysis.sortConfig.column}"</span> 열,{' '}
                        <span className="font-bold">{analysis.sortConfig.direction === 'asc' ? '오름차순' : '내림차순'}</span>으로 정렬했습니다.
                    </p>
                </div>
            )}

            {analysis.intent === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-4">
                    <p className="text-red-700 dark:text-red-400 text-sm font-semibold">
                        {analysis.explanation}
                    </p>
                </div>
            )}

            {analysis.intent === 'update' && analysis.updates && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4">
                    <p className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                        ✅ {analysis.updates.length}개 셀이 수정되었습니다.
                    </p>
                </div>
            )}

            {analysis.intent === 'filtering' && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
                    <p className="text-blue-700 dark:text-blue-400 text-sm">
                        <span className="font-semibold">{analysis.filterColumn}</span> 열에서 <span className="font-semibold">"{analysis.filterValue}"</span> 조건으로 필터링했습니다.
                    </p>
                </div>
            )}
        </div>
    );
}

