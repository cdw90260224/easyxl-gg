import { Link } from 'react-router-dom';
import {
    Upload, MousePointerClick, Download, MessageSquareText,
    Lightbulb, Building2, Store, Briefcase, ShieldCheck, Smartphone, Crown
} from 'lucide-react';

export default function Guide() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f12] py-16 px-4">
            <article className="max-w-4xl mx-auto space-y-12">

                {/* Hero */}
                <header className="text-center space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                        EasyXL: 차세대 AI 데이터 분석 솔루션<br />
                        <span className="text-indigo-600 dark:text-indigo-400">완벽 활용 가이드</span>
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        복잡한 수식 없이, 대화하듯이. Gemini AI 기반의 데이터 분석 솔루션으로
                        비즈니스 인사이트를 즉시 도출하세요.
                    </p>
                </header>

                {/* 1. Overview */}
                <section className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. EasyXL 솔루션 개요</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        현대 비즈니스 환경에서 데이터는 기업의 핵심 자산입니다. 하지만 파편화된 영수증, 복잡한 수기 장부, 방대한 엑셀 시트는 데이터의 효율적인 활용을 가로막는 장애물이 되곤 합니다. EasyXL은 이러한 데이터 처리의 병목 현상을 해결하기 위해 탄생한 차세대 AI 데이터 분석 솔루션입니다.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        최첨단 Gemini AI 모델을 기반으로 구축된 EasyXL은 단순한 데이터 입력을 넘어, 사용자의 자연어 명령을 이해하고 정밀하게 분석하여 비즈니스 인사이트를 도출합니다. 이제 복잡한 엑셀 수식이나 프로그래밍 지식 없이도, 누구나 데이터 전문가 수준의 결과물을 생성할 수 있습니다.
                    </p>
                </section>

                {/* 2. Key Technologies */}
                <section className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">2. 혁신적인 핵심 기술 아키텍처</h2>
                    <div className="space-y-6">
                        {[
                            {
                                icon: Upload,
                                title: '① 지능형 OCR(광학 문자 인식) 엔진 📸',
                                desc: 'EasyXL의 OCR 기술은 단순 텍스트 추출을 넘어 문맥을 이해합니다. 비정형화된 영수증이나 명세서 이미지를 업로드하면, AI가 상호명, 거래 일시, 품목별 금액, 세액 등을 정밀하게 구분하여 디지털 데이터로 변환합니다. 다량의 문서를 동시 처리하여 전수 조사의 효율성을 극대화합니다.'
                            },
                            {
                                icon: MousePointerClick,
                                title: '② 고도화된 InteractiveGrid 시스템 📊',
                                desc: '데이터의 가독성은 분석의 시작입니다. EasyXL은 InteractiveGrid 인터페이스를 통해 중복 데이터를 지능적으로 제어합니다. 동일 카테고리나 반복되는 인덱스 값을 시각적으로 그룹화하여 핵심 정보에 집중할 수 있도록 돕습니다. 사용자는 그리드 내에서 실시간으로 데이터를 수정하고 정렬할 수 있는 직관적인 환경을 제공받습니다.'
                            },
                            {
                                icon: MessageSquareText,
                                title: '③ 실시간 데이터 시각화 및 엔진 분석 📈',
                                desc: '"분기별 매출 변동 추이를 시각화해줘"와 같은 추상적인 명령에도 EasyXL은 즉각적인 응답을 내놓습니다. 자체 분석 엔진이 원천 데이터를 연산하여 최적의 차트 형태(막대, 선, 파이 등)를 추천하고 대시보드를 구성합니다. 이는 보고서 작성 시간을 획기적으로 단축시킵니다.'
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-[#262626] border border-gray-100 dark:border-gray-800">
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Use Cases */}
                <section className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">3. 산업군별 솔루션 적용 사례</h2>
                    <div className="grid sm:grid-cols-3 gap-5">
                        {[
                            {
                                icon: Building2,
                                title: 'Enterprise & Office',
                                subtitle: '일반 기업 및 사무',
                                issue: '수천 행에 달하는 재고 목록과 매입 내역의 정합성 확인에 과도한 시간 소요.',
                                solution: '엑셀 파일을 업로드하고 "재고 수량과 매입 내역 불일치 항목 추출해줘"라고 명령하면 AI가 3초 내에 오류 항목을 필터링하여 리포팅합니다.'
                            },
                            {
                                icon: Store,
                                title: 'Small Business',
                                subtitle: '소상공인 및 자영업',
                                issue: '배달 플랫폼 매출과 식자재 매입 영수증의 통합 관리 및 손익 분석 부재.',
                                solution: '영수증 사진 촬영만으로 자동 장부가 생성됩니다. "이번 달 고정비 대비 이익률 계산해줘"와 같은 분석으로 경영 효율성을 높이세요.'
                            },
                            {
                                icon: Briefcase,
                                title: 'Professional Services',
                                subtitle: '프리랜서 및 전문가',
                                issue: '프로젝트별 지출 증빙 자료의 정리 및 카테고리별 분류 작업의 번거로움.',
                                solution: '캡처된 명세서들을 올리면 AI가 지출 목적별(교통비, 식비 등)로 자동 분류하여 연말정산에 최적화된 자료를 생성합니다.'
                            }
                        ].map((c, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-[#262626] border border-gray-100 dark:border-gray-800 space-y-3">
                                <div className="flex items-center gap-2">
                                    <c.icon className="w-5 h-5 text-indigo-500" />
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{c.title}</p>
                                        <p className="text-xs text-gray-400">{c.subtitle}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-500 mb-1">Issue</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{c.issue}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-500 mb-1">Solution</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{c.solution}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Standard Process */}
                <section className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">4. 솔루션 표준 이용 프로세스</h2>
                    <div className="space-y-4">
                        {[
                            { icon: Upload, step: 'STEP 1', title: '데이터 소스 업로드', desc: '[파일 업로드] 섹션에서 분석할 이미지(JPG, PNG) 또는 엑셀(XLSX, CSV) 파일을 로드합니다.' },
                            { icon: MessageSquareText, step: 'STEP 2', title: 'AI 컨설팅 및 질의', desc: '상단 AI 입력창에 필요한 분석 요청을 자연어로 입력합니다. (예: "항목별 비중 계산", "특정 날짜 구간 필터링")' },
                            { icon: MousePointerClick, step: 'STEP 3', title: '데이터 검토 및 인터랙티브 편집', desc: '분석된 결과값을 InteractiveGrid에서 최종 검토하고, 필요에 따라 개별 셀의 데이터를 즉시 수정합니다.' },
                            { icon: Download, step: 'STEP 4', title: '데이터 익스포트 및 공유', desc: '가공된 고품질 데이터를 표준 엑셀 포맷으로 내보내거나, 암호화된 링크를 생성해 관계자에게 즉시 공유할 수 있습니다.' },
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-[#262626] border border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-indigo-400">{step.step}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{step.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. FAQ & Security */}
                <section className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">5. 기술 지원 및 보안 안내</h2>
                    <div className="grid sm:grid-cols-3 gap-5">
                        {[
                            { icon: ShieldCheck, title: '보안성', desc: '모든 데이터는 TLS 암호화 프로토콜을 통해 안전하게 전송되며, 분석 완료 후에는 개인정보 보호 정책에 따라 철저히 관리됩니다.' },
                            { icon: Smartphone, title: '확장성', desc: 'EasyXL은 반응형 웹 기술을 적용하여 데스크탑은 물론 모바일 환경에서도 제약 없는 솔루션 접근을 지원합니다.' },
                            { icon: Crown, title: '서비스 플랜', desc: '일반 사용자를 위한 기본 분석 횟수를 제공하며, 대용량 데이터 처리가 필요한 엔터프라이즈 사용자를 위한 프리미엄 플랜도 마련되어 있습니다.' },
                        ].map((item, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-[#262626] border border-gray-100 dark:border-gray-800 space-y-2">
                                <item.icon className="w-6 h-6 text-indigo-500 mb-2" />
                                <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. Policy */}
                <section className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. 거버넌스 및 정책 준수</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        EasyXL은 구글 애드센스 가이드라인을 엄격히 준수하며 서비스를 운영합니다. 본 서비스는 사용자의 동의 하에 쿠키를 수집하며, 개인정보는 관련 법령에 따라 안전하게 보호됩니다. 광고 서비스와 관련된 맞춤형 광고 제공에 대한 상세 내용은 개인정보처리방침을 통해 투명하게 고지하고 있습니다.
                    </p>
                    <Link
                        to="/privacy"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-500/20 transition-all"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        개인정보처리방침 전문 보기
                    </Link>
                </section>

                {/* CTA */}
                <div className="text-center py-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-extrabold rounded-2xl shadow-xl shadow-indigo-500/30 transition-all active:scale-95"
                    >
                        <Lightbulb className="w-5 h-5" />
                        EasyXL 지금 바로 시작하기 →
                    </Link>
                </div>
            </article>
        </div>
    );
}
