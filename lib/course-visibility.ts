import { courses } from "./sample-data";
import {
  Course,
  CourseVisibilityContext,
  TakenCourseInput,
} from "./types";

export function normalizeSecondaryMajor(secondaryMajor?: string) {
  return secondaryMajor === "없음" ? undefined : secondaryMajor;
}

export function getVisibleCoursesForProfile(
  profile: CourseVisibilityContext
): Course[] {
  const secondaryMajor = normalizeSecondaryMajor(profile.secondaryMajor);

  return courses.filter(
    (course) =>
      course.yearTracks.includes(profile.studentYearTrack) &&
      (course.majors.includes(profile.primaryMajor) ||
        (secondaryMajor !== undefined &&
          course.majors.includes(secondaryMajor)))
  );
}

export function getVisibleCourseIdsForProfile(
  profile: CourseVisibilityContext
): string[] {
  return getVisibleCoursesForProfile(profile).map((course) => course.id);
}

export function filterTakenCoursesByVisibility(
  profile: CourseVisibilityContext,
  takenCourses: TakenCourseInput[]
): TakenCourseInput[] {
  const visibleCourseIds = new Set(getVisibleCourseIdsForProfile(profile));

  return takenCourses.filter((course) => visibleCourseIds.has(course.courseId));
}

export function filterTakenCourseIdsByVisibility(
  profile: CourseVisibilityContext,
  takenCourseIds: string[]
): string[] {
  const visibleCourseIds = new Set(getVisibleCourseIdsForProfile(profile));

  return takenCourseIds.filter((courseId) => visibleCourseIds.has(courseId));
}
