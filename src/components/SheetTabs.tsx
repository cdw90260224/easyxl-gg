import { Layout, X, Plus } from 'lucide-react';

interface Sheet {
    id: string;
    name: string;
}

interface SheetTabsProps {
    sheets: Sheet[];
    activeSheetIndex: number;
    onSelect: (index: number) => void;
    onDelete: (index: number) => void;
    onAdd: () => void;
}

export default function SheetTabs({ sheets, activeSheetIndex, onSelect, onDelete, onAdd }: SheetTabsProps) {
    if (sheets.length === 0) return null;

    return (
        <div className="w-full mb-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sheets.map((sheet, idx) => (
                <div
                    key={sheet.id}
                    onClick={() => onSelect(idx)}
                    className={`group relative flex items-center gap-2 px-4 py-2 rounded-[10px] border transition-all cursor-pointer whitespace-nowrap min-w-[80px] max-w-[200px]
                        ${activeSheetIndex === idx
                            ? 'bg-deepblue-600 dark:bg-deepblue-500 border-transparent text-white shadow-xl shadow-deepblue-600/20'
                            : 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 text-gray-500 hover:border-deepblue-400 dark:hover:border-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    title={sheet.name}
                >
                    <Layout className={`w-3.5 h-3.5 flex-shrink-0 ${activeSheetIndex === idx ? 'text-blue-100' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold tracking-tight truncate">{sheet.name}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(idx); }}
                        className={`ml-1 p-0.5 rounded-md transition-colors flex-shrink-0 ${activeSheetIndex === idx ? 'hover:bg-white/20 text-white/70 hover:text-white' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400'}`}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}
            <button onClick={onAdd} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 hover:text-deepblue-600 hover:border-deepblue-600 dark:hover:text-deepblue-400 transition-all">
                <Plus className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">새 시트</span>
            </button>
        </div>
    );
}
