import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] URL 또는 ANON_KEY가 설정되지 않았습니다. DB 기능이 비활성화됩니다.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
