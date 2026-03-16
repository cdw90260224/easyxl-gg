import { X, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
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
                            <ShieldCheck className="w-12 h-12 text-indigo-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy-First Data Policy</h3>
                    </div>

                    <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed text-center">
                        <p>
                            EasyXL.GG는 <span className="text-indigo-500 font-semibold underline underline-offset-4">Privacy-First</span> 원칙에 따라 설계되었습니다.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm italic">
                            "귀하의 데이터는 서버에 저장되거나 전송되지 않으며, 완전히 브라우저 로컬 메모리 내에서만 안전하게 처리됩니다."
                        </div>
                        <p className="text-sm">
                            AI 분석 시에만 익명화된 데이터의 일부를 사용하여 처리를 돕지만, 어떠한 개인정보도 영구적으로 보관하지 않습니다.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95"
                    >
                        알겠습니다, 안심하고 사용할게요!
                    </button>
                </div>
            </div>
        </div>
    );
}
