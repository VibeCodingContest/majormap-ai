'use client';

import { courseMap } from "@/lib/sample-data";
import { PlanResult } from "@/lib/types";

type Props = {
  result: PlanResult;
};

export function SemesterPlanPanel({ result }: Props) {
  return (
    <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-gray-900">
          {result.selectedCareer.careerName} 기준 학기별 계획
        </h3>
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

      <div className="grid gap-4 lg:grid-cols-2">
        {result.semesters.map((semester) => (
          <div key={semester.termLabel} className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h4 className="text-base font-bold text-gray-900">
                  {semester.termLabel}
                </h4>
                <span className="text-sm font-semibold text-gray-500">
                  {semester.totalCredits}/{semester.targetCredits}학점
                </span>
              </div>

              {semester.courses.length > 0 ? (
                <div className="overflow-hidden rounded-2xl bg-white divide-y divide-slate-100">
                  {semester.courses.map((course) => (
                    <div
                      key={course.courseId}
                      className={
                        course.isRetake
                          ? "border-l-4 border-blue-500 bg-blue-50/60 px-4 py-4"
                          : "px-4 py-4"
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{course.name}</p>
                          {course.isRetake && (
                            <div className="mt-2">
                              <span className="inline-flex h-6 items-center rounded-full bg-blue-600 px-2.5 text-[11px] font-semibold text-white">
                                재수강
                              </span>
                            </div>
                          )}
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
                <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3">
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
                className="rounded-xl bg-amber-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-gray-800">
                  {courseMap[course.courseId]?.name ?? course.courseId}
                </p>
                <p className="mt-1 text-xs break-keep text-gray-600">{course.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
