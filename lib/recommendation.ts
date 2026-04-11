import { careers, courses, skillTagLabels } from "./sample-data";
import {
  analyzeCareerGradeSignals,
  buildReasons,
  calcConfidenceScore,
  calcScore,
} from "./scoring";
import { CareerRecommendation, ScoreExplanation, StudentProfile } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatTagNames(tags: string[], limit = 2) {
  return tags
    .slice(0, limit)
    .map((tag) => skillTagLabels[tag] ?? tag)
    .join(", ");
}

function getConfidenceLabel(level: CareerRecommendation["confidenceLevel"]) {
  if (level === "high") {
    return "높음";
  }

  if (level === "medium") {
    return "보통";
  }

  return "낮음";
}

function buildFitSummary(input: {
  fitScore: number;
  requiredCoverage: number;
  optionalCoverage: number;
  missingTags: string[];
  hasGradePenalty: boolean;
}) {
  if (input.hasGradePenalty && input.missingTags.length === 0) {
    return input.fitScore >= 45
      ? "진로 방향은 잘 맞는 편인데, 핵심 과목 성적 영향으로 점수가 조금 낮게 나왔습니다."
      : "진로 방향은 잘 맞는 편인데, 핵심 과목 성적 영향으로 점수가 더 낮게 반영되었습니다.";
  }

  if (input.fitScore >= 70) {
    return "현재 이수 과목 기준 이 진로와의 방향성은 높습니다.";
  }

  if (input.fitScore >= 45) {
    return input.missingTags.length === 0
      ? "현재 이수 과목 기준 이 진로와의 방향성은 보통 이상입니다."
      : `${formatTagNames(input.missingTags)} 역량을 보강하면 방향성이 더 선명해집니다.`;
  }

  return input.requiredCoverage >= 0.6
    ? "방향성은 보이지만 아직 적합도가 충분히 높지는 않습니다."
    : `${formatTagNames(input.missingTags)} 역량 보완이 더 필요해 방향성이 아직 약합니다.`;
}

function buildConfidenceSummary(input: {
  confidenceLevel: CareerRecommendation["confidenceLevel"];
  relatedCourseCount: number;
  coreCourseCount: number;
  gradedEvidenceCount: number;
}) {
  if (input.confidenceLevel === "high") {
    return "관련 과목과 성적 정보가 충분해 추천 확신도는 높습니다.";
  }

  if (input.confidenceLevel === "medium") {
    return input.coreCourseCount === 0 || input.gradedEvidenceCount === 0
      ? "관련 과목은 쌓였지만 핵심 과목 또는 성적 근거가 아직 충분하지 않습니다."
      : "관련 과목과 성적 정보가 일부 쌓여 추천 확신도는 보통 수준입니다.";
  }

  if (input.coreCourseCount === 0) {
    return `관련 과목 수가 아직 ${input.relatedCourseCount}개로 적고 핵심 과목 근거도 부족해 추천 확신도는 낮습니다.`;
  }

  if (input.gradedEvidenceCount === 0) {
    return `관련 과목 수가 아직 ${input.relatedCourseCount}개로 적고 성적 근거가 부족해 추천 확신도는 낮습니다.`;
  }

  return `관련 과목 수가 아직 ${input.relatedCourseCount}개로 적어 추천 확신도는 낮게 유지되었습니다.`;
}

function buildReasonSummary(
  fitScore: number,
  confidenceLevel: CareerRecommendation["confidenceLevel"],
  hasGradePenalty: boolean
) {
  if (hasGradePenalty && confidenceLevel === "high" && fitScore >= 45) {
    return "근거는 충분한 편인데, 핵심 과목 성적 때문에 적합도가 조금 낮아졌습니다.";
  }

  if (hasGradePenalty && fitScore >= 45) {
    return "방향은 맞는 편이지만, 핵심 과목 성적 때문에 점수가 일부 낮아졌습니다.";
  }

  if (hasGradePenalty) {
    return "핵심 과목 성적 때문에 적합도가 더 낮게 나왔습니다.";
  }

  if (fitScore >= 65 && confidenceLevel === "high") {
    return "방향성과 근거가 모두 충분한 편입니다.";
  }

  if (fitScore >= 45 && confidenceLevel === "low") {
    return "방향성은 보이지만 추천 근거는 아직 적습니다.";
  }

  if (fitScore >= 45) {
    return "방향성은 보이며 추천 근거도 쌓이는 중입니다.";
  }

  if (confidenceLevel === "high") {
    return "추천 근거는 있지만 방향성 보강이 더 필요합니다.";
  }

  return "방향성과 추천 근거를 더 보강할 필요가 있습니다.";
}

