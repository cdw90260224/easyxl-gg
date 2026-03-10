import { Moon, Sun, Shield, ShieldAlert, FileSpreadsheet } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Header({ isDark, toggleDark, isPrivacyMode, onShowPrivacyPolicy }: any) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Mock google login
    const login = useGoogleLogin({
        onSuccess: () => setIsLoggedIn(true),
        onError: (error) => console.log('Login Failed:', error)
    });

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            toast.success('성공적으로 구글 시트에 반영되었습니다 (시뮬레이션)');
        }, 2000);
    };

    return (
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer group">
                    <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                        <FileSpreadsheet className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        EasyXL<span className="text-indigo-500">.GG</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Privacy Toggle */}
                    <button
                        onClick={onShowPrivacyPolicy}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isPrivacyMode ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 ring-1 ring-indigo-500/20'
                            : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-500/20'
                            }`}
                        title="개인정보 보호 정책 확인 (배너 클릭)"
                    >
                        {isPrivacyMode ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isPrivacyMode ? 'Privacy ON' : 'Privacy OFF'}</span>
                    </button>

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

                    {/* Sync / Login */}
                    {!isLoggedIn ? (
                        <button
                            onClick={() => login()}
                            className="text-sm font-medium px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                        >
                            Sign in with Google
                        </button>
                    ) : (
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="text-sm font-medium px-5 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                        >
                            {isSyncing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    동기화 중...
                                </>
                            ) : '구글 시트에 반영'}
                        </button>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDark}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-all ml-1"
                        title="테마 변경"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </header>
    );
}
