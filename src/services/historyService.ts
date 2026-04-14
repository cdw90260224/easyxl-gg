import { supabase } from '../lib/supabase';

export interface AnalysisHistoryRecord {
    id: string;
    user_id: string;
    file_name: string;
    analysis_data: any[];
    source?: string;
    created_at: string;
}

const ensureSupabase = () => {
    if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.');
    return supabase;
};

/**
 * ── 분석 이력 저장 ──
 */
export const saveAnalysisHistory = async (
    userId: string,
    fileName: string,
    data: any[],
    source?: string
): Promise<AnalysisHistoryRecord> => {
    const db = ensureSupabase();
    
    // 데이터가 너무 크면 압축이나 필터링이 필요할 수 있지만, 일단 그대로 JSONB로 저장
    const { data: record, error } = await db
        .from('analysis_history')
        .insert({
            user_id: userId,
            file_name: fileName,
            analysis_data: data,
            source
        })
        .select()
        .single();

    if (error) {
        console.error('[Supabase Save Error]', error);
        throw new Error(`분석 이력 저장 실패: ${error.message}`);
    }
    
    return record as AnalysisHistoryRecord;
};

/**
 * ── 분석 이력 목록 조회 ──
 */
export const listAnalysisHistory = async (userId: string): Promise<AnalysisHistoryRecord[]> => {
    const db = ensureSupabase();
    const { data, error } = await db
        .from('analysis_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('[Supabase List Error]', error);
        throw new Error(`이력 조회 실패: ${error.message}`);
    }
    
    return (data || []) as AnalysisHistoryRecord[];
};

/**
 * ── 분석 이력 삭제 ──
 */
export const deleteAnalysisHistory = async (id: string): Promise<void> => {
    const db = ensureSupabase();
    const { error } = await db
        .from('analysis_history')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[Supabase Delete Error]', error);
        throw new Error(`이력 삭제 실패: ${error.message}`);
    }
};
