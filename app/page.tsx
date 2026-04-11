import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <section className="rounded-3xl border bg-white p-8 shadow-sm sm:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            수강 이력으로 진로 추천부터 다음 학기 계획까지{" "}
            <span className="inline-block whitespace-nowrap">바로 확인하세요</span>
          </h1>
          <div className="mt-5 flex justify-center">
            <Link
              href="/recommend"
              className="inline-flex min-w-52 items-center justify-center rounded-2xl bg-indigo-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-500"
            >
              추천 시작하기
            </Link>
          </div>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-gray-400">
        샘플 커리큘럼 1종 · 컴퓨터공학·경영학 · 2023·2024 학번 트랙 · 진로 4개
      </p>
    </main>
  );
}
