import Link from "next/link";
import {
  COURSE_CODE_NOTE,
  DATASET_NOTICE,
  MVP_SCOPE_SUMMARY,
} from "@/lib/sample-data";

export default function HomePage() {
  const flowSteps = [
    "수강 이력과 전공 조합 입력",
    "추천 진로 확인 후 하나 선택",
    "선택 진로 기준 다음 1~2개 학기 계획 생성",
  ];

  const differentiators = [
    "추천과 계획은 외부 LLM 없이 규칙 기반으로 계산",
    "점수와 추천 근거를 함께 보여줘 결과 해석이 쉬움",
    "AI 설명이 실패해도 추천과 계획 흐름은 그대로 유지",
  ];

  return (
    <main className="mx-auto max-w-5xl p-8">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500">
          {MVP_SCOPE_SUMMARY.map((item) => (
            <span key={item} className="rounded-full bg-gray-100 px-3 py-1">
              {item}
            </span>
          ))}
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          수강 이력 기반 진로 추천과 다음 학기 계획을 한 번에 연결하는 AI 진로 설계 서비스
        </h1>
        <p className="mt-4 max-w-3xl text-gray-700">
          복수전공·심화전공 대학생의 수강 이력, 학번 트랙, 전공 조합을 바탕으로
          적합한 진로를 추천하고, 선택한 진로 기준 다음 1~2개 학기 계획까지 제안합니다.
          추천과 계획은 규칙 기반으로 동작하며, AI 설명은 보조 기능으로 안전하게 연결됩니다.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/recommend"
            className="inline-block rounded-lg bg-black px-4 py-2 text-white"
          >
            추천 시작하기
          </Link>
          <p className="text-sm text-gray-500">
            작은 범위의 샘플 커리큘럼에서 추천 근거와 계획 흐름을 검증하는 MVP입니다.
          </p>
        </div>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">데이터셋 안내</p>
          <p className="mt-1">{DATASET_NOTICE}</p>
          <p className="mt-1 text-amber-800">{COURSE_CODE_NOTE}</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">현재 지원 범위</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>샘플 커리큘럼 1종 기준으로 동작</li>
            <li>컴퓨터공학·경영학, 2023·2024 학번만 지원</li>
            <li>진로 4개, 계획은 다음 1~2개 학기까지만 제공</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">사용 흐름</h2>
          <ol className="mt-3 space-y-2 text-sm text-gray-600">
            {flowSteps.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">핵심 차별점</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {differentiators.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
