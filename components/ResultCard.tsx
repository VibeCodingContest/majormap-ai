'use client';

import { ReactNode, useState } from "react";
import { courseMap, skillTagLabels } from "@/lib/sample-data";
import {
  CareerRecommendation,
  ExplainApiResponse,
  ExplainResponse,
  StudentProfile,
} from "@/lib/types";
import { RoadmapPanel } from "./RoadmapPanel";

type Props = {
  result: CareerRecommendation;
  profile: StudentProfile;
  onPlanSelect: (result: CareerRecommendation) => void;
  isPlanSelected: boolean;
  collapsed?: boolean;
  children?: ReactNode;
};

function mergeCautionAndRetakeMessages(
  warnings: string[],
  retakes: string[]
): string[] {
  const retakeConsumed = new Set<number>();
  const paragraphs: string[] = [];

  function courseNameFromWarning(warning: string): string | null {
    const match = warning.match(/인 (.+?)의 성적이/);
    return match?.[1]?.trim() ?? null;
  }

  function findRetakeIndex(courseName: string): number {
    return retakes.findIndex(
      (retake, index) =>
        !retakeConsumed.has(index) &&
        (retake.startsWith(`${courseName}은(는)`) ||
          retake.startsWith(`${courseName}은`) ||
          retake.startsWith(`${courseName}는`) ||
          retake.startsWith(courseName))
    );
  }

  for (const warning of warnings) {
    const courseName = courseNameFromWarning(warning);
    const retakeIndex = courseName != null ? findRetakeIndex(courseName) : -1;
    if (retakeIndex >= 0) {
      retakeConsumed.add(retakeIndex);
      const trimmed = warning.trim().replace(/\.\s*$/, "");
      if (/불리하게 작용합니다$/.test(trimmed)) {
        paragraphs.push(
          trimmed.replace(
            /합니다$/,
            "하므로, 후속 학습의 기반 과목인 만큼 재수강 또는 보완 학습을 권장합니다."
          )
        );
      } else if (/주의가 필요합니다$/.test(trimmed)) {
        paragraphs.push(
          trimmed.replace(
            /주의가 필요합니다$/,
            "주의가 필요해, 후속 학습의 기반 과목인 만큼 재수강 또는 보완 학습을 권장합니다."
          )
        );
      } else {
        paragraphs.push(
          `${trimmed}. 후속 학습의 기반 과목인 만큼 재수강 또는 보완 학습을 권장합니다.`
        );
      }
    } else {
      paragraphs.push(warning);
    }
  }

  for (let index = 0; index < retakes.length; index++) {
    if (!retakeConsumed.has(index)) {
      paragraphs.push(retakes[index]);
    }
  }

  return paragraphs;
}

function isExplainResponse(value: ExplainApiResponse): value is ExplainResponse {
  return (
    !("error" in value) &&
    Array.isArray(value.evidence) &&
    Array.isArray(value.roadmap) &&
    Array.isArray(value.recommendedCertifications) &&
    typeof value.headline === "string" &&
    typeof value.fitSummary === "string" &&
    typeof value.caution === "string"
  );
}

