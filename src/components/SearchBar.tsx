import { Search, Sparkles } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (v: string) => void;
    onSearch: (v: string) => void;
}

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
    return (
        <div className="relative group max-w-4xl mx-auto w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl border-2 border-white dark:border-gray-800 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-all shadow-xl shadow-indigo-500/5 overflow-hidden">
                <div className="pl-6 pr-3 py-5">
                    <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch(value)}
                    placeholder="자연어로 질문해보세요. (예: '김철수 담당자의 1월 매출 데이터 보여줘')"
                    className="w-full bg-transparent text-gray-900 dark:text-gray-100 text-lg placeholder-gray-400 dark:placeholder-gray-500 outline-none font-medium"
                />
                <button
                    onClick={() => onSearch(value)}
                    className="mr-3 p-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-px"
                >
                    <Search className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
