import { Suspense } from "react";
import Link from "next/link";
import { IntakeForm } from "@/components/IntakeForm";

export default function RecommendPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-0 h-72 w-72 rounded-full bg-sky-100 blur-3xl" />
        <div className="absolute right-[-10rem] top-24 h-96 w-96 rounded-full bg-indigo-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[28px] border border-slate-200/80 bg-white/85 px-5 py-4 backdrop-blur sm:px-6">
          <p className="text-base font-semibold text-slate-900">MajorMap AI</p>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.75)] transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            홈으로
          </Link>
        </header>

        <section className="mt-5">
          <div className="min-w-0">
            <Suspense
              fallback={
                <div className="rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.42)] backdrop-blur sm:p-6">
                  <div className="h-24 animate-pulse rounded-[24px] bg-slate-100" />
                </div>
              }
            >
              <IntakeForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
