import Link from "next/link";

const checkpoints = [
  "샘플 커리큘럼 1종",
  "컴퓨터공학·경영학 대응",
  "2023·2024 학번 트랙",
  "추천 진로 4개",
] as const;

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-5rem] h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 sm:px-8 lg:py-16">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="grid gap-10 px-7 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)] lg:px-12 lg:py-14">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                MajorMap AI
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                수강 이력으로
                <span className="block text-indigo-600">진로 추천부터</span>
                다음 학기 계획까지 연결하세요
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                이미 들은 과목과 성적, 관심 키워드를 바탕으로 지금 어울리는 진로를 추천하고
                보완 과목과 학기 계획까지 한 흐름으로 보여주는 전공 로드맵 도구입니다.
              </p>

              <div className="mt-8 flex">
                <Link
                  href="/recommend"
                  className="inline-flex min-w-52 items-center justify-center rounded-2xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                >
                  추천 시작하기
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {checkpoints.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-8 top-6 h-40 rounded-[1.75rem] bg-gradient-to-br from-indigo-200/30 via-sky-100/30 to-transparent blur-2xl" />
              <div className="relative rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-900/10">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/70">추천 미리보기</p>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    Demo
                  </span>
                </div>

                <div className="mt-5 rounded-[1.4rem] bg-white p-5 text-slate-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-400">추천 진로</p>
                      <p className="mt-2 text-2xl font-black">백엔드 개발자</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">적합도</p>
                      <p className="mt-1 text-3xl font-black text-emerald-600">87</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">보유 역량</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          프로그래밍
                        </span>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          데이터 처리
                        </span>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          문제 해결
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">다음 액션</p>
                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        SQLD, 데이터분석개론, 운영체제 보강으로 진입 속도를 높일 수 있어요.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/5 px-3 py-4">
                    <p className="text-2xl font-black">4</p>
                    <p className="mt-1 text-xs text-white/70">추천 진로</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-3 py-4">
                    <p className="text-2xl font-black">3</p>
                    <p className="mt-1 text-xs text-white/70">보완 과목</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-3 py-4">
                    <p className="text-2xl font-black">1</p>
                    <p className="mt-1 text-xs text-white/70">학기 계획</p>
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
