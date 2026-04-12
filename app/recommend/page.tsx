import { Suspense } from "react";
import Link from "next/link";
import { IntakeForm } from "@/components/IntakeForm";
import { demoProfiles } from "@/lib/sample-data";

const guideSteps = [
  { step: "01", title: "기본 정보 입력", description: "학번 트랙과 전공 정보를 선택해 추천 기준을 맞춥니다." },
  { step: "02", title: "수강 과목 체크", description: "이수 과목과 성적을 입력해 현재 역량을 반영합니다." },
  { step: "03", title: "관심 분야 추가", description: "관심 키워드를 더해 더 자연스러운 추천 방향을 만듭니다." },
] as const;

export default function RecommendPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-0 h-72 w-72 rounded-full bg-sky-100 blur-3xl" />
        <div className="absolute right-[-10rem] top-24 h-96 w-96 rounded-full bg-indigo-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[28px] border border-slate-200/80 bg-white/85 px-5 py-4 backdrop-blur sm:px-6">
          <p className="text-base font-semibold text-slate-900">MajorMap AI</p>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.75)] transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            홈으로
          </Link>
        </header>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
          <aside className="rounded-[28px] border border-slate-200 bg-white/92 p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.42)] backdrop-blur sm:p-6 lg:sticky lg:top-4 lg:h-fit">
            <span className="inline-flex min-h-9 items-center rounded-full border border-indigo-200 bg-indigo-50 px-3.5 text-xs font-semibold text-indigo-700">
              추천 입력
            </span>

            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              학생 정보를 바탕으로
              <span className="block text-indigo-600">AI 추천을 준비합니다</span>
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              현재 전공과 수강 이력, 관심 분야를 입력하면 진로 추천과 부족 역량 분석,
              추천 과목, 다음 학기 계획까지 한 번에 이어서 확인할 수 있습니다.
            </p>

            <div className="mt-6 space-y-2.5">
              {guideSteps.map((item) => (
                <article key={item.step} className="rounded-[20px] bg-slate-50 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-indigo-600 ring-1 ring-slate-200">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-[20px] border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-400">Quick Start</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    데모 프로필로 바로 시작하기
                  </p>
                </div>
                <Link
                  href="/recommend"
                  className="inline-flex min-h-9 items-center rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.75)] transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  초기화
                </Link>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {demoProfiles.map((profile, idx) => (
                  <Link
                    key={profile.label}
                    href={`/recommend?demo=${idx}`}
                    className="inline-flex min-h-9 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    {profile.label}
                  </Link>
                ))}
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                예시 입력을 바로 불러와 추천 흐름과 결과 화면을 빠르게 확인할 수 있습니다.
              </p>
            </div>
          </aside>

          <div className="min-w-0">
            <Suspense
              fallback={
                <div className="rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.42)] backdrop-blur sm:p-6">
                  <div className="h-24 animate-pulse rounded-[24px] bg-slate-100" />
                </div>
              }
            >
              <IntakeForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
