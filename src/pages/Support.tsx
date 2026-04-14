import { useEffect } from 'react';

export default function Support() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f12] pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="space-y-4 text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        고객 지원 / FAQ
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        EasyXL 이용 시 궁금한 점을 확인해 보세요.
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 sm:p-12 shadow-xl">
                    <div className="space-y-10">
                        
                        {/* 1. 서비스 이용 및 계정 관련 */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3">
                                1. 서비스 이용 및 계정 관련
                            </h2>
                            <div className="space-y-6">
                                <article className="space-y-2">
                                    <h3 className="text-lg font-semibold text-deepblue-600 dark:text-deepblue-400 flex items-start gap-2">
                                        <span className="shrink-0">Q:</span>
                                        <span>EasyXL은 누구나 무료로 이용할 수 있나요?</span>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-7">
                                        A: 네, 기본적으로 모든 사용자는 일일 일정 횟수의 AI 분석 기능을 무료로 체험할 수 있습니다. 대용량 데이터 처리나 무제한 분석이 필요한 엔터프라이즈 사용자를 위한 프리미엄 플랜도 곧 출시될 예정입니다.
                                    </p>
                                </article>
                                <article className="space-y-2">
                                    <h3 className="text-lg font-semibold text-deepblue-600 dark:text-deepblue-400 flex items-start gap-2">
                                        <span className="shrink-0">Q:</span>
                                        <span>구글 로그인 외에 다른 로그인 방식도 지원하나요?</span>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-7">
                                        A: 현재 EasyXL은 사용자 편의와 보안을 위해 Google OAuth 2.0 인증 방식을 우선적으로 지원하고 있습니다. 향후 이메일 및 다양한 소셜 로그인 수단을 확대할 계획입니다.
                                    </p>
                                </article>
                            </div>
                        </section>

                        {/* 2. 데이터 분석 및 OCR 기술 관련 */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3">
                                2. 데이터 분석 및 OCR 기술 관련
                            </h2>
                            <div className="space-y-6">
                                <article className="space-y-2">
                                    <h3 className="text-lg font-semibold text-deepblue-600 dark:text-deepblue-400 flex items-start gap-2">
                                        <span className="shrink-0">Q:</span>
                                        <span>이미지 분석(OCR)이 가능한 파일 형식과 용량 제한은 어떻게 되나요?</span>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-7">
                                        A: 표준 이미지 포맷인 JPG, PNG, WebP를 지원하며, 파일당 최대 10MB까지 업로드가 가능합니다. 최적의 분석 결과를 위해 글자가 선명하고 수평이 잘 맞는 이미지를 권장합니다.
                                    </p>
                                </article>
                                <article className="space-y-2">
                                    <h3 className="text-lg font-semibold text-deepblue-600 dark:text-deepblue-400 flex items-start gap-2">
                                        <span className="shrink-0">Q:</span>
                                        <span>분석된 데이터가 실제와 다를 경우 어떻게 수정하나요?</span>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-7">
                                        A: EasyXL의 InteractiveGrid 시스템을 통해 분석된 모든 셀의 데이터를 직접 클릭하여 수정할 수 있습니다. 수정된 데이터는 즉시 엑셀 파일로 내보내기에 반영됩니다.
                                    </p>
                                </article>
                                <article className="space-y-2">
                                    <h3 className="text-lg font-semibold text-deepblue-600 dark:text-deepblue-400 flex items-start gap-2">
                                        <span className="shrink-0">Q:</span>
                                        <span>"데이터 비서" 기능은 어떤 질문까지 답변이 가능한가요?</span>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-7">
                                        A: 단순한 수치 합산부터 "항목별 비중 계산", "날짜별 매출 추이 분석", "중복 데이터 필터링" 등 엑셀 실무에서 쓰이는 대부분의 논리적 질문에 답변이 가능합니다.
                                    </p>
                                </article>
                            </div>
                        </section>

                        {/* 3. 보안 및 데이터 관리 */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3">
                                3. 보안 및 데이터 관리
                            </h2>
                            <div className="space-y-6">
                                <article className="space-y-2">
                                    <h3 className="text-lg font-semibold text-deepblue-600 dark:text-deepblue-400 flex items-start gap-2">
                                        <span className="shrink-0">Q:</span>
                                        <span>업로드한 데이터의 보안은 어떻게 유지되나요?</span>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-7">
                                        A: 모든 데이터 전송은 SSL/TLS 암호화를 통해 보호됩니다. 또한 사용자가 분석한 내역은 개인화된 데이터베이스에 안전하게 저장되며, 본인 외에는 누구도 접근할 수 없습니다.
                                    </p>
                                </article>
                                <article className="space-y-2">
                                    <h3 className="text-lg font-semibold text-deepblue-600 dark:text-deepblue-400 flex items-start gap-2">
                                        <span className="shrink-0">Q:</span>
                                        <span>내 분석 이력을 삭제하고 싶을 때는 어떻게 하나요?</span>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-7">
                                        A: [마이페이지] 또는 [분석 히스토리] 탭에서 개별 분석 내역을 언제든지 영구 삭제할 수 있습니다.
                                    </p>
                                </article>
                            </div>
                        </section>

                        {/* 4. 기술적 오류 및 피드백 */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3">
                                4. 기술적 오류 및 피드백
                            </h2>
                            <div className="space-y-6">
                                <article className="space-y-2">
                                    <h3 className="text-lg font-semibold text-deepblue-600 dark:text-deepblue-400 flex items-start gap-2">
                                        <span className="shrink-0">Q:</span>
                                        <span>분석 도중 에러가 발생하면 어떻게 조치해야 하나요?</span>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-7">
                                        A: 먼저 인터넷 연결 상태를 확인하고 페이지를 새로고침(F5)해 보시기 바랍니다. 지속적인 에러 발생 시, 에러 메시지와 함께 하단 고객센터 이메일로 문의해 주시면 신속히 해결해 드립니다.
                                    </p>
                                </article>
                                <article className="space-y-2">
                                    <h3 className="text-lg font-semibold text-deepblue-600 dark:text-deepblue-400 flex items-start gap-2">
                                        <span className="shrink-0">Q:</span>
                                        <span>새로운 기능 제안이나 피드백을 보내고 싶습니다.</span>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-7">
                                        A: EasyXL은 사용자의 목소리로 성장합니다. 서비스 개선 아이디어는 언제나 환영하며, 고객지원 팀 이메일(support@easyxl.gg)을 통해 자유롭게 의견을 남겨주세요.
                                    </p>
                                </article>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
