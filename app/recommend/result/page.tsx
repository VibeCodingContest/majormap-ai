'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CareerRecommendation,
  PlanApiResponse,
  PlanOptions,
  PlanResult,
  RecommendApiResponse,
  StudentProfile,
} from "@/lib/types";
import { ResultCard } from "@/components/ResultCard";
import { PlanSetupPanel } from "@/components/PlanSetupPanel";
import { SemesterPlanPanel } from "@/components/SemesterPlanPanel";
import Link from "next/link";

function createDefaultPlanOptions(): PlanOptions {
  return {
    nextSemester: "1",
    targetCredits: 15,
    firstSemesterTargetCredits: 15,
    secondSemesterTargetCredits: 15,
    semesterCount: 1,
    includeLiberalArts: false,
  };
}

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}

export default function ResultPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [results, setResults] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null);
  const [planOptions, setPlanOptions] = useState<PlanOptions>(() => createDefaultPlanOptions());
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [retakeSelectionMap, setRetakeSelectionMap] = useState<Record<string, string[]>>({});

  const recommendAbortControllerRef = useRef<AbortController | null>(null);
  const planAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const rawPayload = sessionStorage.getItem("majormap_intake_payload");
    if (!rawPayload) {
      router.replace("/recommend");
      return;
    }

    try {
      const parsedProfile = JSON.parse(rawPayload) as StudentProfile;
      setProfile(parsedProfile);
      fetchRecommendations(parsedProfile);
    } catch (e) {
      router.replace("/recommend");
    }

    return () => {
      recommendAbortControllerRef.current?.abort();
      planAbortControllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRecommendations(payload: StudentProfile) {
    setLoading(true);
    setError(null);
    recommendAbortControllerRef.current?.abort();
    const controller = new AbortController();
    recommendAbortControllerRef.current = controller;

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as RecommendApiResponse;

      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "추천 요청 중 오류가 발생했습니다.");
      }

      setResults(data.results);
    } catch (caughtError) {
      if (isAbortError(caughtError)) return;
      setError("추천 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      if (recommendAbortControllerRef.current === controller) {
        recommendAbortControllerRef.current = null;
        setLoading(false);
      }
    }
  }

  function toggleRetakeCourseSelection(careerId: string, courseId: string, checked: boolean) {
    setRetakeSelectionMap((prev) => {
      const current = prev[careerId] ?? [];
      const next = checked
        ? Array.from(new Set([...current, courseId]))
        : current.filter((id) => id !== courseId);
      return { ...prev, [careerId]: next };
    });
  }

  async function handlePlanSubmit() {
    if (!selectedCareer || !profile) return;

    setPlanLoading(true);
    setPlanError(null);
    planAbortControllerRef.current?.abort();
    const controller = new AbortController();
    planAbortControllerRef.current = controller;

    try {
      const firstSemesterTargetCredits = planOptions.firstSemesterTargetCredits ?? planOptions.targetCredits;
      const secondSemesterTargetCredits = planOptions.secondSemesterTargetCredits ?? firstSemesterTargetCredits;
      const selectedRetakeCourseIds = retakeSelectionMap[selectedCareer.careerId] ?? [];
      
      const payload = {
        ...profile,
        careerId: selectedCareer.careerId,
        ...planOptions,
        targetCredits: firstSemesterTargetCredits,
        firstSemesterTargetCredits,
        secondSemesterTargetCredits,
        includeRetakeCourses: selectedRetakeCourseIds.length > 0,
        retakeCourseIds: selectedRetakeCourseIds,
      };

      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as PlanApiResponse;
      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "수강 계획 생성 중 오류가 발생했습니다.");
      }

      setPlanResult(data.result);
    } catch (caughtError) {
      if (isAbortError(caughtError)) return;
      setPlanResult(null);
      setPlanError("수강 계획 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      if (planAbortControllerRef.current === controller) {
        planAbortControllerRef.current = null;
        setPlanLoading(false);
      }
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white/92 p-10 text-center shadow-[0_30px_80px_-48px_rgba(15,23,42,0.42)]">
          <svg className="mx-auto mb-5 h-10 w-10 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-semibold tracking-tight text-slate-900">추천 결과를 준비하고 있습니다</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">입력한 과목과 관심 분야를 바탕으로 적합도를 계산하는 중입니다.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-[0_30px_80px_-48px_rgba(15,23,42,0.35)]">
          <p className="text-lg font-semibold tracking-tight text-slate-900">추천 결과를 불러오지 못했습니다</p>
          <p className="mt-2 text-sm leading-7 text-rose-600">{error}</p>
          <Link
            href="/recommend"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            이전 입력 화면으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <section className="mb-8 rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.42)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex min-h-10 items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-700">
              Recommendation Result
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              추천 결과
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
              {profile?.studentYearTrack}학번 · {profile?.primaryMajor}
              {profile?.secondaryMajor ? ` + ${profile.secondaryMajor}` : ""}
              {profile?.interestKeywords.length ? ` · 관심사: ${profile.interestKeywords.join(", ")}` : ""}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="/recommend"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              입력 다시 하기
            </Link>
          </div>
        </div>
      </section>

      {results.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
          <p className="text-lg font-semibold tracking-tight text-slate-900">조건에 맞는 추천 결과가 없습니다</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">입력하신 학번, 전공, 수강 과목을 다시 확인해보세요.</p>
        </section>
      ) : (
        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-400">Top Matches</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">AI 추천 진로 TOP {results.length}</h2>
            </div>
            <p className="text-sm leading-6 text-slate-500">카드를 선택하면 학기 계획 생성으로 바로 이어집니다.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {results.map((result) => {
              const isThisSelected = selectedCareer?.careerId === result.careerId;
              if (selectedCareer && !isThisSelected) return null;

              return (
                <div
                  key={result.careerId}
                  className={isThisSelected ? "md:col-span-2 md:flex md:justify-center" : ""}
                >
                  <div className={isThisSelected ? "w-full md:max-w-[36rem]" : "w-full"}>
                    <ResultCard
                      result={result}
                      profile={profile!}
                      onPlanSelect={(nextCareer) => {
                        if (selectedCareer?.careerId === nextCareer.careerId) {
                          setSelectedCareer(null);
                          setPlanResult(null);
                          setPlanError(null);
                          return;
                        }
                        setSelectedCareer(nextCareer);
                        setPlanResult(null);
                        setPlanError(null);
                      }}
                      isPlanSelected={isThisSelected}
                      collapsed={isThisSelected}
                      selectedRetakeCourseIds={retakeSelectionMap[result.careerId] ?? []}
                      onRetakeCourseToggle={(courseId, checked) =>
                        toggleRetakeCourseSelection(result.careerId, courseId, checked)
                      }
                    >
                      {isThisSelected && (
                        <div
                          id={`plan-inline-${result.careerId}`}
                          tabIndex={-1}
                          className="mt-6 border-t border-slate-100 pt-6 outline-none"
                        >
                          <PlanSetupPanel
                            careerName={selectedCareer.careerName}
                            options={planOptions}
                            loading={planLoading}
                            error={planError}
                            onChange={setPlanOptions}
                            onSubmit={handlePlanSubmit}
                          />
                          {planResult?.selectedCareer.careerId === result.careerId && (
                            <SemesterPlanPanel result={planResult} />
                          )}
                        </div>
                      )}
                    </ResultCard>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
