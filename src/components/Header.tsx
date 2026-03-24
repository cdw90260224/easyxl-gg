import { Moon, Sun, Shield, ShieldAlert, FileSpreadsheet, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function Header({ isDark, toggleDark, isPrivacyMode, onShowPrivacyPolicy, user, onShowHistory }: any) {
    const [isSyncing, setIsSyncing] = useState(false);
    const isLoggedIn = !!user;

    const handleLogin = async () => {
        if (!supabase) return toast.error("Supabase 연결이 필요합니다.");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            }
        });
        if (error) toast.error(error.message);
    };

    const handleLogout = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        toast.success("로그아웃 되었습니다.");
    };

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            toast.success('성공적으로 구글 시트에 반영되었습니다 (시뮬레이션)');
        }, 2000);
    };

    return (
        <header className="glass-morphism sticky top-0 z-50 transition-colors shadow-sm dark:shadow-none border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity">
                    <div className="p-2 bg-deepblue-500/10 rounded-xl group-hover:bg-deepblue-500/20 transition-colors">
                        <FileSpreadsheet className="w-6 h-6 text-deepblue-600" />
                    </div>
                    <Link to="/" className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        EasyXL<span className="text-deepblue-600">.GG</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {/* Privacy Toggle */}
                    <button
                        onClick={onShowPrivacyPolicy}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${isPrivacyMode ? 'bg-deepblue-50 text-deepblue-700 dark:bg-deepblue-500/10 dark:text-deepblue-400 ring-1 ring-deepblue-500/20'
                            : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 red-500/20'
                            }`}
                        title="개인정보 보호 정책 확인"
                    >
                        {isPrivacyMode ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isPrivacyMode ? 'Privacy ON' : 'Privacy OFF'}</span>
                    </button>

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

                    {/* Guide Link */}
                    <Link
                        to="/guide"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all rounded-xl"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline">사용 가이드</span>
                    </Link>

                    {/* Sync / Login */}
                    {!isLoggedIn ? (
                        <button
                            onClick={handleLogin}
                            className="text-sm font-bold px-5 py-2 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300 shadow-sm"
                        >
                            Sign in with Google
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 hidden sm:flex">
                                {user?.user_metadata?.avatar_url && (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" />
                                )}
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {user?.user_metadata?.full_name || '사용자'}님
                                </span>
                            </div>
                            <button
                                onClick={onShowHistory}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all rounded-xl border border-gray-200 dark:border-gray-800"
                                title="최근 분석 이력"
                            >
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="hidden md:inline">히스토리</span>
                            </button>
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="text-sm font-bold px-4 py-2 bg-deepblue-600 text-white rounded-xl hover:bg-deepblue-700 disabled:opacity-50 transition-all shadow-md shadow-deepblue-500/20 flex items-center gap-2"
                            >
                                {isSyncing ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        동기화 중...
                                    </>
                                ) : '구글 시트 연동'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-bold px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all"
                            >
                                로그아웃
                            </button>
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDark}
                        className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-all"
                        title="테마 변경"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </header>
    );
}
