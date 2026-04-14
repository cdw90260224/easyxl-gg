import { TrendingUp, Calculator } from 'lucide-react';

interface ResultCardProps {
    value: string | number;
    unit?: string;
    explanation?: string;
}

export default function ResultCard({ value, unit = '', explanation }: ResultCardProps) {
    const formattedValue = typeof value === 'number'
        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : value;

    return (
        <div className="w-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 border border-indigo-500/20 dark:border-indigo-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-sm animate-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/30">
                        <Calculator className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Analysis Result</p>
                        <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{explanation || "요청하신 필터링 및 계산 결과입니다."}</h4>
                    </div>
                </div>

                <div className="text-center md:text-right">
                    <div className="flex items-baseline justify-center md:justify-end gap-2">
                        <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {formattedValue}
                        </span>
                        <span className="text-xl md:text-2xl font-bold text-indigo-500 dark:text-indigo-400">
                            {unit}
                        </span>
                    </div>
                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-500/20">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Calculated Real-time
                    </div>
                </div>
            </div>
        </div>
    );
}
