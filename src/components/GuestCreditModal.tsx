import { X, Sparkles } from 'lucide-react';

interface GuestCreditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GuestCreditModal({ isOpen, onClose }: GuestCreditModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-[2rem] shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                <div className="absolute top-6 right-6">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-10 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-teal-500/10 rounded-3xl">
                            <Sparkles className="w-12 h-12 text-teal-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">가입 없이 1,000 크레딧 체험하기</h3>
                    </div>

                    <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed text-center">
                        <p>
                            EasyXL.GG에 오신 것을 환영합니다!
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm font-medium">
                            로그인하지 않아도 즉시 <span className="text-teal-500 font-bold text-base">1,000 크레딧</span>을<br/>
                            사용하여 강력한 AI 분석을 테스트해 볼 수 있습니다.<br/><br/>
                            <span className="text-xs text-gray-500">*로그인하시면 작업 내역이 클라우드에 안전하게 보관됩니다.</span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 active:scale-95"
                    >
                        지금 바로 무료 체험하기
                    </button>
                </div>
            </div>
        </div>
    );
}
