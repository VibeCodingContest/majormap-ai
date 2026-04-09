import { NextResponse } from "next/server";
import { recommendCareers } from "@/lib/recommendation";
import { RecommendApiResponse, StudentProfile } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const profile: StudentProfile = {
      studentYearTrack: body.studentYearTrack ?? "2024",
      primaryMajor: body.primaryMajor ?? "컴퓨터공학",
      secondaryMajor: body.secondaryMajor || undefined,
      takenCourseIds: Array.isArray(body.takenCourseIds) ? body.takenCourseIds : [],
      interestKeywords: Array.isArray(body.interestKeywords) ? body.interestKeywords : [],
    };

    const results = recommendCareers(profile);
    return NextResponse.json<RecommendApiResponse>({ results });
  } catch {
    return NextResponse.json<RecommendApiResponse>(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
