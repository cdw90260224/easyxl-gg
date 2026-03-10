import { useMemo, useState } from 'react';
import { ArrowDownAZ, ArrowUpZA, ArrowUpDown } from 'lucide-react';

interface DataGridProps {
    data: any[];
    isPrivacyMode: boolean;
}

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

export default function DataGrid({ data, isPrivacyMode }: DataGridProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    if (!data || data.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center gap-3">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>데이터를 업로드하면 여기에 표시됩니다</span>
            </div>
        );
    }

    const columns = useMemo(() => {
        const firstRow = data[0];
        return Object.keys(firstRow);
    }, [data]);

    const sortedData = useMemo(() => {
        let sortableData = [...data];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal == null) return sortConfig.direction === 'asc' ? -1 : 1;
                if (bVal == null) return sortConfig.direction === 'asc' ? 1 : -1;

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                const strA = String(aVal).toLowerCase();
                const strB = String(bVal).toLowerCase();
                if (strA < strB) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (strA > strB) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const maskValue = (colName: string, value: any) => {
        if (!isPrivacyMode) return value;
        if (value === null || value === undefined || value === '') return '';

        const lowerCol = colName.toLowerCase();

        if (lowerCol.includes('이름') || lowerCol.includes('name') || lowerCol.includes('담당자')) {
            return '👤 [NAME_HIDDEN]';
        }
        if (lowerCol.includes('연락처') || lowerCol.includes('phone') || lowerCol.includes('tel') || lowerCol.includes('전화')) {
            return '📞 [PHONE_HIDDEN]';
        }
        if (lowerCol.includes('email') || lowerCol.includes('이메일') || lowerCol.includes('메일')) {
            return '✉️ [EMAIL_HIDDEN]';
        }
        if (lowerCol.includes('주소') || lowerCol.includes('address')) {
            return '🏠 [ADDRESS_HIDDEN]';
        }

        return value;
    };

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#1a1a1a]">
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300 relative">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-[#202020] sticky top-0 z-10 shadow-sm border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4 font-bold tracking-wider bg-gray-50 dark:bg-[#202020]">#</th>
                            {columns.map((c, i) => (
                                <th
                                    key={i}
                                    scope="col"
                                    className="px-6 py-4 font-bold tracking-wider bg-gray-50 dark:bg-[#202020] whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none"
                                    onClick={() => requestSort(c)}
                                >
                                    <div className="flex items-center gap-2">
                                        {c}
                                        <span className="text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 transition-colors">
                                            {sortConfig?.key === c ? (
                                                sortConfig.direction === 'asc' ? <ArrowDownAZ className="w-4 h-4 text-indigo-500" /> : <ArrowUpZA className="w-4 h-4 text-indigo-500" />
                                            ) : (
                                                <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                                            )}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 relative">
                        {sortedData.slice(0, 100).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-indigo-500/5 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-400 dark:text-gray-500 font-medium border-r border-transparent group-hover:border-indigo-500/30">
                                    {i + 1}
                                </td>
                                {columns.map((c, j) => {
                                    const val = row[c] ?? '';
                                    const maskedVal = maskValue(c, val);
                                    const isMasked = maskedVal !== val;
                                    return (
                                        <td key={j} className="px-5 py-4 whitespace-nowrap">
                                            {isMasked ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                                                    {maskedVal}
                                                </span>
                                            ) : (
                                                <span className="text-gray-800 dark:text-gray-200">{String(val)}</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {sortedData.length > 100 && (
                <div className="p-4 text-center text-xs font-medium text-gray-500 bg-gray-50/80 dark:bg-[#202020]/80 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center transition-colors">
                    <span>* 최적화를 위해 상위 100개의 행만 렌더링됩니다.</span>
                    <span className="flex items-center gap-2">
                        총 <strong className="text-indigo-600 dark:text-indigo-400 text-sm bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full ring-1 ring-indigo-500/20">{(sortedData.length).toLocaleString()}</strong> rows
                    </span>
                </div>
            )}
            {sortedData.length <= 100 && sortedData.length > 0 && (
                <div className="p-4 flex justify-end text-xs font-medium text-gray-500 bg-gray-50/80 dark:bg-[#202020]/80 border-t border-gray-100 dark:border-gray-800 transition-colors">
                    <span className="flex items-center gap-2">
                        총 <strong className="text-indigo-600 dark:text-indigo-400 text-sm bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full ring-1 ring-indigo-500/20">{(sortedData.length).toLocaleString()}</strong> rows
                    </span>
                </div>
            )}
        </div>
    );
}
