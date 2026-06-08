import { X, Gift } from 'lucide-react';

interface CreditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreditModal({ isOpen, onClose }: CreditModalProps) {
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
                        <div className="p-4 bg-indigo-500/10 rounded-3xl">
                            <Gift className="w-12 h-12 text-indigo-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">축하합니다! 1,000 크레딧 지급 완료</h3>
                    </div>

                    <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed text-center">
                        <p>
                            방문해 주셔서 감사합니다! 
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm font-medium">
                            자유롭게 AI 기능을 체험해 볼 수 있도록 <br/>
                            <span className="text-indigo-500 text-base font-bold">1,000 크레딧</span>이 지급되었습니다.
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95"
                    >
                        감사합니다, 지금 시작하기
                    </button>
                </div>
            </div>
        </div>
    );
}
