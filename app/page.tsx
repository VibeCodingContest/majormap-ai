import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">
        수강 이력 기반 진로 추천과 다음 학기 계획을 한 번에 연결하는 AI 진로 설계 서비스
      </h1>
      <p className="mt-4 text-gray-700">
        복수전공·심화전공 대학생의 수강 이력, 학번 트랙, 전공 조합을 바탕으로
        적합한 진로를 추천하고, 선택한 진로 기준 다음 1~2개 학기 계획까지 제안합니다.
        추천과 계획은 규칙 기반으로 동작하며, AI 설명은 보조 기능으로 안전하게 연결됩니다.
      </p>
      <Link
        href="/recommend"
        className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-white"
      >
        추천 시작하기
      </Link>
    </main>
  );
}
