import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

/**
 * ── 분석 결과 저장 (Supabase) ──
 * 사용자가 요청한 로직을 바탕으로 구현되었습니다.
 */
export const saveAnalysisResult = async (fileName: string, analysisData: unknown) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            toast.error('로그인이 필요합니다!');
            return;
        }

        const { error } = await supabase
            .from('analysis_history')
            .insert([{ 
                user_id: user.id, 
                file_name: fileName, 
                analysis_data: analysisData 
            }]);

        if (error) {
            console.error('[Supabase Save Error]', error.message);
            toast.error(`저장 실패: ${error.message}`);
        } else {
            toast.success(`🎉 [${fileName}] 분석 결과가 보관함에 저장되었습니다!`);
        }
    } catch (err: unknown) {
        console.error('[Database Service Error]', err);
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        toast.error(`오류 발생: ${message}`);
    }
};
