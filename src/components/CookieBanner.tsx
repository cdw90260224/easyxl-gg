import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie, ShieldCheck } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'easyxl_cookie_consent';
const EXPIRY_DAYS = 7;

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consentData = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (consentData) {
            const { expires } = JSON.parse(consentData);
            if (new Date().getTime() < expires) {
                return; // Not expired, do not show
            }
        }
        // Show banner if no consent or expired
        setIsVisible(true);
    }, []);

    const handleAccept = () => {
        const expiryDate = new Date().getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ expires: expiryDate }));
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 ptr-0 pointer-events-none sm:pb-6">
            <div className="max-w-4xl mx-auto pointer-events-auto">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hidden sm:flex shrink-0">
                            <Cookie className="w-6 h-6" />
                        </div>
                        <div className="flex-1 w-full">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                                쿠키 사용 안내 <Cookie className="w-4 h-4 sm:hidden text-indigo-500" />
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                                EasyXL은 맞춤형 서비스 제공 및 구글 애드센스 광고 송출을 위해 쿠키(Cookie)를 사용합니다. 계속 이용하시는 경우 쿠키 사용에 동의한 것으로 간주합니다.
                                <Link to="/privacy" className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium ml-2 underline underline-offset-2 transition-colors">
                                    <ShieldCheck className="w-3.5 h-3.5" /> 개인정보처리방침 보기
                                </Link>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800 pt-3 sm:pt-0 mt-1 sm:mt-0">
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors sm:static absolute top-4 right-4"
                            title="닫기 (동의하지 않음)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all w-full sm:w-auto text-center"
                        >
                            동의하고 계속하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
