import { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { parseExcelWorkbook, type ParsedSheet } from '../utils/excelParser';
import { extractTextFromPDF } from '../utils/pdfParser';

interface UploadZoneProps {
    onSheetsLoaded: (sheets: ParsedSheet[]) => void;
    onPDFLoaded: (text: string) => void;
    onImageLoaded: (base64: string, mimeType: string) => void;
}

export default function UploadZone({ onSheetsLoaded, onPDFLoaded, onImageLoaded }: UploadZoneProps) {
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

    const processFile = async (file: File) => {
        if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
            try {
                toast.loading('이미지 분석을 위해 데이터를 준비 중...');
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    const base64 = result.split(',')[1];
                    onImageLoaded(base64, file.type || 'image/jpeg');
                    toast.dismiss();
                };
                reader.readAsDataURL(file);
            } catch (err) {
                toast.error("이미지 처리 중 오류가 발생했습니다.");
                console.error(err);
            }
            return;
        }

        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            try {
                toast.loading('PDF에서 텍스트를 추출하는 중...');
                const text = await extractTextFromPDF(file);
                onPDFLoaded(text);
                toast.dismiss();
            } catch (err) {
                toast.error("PDF 처리 중 오류가 발생했습니다.");
                console.error(err);
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                
                const sheets = parseExcelWorkbook(workbook);

                if (sheets.length > 0) {
                    onSheetsLoaded(sheets);
                    toast.success(`파일 로드 완료: 총 ${sheets.length}개의 시트를 인식했습니다.`);
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
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
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
                        accept=".xlsx,.xls,.csv,.pdf,image/*"
                        onChange={handleFileInput}
                    />
                </label>
            </div>
        </div>
    );
}
