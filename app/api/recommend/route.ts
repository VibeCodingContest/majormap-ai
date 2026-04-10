import { NextResponse } from "next/server";
import {
  filterTakenCourseIdsByVisibility,
  filterTakenCoursesByVisibility,
  normalizeSecondaryMajor,
} from "@/lib/course-visibility";
import { validateTakenCourseGradePolicy } from "@/lib/grade-policy";
import { recommendCareers } from "@/lib/recommendation";
import { RecommendApiResponse, StudentProfile } from "@/lib/types";

const VALID_GRADES = new Set([
  "A+",
  "A0",
  "B+",
  "B0",
  "C+",
  "C0",
  "D+",
  "D0",
  "F",
  "P",
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incomingTakenCourses = Array.isArray(body.takenCourses)
      ? body.takenCourses
      : undefined;
    const hasTakenCoursesPayload = Boolean(incomingTakenCourses);
    const takenCourses: StudentProfile["takenCourses"] = incomingTakenCourses
      ? incomingTakenCourses
          .filter(
            (course: unknown): course is { courseId: string; grade?: string } =>
              typeof course === "object" &&
              course !== null &&
              typeof (course as { courseId?: unknown }).courseId === "string"
          )
          .map((course: { courseId: string; grade?: string }) => ({
            courseId: course.courseId,
            grade:
              typeof course.grade === "string" && VALID_GRADES.has(course.grade)
                ? (course.grade as StudentProfile["takenCourses"][number]["grade"])
                : undefined,
          }))
      : [];
    const takenCourseIds = hasTakenCoursesPayload
      ? takenCourses.map((course) => course.courseId)
      : Array.isArray(body.takenCourseIds)
      ? body.takenCourseIds.filter(
          (courseId: unknown): courseId is string => typeof courseId === "string"
        )
      : [];
    const secondaryMajor = normalizeSecondaryMajor(body.secondaryMajor || undefined);
    const profileBase = {
      studentYearTrack: body.studentYearTrack ?? "2024",
      primaryMajor: body.primaryMajor ?? "컴퓨터공학",
      secondaryMajor,
    };
    const visibleTakenCourses = filterTakenCoursesByVisibility(profileBase, takenCourses);
    const visibleTakenCourseIds = hasTakenCoursesPayload
      ? visibleTakenCourses.map((course) => course.courseId)
      : filterTakenCourseIdsByVisibility(profileBase, takenCourseIds);

    const profile: StudentProfile = {
      ...profileBase,
      takenCourses: visibleTakenCourses,
      takenCourseIds: visibleTakenCourseIds,
      interestKeywords: Array.isArray(body.interestKeywords) ? body.interestKeywords : [],
    };
    const gradePolicyError = validateTakenCourseGradePolicy(profile.takenCourses);

    if (gradePolicyError) {
      return NextResponse.json<RecommendApiResponse>(
        { error: gradePolicyError },
        { status: 400 }
      );
    }

    const results = recommendCareers(profile);
    return NextResponse.json<RecommendApiResponse>({ results });
  } catch {
    return NextResponse.json<RecommendApiResponse>(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
