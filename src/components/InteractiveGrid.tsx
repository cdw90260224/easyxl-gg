import { useRef, useMemo } from 'react';
import { HotTable } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';

// register Handsontable's modules
registerAllModules();

interface InteractiveGridProps {
    data: any[];
    onSelection?: (startRow: number, startCol: number, endRow: number, endCol: number) => void;
    onDataChange?: (newData: any[]) => void;
}

export default function InteractiveGrid({ data, onSelection, onDataChange }: InteractiveGridProps) {
    const hotRef = useRef<any>(null);

    // Prepare columns based on data keys
    const columns = useMemo(() => {
        if (data.length === 0) return [];
        return Object.keys(data[0]).map(key => ({
            data: key,
            title: key,
            readOnly: false
        }));
    }, [data]);

    const handleAfterSelection = (r: number, c: number, r2: number, c2: number) => {
        if (onSelection) {
            onSelection(r, c, r2, c2);
        }
    };

    const handleAfterChange = (changes: any[] | null, source: string) => {
        if (changes && source !== 'loadData' && onDataChange) {
            const hotInstance = hotRef.current?.hotInstance;
            if (hotInstance) {
                const updatedData = hotInstance.getSourceData();
                onDataChange([...updatedData]);
            }
        }
    };

    if (data.length === 0) {
        return (
            <div className="p-20 text-center flex flex-col items-center gap-4 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-full">
                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-gray-400 dark:text-gray-600 font-medium">데이터를 업로드하거나 생성하면 그리드가 활성화됩니다.</p>
            </div>
        );
    }

    return (
        <div className="handsontable-container w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#1a1a1a]">
            <HotTable
                ref={hotRef}
                data={data}
                columns={columns}
                rowHeaders={true}
                colHeaders={true}
                height="500px"
                width="100%"
                licenseKey="non-commercial-and-evaluation"
                contextMenu={true}
                manualColumnResize={true}
                manualRowResize={true}
                autoColumnSize={true}
                selectionMode="multiple"
                outsideClickDeselects={false}
                afterSelection={handleAfterSelection}
                afterChange={handleAfterChange}
                stretchH="all"
                className="custom-hot-table"
            />
            <style dangerouslySetInnerHTML={{
                __html: `
                .handsontable {
                    font-family: inherit;
                    font-size: 13px;
                }
                .dark .handsontable {
                    color: #d1d5db;
                }
                .dark .handsontable .htCore {
                    background-color: #1a1a1a;
                }
                .dark .handsontable th, .dark .handsontable td {
                    background-color: #1a1a1a;
                    border-color: #374151;
                    color: #d1d5db;
                }
                .dark .handsontable tr:hover td {
                    background-color: #262626 !important;
                }
                .dark .handsontable .ht_clone_top th, .dark .handsontable .ht_clone_left th {
                    background-color: #262626;
                    color: #9ca3af;
                }
                .handsontable .area {
                    background-color: rgba(99, 102, 241, 0.15) !important;
                }
                .handsontable .selection {
                    background-color: rgba(99, 102, 241, 0.3) !important;
                }
                .htContextMenu table.htCore {
                    border: 1px solid #374151;
                    background: #fff;
                }
                .dark .htContextMenu table.htCore {
                    background: #1f2937;
                    color: #f3f4f6;
                }
            ` }} />
        </div>
    );
}
