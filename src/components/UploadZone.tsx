import { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export default function UploadZone({ onDataLoaded }: { onDataLoaded: (data: any[]) => void }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Get raw 2D array to identify title vs header
                const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

                // Find the first row that looks like a header (multiple columns filled)
                let headerRowIndex = 0;
                for (let i = 0; i < rawRows.length; i++) {
                    const filledCols = rawRows[i].filter(cell => String(cell).trim() !== "").length;
                    if (filledCols >= 2) { // Heuristic: headers usually have at least 2 non-empty columns
                        headerRowIndex = i;
                        break;
                    }
                }

                const headers = rawRows[headerRowIndex].map(h => String(h).trim());
                const dataRows = rawRows.slice(headerRowIndex + 1);

                // Convert back to objects using found headers
                const jsonData = dataRows
                    .filter(row => row.some(cell => String(cell).trim() !== "")) // Skip empty rows
                    .map(row => {
                        const obj: any = {};
                        headers.forEach((h, idx) => {
                            if (h) obj[h] = row[idx] === undefined ? "" : row[idx];
                        });
                        return obj;
                    });

                if (jsonData.length > 0) {
                    onDataLoaded(jsonData);
                    toast.success(`파일 로드 완료: 총 ${jsonData.length.toLocaleString()}개의 행과 ${headers.filter(h => h).length}개의 카테고리(열)를 인식했습니다.`);
                } else {
                    toast.error("엑셀 파일이 비어있거나 읽을 수 없습니다.");
                }
            } catch (err) {
                toast.error("파일 처리 중 오류가 발생했습니다.");
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[35vh] animate-in fade-in zoom-in-95 duration-500">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`w-full max-w-2xl p-12 rounded-[2rem] border transition-all duration-300 text-center flex flex-col items-center gap-6 shadow-premium dark:shadow-premium-dark
          ${isDragging
                        ? 'border-deepblue-500 bg-deepblue-50/50 dark:bg-deepblue-500/10 scale-[1.01]'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] hover:border-deepblue-300 dark:hover:border-gray-700'
                    }`}
            >
                <div className="p-5 bg-deepblue-50 dark:bg-deepblue-500/10 rounded-2xl">
                    <UploadCloud className="w-10 h-10 text-deepblue-600" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                        데이터 파일을 업로드하세요
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        엑셀(.xlsx, .csv) 파일을 끌어다 놓거나 아래 버튼을 눌러 선택할 수 있습니다.
                    </p>
                </div>

                <label className="cursor-pointer bg-deepblue-600 hover:bg-deepblue-700 text-white px-10 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-deepblue-500/25 hover:shadow-deepblue-500/40 active:scale-95">
                    파일 찾아보기
                    <input
                        type="file"
                        className="hidden"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileInput}
                    />
                </label>
            </div>
        </div>
    );
}
