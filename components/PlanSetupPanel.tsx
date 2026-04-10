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
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
          2단계 계획 옵션
        </p>
        <h3 className="mt-1 text-lg font-bold text-gray-900">
          {careerName} 기준 다음 학기 계획
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          진로 추천 결과를 유지한 채 다음 1~2개 학기 수강 계획만 추가로 계산합니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
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
            className="w-full rounded border border-gray-300 p-2 text-sm"
          >
            <option value="1">1학기</option>
            <option value="2">2학기</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
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
            className="w-full rounded border border-gray-300 p-2 text-sm"
          >
            {renderTargetCreditOptions()}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
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
            className="w-full rounded border border-gray-300 p-2 text-sm"
          >
            <option value={1}>1개 학기</option>
            <option value={2}>2개 학기</option>
          </select>
        </div>

        {options.semesterCount === 2 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
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
              className="w-full rounded border border-gray-300 p-2 text-sm"
            >
              {renderTargetCreditOptions()}
            </select>
          </div>
        )}

      </div>

      <label className="mt-4 flex w-fit items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={options.includeLiberalArts}
          onChange={(e) =>
            onChange({
              ...options,
              includeLiberalArts: e.target.checked,
            })
          }
          className="h-4 w-4 accent-indigo-600"
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
        className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 sm:mt-6"
      >
        {loading ? "계획 생성 중..." : "다음 학기 계획 생성"}
      </button>
    </section>
  );
}
