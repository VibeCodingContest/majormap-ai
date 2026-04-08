import { careers, courses } from "./sample-data";
import { buildReasons, calcScore } from "./scoring";
import { CareerRecommendation, StudentProfile } from "./types";

export function recommendCareers(profile: StudentProfile): CareerRecommendation[] {
  const takenCourses = courses.filter((course) =>
    profile.takenCourseIds.includes(course.id)
  );
  const ownedTags = Array.from(
    new Set(takenCourses.flatMap((course) => course.tags))
  );

  const results = careers.map((career) => {
    const matchedRequired = career.requiredTags.filter((t) => ownedTags.includes(t));
    const matchedOptional = career.optionalTags.filter((t) => ownedTags.includes(t));
    const missingTags = career.requiredTags.filter((t) => !ownedTags.includes(t));

    const scoreBreakdown = calcScore(career, ownedTags, profile);
    const reasons = buildReasons(career, [...matchedRequired, ...matchedOptional], missingTags, profile);

    const recommendedCourseIds = courses
      .filter(
        (course) =>
          course.yearTracks.includes(profile.studentYearTrack) &&
          !profile.takenCourseIds.includes(course.id) &&
          course.tags.some((tag) => missingTags.includes(tag))
      )
      .slice(0, 3)
      .map((course) => course.id);

    return {
      careerId: career.id,
      careerName: career.name,
      score: scoreBreakdown.total,
      summary: career.summary,
      scoreBreakdown,
      matchedTags: [...matchedRequired, ...matchedOptional],
      missingTags,
      reasons,
      recommendedCourseIds,
    } satisfies CareerRecommendation;
  });

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}
