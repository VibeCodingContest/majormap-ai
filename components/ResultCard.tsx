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
  selectedRetakeCourseIds: string[];
  onRetakeCourseToggle: (courseId: string, checked: boolean) => void;
  children?: ReactNode;
};

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
      setShowPanel((v) => !v);
      return;
    }
    setExplainLoading(true);
    setExplainError(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendation: result, profile }),
      });

      if (!res.ok) {
        setExplainError("AI 해설을 불러오는 데 실패했습니다.");
        setShowPanel(false);
        return;
      }

      const data = (await res.json()) as ExplainApiResponse;

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

  const recommendedCourseNames = result.recommendedCourseIds
    .map((id) => courseMap[id]?.name ?? id)
    .filter(Boolean);
  const coreMissingCourseNames = result.coreMissingCourseIds
    .map((id) => courseMap[id]?.name ?? id)
    .filter(Boolean);

  const matchedTagNames = result.strengthHighlights.length > 0
    ? result.strengthHighlights
    : result.matchedTags.map((t) => skillTagLabels[t] ?? t);
  const missingTagNames = result.gapHighlights.length > 0
    ? result.gapHighlights
    : result.missingTags.map((t) => skillTagLabels[t] ?? t);

  const scoreColor =
    result.score >= 70
      ? "text-green-600"
      : result.score >= 40
      ? "text-yellow-600"
      : "text-red-500";

  const confidenceColor =
    result.confidenceLabel === "높음"
      ? "bg-emerald-100 text-emerald-700"
      : result.confidenceLabel === "보통"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";
  const priorityLabelMap = {
    high: "우선",
    medium: "권장",
    low: "참고",
  } as const;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{result.careerName}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{result.summary}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${confidenceColor}`}
            >
              근거 충분도 {result.confidenceLabel}
            </span>
            <span className="text-xs text-gray-500">
              관련 이수 과목 {result.evidenceCourseCount}개
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium text-gray-400">추천 적합도</p>
          <span className={`text-2xl font-extrabold ${scoreColor}`}>
            {result.score}
          </span>
          <span className="ml-0.5 text-xs text-gray-400">/ 100</span>
        </div>
      </div>

      {/* 점수 세부 내역 */}
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-xs sm:grid-cols-5">
        <div>
          <p className="text-gray-400">필수 커버리지</p>
          <p className="font-semibold">{result.scoreBreakdown.requiredCoveragePct}%</p>
        </div>
        <div>
          <p className="text-gray-400">선택 커버리지</p>
          <p className="font-semibold">{result.scoreBreakdown.optionalCoveragePct}%</p>
        </div>
        <div>
          <p className="text-gray-400">필수/선택 점수</p>
          <p className="font-semibold">{result.scoreBreakdown.requiredTagScore}점</p>
          <p className="text-[11px] text-gray-400">
            선택 {result.scoreBreakdown.optionalTagScore}점
          </p>
        </div>
        <div>
          <p className="text-gray-400">키워드</p>
          <p className="font-semibold">+{result.scoreBreakdown.keywordBonus}점</p>
        </div>
        <div>
          <p className="text-gray-400">전공 적합도</p>
          <p className="font-semibold">
            +{result.scoreBreakdown.primaryMajorBonus + result.scoreBreakdown.secondaryMajorBonus}점
          </p>
          <p className="text-[11px] text-gray-400">
            보정 {result.scoreBreakdown.evidencePenalty}점
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-indigo-50 px-4 py-3">
        <p className="text-xs font-semibold text-indigo-600">추천 요약</p>
        <p className="mt-1 text-sm text-gray-700">{result.reasonSummary}</p>
        <p className="mt-2 text-xs text-indigo-700">{result.confidenceReason}</p>
      </div>

      {result.scoreAdjustments && result.scoreAdjustments.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-800">점수 조정</p>
          <ul className="mt-2 space-y-1">
            {result.scoreAdjustments.map((adjustment) => (
              <li
                key={`${adjustment.reason}-${adjustment.delta}`}
                className="flex items-start justify-between gap-3 text-xs text-amber-900"
              >
                <span>{adjustment.reason}</span>
                <span className="shrink-0 font-semibold">{adjustment.delta}점</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 역량 배지 */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold text-gray-500">보유 역량</p>
          <div className="flex flex-wrap gap-1">
            {matchedTagNames.length > 0 ? (
              matchedTagNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"
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
          <p className="mb-1 text-xs font-semibold text-gray-500">부족 역량</p>
          <div className="flex flex-wrap gap-1">
            {missingTagNames.length > 0 ? (
              missingTagNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600"
                >
                  {name}
                </span>
              ))
            ) : (
              <span className="text-xs text-green-600 font-medium">필수 역량 충족</span>
            )}
          </div>
        </div>
      </div>

      {/* 추천 과목 */}
      {recommendedCourseNames.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-gray-500">추천 보완 과목</p>
          <div className="flex flex-wrap gap-1">
            {recommendedCourseNames.map((name) => (
              <span
                key={name}
                className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3">
        <p className="mb-1 text-xs font-semibold text-gray-500">미이수 핵심 과목 미리보기</p>
        <div className="flex flex-wrap gap-1">
          {coreMissingCourseNames.length > 0 ? (
            coreMissingCourseNames.map((name) => (
              <span
                key={name}
                className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700"
              >
                {name}
              </span>
            ))
          ) : (
            <span className="text-xs text-green-600 font-medium">핵심 과목 대부분 이수</span>
          )}
        </div>
      </div>

      {/* 추천 이유 */}
      {result.reasons.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-gray-500">추천 이유</p>
          <ul className="space-y-1">
            {result.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600">
                <span className="mt-0.5 text-gray-300">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.lowGradeWarnings.length > 0 && (
        <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <p className="text-xs font-semibold text-orange-800">주의</p>
          <ul className="mt-2 space-y-1">
            {result.lowGradeWarnings.map((warning) => (
              <li key={warning} className="text-sm text-orange-900">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.retakeRecommendations.length > 0 && (
        <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
          <p className="text-xs font-semibold text-sky-700">재수강 권장</p>
          <ul className="mt-2 space-y-1">
            {result.retakeRecommendations.map((recommendation) => (
              <li key={recommendation} className="text-sm text-sky-900">
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.recommendationNotes.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-gray-500">보완 권장</p>
          <ul className="space-y-1">
            {result.recommendationNotes.map((note) => (
              <li key={note} className="text-sm text-gray-600">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.recommendedCertifications.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-gray-500">추천 자격증</p>
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
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500">
                      {priorityLabelMap[certification.priority]}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {certification.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 해설 버튼 */}
      <div className="mt-4 border-t pt-4">
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
            className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
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
            <p className="text-xs font-semibold text-sky-800">
              재수강 반영 과목 선택
            </p>
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
                      onChange={(e) =>
                        onRetakeCourseToggle(courseId, e.target.checked)
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

      {showPanel && explainData && (
        <RoadmapPanel data={explainData} onClose={() => setShowPanel(false)} />
      )}

      {children}
    </div>
  );
}
