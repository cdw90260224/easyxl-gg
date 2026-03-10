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
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                if (jsonData.length > 0) {
                    onDataLoaded(jsonData);
                    toast.success('파일이 성공적으로 로드되었습니다.');
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
        <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh] animate-in fade-in zoom-in-95 duration-500">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`w-full max-w-2xl p-16 rounded-[2rem] border-2 border-dashed transition-all duration-300 text-center flex flex-col items-center gap-6
          ${isDragging
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02]'
                        : 'border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#1a1a1a]/50 hover:border-indigo-300 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-[#202020]'
                    }`}
            >
                <div className="p-6 bg-indigo-100 dark:bg-indigo-500/20 rounded-full shadow-inner">
                    <UploadCloud className="w-12 h-12 text-indigo-500" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                        엑셀 파일을 여기에 드롭하세요
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        또는 버튼을 클릭하여 파일을 선택할 수 있습니다. (.xlsx, .csv)
                    </p>
                </div>

                <label className="cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                    파일 선택
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
