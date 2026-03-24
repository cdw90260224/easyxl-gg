import { Link } from 'react-router-dom';
import { Lightbulb, Cpu, Puzzle, Globe, ShieldCheck } from 'lucide-react';

const sections = [
    {
        icon: Lightbulb,
        title: '1. 우리의 시작 (The Genesis of EasyXL)',
        paragraphs: [
            '현대 비즈니스 환경에서 데이터는 \'제2의 석유\'라고 불릴 만큼 중요한 자산입니다. 하지만 역설적으로 우리는 데이터의 홍수 속에서 길을 잃곤 합니다. 숙련된 엑셀 전문가가 아니라면 수만 행의 로우 데이터(Raw Data)에서 의미 있는 결론을 도출하기란 결코 쉬운 일이 아닙니다.',
            'EasyXL은 바로 이러한 \'데이터 격차(Data Gap)\'를 해소하기 위해 탄생했습니다. 우리는 복잡한 수식과 프로그래밍 언어가 지배하던 데이터 분석의 영역을, 누구나 일상 언어로 소통할 수 있는 민주적인 공간으로 바꾸고자 합니다. 차세대 AI 기술을 통해 복잡함은 걷어내고, 본질적인 인사이트만 남기는 것. 그것이 EasyXL이 추구하는 첫 번째 가치입니다.',
        ],
    },
    {
        icon: Cpu,
        title: '2. 혁신적 기술 지향점 (Technological Vision)',
        paragraphs: ['EasyXL은 단순한 웹 도구를 넘어, 최첨단 인공지능 아키텍처를 기반으로 설계된 지능형 분석 엔진입니다.'],
        bullets: [
            { label: 'Gemini AI 기반의 인지 컴퓨팅', desc: '구글의 최신 거대언어모델(LLM)인 Gemini를 심장으로 채택하여, 사용자의 모호한 질문 속에서도 정확한 분석 의도를 파악합니다. 기존의 정형화된 필터링 도구와는 차원이 다른 \'맥락 이해형\' 분석을 가능하게 합니다.' },
            { label: '하이브리드 데이터 프로세싱', desc: '이미지(OCR)와 엑셀(XLSX) 데이터를 동시에 처리하는 멀티모달 기술을 통해, 오프라인의 아날로그 데이터와 온라인의 디지털 데이터를 하나의 통합된 그리드에서 관리할 수 있습니다.' },
            { label: '실시간 인터랙티브 시각화', desc: '분석 결과는 정적인 표에 머물지 않습니다. 사용자의 추가 요청에 따라 실시간으로 변화하는 동적 차트와 대시보드를 제공하여, 데이터가 살아 움직이는 경험을 선사합니다.' },
        ],
    },
    {
        icon: Puzzle,
        title: '3. 우리가 해결하고자 하는 문제 (Problem Solving)',
        paragraphs: ['EasyXL은 다음과 같은 비즈니스 현장의 고질적인 문제들을 혁신적으로 해결합니다.'],
        bullets: [
            { label: '반복적인 데이터 입력의 늪 (Automation)', desc: '수기 장부나 영수증을 엑셀에 옮기는 단순 반복 작업은 인적 오류(Human Error)를 유발하고 창의적인 업무 시간을 앗아갑니다. EasyXL은 이를 초단위 자동화로 전환합니다.' },
            { label: '높은 분석 진입 장벽 (Accessibility)', desc: '피벗 테이블이나 복잡한 통계 함수를 배우지 못한 사람들도 "이번 달 수익성 분석해줘"라는 한 마디로 전문가 수준의 리포트를 얻을 수 있습니다.' },
            { label: '파편화된 정보의 통합 (Integration)', desc: '흩어져 있는 수많은 파일과 이미지들을 하나의 솔루션 안에서 체계적으로 아카이빙하고 관리할 수 있도록 돕습니다.' },
        ],
    },
    {
        icon: Globe,
        title: '4. 우리의 비전: \'모두를 위한 데이터 분석가\'',
        paragraphs: [
            'EasyXL의 비전은 명확합니다. 모든 개인과 기업이 데이터의 주권을 갖게 하는 것입니다.',
            '우리는 소상공인이 대기업 수준의 정밀한 매출 분석을 수행하고, 학생이 방대한 설문 데이터를 단 몇 분 만에 요약하며, 직장인이 보고서 작성의 압박에서 벗어나 더 가치 있는 의사결정에 집중하는 세상을 꿈꿉니다.',
            '단순히 엑셀 파일을 읽어주는 도구를 넘어, 사용자의 비즈니스 성장을 함께 고민하는 지능형 파트너로서 EasyXL은 끊임없이 진화할 것입니다. 우리는 데이터 분석이 더 이상 고통스러운 노동이 아닌, 즐거운 발견의 과정이 되도록 기술적 혁신을 멈추지 않겠습니다.',
        ],
    },
    {
        icon: ShieldCheck,
        title: '5. 신뢰와 보안 (Trust & Security)',
        paragraphs: [
            '사용자의 데이터는 EasyXL에게 가장 소중한 자산입니다. 우리는 업계 표준의 암호화 기술을 적용하여 모든 데이터 전송 구간을 보호하며, 분석 과정에서 사용되는 민감한 정보는 엄격한 개인정보 처리 방침에 따라 관리됩니다. 기술의 편리함 뒤에 숨은 보안의 중요성을 우리는 결코 간과하지 않습니다.',
        ],
    },
];

export default function About() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f12] py-16 px-4">
            <article className="max-w-4xl mx-auto space-y-10">

                {/* Hero */}
                <header className="text-center space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-loose">
                        EasyXL: 데이터 분석의<br />
                        <span className="text-xl sm:text-2xl text-indigo-600 dark:text-indigo-400">새로운 패러다임을 열다</span>
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        AI 기술로 데이터 격차를 해소하고, 모두에게 데이터의 주권을 돌려드립니다.
                    </p>
                </header>

                {/* Content Sections */}
                {sections.map((section, i) => (
                    <section
                        key={i}
                        className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                <section.icon className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                        </div>
                        <div className="space-y-4">
                            {section.paragraphs.map((p, j) => (
                                <p key={j} className="text-gray-600 dark:text-gray-400 leading-relaxed">{p}</p>
                            ))}
                            {section.bullets && (
                                <ul className="space-y-4 mt-2">
                                    {section.bullets.map((b, k) => (
                                        <li key={k} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#262626] border border-gray-100 dark:border-gray-800">
                                            <span className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                            <div>
                                                <strong className="block text-gray-800 dark:text-gray-200 mb-1">{b.label}</strong>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{b.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                ))}

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
