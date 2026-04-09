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
  PlanApiResponse,
  PlanOptions,
  PlanResult,
  RecommendApiResponse,
  StudentProfile,
} from "@/lib/types";
import { PlanSetupPanel } from "./PlanSetupPanel";
import { ResultCard } from "./ResultCard";
import { SemesterPlanPanel } from "./SemesterPlanPanel";

const YEAR_TRACKS = ["2024", "2023"];
const PRIMARY_MAJORS = ["컴퓨터공학", "경영학"];
const SECONDARY_MAJORS = ["없음", "컴퓨터공학", "경영학"];

const defaultProfile: StudentProfile = {
  studentYearTrack: "2024",
  primaryMajor: "컴퓨터공학",
  secondaryMajor: undefined,
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

  function buildCurrentProfile(): StudentProfile {
    return {
      ...profile,
      secondaryMajor:
        profile.secondaryMajor === "없음" ? undefined : profile.secondaryMajor,
      interestKeywords: interestInput
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };
  }

  function applyDemoProfile(idx: number) {
    const dp = demoProfiles[idx];
    setProfile(dp.profile);
    setInterestInput(dp.profile.interestKeywords.join(", "));
    setResults([]);
    setError(null);
    setHasSubmitted(false);
    setSelectedCareer(null);
    setPlanResult(null);
    setPlanError(null);
  }

  function toggleCourse(id: string) {
    setProfile((prev) => ({
      ...prev,
      takenCourseIds: prev.takenCourseIds.includes(id)
        ? prev.takenCourseIds.filter((c) => c !== id)
        : [...prev.takenCourseIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (profile.takenCourseIds.length === 0) {
      setError("수강한 과목을 하나 이상 선택해주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload = buildCurrentProfile();
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
        <div className="flex flex-wrap gap-3">
          {demoProfiles.map((dp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyDemoProfile(idx)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              {dp.label}
            </button>
          ))}
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
                  takenCourseIds: [],
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
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  primaryMajor: e.target.value,
                  takenCourseIds: [],
                }))
              }
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
              {SECONDARY_MAJORS.map((m) => (
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
              ({profile.takenCourseIds.length}개 선택됨)
            </span>
          </label>
          {visibleCourses.length === 0 ? (
            <p className="text-sm text-gray-400">선택한 학번/전공에 해당하는 과목이 없습니다.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleCourses.map((course) => (
                <label
                  key={course.id}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={profile.takenCourseIds.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                    className="mt-0.5 h-4 w-4 accent-black"
                  />
                  <div>
                    <span className="text-sm font-medium">{course.name}</span>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      과목코드 {course.code}
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500"
                        >
                          {skillTagLabels[tag] ?? tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </label>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "추천 분석 중..." : "진로 추천 받기"}
        </button>
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
