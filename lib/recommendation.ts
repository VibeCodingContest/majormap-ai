import { careers, courses } from "./sample-data";
import {
  analyzeCareerGradeSignals,
  buildReasons,
  calcScore,
  deriveConfidenceLevel,
} from "./scoring";
import { skillTagLabels } from "./sample-data";
import { CareerRecommendation, StudentProfile } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function recommendCareers(profile: StudentProfile): CareerRecommendation[] {
  const takenCourseIds = Array.from(
    new Set(
      profile.takenCourses.length > 0
        ? profile.takenCourses.map((course) => course.courseId)
        : profile.takenCourseIds
    )
  );
  const takenCourses = courses.filter((course) =>
    takenCourseIds.includes(course.id)
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
        !takenCourseIds.includes(courseId) &&
        courses.some(
          (course) =>
            course.id === courseId &&
            course.yearTracks.includes(profile.studentYearTrack)
        )
    );

    const gradeSignals = analyzeCareerGradeSignals(career, takenCourses, profile);
    const gradeAdjustment = clamp(gradeSignals.totalPenalty, -10, 10);
    const scoreBreakdown = calcScore(
      career,
      takenCourses,
      profile,
      gradeAdjustment
    );
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

    const confidenceLevel = deriveConfidenceLevel(evidenceCourseCount);
    const confidenceLabel =
      confidenceLevel === "high"
        ? "높음"
        : confidenceLevel === "medium"
        ? "보통"
        : "낮음";
    const isLowFit = scoreBreakdown.total < 45;
    const evidenceMultiplierPct = Math.round(
      scoreBreakdown.evidencePenaltyMultiplier * 100
    );
    const evidenceSummary =
      scoreBreakdown.evidencePenaltyMultiplier < 1
        ? `관련 과목 ${evidenceCourseCount}개 기준으로 점수를 ${evidenceMultiplierPct}% 수준으로 보수 조정했습니다.`
        : `관련 과목 ${evidenceCourseCount}개가 확보되어 근거 보정 없이 점수를 계산했습니다.`;

    const confidenceReason =
      gradeSignals.lowGradeWarnings.length > 0
        ? `${gradeSignals.lowGradeWarnings[0]} ${gradeSignals.recommendationNotes[0] ?? ""}`.trim()
        : isLowFit
        ? `현재 이수 과목 기준으로는 ${career.name} 진로와의 적합도가 낮습니다. 관련 근거가 약하고 핵심 역량 공백이 커서 바로 추천하기 어렵습니다.`
        : confidenceLevel === "low"
        ? `관련 이수 과목이 ${evidenceCourseCount}개로 아직 적어 탐색 중심의 보수적인 점수입니다.`
        : confidenceLevel === "medium"
        ? `관련 이수 과목 ${evidenceCourseCount}개를 바탕으로 계산했으며, 핵심 과목을 더 쌓으면 점수 신뢰도가 높아집니다.`
        : `관련 이수 과목 ${evidenceCourseCount}개와 높은 필수 역량 충족률을 바탕으로 추천 근거가 충분한 편입니다.`;

    const recommendedCourseIds = courses
      .filter(
        (course) =>
          course.yearTracks.includes(profile.studentYearTrack) &&
          !takenCourseIds.includes(course.id) &&
          (career.coreCourseIds.includes(course.id) ||
            course.tags.some((tag) => missingTags.includes(tag)))
      )
      .slice(0, 3)
      .map((course) => course.id);

    const reasonSummary =
      isLowFit
        ? `${career.name} 기준 현재 적합도는 낮은 편입니다. 핵심 과목과 필수 역량 공백이 있어 점수를 보수적으로 유지했습니다. ${evidenceSummary} ${confidenceReason}`
        : gradeSignals.scoreAdjustments.length > 0
        ? `${career.name} 기준 기본 적합도는 확인되지만, 성적 기반 보정이 반영되었습니다. ${evidenceSummary} ${confidenceReason}`
        : coreMissingCourseIds.length > 0
        ? `${career.name} 기준 핵심 과목 ${coreMissingCourseIds.length}개와 부족 역량 보완 과목을 바로 이어서 추천할 수 있습니다. ${evidenceSummary} ${confidenceReason}`
        : `${career.name} 기준 핵심 역량을 대부분 충족하고 있어 다음 학기 계획으로 바로 연결하기 좋습니다. ${evidenceSummary} ${confidenceReason}`;

    const recommendationNotes = Array.from(
      new Set([
        ...gradeSignals.recommendationNotes,
        gradeSignals.totalPenalty !== gradeAdjustment
          ? "성적 기반 점수 보정은 과도한 왜곡을 막기 위해 최대 ±10점 범위로 제한해 반영했습니다."
          : "",
        scoreBreakdown.evidencePenaltyMultiplier < 1
          ? "관련 과목 수가 충분하지 않아 탐색 적합도를 보수적으로 조정했습니다."
          : "관련 과목 수가 충분해 탐색 적합도 계산의 신뢰도가 높습니다.",
      ])
    ).filter(Boolean);

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
      confidenceLevel,
      confidenceLabel,
      confidenceReason,
      lowGradeWarnings: gradeSignals.lowGradeWarnings,
      retakeRecommendations: gradeSignals.retakeRecommendations,
      retakeCourseIds: gradeSignals.retakeCourseIds,
      recommendationNotes,
      recommendedCertifications: career.recommendedCertifications ?? [],
      scoreAdjustments: gradeSignals.scoreAdjustments,
    } satisfies CareerRecommendation;
  });

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}
