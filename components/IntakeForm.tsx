'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { demoProfiles, skillTagLabels } from "@/lib/sample-data";
import {
  filterTakenCoursesByVisibility,
  getVisibleCoursesForProfile,
  normalizeSecondaryMajor,
} from "@/lib/course-visibility";
import { validateTakenCourseGradePolicy } from "@/lib/grade-policy";
import {
  Course,
  GradeValue,
  StudentProfile,
  TakenCourseInput,
} from "@/lib/types";

const YEAR_TRACKS = ["2024", "2023"];
const PRIMARY_MAJORS = ["컴퓨터공학", "경영학"];
const GRADE_OPTIONS: GradeValue[] = [
  "A+", "A0", "B+", "B0", "C+", "C0", "D+", "D0", "F", "P",
];

type SelectedCourseState = Record<string, { checked: boolean; grade: "" | GradeValue }>;

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
    selections[course.courseId] = { checked: true, grade: course.grade ?? "" };
  }
  return selections;
}

function buildTakenCourses(selectedCourses: SelectedCourseState): TakenCourseInput[] {
  return Object.entries(selectedCourses)
    .filter(([, value]) => value.checked)
    .map(([courseId, value]) =>
      value.grade ? { courseId, grade: value.grade } : { courseId }
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
        checked ? "border-gray-900 bg-gray-50" : "border-gray-200 bg-white",
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
          <label htmlFor={checkboxId} className="cursor-pointer text-sm font-semibold text-gray-900">
            {course.name}
          </label>
          <p className="mt-1 text-xs text-gray-500">과목코드 {course.code}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {course.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
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
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">성적 선택</option>
          {gradeOptions.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        {checked && isFpCourse && <p className="mt-1 text-[11px] text-sky-700">P/F 과목</p>}
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

export function IntakeForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile>(() => createDefaultProfile());
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourseState>({});
  const [interestInput, setInterestInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleCourses = useMemo(() => getVisibleCoursesForProfile(profile), [profile]);
  const visibleCourseIds = useMemo(() => visibleCourses.map((course) => course.id), [visibleCourses]);
  const visibleCourseIdSet = useMemo(() => new Set(visibleCourseIds), [visibleCourseIds]);
  
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
    setError(null);
  }

  function toggleCourse(id: string) {
    setSelectedCourses((prev) => {
      const current = prev[id];
      if (current?.checked) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { checked: true, grade: current?.grade ?? "" } };
    });
  }

  function updateCourseGrade(id: string, grade: "" | GradeValue) {
    setSelectedCourses((prev) => ({
      ...prev,
      [id]: { checked: prev[id]?.checked ?? true, grade },
    }));
  }

  function resetForm() {
    setProfile(createDefaultProfile());
    setSelectedCourses({});
    setInterestInput("");
    setLoading(false);
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
    const gradePolicyError = validateTakenCourseGradePolicy(payload.takenCourses);
    if (gradePolicyError) {
      setError(gradePolicyError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      sessionStorage.setItem("majormap_intake_payload", JSON.stringify(payload));
      router.push("/recommend/result");
    } catch (caughtError) {
      setError("페이지 이동 중 오류가 발생했습니다.");
      setLoading(false);
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

  return (
    <div className="mx-auto max-w-3xl space-y-8 mt-6">
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

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">학번 트랙</label>
            <select
              value={profile.studentYearTrack}
              onChange={(e) => setProfile((p) => ({ ...p, studentYearTrack: e.target.value }))}
              className="w-full rounded border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {YEAR_TRACKS.map((y) => <option key={y} value={y}>{y}학번</option>)}
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
                  secondaryMajor: p.secondaryMajor === nextPrimaryMajor ? undefined : p.secondaryMajor,
                }));
              }}
              className="w-full rounded border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {PRIMARY_MAJORS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">복수전공</label>
            <select
              value={profile.secondaryMajor ?? "없음"}
              onChange={(e) => setProfile((p) => ({
                ...p,
                secondaryMajor: e.target.value === "없음" ? undefined : e.target.value,
              }))}
              className="w-full rounded border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {secondaryMajorOptions.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            수강한 과목 선택 <span className="font-normal text-gray-400">({selectedCourseCount}개 선택됨)</span>
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

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            관심 키워드 <span className="font-normal text-gray-400">(쉼표로 구분)</span>
          </label>
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            placeholder="예: product, data, backend"
            className="w-full rounded border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 sm:min-w-40 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? "결과 확인 준비 중..." : "추천 받기"}
          </button>
        </div>
      </form>
    </div>
  );
}
