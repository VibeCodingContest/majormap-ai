'use client';

import { ExplainResponse } from "@/lib/types";

type Props = {
  data: ExplainResponse;
  onClose: () => void;
};

export function RoadmapPanel({ data, onClose }: Props) {
  const evidence = Array.isArray(data.evidence) ? data.evidence : [];
  const roadmap = Array.isArray(data.roadmap) ? data.roadmap : [];

  return (
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-1">
            AI 진로 해설
          </p>
          <h3 className="text-base font-bold text-gray-900">
            {data.headline || "AI 해설 결과"}
          </h3>
          <p className="mt-1 text-gray-700">
            {data.fitSummary || "추천 결과를 바탕으로 설명을 생성했습니다."}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-md px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-blue-100 transition-colors"
        >
          닫기
        </button>
      </div>

      {evidence.length > 0 && (
        <div>
          <p className="mb-1 font-semibold text-gray-700">추천 근거</p>
          <ul className="space-y-1 list-disc list-inside text-gray-600">
            {evidence.map((ev, i) => (
              <li key={i}>{ev}</li>
            ))}
          </ul>
        </div>
      )}

      {data.caution && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs font-semibold text-amber-600 mb-0.5">보완 포인트</p>
          <p className="text-gray-700">{data.caution}</p>
        </div>
      )}

      {roadmap.length > 0 && (
        <div>
          <p className="mb-2 font-semibold text-gray-700">학습 로드맵</p>
          <div className="space-y-3">
            {roadmap.map((phase) => (
              <div key={phase.phase} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {phase.phase}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{phase.title}</p>
                  <p className="text-gray-600">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
