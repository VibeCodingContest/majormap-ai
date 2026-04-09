import { IntakeForm } from "@/components/IntakeForm";

export default function RecommendPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold">진로 추천 및 다음 학기 계획</h1>
      <p className="mt-2 text-sm text-gray-600">
        1단계에서 진로를 추천받고, 2단계에서 선택한 진로 기준 다음 1~2개 학기 계획을 생성합니다.
      </p>
      <IntakeForm />
    </main>
  );
}
