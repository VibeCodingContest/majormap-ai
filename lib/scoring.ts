import {
  Career,
  Course,
  GradeValue,
  ScoreBreakdown,
  StudentProfile,
} from "./types";
import { skillTagLabels } from "./sample-data";

const REQUIRED_TAG_SCORE_MAX = 60;
const OPTIONAL_TAG_SCORE_MAX = 15;
const KEYWORD_BONUS_PER_MATCH = 4;
const KEYWORD_BONUS_MAX = 8;
const PRIMARY_MAJOR_BONUS = 4;
const SECONDARY_MAJOR_BONUS = 2;
const DEFAULT_GRADE_WEIGHT = 1;
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

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCourseWeightMap(profile: StudentProfile) {
  return new Map(
    profile.takenCourses.map((course) => [
      course.courseId,
      course.grade ? GRADE_WEIGHTS[course.grade] : DEFAULT_GRADE_WEIGHT,
    ])
  );
}

export function calcScore(
  career: Career,
  takenCourses: Course[],
  profile: StudentProfile
): ScoreBreakdown {
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

  const requiredCoverage =
    career.requiredTags.length > 0
      ? career.requiredTags.reduce(
          (sum, tag) => sum + (tagStrengthMap.get(tag) ?? 0),
          0
        ) / career.requiredTags.length
      : 0;
  const optionalCoverage =
    career.optionalTags.length > 0
      ? career.optionalTags.reduce(
          (sum, tag) => sum + (tagStrengthMap.get(tag) ?? 0),
          0
        ) / career.optionalTags.length
      : 0;

  const requiredTagScore = Math.round(requiredCoverage * REQUIRED_TAG_SCORE_MAX);
  const optionalTagScore = Math.round(optionalCoverage * OPTIONAL_TAG_SCORE_MAX);

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

  const primaryMajorBonus = career.preferredMajors?.includes(profile.primaryMajor)
    ? PRIMARY_MAJOR_BONUS
    : 0;
  const secondaryMajorBonus =
    profile.secondaryMajor && career.preferredMajors?.includes(profile.secondaryMajor)
      ? SECONDARY_MAJOR_BONUS
      : 0;

  const relatedCourseCount = takenCourses.filter(
    (course) =>
      career.coreCourseIds.includes(course.id) ||
      course.tags.some(
        (tag) =>
          career.requiredTags.includes(tag) || career.optionalTags.includes(tag)
      )
  ).length;
  const weightedRelatedEvidence = takenCourses.reduce((sum, course) => {
    const isRelated =
      career.coreCourseIds.includes(course.id) ||
      course.tags.some(
        (tag) =>
          career.requiredTags.includes(tag) || career.optionalTags.includes(tag)
      );

    if (!isRelated) {
      return sum;
    }

    return sum + (courseWeightMap.get(course.id) ?? DEFAULT_GRADE_WEIGHT);
  }, 0);

  const evidencePenalty =
    weightedRelatedEvidence <= 1
      ? -18
      : weightedRelatedEvidence <= 2
      ? -10
      : weightedRelatedEvidence <= 3
      ? -4
      : 0;

  const raw =
    requiredTagScore +
    optionalTagScore +
    keywordBonus +
    primaryMajorBonus +
    secondaryMajorBonus +
    evidencePenalty;
  const total = clamp(Math.round(raw), 0, 100);

  return {
    requiredTagScore,
    optionalTagScore,
    keywordBonus,
    primaryMajorBonus,
    secondaryMajorBonus,
    evidencePenalty,
    requiredCoveragePct: Math.round(requiredCoverage * 100),
    optionalCoveragePct: Math.round(optionalCoverage * 100),
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
