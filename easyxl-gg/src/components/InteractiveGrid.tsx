import { useState, useCallback, useRef } from 'react';

interface InteractiveGridProps {
    data: any[];
    onSelection?: (startRow: number, startCol: number, endRow: number, endCol: number) => void;
    onDataChange?: (newData: any[]) => void;
}

interface CellPos { row: number; col: number; }

export default function InteractiveGrid({ data, onSelection, onDataChange }: InteractiveGridProps) {
    const [editingCell, setEditingCell] = useState<CellPos | null>(null);
    const [editValue, setEditValue] = useState('');
    const [selStart, setSelStart] = useState<CellPos | null>(null);
    const [selEnd, setSelEnd] = useState<CellPos | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    if (!data || data.length === 0) {
        return (
            <div className="p-20 text-center flex flex-col items-center gap-4 bg-white dark:bg-[#1a1a1a]">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 dark:text-gray-600 font-medium">데이터를 업로드하면 그리드가 활성화됩니다.</p>
            </div>
        );
    }

    const headers = Object.keys(data[0]);

    const isSelected = (row: number, col: number) => {
        if (!selStart || !selEnd) return false;
        const minR = Math.min(selStart.row, selEnd.row);
        const maxR = Math.max(selStart.row, selEnd.row);
        const minC = Math.min(selStart.col, selEnd.col);
        const maxC = Math.max(selStart.col, selEnd.col);
        return row >= minR && row <= maxR && col >= minC && col <= maxC;
    };

    const handleMouseDown = (row: number, col: number) => {
        if (editingCell) commitEdit(editingCell);
        setSelStart({ row, col });
        setSelEnd({ row, col });
        setIsDragging(true);
    };

    const handleMouseEnter = (row: number, col: number) => {
        if (!isDragging) return;
        setSelEnd({ row, col });
    };

    const handleMouseUp = (row: number, col: number) => {
        setIsDragging(false);
        const start = selStart!;
        const minR = Math.min(start.row, row);
        const maxR = Math.max(start.row, row);
        const minC = Math.min(start.col, col);
        const maxC = Math.max(start.col, col);
        onSelection?.(minR, minC, maxR, maxC);
    };

    const handleDoubleClick = (row: number, col: number) => {
        const val = data[row][headers[col]];
        setEditingCell({ row, col });
        setEditValue(String(val ?? ''));
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const commitEdit = useCallback((cell: CellPos) => {
        const newData = data.map((r, ri) => {
            if (ri !== cell.row) return r;
            const updated = { ...r };
            const raw = editValue;
            const num = Number(raw);
            updated[headers[cell.col]] = raw !== '' && !isNaN(num) ? num : raw;
            return updated;
        });
        onDataChange?.(newData);
        setEditingCell(null);
    }, [data, editValue, headers, onDataChange]);

    const handleKeyDown = (e: React.KeyboardEvent, cell: CellPos) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            commitEdit(cell);
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    return (
        <div
            className="w-full overflow-auto select-none"
            style={{ maxHeight: '520px' }}
            onMouseLeave={() => setIsDragging(false)}
        >
            <table className="border-collapse text-sm" style={{ minWidth: '100%' }}>
                <thead>
                    <tr>
                        {/* Row number header corner */}
                        <th className="sticky top-0 left-0 z-30 w-10 min-w-[40px] bg-gray-100 dark:bg-[#262626] border border-gray-300 dark:border-gray-700 text-center text-xs text-gray-400 font-medium" />
                        {/* Column letter headers */}
                        {headers.map((h, ci) => (
                            <th
                                key={ci}
                                className="sticky top-0 z-20 bg-gray-100 dark:bg-[#262626] border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap"
                                style={{ minWidth: '120px' }}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-gray-400 font-mono">
                                        {String.fromCharCode(65 + ci)}
                                    </span>
                                    <span>{h}</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, ri) => (
                        <tr key={ri} className="group">
                            {/* Row number */}
                            <td className="sticky left-0 z-10 bg-gray-100 dark:bg-[#262626] border border-gray-300 dark:border-gray-700 text-center text-xs text-gray-400 font-mono w-10 min-w-[40px]">
                                {ri + 1}
                            </td>
                            {headers.map((h, ci) => {
                                const selected = isSelected(ri, ci);
                                const editing = editingCell?.row === ri && editingCell?.col === ci;
                                const val = row[h];
                                return (
                                    <td
                                        key={ci}
                                        className={`border border-gray-200 dark:border-gray-700 relative cursor-cell transition-colors ${selected
                                                ? 'bg-indigo-100 dark:bg-indigo-900/40'
                                                : 'bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#262626]'
                                            }`}
                                        onMouseDown={() => handleMouseDown(ri, ci)}
                                        onMouseEnter={() => handleMouseEnter(ri, ci)}
                                        onMouseUp={() => handleMouseUp(ri, ci)}
                                        onDoubleClick={() => handleDoubleClick(ri, ci)}
                                    >
                                        {editing ? (
                                            <input
                                                ref={inputRef}
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onBlur={() => commitEdit({ row: ri, col: ci })}
                                                onKeyDown={e => handleKeyDown(e, { row: ri, col: ci })}
                                                className="absolute inset-0 w-full h-full px-2 py-1 z-10 outline-none border-2 border-indigo-500 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 text-sm"
                                            />
                                        ) : (
                                            <span className="block px-2 py-1.5 text-gray-800 dark:text-gray-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                                {val !== null && val !== undefined ? String(val) : ''}
                                            </span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