function buildRecommendationNotes(input: {
  existingNotes: string[];
  confidenceLevel: CareerRecommendation["confidenceLevel"];
  confidenceHighlights: string[];
  hasScoreClamp: boolean;
}) {
  return Array.from(
    new Set(
      [
        ...input.existingNotes,
        input.hasScoreClamp
          ? "성적 감점은 최대 -10점까지만 반영했습니다."
          : "",
        input.confidenceLevel === "low"
          ? "관련 과목과 핵심 과목이 더 쌓이면 확신도가 높아집니다."
          : input.confidenceLevel === "medium"
          ? "추가 과목 이수와 성적 정보가 쌓이면 확신도가 더 선명해집니다."
          : "",
        ...input.confidenceHighlights.map(
          (highlight) => `${highlight} 보강 시 확신도가 높아집니다.`
        ),
      ].filter(Boolean)
    )
  );
}

const scoreExplanation: ScoreExplanation = {
  fitLabel: "탐색 적합도",
  fitDescription: "이 진로 방향과의 일치도",
  confidenceLabel: "추천 확신도",
  confidenceDescription: "추천 근거의 충분도",
};

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
    const matchedRequired = career.requiredTags.filter((tag) =>
      ownedTags.includes(tag)
    );
    const matchedOptional = career.optionalTags.filter((tag) =>
      ownedTags.includes(tag)
    );
    const missingTags = career.requiredTags.filter(
      (tag) => !ownedTags.includes(tag)
    );
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
    const confidenceResult = calcConfidenceScore(career, takenCourses, profile);
    const fitScore = scoreBreakdown.total;
    const confidenceScore = confidenceResult.score;
    const confidenceLevel = confidenceResult.level;
    const confidenceLabel = getConfidenceLabel(confidenceLevel);
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

    const fitSummary = buildFitSummary({
      fitScore,
      requiredCoverage: scoreBreakdown.requiredCoverage,
      optionalCoverage: scoreBreakdown.optionalCoverage,
      missingTags,
      hasGradePenalty: gradeSignals.scoreAdjustments.length > 0,
    });
    const confidenceSummary = buildConfidenceSummary({
      confidenceLevel,
      relatedCourseCount: confidenceResult.relatedCourseCount,
      coreCourseCount: confidenceResult.coreCourseCount,
      gradedEvidenceCount: confidenceResult.gradedEvidenceCount,
    });
    const reasonSummary = buildReasonSummary(
      fitScore,
      confidenceLevel,
      gradeSignals.scoreAdjustments.length > 0
    );
    const recommendationNotes = buildRecommendationNotes({
      existingNotes: gradeSignals.recommendationNotes,
      confidenceLevel,
      confidenceHighlights: confidenceResult.confidenceHighlights,
      hasScoreClamp: gradeSignals.totalPenalty !== gradeAdjustment,
    });

    return {
      careerId: career.id,
      careerName: career.name,
      score: fitScore,
      fitScore,
      confidenceScore,
      confidenceLevel,
      summary: career.summary,
      reasonSummary,
      fitSummary,
      confidenceSummary,
      scoreExplanation,
      scoreBreakdown,
      matchedTags: [...matchedRequired, ...matchedOptional],
      missingTags,
      strengthHighlights,
      gapHighlights,
      confidenceHighlights: confidenceResult.confidenceHighlights,
      reasons,
      coreMissingCourseIds,
      recommendedCourseIds,
      evidenceCourseCount: confidenceResult.relatedCourseCount,
      coreEvidenceCourseCount: confidenceResult.coreCourseCount,
      gradedEvidenceCourseCount: confidenceResult.gradedEvidenceCount,
      confidenceLabel,
      confidenceReason: confidenceSummary,
      lowGradeWarnings: gradeSignals.lowGradeWarnings,
      retakeRecommendations: gradeSignals.retakeRecommendations,
      retakeCourseIds: gradeSignals.retakeCourseIds,
      recommendationNotes,
      recommendedCertifications: career.recommendedCertifications ?? [],
      scoreAdjustments: gradeSignals.scoreAdjustments,
    } satisfies CareerRecommendation;
  });

  return results
    .sort(
      (a, b) =>
        b.fitScore - a.fitScore || b.confidenceScore - a.confidenceScore
    )
    .slice(0, 3);
}
