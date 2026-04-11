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
  selectedRetakeCourseIds: string[];
  onRetakeCourseToggle: (courseId: string, checked: boolean) => void;
  children?: ReactNode;
};

/** 경고와 동일 과목의 재수강 권장을 한 문단으로 합친다(표시 전용, API·로직 불변). */
function mergeCautionAndRetakeMessages(
  warnings: string[],
  retakes: string[]
): string[] {
  const retakeConsumed = new Set<number>();
  const paragraphs: string[] = [];

  function courseNameFromWarning(w: string): string | null {
    const m = w.match(/인 (.+?)의 성적이/);
    return m?.[1]?.trim() ?? null;
  }

  function findRetakeIndex(courseName: string): number {
    return retakes.findIndex(
      (r, i) =>
        !retakeConsumed.has(i) &&
        (r.startsWith(`${courseName}은(는)`) ||
          r.startsWith(`${courseName}은`) ||
          r.startsWith(`${courseName}는`) ||
          r.startsWith(courseName))
    );
  }

  for (const w of warnings) {
    const cn = courseNameFromWarning(w);
    const ri = cn != null ? findRetakeIndex(cn) : -1;
    if (ri >= 0) {
      retakeConsumed.add(ri);
      const trimmed = w.trim().replace(/\.\s*$/, "");
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
      paragraphs.push(w);
    }
  }

  for (let i = 0; i < retakes.length; i++) {
    if (!retakeConsumed.has(i)) {
      paragraphs.push(retakes[i]);
    }
  }

  return paragraphs;
}