export function ResultCard({
  result,
  profile,
  onPlanSelect,
  isPlanSelected,
  collapsed = false,
  children,
}: Props) {
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  async function handleExplain() {
    if (explainData) {
      setShowPanel((current) => !current);
      return;
    }

    setExplainLoading(true);
    setExplainError(null);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendation: result, profile }),
      });

      if (!response.ok) {
        setExplainError("AI 해설을 불러오는 데 실패했습니다.");
        setShowPanel(false);
        return;
      }

      const data = (await response.json()) as ExplainApiResponse;

      if (!isExplainResponse(data)) {
        setExplainError("AI 해설 결과를 해석하지 못했습니다.");
        setShowPanel(false);
        return;
      }

      setExplainData(data);
      setShowPanel(true);
    } catch {
      setExplainError("AI 해설을 불러오는 데 실패했습니다.");
    } finally {
      setExplainLoading(false);
    }
  }

  const fitScore = result.fitScore ?? result.score;
  const confidenceScore = result.confidenceScore;
  const mergedSupplementalCourseIds: string[] = [];
  const supplementalIdSeen = new Set<string>();

  for (const id of result.recommendedCourseIds) {
    if (!supplementalIdSeen.has(id)) {
      supplementalIdSeen.add(id);
      mergedSupplementalCourseIds.push(id);
    }
  }

  for (const id of result.coreMissingCourseIds) {
    if (!supplementalIdSeen.has(id)) {
      supplementalIdSeen.add(id);
      mergedSupplementalCourseIds.push(id);
    }
  }

  const mergedSupplementalCourseNames = mergedSupplementalCourseIds
    .map((id) => courseMap[id]?.name ?? id)
    .filter(Boolean);

  const matchedTagNames =
    result.strengthHighlights.length > 0
      ? result.strengthHighlights
      : result.matchedTags.map((tag) => skillTagLabels[tag] ?? tag);
  const missingTagNames =
    result.gapHighlights.length > 0
      ? result.gapHighlights
      : result.missingTags.map((tag) => skillTagLabels[tag] ?? tag);
  const confidenceHighlights = result.confidenceHighlights ?? [];

  const fitScoreColor =
    fitScore >= 70 ? "text-emerald-600" : fitScore >= 45 ? "text-amber-600" : "text-rose-500";
  const detailSectionLabel =
    missingTagNames.length > 0
      ? "부족 역량"
      : confidenceHighlights.length > 0
        ? "근거 보강"
        : "추가 확인";
  const detailSectionItems =
    missingTagNames.length > 0 ? missingTagNames : confidenceHighlights;

  const priorityBadgeMap = {
    high: { label: "우선", className: "bg-indigo-600 text-white" },
    medium: { label: "권장", className: "bg-sky-100 text-sky-700" },
    low: { label: "참고", className: "bg-slate-100 text-slate-600" },
  } as const;

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] sm:p-5">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <span className="inline-flex min-h-8 items-center rounded-full bg-indigo-50 px-3 text-[11px] font-semibold tracking-wide text-indigo-700">
            추천 진로
          </span>
          <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
            {result.careerName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{result.summary}</p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 sm:w-[170px] sm:grid-cols-1">
          <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-left sm:text-right">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {result.scoreExplanation?.fitLabel ?? "적합도"}
            </p>
            <div className="flex items-baseline justify-start gap-1 sm:justify-end">
              <span className={`text-2xl font-black ${fitScoreColor}`}>{fitScore}</span>
              <span className="text-sm text-slate-400">/100</span>
            </div>
          </div>

          <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-left sm:text-right">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {result.scoreExplanation?.confidenceLabel ?? "확신도"}
            </p>
            <div className="flex items-baseline justify-start gap-1 sm:justify-end">
              <span className="text-xl font-black text-slate-900">{confidenceScore}</span>
              <span className="text-sm text-slate-400">/100</span>
            </div>
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className="flex flex-1 flex-col gap-6">
          {result.reasons.length > 0 && (
            <section className="rounded-[24px] bg-slate-50 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                추천 이유
              </p>
              <ul className="space-y-2.5">
                {result.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-3 text-[15px] text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-black text-indigo-700">
                      ✓
                    </span>
                    <span className="leading-7">{reason}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                보유 역량
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matchedTagNames.length > 0 ? (
                  matchedTagNames.map((name) => (
                    <span
                      key={name}
                      className="inline-flex min-h-9 items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-800"
                    >
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm italic text-slate-400">없음</span>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-rose-100 bg-rose-50/70 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-rose-700">
                {detailSectionLabel}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {detailSectionItems.length > 0 ? (
                  detailSectionItems.map((name) => (
                    <span
                      key={name}
                      className="inline-flex min-h-9 items-center rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-800"
                    >
                      {name}
                    </span>
                  ))
                ) : missingTagNames.length > 0 ? (
                  <span className="text-sm font-medium text-emerald-600">필수 역량 충족 완료</span>
                ) : (
                  <span className="text-sm font-medium text-slate-500">추가 보강 불필요</span>
                )}
              </div>
            </section>
          </div>

          <section>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              추천 과목
            </p>
            {mergedSupplementalCourseNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {mergedSupplementalCourseNames.map((name) => (
                  <div key={name} className="flex overflow-hidden rounded-2xl border border-indigo-100 bg-white">
                    <div className="flex min-h-10 items-center justify-center border-r border-indigo-100 bg-indigo-50 px-3">
                      <svg className="h-3.5 w-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                      </svg>
                    </div>
                    <div className="flex min-h-10 items-center px-4">
                      <span className="text-sm font-semibold text-slate-700">{name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-center">
                <span className="text-sm font-semibold text-emerald-600">
                  현재 핵심 과목을 대부분 이수했습니다
                </span>
              </div>
            )}
          </section>

          {(result.lowGradeWarnings.length > 0 || result.retakeRecommendations.length > 0) && (
            <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
                <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                주의 및 보완 액션
              </p>
              <div className="space-y-2">
                {mergeCautionAndRetakeMessages(
                  result.lowGradeWarnings,
                  result.retakeRecommendations
                ).map((paragraph, index) => (
                  <p key={index} className="text-[15px] font-medium leading-7 text-amber-900">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {result.recommendedCertifications.length > 0 && (
            <section>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                추천 자격증
              </p>
              <div className="grid gap-3">
                {result.recommendedCertifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="grid gap-3 rounded-[24px] border border-slate-200 bg-white p-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start sm:gap-6"
                  >
                    <div className="flex min-w-0 flex-col items-start gap-2">
                      <span className="text-sm font-bold leading-7 text-slate-800 break-keep">
                        {cert.name}
                      </span>
                      {cert.priority ? (
                        <span
                          className={`inline-flex min-h-7 min-w-12 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold ${priorityBadgeMap[cert.priority].className}`}
                        >
                          {priorityBadgeMap[cert.priority].label}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-sm leading-7 text-slate-500">{cert.reason}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <div className={`mt-4 flex flex-wrap gap-2.5 pt-4 ${collapsed ? "mt-0 border-none pt-0" : "border-t border-slate-100"}`}>
        <button
          type="button"
          onClick={() => onPlanSelect(result)}
          className={`inline-flex min-h-10 flex-1 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-all sm:flex-none ${
            isPlanSelected
              ? "bg-indigo-600 text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.75)] hover:bg-indigo-700"
              : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          }`}
        >
          {isPlanSelected ? "계획 닫기" : "수강 계획 만들기"}
        </button>

        <button
          type="button"
          onClick={handleExplain}
          disabled={explainLoading}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50 sm:flex-none"
        >
          {explainLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              분석 중...
            </>
          ) : showPanel ? (
            "AI 해설 접기"
          ) : (
            "AI 해설 보기"
          )}
        </button>

        {explainError ? (
          <p className="mt-2 w-full text-center text-sm font-medium text-red-500">{explainError}</p>
        ) : null}
      </div>

      {showPanel && explainData ? (
        <RoadmapPanel data={explainData} onClose={() => setShowPanel(false)} />
      ) : null}

      {children}
    </article>
  );
}
