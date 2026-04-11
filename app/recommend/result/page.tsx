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
      <main className="mx-auto max-w-6xl p-8 min-h-screen flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 font-medium animate-pulse">최적의 진로를 분석중입니다...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <div className="rounded-xl bg-red-50 p-8 text-center border border-red-200">
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          <Link href="/recommend" className="text-indigo-600 hover:underline font-semibold">
            &larr; 이전 폼으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      {/* 입력 요약 및 헤더 */}
      <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">추천 결과</h1>
          <p className="text-sm text-gray-500 mt-1">
            {profile?.studentYearTrack}학번 • {profile?.primaryMajor} 
            {profile?.secondaryMajor ? ` + ${profile.secondaryMajor}` : ''} 
            {profile?.interestKeywords.length ? ` • 관심사: ${profile.interestKeywords.join(", ")}` : ''}
          </p>
        </div>
        <Link href="/recommend" className="mt-4 md:mt-0 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors inline-block text-center shrink-0">
          다시 추천받기
        </Link>
      </div>

      {results.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 shadow-sm">
          <p className="text-lg font-medium text-gray-700 mb-2">조건에 맞는 추천 결과가 없습니다.</p>
          <p className="text-sm">입력하신 학번, 전공, 수강 과목을 다시 확인해보세요.</p>
        </section>
      ) : (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            AI 추천 진로 TOP {results.length}
          </h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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
