import { Sparkles, Image as ImageIcon, LayoutGrid, BarChart3, Upload, MousePointerClick, MessageSquareText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Guide() {
    return (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <article className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Hero Section */}
                <header className="px-8 py-16 text-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 border-b border-gray-100 dark:border-gray-800">
                    <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                        <Sparkles className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
                        EasyXL <span className="text-indigo-600 dark:text-indigo-400">사용 가이드</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        차세대 AI 데이터 분석 솔루션으로 복잡한 수식 없이 대화하듯 데이터를 관리하세요.
                    </p>
                </header>

                <div className="px-8 py-12 space-y-16">
                    {/* Section 1: Intro */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-black">1</span>
                            EasyXL: 차세대 AI 데이터 분석 솔루션
                        </h2>
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                            <p>
                                EasyXL은 사용자가 업로드한 영수증, 장부, 엑셀 파일을 최첨단 <strong>Gemini AI 기술</strong>을 활용하여 즉시 분석합니다. 
                                전문적인 엑셀 수식이나 코딩 지식이 없어도, 일상 언어로 질문하고 지시하여 데이터를 가공할 수 있습니다.
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Core Tech */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-black">2</span>
                            핵심 기술 안내
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Tech 1 */}
                            <div className="bg-gray-50 dark:bg-[#262626] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">스마트 OCR 분석</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    이미지 속 텍스트를 디지털 데이터로 정밀 변환합니다. 다수의 영수증 이미지도 한 번에 테이블 형태의 엑셀 데이터로 구조화합니다.
                                </p>
                            </div>

                            {/* Tech 2 */}
                            <div className="bg-gray-50 dark:bg-[#262626] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                                    <LayoutGrid className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">지능형 InteractiveGrid</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    중복 데이터를 시각적으로 자동 정리하여 가독성을 극대화합니다. 연속된 중복 값은 첫 행만 노출하고, 나머지는 직관적으로 숨겨 깔끔한 뷰를 제공합니다.
                                </p>
                            </div>

                            {/* Tech 3 */}
                            <div className="bg-gray-50 dark:bg-[#262626] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">실시간 데이터 시각화</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    "매출 추이를 차트로 그려줘"와 같은 자연어 질문만으로 맞춤형 차트와 대시보드를 즉시 생성합니다.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: How to Use */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-black">3</span>
                            이용 방법
                        </h2>
                        
                        <div className="space-y-4">
                            {[
                                { icon: MessageSquareText, title: "AI 대화형 분석", desc: "필요한 통계 수치나 데이터 정렬, 필터링을 상단 검색창에 자연어로 입력하여 답변을 얻습니다." },
                                { icon: MousePointerClick, title: "데이터 검토 및 수정", desc: "분석된 데이터를 InteractiveGrid에서 직접 확인하고, 필요 시 간편하게 클릭하여 수정합니다." },
                                { icon: Upload, title: "파일 형태의 데이터 업로드", desc: "파일 업로드 탭에서 분석할 이미지나 기존 엑셀 파일을 선택하여 업로드합니다." },
                                { icon: Download, title: "엑셀 데이터 내보내기", desc: "최종 가공된 양질의 데이터를 엑셀(Excel) 포맷으로 내보내어 안전하게 보관합니다." }
                            ].map((step, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mt-1">
                                        <step.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                            {idx + 1}. {step.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                
                {/* Footer Action */}
                <footer className="px-8 py-10 bg-gray-50 dark:bg-[#262626] border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-6">
                        지금 바로 EasyXL과 함께 놀라운 데이터 분석을 경험해보세요.
                    </p>
                    <Link 
                        to="/"
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25"
                    >
                        EasyXL 시작하기
                    </Link>
                </footer>
            </article>
        </main>
    );
}
