import { supabase } from '../lib/supabase';

export interface SheetRecord {
    id: string;
    title: string;
    columns: Array<{ field: string; headerName: string }>;
    rows: any[];
    source?: string; // guest_migration 등 구분용
    created_at: string;
    updated_at: string;
}

const ensureSupabase = () => {
    if (!supabase) throw new Error('Supabase가 설정되지 않았습니다. 환경변수를 확인해주세요.');
    return supabase;
};

// ── 시트 저장 ──
export const saveSheet = async (
    title: string,
    columns: Array<{ field: string; headerName: string }>,
    rows: any[],
    source?: string
): Promise<SheetRecord> => {
    const db = ensureSupabase();
    const { data, error } = await db
        .from('sheets')
        .insert({ title, columns, rows, source })
        .select()
        .single();

    if (error) throw new Error(`시트 저장 실패: ${error.message}`);
    return data as SheetRecord;
};

// ── 시트 목록 조회 ──
export const listSheets = async (): Promise<SheetRecord[]> => {
    const db = ensureSupabase();
    const { data, error } = await db
        .from('sheets')
        .select('id, title, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw new Error(`시트 목록 조회 실패: ${error.message}`);
    return (data || []) as SheetRecord[];
};

// ── 시트 상세 조회 ──
export const getSheet = async (id: string): Promise<SheetRecord> => {
    const db = ensureSupabase();
    const { data, error } = await db
        .from('sheets')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error(`시트 조회 실패: ${error.message}`);
    return data as SheetRecord;
};

// ── 시트 삭제 ──
export const deleteSheet = async (id: string): Promise<void> => {
    const db = ensureSupabase();
    const { error } = await db
        .from('sheets')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`시트 삭제 실패: ${error.message}`);
};
