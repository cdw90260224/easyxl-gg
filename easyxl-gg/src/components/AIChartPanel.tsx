import { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    LineChart, Line,
    AreaChart, Area
} from 'recharts';
import { BarChart3, X } from 'lucide-react';
import type { ChartConfig } from '../services/aiService';

interface AIChartPanelProps {
    data: any[];
    chartConfig: ChartConfig;
    onClose: () => void;
}

const COLORS = [
    '#6366f1', '#e879f9', '#ec4899', '#f43f5e',
    '#facc15', '#4ade80', '#2dd4bf', '#38bdf8',
    '#a78bfa', '#fb923c'
];

export default function AIChartPanel({ data, chartConfig, onClose }: AIChartPanelProps) {
    const { chartType, xAxis, yAxis, title } = chartConfig;

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Pie chart: aggregate by xAxis
        if (chartType === 'pie') {
            const grouped = data.reduce((acc, row) => {
                const cat = String(row[xAxis] ?? 'Unknown');
                const num = Number(row[yAxis]) || 0;
                acc[cat] = (acc[cat] || 0) + num;
                return acc;
            }, {} as Record<string, number>);

            return Object.entries(grouped)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => (b.value as number) - (a.value as number))
                .slice(0, 10);
        }

        // Bar/Line/Area: use raw data directly
        return data.slice(0, 20).map(row => ({
            name: String(row[xAxis] ?? ''),
            value: Number(row[yAxis]) || 0
        }));
    }, [data, chartType, xAxis, yAxis]);

    if (chartData.length === 0) return null;

    const renderChart = () => {
        switch (chartType) {
            case 'bar':
                return (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false}
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val} />
                        <Tooltip
                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '0.75rem', fontWeight: 500 }}
                            itemStyle={{ color: '#818cf8' }}
                        />
                        <Bar dataKey="value" name={yAxis} radius={[8, 8, 0, 0]}>
                            {chartData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                );

            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={4}
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
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '0.75rem', fontWeight: 500 }}
                            itemStyle={{ color: '#e879f9' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                );

            case 'line':
                return (
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false}
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '0.75rem', fontWeight: 500 }}
                            itemStyle={{ color: '#6366f1' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            name={yAxis}
                            stroke="#6366f1"
                            strokeWidth={3}
                            dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7, fill: '#818cf8' }}
                        />
                    </LineChart>
                );

            case 'area':
                return (
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false}
                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '0.75rem', fontWeight: 500 }}
                            itemStyle={{ color: '#6366f1' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            name={yAxis}
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            fill="url(#areaGradient)"
                        />
                    </AreaChart>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl shadow-indigo-500/10 dark:shadow-none overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Talk-to-Chart • {chartType.toUpperCase()} • {xAxis} × {yAxis}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/80 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Chart Body */}
            <div className="h-[360px] w-full p-6">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()!}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
