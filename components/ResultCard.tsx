'use client';

import { useState } from "react";
import { courseMap, skillTagLabels } from "@/lib/sample-data";
import { CareerRecommendation, ExplainResponse, StudentProfile } from "@/lib/types";
import { RoadmapPanel } from "./RoadmapPanel";

type Props = {
  result: CareerRecommendation;
  profile: StudentProfile;
};

export function ResultCard({ result, profile }: Props) {
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

      const data = await res.json();
      setExplainData(data);
      setShowPanel(true);
    } catch {
      setExplainError("AI 해설을 불러오는 데 실패했습니다.");
    } finally {
      setExplainLoading(false);
    }
  }

  const recommendedCourseNames = result.recommendedCourseIds
    .map((id) => courseMap[id]?.name ?? id)
    .filter(Boolean);

  const matchedTagNames = result.matchedTags.map(
    (t) => skillTagLabels[t] ?? t
  );
  const missingTagNames = result.missingTags.map(
    (t) => skillTagLabels[t] ?? t
  );

  const scoreColor =
    result.score >= 70
      ? "text-green-600"
      : result.score >= 40
      ? "text-yellow-600"
      : "text-red-500";

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{result.careerName}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{result.summary}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className={`text-2xl font-extrabold ${scoreColor}`}>
            {result.score}
          </span>
          <span className="ml-0.5 text-xs text-gray-400">/ 100</span>
        </div>
      </div>

      {/* 점수 세부 내역 */}
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-xs sm:grid-cols-4">
        <div>
          <p className="text-gray-400">필수역량</p>
          <p className="font-semibold">{result.scoreBreakdown.requiredTagScore}점</p>
        </div>
        <div>
          <p className="text-gray-400">선택역량</p>
          <p className="font-semibold">{result.scoreBreakdown.optionalTagScore}점</p>
        </div>
        <div>
          <p className="text-gray-400">키워드</p>
          <p className="font-semibold">+{result.scoreBreakdown.keywordBonus}점</p>
        </div>
        <div>
          <p className="text-gray-400">복수전공</p>
          <p className="font-semibold">+{result.scoreBreakdown.majorComboBonus}점</p>
        </div>
      </div>

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

      {/* AI 해설 버튼 */}
      <div className="mt-4 border-t pt-4">
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
        {explainError && (
          <p className="mt-2 text-xs text-red-500">{explainError}</p>
        )}
      </div>

      {showPanel && explainData && (
        <RoadmapPanel data={explainData} onClose={() => setShowPanel(false)} />
      )}
    </div>
  );
}
