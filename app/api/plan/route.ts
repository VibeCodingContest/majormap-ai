import { NextResponse } from "next/server";
import { buildPlan } from "@/lib/planning";
import { PlanApiResponse, PlanRequest } from "@/lib/types";

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
const VALID_TARGET_CREDITS = new Set([
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (typeof body.careerId !== "string") {
      return NextResponse.json<PlanApiResponse>(
        { error: "careerId가 필요합니다." },
        { status: 400 }
      );
    }

    const incomingTakenCourses = Array.isArray(body.takenCourses)
      ? body.takenCourses
      : undefined;
    const hasTakenCoursesPayload = Boolean(incomingTakenCourses);
    const takenCourses: PlanRequest["takenCourses"] = incomingTakenCourses
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
                ? (course.grade as PlanRequest["takenCourses"][number]["grade"])
                : undefined,
          }))
      : Array.isArray(body.takenCourseIds)
      ? body.takenCourseIds
          .filter(
            (courseId: unknown): courseId is string => typeof courseId === "string"
          )
          .map((courseId: string) => ({ courseId }))
      : [];
    const takenCourseIds = hasTakenCoursesPayload
      ? takenCourses.map((course) => course.courseId)
      : Array.isArray(body.takenCourseIds)
      ? body.takenCourseIds.filter(
          (courseId: unknown): courseId is string => typeof courseId === "string"
        )
      : [];

    const request: PlanRequest = {
      studentYearTrack: body.studentYearTrack ?? "2024",
      primaryMajor: body.primaryMajor ?? "컴퓨터공학",
      secondaryMajor: body.secondaryMajor || undefined,
      takenCourses,
      takenCourseIds,
      interestKeywords: Array.isArray(body.interestKeywords)
        ? body.interestKeywords
        : [],
      careerId: body.careerId,
      targetCredits:
        typeof body.targetCredits === "number" &&
        VALID_TARGET_CREDITS.has(body.targetCredits)
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
