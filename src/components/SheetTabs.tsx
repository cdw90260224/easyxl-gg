import { useState, useRef, useEffect } from 'react';
import { Layout, X, Plus, Edit2 } from 'lucide-react';

interface Sheet {
    id: string;
    name: string;
}

interface SheetTabsProps {
    sheets: Sheet[];
    activeSheetIndex: number;
    onSelect: (index: number) => void;
    onDelete: (index: number) => void;
    onRename: (index: number, newName: string) => void;
    onAdd: () => void;
}

export default function SheetTabs({ sheets, activeSheetIndex, onSelect, onDelete, onRename, onAdd }: SheetTabsProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [tempName, setTempName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingIndex !== null && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingIndex]);

    const handleStartRename = (e: React.MouseEvent, idx: number, name: string) => {
        e.stopPropagation();
        setEditingIndex(idx);
        setTempName(name);
    };

    const handleFinishRename = () => {
        if (editingIndex !== null && tempName.trim()) {
            onRename(editingIndex, tempName.trim());
        }
        setEditingIndex(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleFinishRename();
        if (e.key === 'Escape') setEditingIndex(null);
    };

    if (sheets.length === 0) return null;

    return (
        <div className="w-full mb-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sheets.map((sheet, idx) => (
                <div
                    key={sheet.id}
                    onClick={() => onSelect(idx)}
                    onDoubleClick={(e) => handleStartRename(e, idx, sheet.name)}
                    className={`group relative flex items-center gap-2 px-4 py-2 rounded-[10px] border transition-all cursor-pointer whitespace-nowrap min-w-[80px] max-w-[200px]
                        ${activeSheetIndex === idx
                            ? 'bg-deepblue-600 dark:bg-deepblue-500 border-transparent text-white shadow-xl shadow-deepblue-600/20'
                            : 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 text-gray-500 hover:border-deepblue-400 dark:hover:border-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    <Layout className={`w-3.5 h-3.5 flex-shrink-0 ${activeSheetIndex === idx ? 'text-blue-100' : 'text-gray-400'}`} />
                    
                    {editingIndex === idx ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={handleFinishRename}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/10 dark:bg-black/20 text-xs font-bold border-none outline-none focus:ring-1 focus:ring-white/30 rounded px-1 w-full text-inherit"
                        />
                    ) : (
                        <span className="text-xs font-bold tracking-tight truncate select-none">{sheet.name}</span>
                    )}

                    <div className="flex items-center gap-0.5 ml-1">
                        {!editingIndex && activeSheetIndex === idx && (
                            <button
                                onClick={(e) => handleStartRename(e, idx, sheet.name)}
                                className="p-0.5 rounded-md hover:bg-white/20 text-white/50 hover:text-white transition-colors flex-shrink-0"
                            >
                                <Edit2 className="w-3 h-3" />
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(idx); }}
                            className={`p-0.5 rounded-md transition-colors flex-shrink-0 ${activeSheetIndex === idx ? 'hover:bg-white/20 text-white/70 hover:text-white' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400'}`}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}
            <button onClick={onAdd} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 hover:text-deepblue-600 hover:border-deepblue-600 dark:hover:text-deepblue-400 transition-all">
                <Plus className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">새 시트</span>
            </button>
        </div>
    );
}
