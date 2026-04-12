'use client';

import { useEffect } from "react";
import { ExplainResponse } from "@/lib/types";

type Props = {
  data: ExplainResponse;
  onClose: () => void;
};

export function RoadmapPanel({ data, onClose }: Props) {
  const evidence = Array.isArray(data.evidence) ? data.evidence : [];
  const roadmap = Array.isArray(data.roadmap) ? data.roadmap : [];
  const recommendedCertifications = Array.isArray(data.recommendedCertifications)
    ? data.recommendedCertifications
    : [];
  const priorityBadgeMap = {
    high: { label: "우선", className: "bg-indigo-600 text-white" },
    medium: { label: "권장", className: "bg-sky-100 text-sky-700" },
    low: { label: "참고", className: "bg-slate-100 text-slate-600" },
  } as const;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <section
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">
              AI 진로 해설
            </p>
            <h3 className="text-lg font-black tracking-tight text-slate-950">
              {data.headline || "AI 해설 결과"}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              {data.fitSummary || "추천 결과를 바탕으로 설명을 생성했습니다."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
          >
            닫기
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {evidence.length > 0 && (
            <div className="rounded-[18px] bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">추천 근거</p>
              <ul className="space-y-2 text-sm text-slate-600">
                {evidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-3 leading-6">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.caution && (
            <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3.5">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">보완 포인트</p>
              <p className="text-sm leading-6 text-slate-700">{data.caution}</p>
            </div>
          )}

          {roadmap.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-800">학습 로드맵</p>
              <div className="space-y-3">
                {roadmap.map((phase) => (
                  <div key={phase.phase} className="flex gap-3 rounded-[18px] bg-slate-50 px-4 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                      {phase.phase}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{phase.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{phase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendedCertifications.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-800">자격증 추천</p>
              <div className="space-y-3">
                {recommendedCertifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="grid gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-start"
                  >
                    <div className="flex min-w-0 flex-col items-start gap-2">
                      <span className="text-sm font-semibold leading-6 text-slate-800 break-keep">
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
                    <p className="text-sm leading-6 text-slate-600">{cert.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
