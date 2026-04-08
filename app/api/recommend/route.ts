import { NextResponse } from "next/server";
import { recommendCareers } from "@/lib/recommendation";
import { StudentProfile } from "@/lib/types";

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
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
