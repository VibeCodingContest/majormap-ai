import { courseMap } from "./sample-data";
import { GradeValue, TakenCourseInput } from "./types";

function isFpGrade(grade: GradeValue) {
  return grade === "F" || grade === "P";
}

function isFpCourse(courseId: string) {
  const course = courseMap[courseId];
  if (!course) {
    return false;
  }

  return course.gradingType === "fp" || course.code.startsWith("LA");
}

export function validateTakenCourseGradePolicy(
  takenCourses: TakenCourseInput[]
): string | null {
  for (const takenCourse of takenCourses) {
    if (!takenCourse.grade) {
      continue;
    }

    const course = courseMap[takenCourse.courseId];
    if (!course) {
      continue;
    }

    const fpCourse = isFpCourse(takenCourse.courseId);
    const fpGrade = isFpGrade(takenCourse.grade);

    if (!fpCourse && takenCourse.grade === "P") {
      return `${course.name}(${course.code})은 P/F 과목이 아닙니다. P 대신 일반 성적 또는 F를 선택해주세요.`;
    }

    if (fpCourse && !fpGrade) {
      return `${course.name}(${course.code})은 P/F 과목입니다. 성적은 P 또는 F만 선택할 수 있습니다.`;
    }
  }

  return null;
}
