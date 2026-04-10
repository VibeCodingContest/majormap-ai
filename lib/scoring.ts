import { Career, Course, GradeValue, ScoreBreakdown, ScoreAdjustment, StudentProfile } from "./types";
import { skillTagLabels } from "./sample-data";

const REQUIRED_TAG_SCORE_MAX = 60;
const OPTIONAL_TAG_SCORE_MAX = 15;
const KEYWORD_BONUS_PER_MATCH = 2.5;
const KEYWORD_BONUS_MAX = 5;
const PRIMARY_MAJOR_BONUS = 7;
const SECONDARY_MAJOR_BONUS = 3;
const DEFAULT_GRADE_WEIGHT = 1;
const GRADE_ADJUSTMENT_MIN = -10;
const GRADE_ADJUSTMENT_MAX = 10;
const LOW_GRADE_THRESHOLD: GradeValue = "C+";
const GRADE_WEIGHTS: Record<GradeValue, number> = {
  "A+": 1,
  A0: 0.98,
  "B+": 0.9,
  B0: 0.84,
  "C+": 0.62,
  C0: 0.52,
  "D+": 0.32,
  D0: 0.2,
  F: 0,
  P: 0.72,
};
const GRADE_RANKS: Record<Exclude<GradeValue, "P">, number> = {
  F: 0,
  D0: 1,
  "D+": 2,
  C0: 3,
  "C+": 4,
  B0: 5,
  "B+": 6,
  A0: 7,
  "A+": 8,
};

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function gradeToRank(grade?: GradeValue): number | null {
  if (!grade || grade === "P") {
    return null;
  }

  return GRADE_RANKS[grade];
}

export function isLowGrade(
  grade?: GradeValue,
  threshold: GradeValue = LOW_GRADE_THRESHOLD
) {
  const gradeRank = gradeToRank(grade);
  const thresholdRank = gradeToRank(threshold);

  if (gradeRank === null || thresholdRank === null) {
    return false;
  }

  return gradeRank <= thresholdRank;
}

export function isRetakeRecommended(course: Course, grade?: GradeValue) {
  const threshold =
    course.retakeThreshold ??
    (course.isCore || course.isMajorImportant ? LOW_GRADE_THRESHOLD : undefined);

  if (!threshold) {
    return false;
  }

  return isLowGrade(grade, threshold);
}

function getCourseWeightMap(profile: StudentProfile) {
  return new Map(
    profile.takenCourses.map((course) => [
      course.courseId,
      course.grade ? GRADE_WEIGHTS[course.grade] : DEFAULT_GRADE_WEIGHT,
    ])
  );
}

function isCareerRelatedCourse(course: Course, career: Career) {
  return (
    career.coreCourseIds.includes(course.id) ||
    course.tags.some(
      (tag) =>
        career.requiredTags.includes(tag) || career.optionalTags.includes(tag)
    )
  );
}

export function calculateCoverageScore(
  tags: string[],
  tagStrengthMap: Map<string, number>,
  maxScore: number
) {
  const coverage =
    tags.length > 0
      ? tags.reduce((sum, tag) => sum + (tagStrengthMap.get(tag) ?? 0), 0) /
        tags.length
      : 0;

  return {
    coverage: roundTo(coverage, 2),
    score: roundTo(coverage * maxScore, 1),
  };
}

export function calculateEvidencePenaltyMultiplier(relatedCourseCount: number) {
  // 관련 과목 수가 적을수록 최종 점수를 보수적으로 축소한다.
  if (relatedCourseCount <= 1) {
    return 0.45;
  }
  if (relatedCourseCount === 2) {
    return 0.6;
  }
  if (relatedCourseCount === 3) {
    return 0.72;
  }
  if (relatedCourseCount === 4) {
    return 0.82;
  }
  return 1;
}

export function deriveConfidenceLevel(
  relatedCourseCount: number
): "low" | "medium" | "high" {
  if (relatedCourseCount <= 2) {
    return "low";
  }
  if (relatedCourseCount <= 4) {
    return "medium";
  }
  return "high";
}

function getTakenCourseGradeMap(profile: StudentProfile) {
  return new Map(
    profile.takenCourses.map((course) => [course.courseId, course.grade])
  );
}

