'use client';

import { courseMap } from "@/lib/sample-data";
import { PlanResult } from "@/lib/types";

type Props = {
  result: PlanResult;
};

export function SemesterPlanPanel({ result }: Props) {
  return (
    <section className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] sm:p-5">
      <div>
        <h3 className="text-lg font-black tracking-tight text-slate-950">
          {result.selectedCareer.careerName} 기준 학기별 계획
        </h3>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          아직 이수하지 않은 핵심 과목
        </p>
        <div className="flex flex-wrap gap-2">
          {result.coreMissingCourseIds.length > 0 ? (
            result.coreMissingCourseIds.map((courseId) => (
              <span
                key={courseId}
                className="inline-flex min-h-8 items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
              >
                {courseMap[courseId]?.name ?? courseId}
              </span>
            ))
          ) : (
            <span className="text-sm font-medium text-emerald-600">핵심 과목을 모두 이수했습니다.</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {result.semesters.map((semester) => (
          <div key={semester.termLabel} className="space-y-3">
            <div className="rounded-[20px] bg-slate-50 p-3.5">
              <div className="mb-2.5 flex items-center justify-between gap-4">
                <h4 className="text-base font-black tracking-tight text-slate-950">
                  {semester.termLabel}
                </h4>
                <span className="text-xs font-semibold text-slate-500 sm:text-sm">
                  {semester.totalCredits}/{semester.targetCredits}학점
                </span>
              </div>

              {semester.courses.length > 0 ? (
                <div className="overflow-hidden rounded-[18px] bg-white ring-1 ring-slate-100">
                  {semester.courses.map((course) => (
                    <div
                      key={course.courseId}
                      className={
                        course.isRetake
                          ? "border-b border-slate-100 border-l-4 border-blue-500 bg-blue-50/50 px-3.5 py-3 last:border-b-0"
                          : "border-b border-slate-100 px-3.5 py-3 last:border-b-0"
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-slate-900">{course.name}</p>
                          {course.isRetake && (
                            <div className="mt-1.5">
                              <span className="inline-flex h-5 items-center rounded-full bg-blue-600 px-2.5 text-[10px] font-semibold text-white">
                                재수강
                              </span>
                            </div>
                          )}
                          <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                            과목코드 {courseMap[course.courseId]?.code ?? course.courseId}
                          </p>
                          <p className="mt-1.5 text-sm leading-6 text-slate-600">
                            {course.reason}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-slate-500 sm:text-sm">
                          {course.credits}학점
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{course.whyNow}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-[18px] bg-white px-3.5 py-4 text-sm leading-6 text-slate-500 ring-1 ring-slate-100">
                  현재 조건에서 이 학기에 바로 배치할 수 있는 과목이 없습니다.
                </p>
              )}

              {semester.creditGapGuidance && (
                <div className="mt-3 rounded-[18px] border border-blue-100 bg-blue-50 px-3.5 py-3.5">
                  <p className="text-sm font-semibold text-blue-900">
                    남은 학점 {semester.creditGapGuidance.remainingCredits}학점
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-blue-800">
                    {semester.creditGapGuidance.message}
                  </p>
                  {semester.creditGapGuidance.suggestedCourseIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {semester.creditGapGuidance.suggestedCourseIds.map((courseId) => (
                        <span
                          key={courseId}
                          className="inline-flex min-h-8 items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700"
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
          <p className="mb-2 text-sm font-semibold text-slate-700">이월된 과목</p>
          <div className="space-y-2">
            {result.deferredCourses.map((course) => (
              <div
                key={course.courseId}
                className="rounded-[18px] border border-amber-100 bg-amber-50 px-3.5 py-3"
              >
                <p className="text-sm font-semibold text-slate-800">
                  {courseMap[course.courseId]?.name ?? course.courseId}
                </p>
                <p className="mt-1.5 text-sm break-keep leading-6 text-slate-600">{course.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
