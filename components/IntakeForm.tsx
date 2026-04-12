'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    <article
      className={[
        "rounded-[20px] border p-3 transition-colors",
        checked
          ? "border-indigo-200 bg-indigo-50/60"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_80px] md:items-start md:gap-3">
        <label
          htmlFor={checkboxId}
          className="flex min-h-10 min-w-0 cursor-pointer items-start gap-2.5"
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-900 sm:text-sm">{course.name}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
              과목코드 {course.code}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {course.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex min-h-6 items-center whitespace-nowrap rounded-full bg-white px-2 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200"
                >
                  {skillTagLabels[tag] ?? tag}
                </span>
              ))}
            </div>
          </div>
        </label>

        <div className="w-full md:w-[80px] md:shrink-0">
          <label htmlFor={gradeSelectId} className="sr-only">
            {course.name} 성적 선택
          </label>
          <select
            id={gradeSelectId}
            aria-label={`${course.name} 성적 선택`}
            value={grade}
            onChange={(e) => onGradeChange(e.target.value as "" | GradeValue)}
            disabled={!checked}
            className="min-h-8 w-full rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-700 transition-colors focus:border-indigo-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">성적 선택</option>
            {gradeOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          {checked && isFpCourse && (
            <p className="mt-2 text-[11px] font-medium text-sky-700">P/F 과목</p>
          )}
        </div>
      </div>
    </article>
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

function FieldWrapper({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {hint ? <span className="ml-1 text-slate-400">{hint}</span> : null}
      </label>
      {children}
    </div>
  );
}

export function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<StudentProfile>(() => createDefaultProfile());
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourseState>({});
  const [interestInput, setInterestInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handledDemoParamRef = useRef<string | null>(searchParams.get("demo"));
  const submitSectionRef = useRef<HTMLDivElement | null>(null);
  const demoParam = searchParams.get("demo");

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

  function applyDemoProfile(idx: number) {
    const selectedDemoProfile = demoProfiles[idx];
    setProfile({
      ...selectedDemoProfile.profile,
      secondaryMajor: normalizeSecondaryMajor(selectedDemoProfile.profile.secondaryMajor),
    });
    setSelectedCourses(buildSelectedCourseState(selectedDemoProfile.profile));
    setInterestInput(selectedDemoProfile.profile.interestKeywords.join(", "));
    setLoading(false);
    setError(null);

    window.setTimeout(() => {
      submitSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 120);
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
    } catch {
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

  useEffect(() => {
    if (handledDemoParamRef.current === demoParam) {
      return;
    }

    handledDemoParamRef.current = demoParam;

    if (demoParam === null) {
      resetForm();
      return;
    }

    const demoIndex = Number(demoParam);
    if (!Number.isInteger(demoIndex) || demoIndex < 0 || demoIndex >= demoProfiles.length) {
      return;
    }

    applyDemoProfile(demoIndex);
  }, [demoParam]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white/92 p-4 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.42)] backdrop-blur sm:p-5"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
        <section className="rounded-[22px] bg-slate-50 p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-400">Step 1</p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">기본 정보</h3>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex min-h-9 items-center justify-center rounded-xl bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.75)] transition-colors hover:bg-indigo-500"
            >
              초기화
            </button>
          </div>

          <div className="mb-4 rounded-[18px] border border-slate-200 bg-white p-3.5">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-400">Demo Profile</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">데모 프로필로 빠르게 입력하기</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {demoProfiles.map((demoProfile, idx) => (
                <button
                  key={demoProfile.label}
                  type="button"
                  onClick={() => applyDemoProfile(idx)}
                  className="inline-flex min-h-9 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  {demoProfile.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <FieldWrapper label="학번 트랙">
              <select
                value={profile.studentYearTrack}
                onChange={(e) => setProfile((p) => ({ ...p, studentYearTrack: e.target.value }))}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 focus:border-indigo-300 focus:outline-none"
              >
                {YEAR_TRACKS.map((y) => (
                  <option key={y} value={y}>
                    {y}학번
                  </option>
                ))}
              </select>
            </FieldWrapper>

            <FieldWrapper label="주전공">
              <select
                value={profile.primaryMajor}
                onChange={(e) => {
                  const nextPrimaryMajor = e.target.value;
                  setProfile((p) => ({
                    ...p,
                    primaryMajor: nextPrimaryMajor,
                    secondaryMajor:
                      p.secondaryMajor === nextPrimaryMajor ? undefined : p.secondaryMajor,
                  }));
                }}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 focus:border-indigo-300 focus:outline-none"
              >
                {PRIMARY_MAJORS.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </FieldWrapper>

            <FieldWrapper label="복수전공 / 부전공 / 심화전공">
              <select
                value={profile.secondaryMajor ?? "없음"}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    secondaryMajor: e.target.value === "없음" ? undefined : e.target.value,
                  }))
                }
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 focus:border-indigo-300 focus:outline-none"
              >
                {secondaryMajorOptions.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </FieldWrapper>
          </div>
        </section>

        <section className="rounded-[22px] bg-slate-50 p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold tracking-wide text-slate-400">Step 2</p>
            <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">관심 분야</h3>
          </div>

          <FieldWrapper label="관심 키워드" hint="쉼표로 구분">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="예: backend, server, data, product"
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none"
            />
          </FieldWrapper>

          <div className="mt-3 flex flex-wrap gap-2">
            {["backend", "server", "data", "product", "AI", "analytics"].map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() =>
                  setInterestInput((prev) => {
                    const next = prev
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean);
                    if (next.includes(keyword)) return prev;
                    return [...next, keyword].join(", ");
                  })
                }
                className="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                {keyword}
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[22px] bg-slate-50 p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-400">Step 3</p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">성적 입력</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                수강한 과목을 선택하고 해당 과목의 성적을 입력해 주세요.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex min-h-9 items-center rounded-full bg-white px-3.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 sm:text-sm">
                노출 과목 {visibleCourses.length}개
              </span>
              <span className="inline-flex min-h-9 items-center rounded-full bg-indigo-50 px-3.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100 sm:text-sm">
                선택 {selectedCourseCount}개
              </span>
            </div>
          </div>

          {visibleCourses.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-slate-300 bg-white px-4 py-5 text-sm leading-6 text-slate-500">
              선택한 학번 또는 전공 기준으로 표시할 과목이 없습니다.
            </div>
          ) : (
            <div className="grid max-h-[25rem] gap-2.5 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
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
      </section>

        {error ? (
          <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <div
          ref={submitSectionRef}
          className="flex flex-col gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">입력 요약</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {selectedCourseCount}개 과목과 {interestInput.split(",").map((item) => item.trim()).filter(Boolean).length}개 관심 키워드가 추천에 반영됩니다.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.75)] transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                결과 준비 중...
              </>
            ) : (
              "추천 결과 보기"
            )}
          </button>
        </div>
    </form>
  );
}
