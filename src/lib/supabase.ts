import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Supabase] 클라이언트 초기화 성공');
} else {
    console.warn('[Supabase] URL 또는 ANON_KEY가 설정되지 않았습니다. DB 기능이 비활성화됩니다.');
}

export { supabase };
