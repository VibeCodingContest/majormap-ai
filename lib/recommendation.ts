import { careers, courses } from "./sample-data";
import { buildReasons, calcScore } from "./scoring";
import { skillTagLabels } from "./sample-data";
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
    const coreMissingCourseIds = career.coreCourseIds.filter(
      (courseId) =>
        !profile.takenCourseIds.includes(courseId) &&
        courses.some(
          (course) =>
            course.id === courseId &&
            course.yearTracks.includes(profile.studentYearTrack)
        )
    );

    const scoreBreakdown = calcScore(career, takenCourses, profile);
    const reasons = buildReasons(
      career,
      [...matchedRequired, ...matchedOptional],
      missingTags,
      profile
    );
    const strengthHighlights = [...matchedRequired, ...matchedOptional]
      .slice(0, 4)
      .map((tag) => skillTagLabels[tag] ?? tag);
    const gapHighlights = missingTags.map((tag) => skillTagLabels[tag] ?? tag);
    const evidenceCourseCount = scoreBreakdown.relatedCourseCount;

    const confidenceLabel =
      evidenceCourseCount <= 1 || scoreBreakdown.requiredCoveragePct < 34
        ? "낮음"
        : evidenceCourseCount <= 3 || scoreBreakdown.requiredCoveragePct < 67
        ? "보통"
        : "높음";

    const confidenceReason =
      confidenceLabel === "낮음"
        ? `관련 이수 과목이 ${evidenceCourseCount}개라 현재 추천 근거가 아직 얇습니다.`
        : confidenceLabel === "보통"
        ? `관련 이수 과목 ${evidenceCourseCount}개를 기준으로 추천했으며, 추가 이수 시 신뢰도가 더 높아집니다.`
        : `관련 이수 과목 ${evidenceCourseCount}개와 높은 필수 역량 커버리지를 바탕으로 추천 근거가 비교적 충분합니다.`;

    const recommendedCourseIds = courses
      .filter(
        (course) =>
          course.yearTracks.includes(profile.studentYearTrack) &&
          !profile.takenCourseIds.includes(course.id) &&
          (career.coreCourseIds.includes(course.id) ||
            course.tags.some((tag) => missingTags.includes(tag)))
      )
      .slice(0, 3)
      .map((course) => course.id);

    const reasonSummary =
      coreMissingCourseIds.length > 0
        ? `${career.name} 기준 핵심 과목 ${coreMissingCourseIds.length}개와 부족 역량 보완 과목을 바로 이어서 추천할 수 있습니다. ${confidenceReason}`
        : `${career.name} 기준 핵심 역량을 대부분 충족하고 있어 다음 학기 계획으로 바로 연결하기 좋습니다. ${confidenceReason}`;

    return {
      careerId: career.id,
      careerName: career.name,
      score: scoreBreakdown.total,
      summary: career.summary,
      reasonSummary,
      scoreBreakdown,
      matchedTags: [...matchedRequired, ...matchedOptional],
      missingTags,
      strengthHighlights,
      gapHighlights,
      reasons,
      coreMissingCourseIds,
      recommendedCourseIds,
      evidenceCourseCount,
      confidenceLabel,
      confidenceReason,
    } satisfies CareerRecommendation;
  });

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}
