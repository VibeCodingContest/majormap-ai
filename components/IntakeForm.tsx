'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import {
  demoProfiles,
  skillTagLabels,
} from "@/lib/sample-data";
import {
  filterTakenCoursesByVisibility,
  getVisibleCoursesForProfile,
  normalizeSecondaryMajor,
} from "@/lib/course-visibility";
import { validateTakenCourseGradePolicy } from "@/lib/grade-policy";
import {
  CareerRecommendation,
  Course,
  GradeValue,
  PlanApiResponse,
  PlanOptions,
  PlanResult,
  RecommendApiResponse,
  StudentProfile,
  TakenCourseInput,
} from "@/lib/types";
import { PlanSetupPanel } from "./PlanSetupPanel";
import { ResultCard } from "./ResultCard";
import { SemesterPlanPanel } from "./SemesterPlanPanel";

const YEAR_TRACKS = ["2024", "2023"];
const PRIMARY_MAJORS = ["컴퓨터공학", "경영학"];
const GRADE_OPTIONS: GradeValue[] = [
  "A+",
  "A0",
  "B+",
  "B0",
  "C+",
  "C0",
  "D+",
  "D0",
  "F",
  "P",
];

type SelectedCourseState = Record<
  string,
  {
    checked: boolean;
    grade: "" | GradeValue;
  }
>;

type CourseSelectionCardProps = {
  course: Course;
  checked: boolean;
  grade: "" | GradeValue;
  onToggle: () => void;
  onGradeChange: (grade: "" | GradeValue) => void;
};

function buildSelectedCourseState(
  profile: Pick<StudentProfile, "takenCourseIds" | "takenCourses">
): SelectedCourseState {
  const selections: SelectedCourseState = {};
  const selectedCourses: TakenCourseInput[] =
    profile.takenCourses.length > 0
      ? profile.takenCourses
      : profile.takenCourseIds.map((courseId) => ({ courseId }));

  for (const course of selectedCourses) {
    selections[course.courseId] = {
      checked: true,
      grade: course.grade ?? "",
    };
  }

  return selections;
}

function buildTakenCourses(
  selectedCourses: SelectedCourseState
): TakenCourseInput[] {
  return Object.entries(selectedCourses)
    .filter(([, value]) => value.checked)
    .map(([courseId, value]) =>
      value.grade
        ? { courseId, grade: value.grade }
        : { courseId }
    );
}

