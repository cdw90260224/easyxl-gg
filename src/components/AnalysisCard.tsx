import { Sparkles, TrendingUp, Filter, Edit3 } from 'lucide-react';

const intentIcon: Record<string, any> = {
    calculation: TrendingUp,
    filtering: Filter,
    update: Edit3,
    generation: Sparkles,
};

const intentLabel: Record<string, string> = {
    calculation: '계산 결과',
    filtering: '필터링 완료',
    update: '데이터 수정 완료',
    generation: '데이터 생성',
};

const intentColor: Record<string, string> = {
    calculation: 'from-indigo-500 to-purple-600',
    filtering: 'from-blue-500 to-cyan-500',
    update: 'from-emerald-500 to-teal-500',
    generation: 'from-pink-500 to-rose-500',
};

export default function AnalysisCard({ analysis }: { analysis: any }) {
    if (!analysis) return null;

    const Icon = intentIcon[analysis.intent] ?? Sparkles;
    const label = intentLabel[analysis.intent] ?? 'AI 분석';
    const gradient = intentColor[analysis.intent] ?? 'from-indigo-500 to-purple-600';

    return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xl dark:shadow-none flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 max-w-4xl mx-auto w-full">
            {/* 헤더 */}
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{label}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{analysis.explanation}</p>
                </div>
            </div>

            {/* 계산 결과 강조 표시 */}
            {analysis.intent === 'calculation' && analysis.calculatedValue !== undefined && (
                <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-center`}>
                    <p className="text-white/70 text-sm font-medium mb-1">
                        {analysis.operation === 'sum' ? '합계' :
                            analysis.operation === 'average' ? '평균' :
                                analysis.operation === 'max' ? '최댓값' :
                                    analysis.operation === 'min' ? '최솟값' :
                                        analysis.operation === 'count' ? '개수' : '결과'}
                    </p>
                    <p className="text-white text-4xl font-black tracking-tight">
                        {typeof analysis.calculatedValue === 'number'
                            ? analysis.calculatedValue.toLocaleString()
                            : analysis.calculatedValue}
                        <span className="text-xl font-medium ml-1 opacity-80">{analysis.unit}</span>
                    </p>
                    {analysis.formula && (
                        <p className="text-white/60 text-xs font-mono mt-2">{analysis.formula}</p>
                    )}
                </div>
            )}

            {/* 업데이트 요약 */}
            {analysis.intent === 'update' && analysis.updates && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4">
                    <p className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                        ✅ {analysis.updates.length}개 셀이 수정되었습니다.
                    </p>
                </div>
            )}

            {/* 필터링 안내 */}
            {analysis.intent === 'filtering' && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
                    <p className="text-blue-700 dark:text-blue-400 text-sm">
                        <span className="font-semibold">{analysis.filterColumn}</span> 열에서{' '}
                        <span className="font-semibold">"{analysis.filterValue}"</span> 조건으로 필터링했습니다.
                    </p>
                </div>
            )}
        </div>
    );
}
