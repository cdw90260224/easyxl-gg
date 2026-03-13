import { supabase } from '../lib/supabase';

export interface SheetRecord {
    id: string;
    title: string;
    columns: Array<{ field: string; headerName: string }>;
    rows: any[];
    created_at: string;
    updated_at: string;
}

// ── 시트 저장 ──
export const saveSheet = async (
    title: string,
    columns: Array<{ field: string; headerName: string }>,
    rows: any[]
): Promise<SheetRecord> => {
    const { data, error } = await supabase
        .from('sheets')
        .insert({ title, columns, rows })
        .select()
        .single();

    if (error) throw new Error(`시트 저장 실패: ${error.message}`);
    return data as SheetRecord;
};

// ── 시트 목록 조회 ──
export const listSheets = async (): Promise<SheetRecord[]> => {
    const { data, error } = await supabase
        .from('sheets')
        .select('id, title, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw new Error(`시트 목록 조회 실패: ${error.message}`);
    return (data || []) as SheetRecord[];
};

// ── 시트 상세 조회 ──
export const getSheet = async (id: string): Promise<SheetRecord> => {
    const { data, error } = await supabase
        .from('sheets')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error(`시트 조회 실패: ${error.message}`);
    return data as SheetRecord;
};

// ── 시트 삭제 ──
export const deleteSheet = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('sheets')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`시트 삭제 실패: ${error.message}`);
};
