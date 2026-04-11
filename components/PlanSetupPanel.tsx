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
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {careerName} 기준 학기 계획
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block min-h-[3.25rem] text-sm font-medium leading-snug text-gray-700">
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-gray-900"
          >
            <option value="1">1학기</option>
            <option value="2">2학기</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block min-h-[3.25rem] text-sm font-medium leading-snug text-gray-700">
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-gray-900"
          >
            {renderTargetCreditOptions()}
          </select>
        </div>

        <div>
          <label className="mb-1 block min-h-[3.25rem] text-sm font-medium leading-snug text-gray-700">
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-gray-900"
          >
            <option value={1}>1개 학기</option>
            <option value={2}>2개 학기</option>
          </select>
        </div>

        {options.semesterCount === 2 && (
          <div>
            <label className="mb-1 block min-h-[3.25rem] text-sm font-medium leading-snug text-gray-700">
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
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-gray-900"
            >
              {renderTargetCreditOptions()}
            </select>
          </div>
        )}

      </div>

      <label className="mt-4 flex w-fit items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-gray-700 ring-1 ring-slate-200">
        <input
          type="checkbox"
          checked={options.includeLiberalArts}
          onChange={(e) =>
            onChange({
              ...options,
              includeLiberalArts: e.target.checked,
            })
          }
          className="h-4 w-4 rounded-md border border-slate-300 accent-indigo-600"
        />
        교양 과목 포함
      </label>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 sm:mt-6"
      >
        {loading ? "계획 생성 중..." : "다음 학기 계획 생성"}
      </button>
    </section>
  );
}
