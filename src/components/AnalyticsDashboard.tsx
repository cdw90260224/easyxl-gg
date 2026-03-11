import { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface AnalyticsDashboardProps {
    data: any[];
}

const COLORS = ['#6366f1', '#e879f9', '#ec4899', '#f43f5e', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8'];

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    if (!data || data.length === 0) return null;

    const chartConfig = useMemo(() => {
        if (data.length === 0) return null;

        const sampleRow = data[0];
        const keys = Object.keys(sampleRow);

        let numericKey: string | null = null;
        let categoricalKey: string | null = null;

        for (const key of keys) {
            const type = typeof sampleRow[key];
            const val = sampleRow[key];

            if (type === 'number' && !numericKey && key.toLowerCase() !== 'id' && key.toLowerCase() !== 'no') {
                numericKey = key;
            }

            if (type === 'string' && !categoricalKey && isNaN(Number(val)) && val.length < 50) {
                categoricalKey = key;
            }
        }

        if (!numericKey && !categoricalKey) return null;

        let chartData: any[] = [];
        let chartType: 'bar' | 'pie' | 'frequency' = 'bar';

        if (categoricalKey && numericKey) {
            const grouped = data.reduce((acc, row) => {
                const cat = String(row[categoricalKey!] || 'Unknown');
                const num = Number(row[numericKey!]) || 0;
                acc[cat] = (acc[cat] || 0) + num;
                return acc;
            }, {} as Record<string, number>);

            chartData = Object.entries(grouped)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => (b.value as number) - (a.value as number))
                .slice(0, 10);

            chartType = 'bar';
        } else if (categoricalKey && !numericKey) {
            const grouped = data.reduce((acc, row) => {
                const cat = String(row[categoricalKey!] || 'Unknown');
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            chartData = Object.entries(grouped)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => (b.value as number) - (a.value as number))
                .slice(0, 8);

            chartType = 'pie';
            numericKey = 'Count';
        }

        return { chartData, categoricalKey, numericKey, chartType };

    }, [data]);

    if (!chartConfig || chartConfig.chartData.length === 0) {
        return null;
    }

    const { chartData, categoricalKey, numericKey, chartType } = chartConfig;

    return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none animate-in fade-in zoom-in-95 duration-500">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-pink-500" />
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">AI Smart Insights</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            데이터 구조를 분석하여 <strong>[{categoricalKey}]</strong> 별 <strong>[{numericKey}]</strong> 통계를 자동 생성했습니다.
                        </p>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                    {isCollapsed ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
                </button>
            </div>

            {!isCollapsed && (
                <div className="h-[300px] w-full mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-4 duration-300">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '0.5rem', fontWeight: 500 }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Bar dataKey="value" name={numericKey!} radius={[6, 6, 0, 0]}>
                                    {chartData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        ) : (
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {chartData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '0.5rem', fontWeight: 500 }}
                                    itemStyle={{ color: '#e879f9' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        )}
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
