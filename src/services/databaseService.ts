import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

/**
 * ── 분석 결과 저장 (Supabase) ──
 * 사용자가 요청한 로직을 바탕으로 구현되었습니다.
 */
export const saveAnalysisResult = async (fileName: string, analysisData: unknown, source?: string) => {
    try {
        if (!supabase) {
            console.warn('Supabase client is not initialized.');
            return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            // Silently skip cloud saving for non-logged-in users.
            // LocalStorage persistence is handled via Zustand now
            return;
        }

        const { error } = await supabase
            .from('analysis_history')
            .insert([{ 
                user_id: user.id, 
                file_name: fileName, 
                analysis_data: analysisData,
                source: source // 'guest_migration' 등
            }]);

        if (error) {
            console.error('[Supabase Save Error]', error.message);
            toast.error(`저장 실패: ${error.message}`);
        } else {
            // migration 일 때는 성공 토스트를 한꺼번에 띄울 것이므로 여기서는 생략하거나 조건부 처리 가능
            if (source !== 'guest_migration') {
                toast.success(`🎉 [${fileName}] 분석 결과가 보관함에 저장되었습니다!`);
            }
        }
    } catch (err: unknown) {
        console.error('[Database Service Error]', err);
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        toast.error(`오류 발생: ${message}`);
    }
};
