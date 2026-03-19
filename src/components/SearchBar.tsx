import { Search, Sparkles, Paperclip } from 'lucide-react';
import { useRef } from 'react';

interface SearchBarProps {
    value: string;
    onChange: (v: string) => void;
    onSearch: (v: string) => void;
    onFileSelected?: (file: File) => void;
}

export default function SearchBar({ value, onChange, onSearch, onFileSelected }: SearchBarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onFileSelected) {
            onFileSelected(file);
        }
    };

    return (
        <div className="relative group max-w-4xl mx-auto w-full animate-in fade-in zoom-in-95 duration-1000 delay-200">
            <div className="absolute -inset-1 bg-gradient-to-r from-deepblue-500 to-purple-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
            <div className="relative flex items-center bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 focus-within:border-deepblue-500 dark:focus-within:border-deepblue-500 transition-all shadow-premium dark:shadow-premium-dark overflow-hidden">
                <div className="pl-6 pr-3 py-5">
                    <Sparkles className="w-6 h-6 text-deepblue-600 animate-pulse" />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch(value)}
                    placeholder="자연어로 질문해보세요. (예: '데이터에서 핵심 내용 추출해줘')"
                    className="w-full bg-transparent text-gray-900 dark:text-gray-100 text-lg placeholder-gray-400 dark:placeholder-gray-500 outline-none font-medium"
                />
                
                <div className="flex items-center gap-2 mr-3">
                    {onFileSelected && (
                        <>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.xlsx,.xls,.csv"
                                onChange={handleFileChange}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                title="문서 업로드 (PDF/Excel)"
                                className="p-3.5 text-gray-400 hover:text-deepblue-500 dark:text-gray-500 dark:hover:text-deepblue-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => onSearch(value)}
                        className="p-3.5 bg-deepblue-600 hover:bg-deepblue-700 text-white rounded-xl transition-all shadow-lg shadow-deepblue-500/25 hover:shadow-deepblue-500/40 hover:-translate-y-px active:scale-95"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
