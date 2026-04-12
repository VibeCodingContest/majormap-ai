'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SemesterPlanPanel } from "@/components/SemesterPlanPanel";
import { PlanResult } from "@/lib/types";

export default function RecommendPlanPage() {
  const router = useRouter();
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);

  useEffect(() => {
    const rawPlanResult = sessionStorage.getItem("majormap_plan_result");
    if (!rawPlanResult) {
      router.replace("/recommend/result");
      return;
    }

    try {
      setPlanResult(JSON.parse(rawPlanResult) as PlanResult);
    } catch {
      router.replace("/recommend/result");
    }
  }, [router]);

  if (!planResult) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white/92 p-10 text-center shadow-[0_30px_80px_-48px_rgba(15,23,42,0.42)]">
          <svg className="mx-auto mb-5 h-10 w-10 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-semibold tracking-tight text-slate-900">학기 계획을 불러오고 있습니다</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <section className="mb-5 rounded-[26px] border border-slate-200 bg-white/92 p-4 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.42)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              다음 학기 계획
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {planResult.selectedCareer.careerName} 추천 결과를 바탕으로 생성된 학기별 계획입니다.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/recommend/result#top-matches"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              추천 결과로 돌아가기
            </Link>
            <Link
              href="/recommend"
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.75)] transition-colors hover:bg-indigo-500"
            >
              입력 다시 하기
            </Link>
          </div>
        </div>
      </section>

      <SemesterPlanPanel result={planResult} />
    </main>
  );
}