function isExplainResponse(value: ExplainApiResponse): value is ExplainResponse {
  return (
    !("error" in value) &&
    Array.isArray(value.evidence) &&
    Array.isArray(value.roadmap) &&
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
  selectedRetakeCourseIds,
  onRetakeCourseToggle,
  children,
}: Props) {
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  async function handleExplain() {
    if (explainData) {
      setShowPanel((value) => !value);
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
        setExplainError("explain 결과를 해석하지 못했습니다.");
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
    
  const matchedTagNames = result.strengthHighlights.length > 0
      ? result.strengthHighlights
      : result.matchedTags.map((tag) => skillTagLabels[tag] ?? tag);
  const missingTagNames = result.gapHighlights.length > 0
      ? result.gapHighlights
      : result.missingTags.map((tag) => skillTagLabels[tag] ?? tag);
  const confidenceHighlights = result.confidenceHighlights ?? [];

  const fitScoreColor = fitScore >= 70 ? "text-emerald-600" : fitScore >= 45 ? "text-amber-600" : "text-rose-500";
  const detailSectionLabel = missingTagNames.length > 0 ? "부족 역량" : confidenceHighlights.length > 0 ? "근거 보강" : "추가 확인";
  const detailSectionItems = missingTagNames.length > 0 ? missingTagNames : confidenceHighlights;
  
  const priorityBadgeMap = {
    high: { label: "우선", className: "bg-indigo-600 text-white" },
    medium: { label: "권장", className: "bg-blue-100 text-blue-700" },
    low: { label: "참고", className: "bg-gray-100 text-gray-600" },
  } as const;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">

      {/* 1. 진로명 + 점수 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="min-w-0 flex-1 border-l-4 border-indigo-500 pl-4 py-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{result.careerName}</h2>
          <p className="mt-2 text-sm text-gray-600 font-medium leading-relaxed">{result.summary}</p>
        </div>

        <div className="shrink-0 flex sm:flex-col gap-4 sm:gap-2">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 sm:w-[130px] flex-1 sm:flex-none text-center sm:text-right">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {result.scoreExplanation?.fitLabel ?? "적합도"}
            </p>
            <div className="flex items-baseline justify-center sm:justify-end gap-1">
              <span className={`text-2xl font-extrabold ${fitScoreColor}`}>{fitScore}</span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 sm:w-[130px] flex-1 sm:flex-none text-center sm:text-right">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {result.scoreExplanation?.confidenceLabel ?? "확신도"}
            </p>
            <div className="flex items-baseline justify-center sm:justify-end gap-1">
              <span className="text-xl font-bold text-gray-800">{confidenceScore}</span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 실질적인 카드 컨텐츠 영역 */}
      {!collapsed && (
        <div className="flex-1 flex flex-col gap-6">
          {/* 이유 및 설명 */}
          {result.reasons.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">추천 이유</p>
              <ul className="space-y-2">
                {result.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-indigo-500 flex-shrink-0 mt-0.5 font-black">✓</span>
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 태그 영역 (2단) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">보유 역량</p>
              <div className="flex flex-wrap gap-1.5">
                {matchedTagNames.length > 0 ? (
                  matchedTagNames.map((name) => (
                    <span key={name} className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 italic">없음</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-3">{detailSectionLabel}</p>
              <div className="flex flex-wrap gap-1.5">
                {detailSectionItems.length > 0 ? (
                  detailSectionItems.map((name) => (
                    <span key={name} className="rounded-full bg-rose-100 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-800 shadow-sm">
                      {name}
                    </span>
                  ))
                ) : missingTagNames.length > 0 ? (
                  <span className="text-sm font-medium text-emerald-600">필수 역량 충족 완료</span>
                ) : (
                  <span className="text-sm font-medium text-slate-500">추가 보강 불필요</span>
                )}
              </div>
            </div>
          </div>

          {/* 추천 과목 */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">추천 보완 과목</p>
            {mergedSupplementalCourseNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {mergedSupplementalCourseNames.map((name) => (
                  <div key={name} className="flex border border-indigo-100 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-indigo-50 px-2.5 py-1.5 flex items-center justify-center border-r border-indigo-100">
                      <svg className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path></svg>
                    </div>
                    <div className="bg-white px-3 py-1.5 flex items-center">
                      <span className="text-sm font-semibold text-slate-700">{name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                <span className="text-sm font-semibold text-emerald-600">현재 핵심 과목을 대부분 이수했습니다! ✨</span>
              </div>
            )}
          </div>

          {/* 주의 액션 */}
          {(result.lowGradeWarnings.length > 0 || result.retakeRecommendations.length > 0) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                주의 및 보완 액션
              </p>
              <div className="space-y-2">
                {mergeCautionAndRetakeMessages(result.lowGradeWarnings, result.retakeRecommendations).map((paragraph, index) => (
                  <p key={index} className="text-sm text-amber-900 leading-relaxed font-medium">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 자격증 */}
          {result.recommendedCertifications.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">추천 자격증</p>
              <div className="grid gap-2">
                {result.recommendedCertifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start sm:gap-6"
                  >
                    <div className="flex min-w-0 flex-col items-start gap-2">
                      <span className="text-sm font-bold leading-snug text-slate-800 break-keep">
                        {cert.name}
                      </span>
                      {cert.priority && (
                        <span
                          className={`inline-flex h-7 w-12 shrink-0 items-center justify-center rounded-md text-[11px] font-black leading-none ${priorityBadgeMap[cert.priority].className}`}
                        >
                          {priorityBadgeMap[cert.priority].label}
                        </span>
                      )}
                    </div>
                    <span className="text-xs leading-relaxed text-slate-500 sm:pt-0.5">
                      {cert.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className={`mt-6 pt-5 flex flex-wrap gap-2 ${collapsed ? "border-none pt-0 mt-0" : "border-t border-slate-100"}`}>
        <button
          type="button"
          onClick={() => onPlanSelect(result)}
          className={`flex-1 sm:flex-none rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-sm ${
            isPlanSelected
              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
              : "bg-white border text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
          }`}
        >
          {isPlanSelected ? "계획 닫기" : "수강 계획 만들기"}
        </button>
        <button
          onClick={handleExplain}
          disabled={explainLoading}
          className="flex-1 sm:flex-none rounded-xl px-5 py-2.5 text-sm font-bold bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {explainLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              분석 중...
            </>
          ) : showPanel ? (
            "AI 해설 접기"
          ) : (
            "AI 해설 보기"
          )}
        </button>

        {result.retakeCourseIds.length > 0 && !collapsed && (
          <div className="w-full mt-3 p-3 rounded-xl border border-sky-100 bg-sky-50/50">
            <p className="text-xs font-bold text-sky-800 mb-2">재수강 반영 우선 과목 선택</p>
            <div className="flex flex-wrap gap-2">
              {result.retakeCourseIds.map((courseId) => {
                const checked = selectedRetakeCourseIds.includes(courseId);
                const courseName = courseMap[courseId]?.name ?? courseId;
                return (
                  <label key={courseId} className="group relative flex cursor-pointer items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-1.5 shadow-sm hover:border-sky-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => onRetakeCourseToggle(courseId, e.target.checked)}
                      className="peer h-4 w-4 accent-sky-500 rounded border-sky-300"
                    />
                    <span className="text-sm font-semibold text-sky-900 group-hover:text-sky-700">{courseName}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
        
        {explainError && <p className="w-full mt-2 text-sm text-red-500 font-medium text-center">{explainError}</p>}
      </div>

      {showPanel && explainData && (
        <div className="mt-4">
          <RoadmapPanel data={explainData} onClose={() => setShowPanel(false)} />
        </div>
      )}

      {children}
    </div>
  );
}
