import { Code, Info } from 'lucide-react';

export default function AnalysisCard({ analysis }: { analysis: any }) {
    if (!analysis) return null;

    return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col gap-5 animate-in fade-in slide-in-from-top-4 duration-500 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">AI Analysis & Formula</h3>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-[#222222] rounded-xl font-mono text-sm text-indigo-600 dark:text-indigo-400 flex items-center justify-between group border border-gray-100 dark:border-gray-800">
                <span className="tracking-wide font-medium">{analysis.formula}</span>

                {/* Tooltip for Transparency */}
                <div className="relative flex items-center">
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <Info className="w-4 h-4 text-gray-400" />
                    </button>
                    <div className="absolute bottom-full right-0 mb-3 w-64 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-gray-700">
                        해당 수식은 다음 열의 데이터를 바탕으로 작성되었습니다:
                        <span className="block mt-1 text-indigo-300 font-medium">{analysis.references.join(", ")}</span>
                        <div className="absolute -bottom-1 right-2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45 border-r border-b border-gray-700"></div>
                    </div>
                </div>
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300 bg-indigo-50/50 dark:bg-indigo-500/5 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-500/10 leading-relaxed">
                <span className="font-semibold text-gray-900 dark:text-gray-100 mr-2">실행 계획:</span>
                {analysis.plan}
            </div>
        </div>
    );
}