function CourseSelectionCard({
  course,
  checked,
  grade,
  onToggle,
  onGradeChange,
}: CourseSelectionCardProps) {
  const checkboxId = `taken-course-${course.id}`;
  const gradeSelectId = `taken-course-grade-${course.id}`;
  const isFpCourse = course.gradingType === "fp" || course.code.startsWith("LA");
  const gradeOptions = isFpCourse
    ? (["P", "F"] as const)
    : GRADE_OPTIONS.filter((value) => value !== "P");

  return (
    <div
      className={[
        "flex flex-col gap-3 rounded-xl border p-4 transition-colors md:flex-row md:items-center md:justify-between",
        checked
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-1 h-4 w-4 shrink-0 accent-black"
        />
        <div className="min-w-0">
          <label
            htmlFor={checkboxId}
            className="cursor-pointer text-sm font-semibold text-gray-900"
          >
            {course.name}
          </label>
          <p className="mt-1 text-xs text-gray-500">과목코드 {course.code}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {course.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
              >
                {skillTagLabels[tag] ?? tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full md:w-36 md:shrink-0">
        <label htmlFor={gradeSelectId} className="sr-only">
          {course.name} 성적 선택
        </label>
        <select
          id={gradeSelectId}
          aria-label={`${course.name} 성적 선택`}
          value={grade}
          onChange={(e) => onGradeChange(e.target.value as "" | GradeValue)}
          disabled={!checked}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">성적 선택</option>
          {gradeOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        {checked && isFpCourse && (
          <p className="mt-1 text-[11px] text-sky-700">P/F 과목</p>
        )}
      </div>
    </div>
  );
}

function createDefaultProfile(): StudentProfile {
  return {
    studentYearTrack: "2024",
    primaryMajor: "컴퓨터공학",
    secondaryMajor: undefined,
    takenCourses: [],
    takenCourseIds: [],
    interestKeywords: [],
  };
}

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

export function IntakeForm() {
  const [profile, setProfile] = useState<StudentProfile>(() => createDefaultProfile());
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourseState>({});
  const [interestInput, setInterestInput] = useState("");
  const [results, setResults] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [selectedCareer, setSelectedCareer] =
    useState<CareerRecommendation | null>(null);
  const [planOptions, setPlanOptions] = useState<PlanOptions>(() =>
    createDefaultPlanOptions()
  );
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [retakeSelectionMap, setRetakeSelectionMap] = useState<
    Record<string, string[]>
  >({});
  const recommendAbortControllerRef = useRef<AbortController | null>(null);
  const planAbortControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const visibleCourses = useMemo(
    () => getVisibleCoursesForProfile(profile),
    [profile]
  );
  const visibleCourseIds = useMemo(
    () => visibleCourses.map((course) => course.id),
    [visibleCourses]
  );
  const visibleCourseIdSet = useMemo(
    () => new Set(visibleCourseIds),
    [visibleCourseIds]
  );
  const secondaryMajorOptions = [
    "없음",
    ...PRIMARY_MAJORS.filter((major) => major !== profile.primaryMajor),
  ];
  const selectedCourseCount = visibleCourses.filter(
    (course) => selectedCourses[course.id]?.checked
  ).length;

  function buildCurrentProfile(): StudentProfile {
    const takenCourses = filterTakenCoursesByVisibility(
      profile,
      buildTakenCourses(selectedCourses)
    );
    const secondaryMajor = normalizeSecondaryMajor(profile.secondaryMajor);

    return {
      ...profile,
      secondaryMajor,
      takenCourses,
      takenCourseIds: takenCourses.map((course) => course.courseId),
      interestKeywords: interestInput
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };
  }

  function applyDemoProfile(idx: number) {
    const dp = demoProfiles[idx];
    setProfile({
      ...dp.profile,
      secondaryMajor: normalizeSecondaryMajor(dp.profile.secondaryMajor),
    });
    setSelectedCourses(buildSelectedCourseState(dp.profile));
    setInterestInput(dp.profile.interestKeywords.join(", "));
    setResults([]);
    setError(null);
    setHasSubmitted(false);
    setSelectedCareer(null);
    setPlanResult(null);
    setPlanError(null);
    setRetakeSelectionMap({});
    setPlanOptions(createDefaultPlanOptions());
  }

  function toggleRetakeCourseSelection(
    careerId: string,
    courseId: string,
    checked: boolean
  ) {
    setRetakeSelectionMap((prev) => {
      const current = prev[careerId] ?? [];
      const next = checked
        ? Array.from(new Set([...current, courseId]))
        : current.filter((id) => id !== courseId);

      return {
        ...prev,
        [careerId]: next,
      };
    });
  }

  function toggleCourse(id: string) {
    setSelectedCourses((prev) => {
      const current = prev[id];

      if (current?.checked) {
        const next = { ...prev };
        delete next[id];
        return next;
      }

      return {
        ...prev,
        [id]: { checked: true, grade: current?.grade ?? "" },
      };
    });
  }

  function updateCourseGrade(id: string, grade: "" | GradeValue) {
    setSelectedCourses((prev) => ({
      ...prev,
      [id]: {
        checked: prev[id]?.checked ?? true,
        grade,
      },
    }));
  }

  function resetForm() {
    recommendAbortControllerRef.current?.abort();
    recommendAbortControllerRef.current = null;
    planAbortControllerRef.current?.abort();
    planAbortControllerRef.current = null;
    setProfile(createDefaultProfile());
    setSelectedCourses({});
    setInterestInput("");
    setResults([]);
    setLoading(false);
    setError(null);
    setHasSubmitted(false);
    setSelectedCareer(null);
    setPlanOptions(createDefaultPlanOptions());
    setPlanResult(null);
    setPlanLoading(false);
    setPlanError(null);
    setRetakeSelectionMap({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = buildCurrentProfile();

    if (payload.takenCourses.length === 0) {
      setError("수강한 과목을 하나 이상 선택해주세요.");
      return;
    }

    if (payload.takenCourses.some((course) => !course.grade)) {
      setError("성적을 입력해주세요.");
      return;
    }

    const gradePolicyError = validateTakenCourseGradePolicy(payload.takenCourses);
    if (gradePolicyError) {
      setError(gradePolicyError);
      return;
    }

    setError(null);
    setLoading(true);
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
        throw new Error(
          "error" in data ? data.error : "추천 요청 중 오류가 발생했습니다."
        );
      }

      setResults(data.results);
      setHasSubmitted(true);
      setSelectedCareer(null);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      setPlanResult(null);
      setPlanError(null);
      setRetakeSelectionMap({});
    } catch (caughtError) {
      if (isAbortError(caughtError)) {
        return;
      }

      setResults([]);
      setError("추천 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      if (recommendAbortControllerRef.current === controller) {
        recommendAbortControllerRef.current = null;
        setLoading(false);
      }
    }
  }

  async function handlePlanSubmit() {
    if (!selectedCareer) {
      return;
    }

    setPlanLoading(true);
    setPlanError(null);
    planAbortControllerRef.current?.abort();
    const controller = new AbortController();
    planAbortControllerRef.current = controller;

    try {
      const firstSemesterTargetCredits =
        planOptions.firstSemesterTargetCredits ?? planOptions.targetCredits;
      const secondSemesterTargetCredits =
        planOptions.secondSemesterTargetCredits ?? firstSemesterTargetCredits;
      const selectedRetakeCourseIds =
        retakeSelectionMap[selectedCareer.careerId] ?? [];
      const payload = {
        ...buildCurrentProfile(),
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
        throw new Error(
          "error" in data ? data.error : "수강 계획 생성 중 오류가 발생했습니다."
        );
      }

      setPlanResult(data.result);
    } catch (caughtError) {
      if (isAbortError(caughtError)) {
        return;
      }

      setPlanResult(null);
      setPlanError("수강 계획 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      if (planAbortControllerRef.current === controller) {
        planAbortControllerRef.current = null;
        setPlanLoading(false);
      }
    }
  }

  useEffect(() => {
    setSelectedCourses((prev) => {
      const nextEntries = Object.entries(prev).filter(([courseId]) =>
        visibleCourseIdSet.has(courseId)
      );

      if (nextEntries.length === Object.keys(prev).length) {
        return prev;
      }

      return Object.fromEntries(nextEntries);
    });
  }, [visibleCourseIdSet]);

  useEffect(() => {
    return () => {
      recommendAbortControllerRef.current?.abort();
      planAbortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!selectedCareer) {
      return;
    }

    const element = document.getElementById(
      `plan-inline-${selectedCareer.careerId}`
    );

    if (!element) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      element.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedCareer, planResult, planLoading]);

  return (
    <div className="mt-6 space-y-8">
      {/* 데모 프로필 빠른 선택 */}
      <section>
        <p className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
          빠른 데모 프로필 선택
        </p>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {demoProfiles.map((dp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyDemoProfile(idx)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              {dp.label}
            </button>
          ))}
          <button
            type="button"
            onClick={resetForm}
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            초기화
          </button>
        </div>
      </section>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">학번 트랙</label>
            <select
              value={profile.studentYearTrack}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  studentYearTrack: e.target.value,
                }))
              }
              className="w-full rounded border border-gray-300 p-2 text-sm"
            >
              {YEAR_TRACKS.map((y) => (
                <option key={y} value={y}>{y}학번</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">주전공</label>
            <select
              value={profile.primaryMajor}
              onChange={(e) => {
                const nextPrimaryMajor = e.target.value;
                setProfile((p) => ({
                  ...p,
                  primaryMajor: nextPrimaryMajor,
                  secondaryMajor:
                    p.secondaryMajor === nextPrimaryMajor
                      ? undefined
                      : p.secondaryMajor,
                }));
              }}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            >
              {PRIMARY_MAJORS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">복수전공</label>
            <select
              value={profile.secondaryMajor ?? "없음"}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  secondaryMajor: e.target.value === "없음" ? undefined : e.target.value,
                }))
              }
              className="w-full rounded border border-gray-300 p-2 text-sm"
            >
              {secondaryMajorOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 과목 체크박스 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            수강한 과목 선택{" "}
            <span className="font-normal text-gray-400">
              ({selectedCourseCount}개 선택됨)
            </span>
          </label>
          {visibleCourses.length === 0 ? (
            <p className="text-sm text-gray-400">선택한 학번/전공에 해당하는 과목이 없습니다.</p>
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {visibleCourses.map((course) => (
                <CourseSelectionCard
                  key={course.id}
                  course={course}
                  checked={selectedCourses[course.id]?.checked ?? false}
                  grade={selectedCourses[course.id]?.grade ?? ""}
                  onToggle={() => toggleCourse(course.id)}
                  onGradeChange={(grade) => updateCourseGrade(course.id, grade)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 관심 키워드 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            관심 키워드{" "}
            <span className="font-normal text-gray-400">(쉼표로 구분)</span>
          </label>
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            placeholder="예: product, data, backend"
            className="w-full rounded border border-gray-300 p-2 text-sm"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 sm:min-w-40"
          >
            {loading ? "추천 분석 중..." : "추천 받기"}
          </button>
        </div>
      </form>

      {/* 결과 */}
      {results.length > 0 && (
        <section ref={resultsRef} className="scroll-mt-6">
          <div className="mb-6 border-t-2 border-indigo-100 pt-6">
            <h2 className="text-xl font-bold text-gray-900">
              추천 진로 TOP {results.length}
            </h2>
          </div>
          <div className="space-y-4">
            {results.map((result) => {
              const isThisSelected = selectedCareer?.careerId === result.careerId;
              // 계획 모드에서 비선택 카드는 숨긴다
              if (selectedCareer && !isThisSelected) {
                return null;
              }

              return (
                <ResultCard
                  key={result.careerId}
                  result={result}
                  profile={buildCurrentProfile()}
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
                      className="mt-4 space-y-4 border-t pt-4 outline-none"
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
              );
            })}
          </div>
        </section>
      )}

      {hasSubmitted && !loading && results.length === 0 && !error && (
        <section className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-gray-500">
          조건에 맞는 추천 결과가 없습니다. 학번, 전공, 수강 과목을 다시 선택해보세요.
        </section>
      )}
    </div>
  );
}
