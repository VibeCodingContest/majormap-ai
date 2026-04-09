import { NextResponse } from "next/server";
import { buildPlan } from "@/lib/planning";
import { PlanApiResponse, PlanRequest } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<PlanRequest>;

    if (!body.careerId) {
      return NextResponse.json<PlanApiResponse>(
        { error: "careerId가 필요합니다." },
        { status: 400 }
      );
    }

    const request: PlanRequest = {
      studentYearTrack: body.studentYearTrack ?? "2024",
      primaryMajor: body.primaryMajor ?? "컴퓨터공학",
      secondaryMajor: body.secondaryMajor || undefined,
      takenCourseIds: Array.isArray(body.takenCourseIds) ? body.takenCourseIds : [],
      interestKeywords: Array.isArray(body.interestKeywords)
        ? body.interestKeywords
        : [],
      careerId: body.careerId,
      targetCredits:
        body.targetCredits === 12 ||
        body.targetCredits === 15 ||
        body.targetCredits === 18
          ? body.targetCredits
          : 15,
      semesterCount: body.semesterCount === 2 ? 2 : 1,
      includeLiberalArts: Boolean(body.includeLiberalArts),
      nextSemester: body.nextSemester === "2" ? "2" : "1",
    };

    const result = buildPlan(request);
    return NextResponse.json<PlanApiResponse>({ result });
  } catch {
    return NextResponse.json<PlanApiResponse>(
      { error: "수강 계획 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
