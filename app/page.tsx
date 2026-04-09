import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">AI 진로 추천 + 다음 학기 계획 설계</h1>
      <p className="mt-4 text-gray-700">
        복수전공/심화전공 대학생의 수강 이력과 학번별 커리큘럼을 바탕으로
        진로를 추천하고, 선택한 진로 기준으로 다음 1~2개 학기 수강 계획까지 설계합니다.
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
