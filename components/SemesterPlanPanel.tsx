'use client';

import { courseMap } from "@/lib/sample-data";
import { PlanResult } from "@/lib/types";

type Props = {
  result: PlanResult;
};

export function SemesterPlanPanel({ result }: Props) {
  const retakeUnavailableNotes = Array.from(
    new Set(
      result.semesters.flatMap((semester) => semester.retakeUnavailableNotes ?? [])
    )
  );

  return (
    <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
          2단계 수강 계획 결과
        </p>
        <h3 className="mt-1 text-lg font-bold text-gray-900">
          {result.selectedCareer.careerName} 기준 학기별 계획
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {result.selectedCareer.summary}
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">
          아직 이수하지 않은 핵심 과목
        </p>
        <div className="flex flex-wrap gap-2">
          {result.coreMissingCourseIds.length > 0 ? (
            result.coreMissingCourseIds.map((courseId) => (
              <span
                key={courseId}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
              >
                {courseMap[courseId]?.name ?? courseId}
              </span>
            ))
          ) : (
            <span className="text-sm text-green-600">핵심 과목을 모두 이수했습니다.</span>
          )}
        </div>
      </div>

      {result.retakeRecommendations.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-900">
            재수강/보완 학습 우선
          </p>
          <ul className="mt-2 space-y-1">
            {result.retakeRecommendations.map((note) => (
              <li key={note} className="text-xs text-amber-800">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {retakeUnavailableNotes.length > 0 && (
        <aside className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-xs leading-5 text-gray-500">
          <p className="font-semibold text-gray-400">재수강 미반영 안내</p>
          <ul className="mt-1 space-y-1">
            {retakeUnavailableNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </aside>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {result.semesters.map((semester) => (
          <div key={semester.termLabel} className="space-y-3">
            <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h4 className="text-base font-bold text-gray-900">
                  {semester.termLabel}
                </h4>
                <span className="text-sm font-semibold text-gray-500">
                  {semester.totalCredits}/{semester.targetCredits}학점
                </span>
              </div>

              {semester.courses.length > 0 ? (
                <div className="space-y-3">
                  {semester.courses.map((course) => (
                    <div
                      key={course.courseId}
                      className={
                        course.isRetake
                          ? "rounded-lg border-2 border-blue-500 bg-blue-50 p-3"
                          : "rounded-lg border bg-white p-3"
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">{course.name}</p>
                            {course.isRetake && (
                              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                                재수강
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-gray-400">
                            과목코드 {courseMap[course.courseId]?.code ?? course.courseId}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {course.reason}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-gray-500">
                          {course.credits}학점
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-600">{course.whyNow}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  현재 조건에서 이 학기에 바로 배치할 수 있는 과목이 없습니다.
                </p>
              )}

              {semester.creditGapGuidance && (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                  <p className="text-sm font-semibold text-blue-900">
                    남은 학점 {semester.creditGapGuidance.remainingCredits}학점
                  </p>
                  <p className="mt-1 text-xs text-blue-800">
                    {semester.creditGapGuidance.message}
                  </p>
                  {semester.creditGapGuidance.suggestedCourseIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {semester.creditGapGuidance.suggestedCourseIds.map((courseId) => (
                        <span
                          key={courseId}
                          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {courseMap[courseId]?.name ?? courseId}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {result.deferredCourses.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">이월된 과목</p>
          <div className="space-y-2">
            {result.deferredCourses.map((course) => (
              <div
                key={course.courseId}
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-gray-800">
                  {courseMap[course.courseId]?.name ?? course.courseId}
                </p>
                <p className="mt-1 text-xs text-gray-600">{course.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
