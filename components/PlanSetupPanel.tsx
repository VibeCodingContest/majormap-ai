'use client';

import { PlanOptions, TargetCredits } from "@/lib/types";

const TARGET_CREDIT_OPTIONS: TargetCredits[] = [
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
];

function renderTargetCreditOptions() {
  return TARGET_CREDIT_OPTIONS.map((credit) => (
    <option key={credit} value={credit}>
      {credit}
    </option>
  ));
}

type Props = {
  careerName: string;
  options: PlanOptions;
  loading: boolean;
  error: string | null;
  onChange: (nextOptions: PlanOptions) => void;
  onSubmit: () => void;
};

export function PlanSetupPanel({
  careerName,
  options,
  loading,
  error,
  onChange,
  onSubmit,
}: Props) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] sm:p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold tracking-wide text-slate-400">Plan Setup</p>
        <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
          {careerName} 기준 학기 계획
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-2 block min-h-[4rem] text-sm font-medium leading-snug text-slate-700">
            다음 학기
          </label>
          <select
            value={options.nextSemester}
            onChange={(e) =>
              onChange({
                ...options,
                nextSemester: e.target.value === "2" ? "2" : "1",
              })
            }
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none"
          >
            <option value="1">1학기</option>
            <option value="2">2학기</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block min-h-[4rem] text-sm font-medium leading-snug text-slate-700">
            다음 학기 목표 학점
          </label>
          <select
            value={options.firstSemesterTargetCredits ?? options.targetCredits}
            onChange={(e) =>
              onChange({
                ...options,
                targetCredits: Number(e.target.value) as TargetCredits,
                firstSemesterTargetCredits: Number(e.target.value) as TargetCredits,
              })
            }
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none"
          >
            {renderTargetCreditOptions()}
          </select>
        </div>

        <div>
          <label className="mb-2 block min-h-[4rem] text-sm font-medium leading-snug text-slate-700">
            계획 학기 수
          </label>
          <select
            value={options.semesterCount}
            onChange={(e) =>
              onChange({
                ...options,
                semesterCount: Number(e.target.value) as 1 | 2,
              })
            }
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none"
          >
            <option value={1}>1개 학기</option>
            <option value={2}>2개 학기</option>
          </select>
        </div>

        {options.semesterCount === 2 && (
          <div>
            <label className="mb-2 block min-h-[4rem] text-sm font-medium leading-snug text-slate-700">
              그 다음 학기 목표 학점
            </label>
            <select
              value={options.secondSemesterTargetCredits ?? options.targetCredits}
              onChange={(e) =>
                onChange({
                  ...options,
                  secondSemesterTargetCredits: Number(e.target.value) as TargetCredits,
                })
              }
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none"
            >
              {renderTargetCreditOptions()}
            </select>
          </div>
        )}

      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex min-h-11 w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={options.includeLiberalArts}
            onChange={(e) =>
              onChange({
                ...options,
                includeLiberalArts: e.target.checked,
              })
            }
            className="h-4 w-4 rounded border border-slate-300 accent-indigo-600"
          />
          교양 과목 포함
        </label>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.75)] transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "계획 생성 중..." : "다음 학기 계획 생성"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