function getPenaltyDelta(course: Course, grade: GradeValue) {
  if (grade === "F") {
    return course.isCore ? -20 : -12;
  }

  if (isLowGrade(grade, "C0")) {
    return course.isCore ? -12 : -8;
  }

  return course.isCore ? -8 : -5;
}

function getCareerDirectPenaltyDelta(grade: GradeValue) {
  if (grade === "F") {
    return -8;
  }

  if (isLowGrade(grade, "C0")) {
    return -6;
  }

  return -4;
}

function getCourseLabel(course: Course) {
  return course.isCore ? "핵심 과목" : "주요 과목";
}

export function analyzeCareerGradeSignals(
  career: Career,
  takenCourses: Course[],
  profile: StudentProfile
) {
  const takenCourseGradeMap = getTakenCourseGradeMap(profile);
  const lowGradeWarnings: string[] = [];
  const retakeRecommendations: string[] = [];
  const retakeCourseIds: string[] = [];
  const recommendationNotes: string[] = [];
  const scoreAdjustments: ScoreAdjustment[] = [];
  let totalPenalty = 0;
  let hasDirectCareerPenalty = false;

  for (const course of takenCourses) {
    const grade = takenCourseGradeMap.get(course.id);

    if (!grade || grade === "P") {
      continue;
    }

    if (!course.isCore && !course.isMajorImportant) {
      continue;
    }

    const threshold = course.retakeThreshold ?? LOW_GRADE_THRESHOLD;
    if (!isLowGrade(grade, threshold)) {
      continue;
    }

    const courseLabel = getCourseLabel(course);
    const directlyRelevant =
      career.coreCourseIds.includes(course.id) ||
      course.tags.some(
        (tag) =>
          career.requiredTags.includes(tag) || career.optionalTags.includes(tag)
      );

    let delta = getPenaltyDelta(course, grade);

    if (career.coreCourseIds.includes(course.id)) {
      delta += getCareerDirectPenaltyDelta(grade);
      hasDirectCareerPenalty = true;
    }

    totalPenalty += delta;
    scoreAdjustments.push({
      reason: `${courseLabel} ${course.name} 성적 ${grade} 반영`,
      delta,
    });

    lowGradeWarnings.push(
      directlyRelevant
        ? `${courseLabel}인 ${course.name}의 성적이 ${grade}로 확인되어, ${career.name} 진로 준비도에 불리하게 작용합니다.`
        : `${courseLabel}인 ${course.name}의 성적이 ${grade}로 확인되어, 관련 역량 평가에 주의가 필요합니다.`
    );

    if (isRetakeRecommended(course, grade)) {
      retakeCourseIds.push(course.id);
      retakeRecommendations.push(
        `${course.name}은(는) 후속 학습의 기반이 되는 과목이라 재수강 또는 보완 학습을 권장합니다.`
      );
    }
  }

  if (scoreAdjustments.length > 0) {
    recommendationNotes.push(
      "주요 과목 성취도가 낮아 현재 추천 점수에 감점이 반영되었습니다."
    );
  }

  if (hasDirectCareerPenalty) {
    recommendationNotes.push(
      "선택한 진로와 직접 연결되는 핵심 과목의 저성적이 추가 감점으로 반영되었습니다."
    );
  }

  if (retakeRecommendations.length > 0) {
    recommendationNotes.push(
      "후속 학습의 기반이 되는 과목은 재수강 또는 보완 학습을 우선 검토하는 편이 좋습니다."
    );
  }

  return {
    totalPenalty,
    lowGradeWarnings: Array.from(new Set(lowGradeWarnings)),
    retakeRecommendations: Array.from(new Set(retakeRecommendations)),
    retakeCourseIds: Array.from(new Set(retakeCourseIds)),
    recommendationNotes: Array.from(new Set(recommendationNotes)),
    scoreAdjustments,
  };
}

