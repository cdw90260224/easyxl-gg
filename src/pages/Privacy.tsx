export default function Privacy() {
    return (
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <article className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <header className="px-8 py-12 border-b border-gray-100 dark:border-gray-800 text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                        개인정보처리방침
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        EasyXL은 사용자의 소중한 개인정보를 안전하게 처리하고 보호하기 위해 최선을 다하고 있습니다.
                    </p>
                </header>

                <div className="px-8 py-10 space-y-10 text-gray-700 dark:text-gray-300">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-deepblue-100 dark:bg-deepblue-900/30 text-deepblue-600 dark:text-deepblue-400 flex items-center justify-center text-sm">1</span>
                            개인정보의 수집 및 이용 목적
                        </h2>
                        <p className="mb-2">EasyXL은 다음의 목적을 위하여 최소한의 개인정보를 수집합니다.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>서비스 제공:</strong> 업로드된 이미지/문서 내 텍스트 추출 및 데이터 분석(AI 기반)</li>
                            <li><strong>사용자 문의 응대:</strong> 서비스 이용 관련 불편 사항 처리 및 고객 지원</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-deepblue-100 dark:bg-deepblue-900/30 text-deepblue-600 dark:text-deepblue-400 flex items-center justify-center text-sm">2</span>
                            수집하는 개인정보 항목
                        </h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>필수 항목:</strong> 이용자가 업로드한 파일 데이터(영수증, 장부 등), 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
                            <li><strong>선택 항목:</strong> 이메일 주소(문의하기 이용 시)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-deepblue-100 dark:bg-deepblue-900/30 text-deepblue-600 dark:text-deepblue-400 flex items-center justify-center text-sm">3</span>
                            개인정보의 보유 및 이용기간
                        </h2>
                        <p className="mb-2">
                            이용자의 개인정보는 원칙적으로 서비스 이용 목적이 달성되면 지체 없이 파기합니다. 단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>파일 데이터:</strong> 분석 완료 후 즉시 또는 이용자 요청 시 삭제</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-deepblue-100 dark:bg-deepblue-900/30 text-deepblue-600 dark:text-deepblue-400 flex items-center justify-center text-sm">4</span>
                            제3자 제공 및 위탁에 관한 사항
                        </h2>
                        <p className="mb-2">
                            EasyXL은 이용자의 데이터를 외부로 판매하거나 무단 제공하지 않습니다. 다만, 서비스 핵심 기능을 위해 다음의 기술을 활용합니다.
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>분석 엔진:</strong> Google Gemini API (데이터는 분석 목적으로만 일시적으로 사용되며 모델 학습에 강제로 이용되지 않도록 관리합니다.)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-deepblue-100 dark:bg-deepblue-900/30 text-deepblue-600 dark:text-deepblue-400 flex items-center justify-center text-sm">5</span>
                            쿠키(Cookie)의 운용 및 거부
                        </h2>
                        <p>
                            본 서비스는 이용자에게 개인화된 서비스를 제공하기 위해 '쿠키'를 사용합니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-deepblue-100 dark:bg-deepblue-900/30 text-deepblue-600 dark:text-deepblue-400 flex items-center justify-center text-sm">6</span>
                            구글 애드센스(Google AdSense) 관련 고지
                        </h2>
                        <p>
                            본 사이트는 구글에서 제공하는 광고 서비스인 애드센스를 사용합니다. 구글은 사용자의 방문 기록을 바탕으로 맞춤형 광고를 제공하기 위해 쿠키를 사용할 수 있습니다. 사용자는 <strong>[구글 광고 설정]</strong>을 통해 맞춤형 광고를 해제할 수 있습니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-deepblue-100 dark:bg-deepblue-900/30 text-deepblue-600 dark:text-deepblue-400 flex items-center justify-center text-sm">7</span>
                            개인정보 보호책임자
                        </h2>
                        <div className="bg-gray-50 dark:bg-[#262626] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            <p><strong>성명:</strong> 차도운 (Cha Do-woon)</p>
                            <p><strong>문의:</strong> <a href="mailto:cdw90260224@gmail.com" className="text-deepblue-600 dark:text-deepblue-400 hover:underline">cdw90260224@gmail.com</a></p>
                        </div>
                    </section>
                </div>
            </article>
        </main>
    );
}
