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
        setExplainError(
          "explain 결과를 해석하지 못했습니다. 추천 결과만으로도 계획을 계속 진행할 수 있습니다."
        );
        setShowPanel(false);
        return;
      }

      setExplainData(data);
      setShowPanel(true);
    } catch {
      setExplainError(
        "AI 해설을 불러오는 데 실패했습니다. 추천 결과와 학기 계획은 계속 사용할 수 있습니다."
      );
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
    fitScore >= 70
      ? "text-emerald-600"
      : fitScore >= 45
      ? "text-amber-600"
      : "text-rose-500";
  const confidenceLevel = result.confidenceLevel;
  const confidenceBadgeText =
    confidenceLevel === "high"
      ? "근거 높음"
      : confidenceLevel === "medium"
      ? "근거 보통"
      : "근거 낮음";
  const confidenceColor =
    confidenceLevel === "high"
      ? "bg-emerald-100 text-emerald-700"
      : confidenceLevel === "medium"
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";

  const detailSectionLabel =
    missingTagNames.length > 0
      ? "부족 역량"
      : confidenceHighlights.length > 0
      ? "근거 보강 포인트"
      : "추가 확인 포인트";
  const detailSectionItems =
    missingTagNames.length > 0 ? missingTagNames : confidenceHighlights;
  const detailSectionClassName =
    missingTagNames.length > 0
      ? "bg-rose-100 text-rose-600"
      : "bg-amber-100 text-amber-700";

  const priorityBadgeMap = {
    high: { label: "우선", className: "bg-indigo-600 text-white" },
    medium: { label: "권장", className: "bg-blue-100 text-blue-700" },
    low: { label: "참고", className: "bg-gray-100 text-gray-600" },
  } as const;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">

      {/* 1. 진로명 + 점수 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900">{result.careerName}</h2>
          <p className="mt-1 text-sm text-gray-500">{result.summary}</p>
        </div>

        <div className="w-full shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:w-[188px]">
          <div>
            <p className="text-xs font-medium text-gray-500">
              {result.scoreExplanation?.fitLabel ?? "탐색 적합도"}
            </p>
            <div className="mt-0.5 flex items-end gap-1">
              <span className={`text-3xl font-extrabold ${fitScoreColor}`}>
                {fitScore}
              </span>
              <span className="pb-1 text-xs text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="mt-2 border-t border-slate-200 pt-2">
            <p className="text-xs font-medium text-gray-500">
              {result.scoreExplanation?.confidenceLabel ?? "추천 확신도"}
            </p>
            <div className="mt-0.5 flex items-end gap-1">
              <span className="text-xl font-bold text-gray-900">{confidenceScore}</span>
              <span className="pb-0.5 text-xs text-gray-400">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* collapsed 모드: 계획 단계에서 카드 본문 숨김 */}
      {!collapsed && (
        <>
          {/* 2. 추천 이유 */}
          {result.reasons.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-bold text-gray-800">추천 이유</p>
              <ul className="space-y-1.5">
                {result.reasons.map((reason, index) => (
                  <li
                    key={`${reason}-${index}`}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="mt-0.5 font-bold text-indigo-400">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. 보완 과목 */}
          <div className="mt-5">
            <p className="mb-2 text-sm font-bold text-gray-800">보완 과목</p>
            {mergedSupplementalCourseNames.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {mergedSupplementalCourseNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-medium text-emerald-600">핵심 과목 대부분 이수</p>
            )}
          </div>

          {/* 4. 주의 및 보완 액션 */}
          {(result.lowGradeWarnings.length > 0 || result.retakeRecommendations.length > 0) && (
            <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
              <p className="text-sm font-bold text-orange-900">주의 및 보완 액션</p>
              <div className="mt-2 space-y-1.5">
                {mergeCautionAndRetakeMessages(
                  result.lowGradeWarnings,
                  result.retakeRecommendations
                ).map((paragraph, index) => (
                  <p
                    key={`${paragraph.slice(0, 48)}-${index}`}
                    className="text-sm leading-relaxed text-orange-900"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 5. 보유 역량 / 부족 역량 */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-sm font-bold text-gray-800">보유 역량</p>
              <div className="flex flex-wrap gap-1">
                {matchedTagNames.length > 0 ? (
                  matchedTagNames.map((name) => (
                    <span
                      key={name}
                      className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                    >
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">없음</span>
                )}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-sm font-bold text-gray-800">{detailSectionLabel}</p>
              <div className="flex flex-wrap gap-1">
                {detailSectionItems.length > 0 ? (
                  detailSectionItems.map((name) => (
                    <span
                      key={name}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${detailSectionClassName}`}
                    >
                      {name}
                    </span>
                  ))
                ) : missingTagNames.length > 0 ? (
                  <span className="text-xs font-medium text-emerald-600">필수 역량 충족</span>
                ) : (
                  <span className="text-xs font-medium text-emerald-600">
                    현재 기준 추가 보강 포인트 없음
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 6. 추천 자격증 */}
          {result.recommendedCertifications.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-bold text-gray-800">추천 자격증</p>
              <div className="space-y-2">
                {result.recommendedCertifications.map((certification) => (
                  <div
                    key={certification.name}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {certification.name}
                      </p>
                      {certification.priority && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            priorityBadgeMap[certification.priority].className
                          }`}
                        >
                          {priorityBadgeMap[certification.priority].label}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{certification.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 7. 버튼 + 재수강 반영 과목 선택 */}
      <div className="mt-5 border-t pt-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onPlanSelect(result)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isPlanSelected
                ? "bg-indigo-600 text-white"
                : "border border-indigo-300 bg-white text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            {isPlanSelected ? "계획 닫기" : "이 진로로 계획 짜기"}
          </button>
          <button
            onClick={handleExplain}
            disabled={explainLoading}
            className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
          >
            {explainLoading
              ? "AI 분석 중..."
              : showPanel
              ? "AI 해설 접기"
              : "AI 해설 보기"}
          </button>
        </div>

        {result.retakeCourseIds.length > 0 && (
          <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-3">
            <p className="text-xs font-semibold text-sky-800">재수강 반영 과목 선택</p>
            <p className="mt-1 text-xs text-sky-700">
              선택한 과목만 다음 학기 계획에 우선 반영됩니다.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.retakeCourseIds.map((courseId) => {
                const checked = selectedRetakeCourseIds.includes(courseId);
                const courseName = courseMap[courseId]?.name ?? courseId;

                return (
                  <label
                    key={courseId}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-sky-300 bg-white px-2.5 py-1.5 text-xs text-sky-900"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        onRetakeCourseToggle(courseId, event.target.checked)
                      }
                      className="h-3.5 w-3.5 accent-sky-600"
                    />
                    {courseName}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {explainError && (
          <p className="mt-2 text-xs text-red-500">{explainError}</p>
        )}
      </div>

      {/* 8. AI 해설 패널 */}
      {showPanel && explainData && (
        <RoadmapPanel data={explainData} onClose={() => setShowPanel(false)} />
      )}

      {children}
    </div>
  );
}
