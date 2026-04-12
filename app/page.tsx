import Link from "next/link";

const trustBadges = [
  "샘플 커리큘럼 1종",
  "컴퓨터공학·경영학 대응",
  "2023·2024 학번 트랙",
  "추천 진로 4개",
] as const;

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-64 w-64 rounded-full bg-sky-100 blur-3xl" />
        <div className="absolute right-[-7rem] top-10 h-72 w-72 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <section className="flex flex-1 items-center py-2 sm:py-4">
          <div className="w-full rounded-[34px] border border-slate-200 bg-white/92 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8 lg:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:gap-10">
              <div className="flex flex-col justify-center">
                <span className="inline-flex min-h-10 w-fit items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-700">
                  AI 기반 진로 추천 MVP
                </span>

                <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-[4rem] lg:leading-[0.98]">
                  수강 이력으로
                  <span className="block text-indigo-600">진로 추천부터</span>
                  다음 학기 계획까지
                </h1>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/recommend"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-indigo-600 px-6 text-base font-semibold text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.75)] transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    추천 시작하기
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {trustBadges.map((item) => (
                    <span
                      key={item}
                      className="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-xs font-medium text-slate-600 sm:text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-full rounded-[30px] bg-slate-950 p-5 text-white shadow-[0_28px_72px_-36px_rgba(15,23,42,0.7)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white/65">Preview</p>
                      <p className="mt-1 text-lg font-semibold">추천 결과 미리보기</p>
                    </div>
                    <span className="inline-flex min-h-10 items-center rounded-full bg-white/10 px-4 text-sm font-semibold text-white/80">
                      Demo
                    </span>
                  </div>

                  <div className="mt-5 rounded-[28px] bg-white p-5 text-slate-900">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-400">추천 진로</p>
                        <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                          백엔드 개발자
                        </p>
                      </div>
                      <div className="rounded-[22px] bg-emerald-50 px-4 py-3 text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">적합도</p>
                        <p className="mt-2 text-4xl font-black text-emerald-600">87</p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="rounded-[24px] bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">보유 역량</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex min-h-9 items-center rounded-full bg-emerald-100 px-3 text-xs font-semibold text-emerald-700">
                            프로그래밍
                          </span>
                          <span className="inline-flex min-h-9 items-center rounded-full bg-emerald-100 px-3 text-xs font-semibold text-emerald-700">
                            데이터 처리
                          </span>
                          <span className="inline-flex min-h-9 items-center rounded-full bg-emerald-100 px-3 text-xs font-semibold text-emerald-700">
                            문제 해결
                          </span>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-indigo-100 bg-indigo-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">다음 액션</p>
                        <p className="mt-2 text-sm font-semibold leading-7 text-slate-800">
                          SQLD, 데이터분석개론, 운영체제 보강으로 진입 속도를 높일 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { value: "4", label: "추천 진로" },
                      { value: "3", label: "보완 과목" },
                      { value: "1", label: "학기 계획" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[22px] bg-white/6 px-3 py-4 text-center">
                        <p className="text-3xl font-black text-white">{item.value}</p>
                        <p className="mt-2 text-xs font-medium text-white/65">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
