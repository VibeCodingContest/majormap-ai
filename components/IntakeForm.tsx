'use client';

import { useEffect, useState } from "react";
import {
  COURSE_CODE_NOTE,
  courses,
  DATASET_NOTICE,
  demoProfiles,
  skillTagLabels,
} from "@/lib/sample-data";
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
          {GRADE_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

const defaultProfile: StudentProfile = {
  studentYearTrack: "2024",
  primaryMajor: "컴퓨터공학",
  secondaryMajor: undefined,
  takenCourses: [],
  takenCourseIds: [],
  interestKeywords: [],
};

const defaultPlanOptions: PlanOptions = {
  nextSemester: "1",
  targetCredits: 15,
  semesterCount: 1,
  includeLiberalArts: false,
};

export function IntakeForm() {
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourseState>({});
  const [interestInput, setInterestInput] = useState("");
  const [results, setResults] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [selectedCareer, setSelectedCareer] =
    useState<CareerRecommendation | null>(null);
  const [planOptions, setPlanOptions] = useState<PlanOptions>(defaultPlanOptions);
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const visibleCourses = courses.filter(
    (c) =>
      c.yearTracks.includes(profile.studentYearTrack) &&
      (c.majors.includes(profile.primaryMajor) ||
        (profile.secondaryMajor && c.majors.includes(profile.secondaryMajor)))
  );
  const secondaryMajorOptions = [
    "없음",
    ...PRIMARY_MAJORS.filter((major) => major !== profile.primaryMajor),
  ];
  const selectedCourseCount = Object.values(selectedCourses).filter(
    (course) => course.checked
  ).length;

  function buildCurrentProfile(): StudentProfile {
    const takenCourses = buildTakenCourses(selectedCourses);

    return {
      ...profile,
      secondaryMajor:
        profile.secondaryMajor === "없음" ? undefined : profile.secondaryMajor,
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
    setProfile(dp.profile);
    setSelectedCourses(buildSelectedCourseState(dp.profile));
    setInterestInput(dp.profile.interestKeywords.join(", "));
    setResults([]);
    setError(null);
    setHasSubmitted(false);
    setSelectedCareer(null);
    setPlanResult(null);
    setPlanError(null);
    setPlanOptions(defaultPlanOptions);
  }

  function toggleCourse(id: string) {
    setSelectedCourses((prev) => {
      const current = prev[id];

      if (current?.checked) {
        return {
          ...prev,
          [id]: { checked: false, grade: "" },
        };
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

  function resetCourseSelections() {
    setSelectedCourses({});
    setProfile((prev) => ({
      ...prev,
      secondaryMajor: undefined,
      takenCourses: [],
      takenCourseIds: [],
    }));
    setError(null);
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

    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setPlanResult(null);
      setPlanError(null);
    } catch {
      setResults([]);
      setError("추천 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePlanSubmit() {
    if (!selectedCareer) {
      return;
    }

    setPlanLoading(true);
    setPlanError(null);

    try {
      const payload = {
        ...buildCurrentProfile(),
        careerId: selectedCareer.careerId,
        ...planOptions,
      };

      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as PlanApiResponse;

      if (!res.ok || "error" in data) {
        throw new Error(
          "error" in data ? data.error : "수강 계획 생성 중 오류가 발생했습니다."
        );
      }

      setPlanResult(data.result);
    } catch {
      setPlanResult(null);
      setPlanError("수강 계획 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setPlanLoading(false);
    }
  }

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
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">지원 데이터셋 안내</p>
        <p className="mt-1">{DATASET_NOTICE}</p>
        <p className="mt-1">
          현재 지원 범위는 컴퓨터공학·경영학, 2023·2024 학번 트랙, 진로 4개입니다.
        </p>
        <p className="mt-1 text-amber-800">{COURSE_CODE_NOTE}</p>
      </section>

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
            onClick={resetCourseSelections}
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            초기화
          </button>
        </div>
        {demoProfiles.map((dp, idx) => (
          <p key={idx} className="mt-1 text-xs text-gray-400">
            {dp.label.split("—")[0].trim()}: {dp.description}
          </p>
        ))}
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
        <section>
          <h2 className="mb-4 text-lg font-bold">추천 진로 TOP {results.length}</h2>
          <div className="space-y-4">
            {results.map((result) => (
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
                isPlanSelected={selectedCareer?.careerId === result.careerId}
              >
                {selectedCareer?.careerId === result.careerId && (
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
            ))}
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
