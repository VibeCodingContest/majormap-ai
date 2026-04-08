import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">AI 진로-교과 로드맵 설계 서비스</h1>
      <p className="mt-4 text-gray-700">
        복수전공/심화전공 대학생의 수강 이력과 학번별 커리큘럼을 바탕으로
        진로와 미수강 과목을 추천합니다.
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