export function calcScore(
  career: Career,
  takenCourses: Course[],
  profile: StudentProfile,
  gradeAdjustmentInput = 0
): ScoreBreakdown {
  // TODO: 향후 course-level penalty를 넘어서 전체 grade distribution도 함께 반영 가능
  const courseWeightMap = getCourseWeightMap(profile);
  const tagStrengthMap = new Map<string, number>();

  for (const course of takenCourses) {
    const courseWeight =
      courseWeightMap.get(course.id) ?? DEFAULT_GRADE_WEIGHT;

    for (const tag of course.tags) {
      const currentWeight = tagStrengthMap.get(tag) ?? 0;
      tagStrengthMap.set(tag, Math.max(currentWeight, courseWeight));
    }
  }

  const { coverage: requiredCoverage, score: requiredScore } =
    calculateCoverageScore(
      career.requiredTags,
      tagStrengthMap,
      REQUIRED_TAG_SCORE_MAX
    );
  const { coverage: optionalCoverage, score: optionalScore } =
    calculateCoverageScore(
      career.optionalTags,
      tagStrengthMap,
      OPTIONAL_TAG_SCORE_MAX
    );

  const normalizedKeywords = Array.from(
    new Set(profile.interestKeywords.map(normalizeKeyword).filter(Boolean))
  );
  const aliases = Array.from(
    new Set(
      [career.id, career.name, ...(career.keywordAliases ?? [])]
        .map(normalizeKeyword)
        .filter(Boolean)
    )
  );

  const keywordMatches = normalizedKeywords.filter((keyword) =>
    aliases.some((alias) => alias === keyword || alias.includes(keyword) || keyword.includes(alias))
  );
  const keywordBonus = Math.min(
    keywordMatches.length * KEYWORD_BONUS_PER_MATCH,
    KEYWORD_BONUS_MAX
  );

  const primaryMajorBonus =
    career.preferredMajors?.includes(profile.primaryMajor)
      ? PRIMARY_MAJOR_BONUS
      : 0;
  const secondaryMajorBonus =
    profile.secondaryMajor && career.preferredMajors?.includes(profile.secondaryMajor)
      ? SECONDARY_MAJOR_BONUS
      : 0;
  const majorFitBonus = primaryMajorBonus + secondaryMajorBonus;

  const relatedCourseCount = takenCourses.filter((course) =>
    isCareerRelatedCourse(course, career)
  ).length;
  const evidencePenaltyMultiplier =
    calculateEvidencePenaltyMultiplier(relatedCourseCount);

  const gradeAdjustment = clamp(
    gradeAdjustmentInput,
    GRADE_ADJUSTMENT_MIN,
    GRADE_ADJUSTMENT_MAX
  );
  const preEvidenceRaw =
    requiredScore + optionalScore + keywordBonus + majorFitBonus + gradeAdjustment;
  const total = clamp(
    Math.round(preEvidenceRaw * evidencePenaltyMultiplier),
    0,
    100
  );

  return {
    requiredCoverage,
    optionalCoverage,
    majorFitBonus: roundTo(majorFitBonus, 1),
    keywordBonus: roundTo(keywordBonus, 1),
    gradeAdjustment: roundTo(gradeAdjustment, 1),
    evidencePenaltyMultiplier,
    relatedCourseCount,
    total,
  };
}

export function buildReasons(
  career: Career,
  matchedTags: string[],
  missingTags: string[],
  profile: StudentProfile
): string[] {
  const reasons: string[] = [];

  if (matchedTags.length > 0) {
    const tagNames = matchedTags
      .slice(0, 3)
      .map((t) => skillTagLabels[t] ?? t)
      .join(", ");
    reasons.push(`수강한 과목에서 ${tagNames} 역량을 이미 보유하고 있습니다.`);
  }

  if (career.preferredMajors?.includes(profile.primaryMajor)) {
    reasons.push(
      `${profile.primaryMajor} 전공 배경이 ${career.name} 진로와 직접 연결됩니다.`
    );
  }

  if (
    profile.secondaryMajor &&
    career.preferredMajors?.includes(profile.secondaryMajor)
  ) {
    reasons.push(
      `${profile.primaryMajor}과 ${profile.secondaryMajor} 복수전공 조합은 이 진로에서 강점이 됩니다.`
    );
  }

  if (missingTags.length === 0) {
    reasons.push("필수 역량을 모두 충족하고 있어 즉시 진입이 가능한 상태입니다.");
  } else {
    const missingNames = missingTags
      .slice(0, 2)
      .map((t) => skillTagLabels[t] ?? t)
      .join(", ");
    reasons.push(
      `${missingNames} 역량을 보완하면 경쟁력이 크게 높아집니다.`
    );
  }

  return reasons;
}
