import { Career, Course, ScoreBreakdown, StudentProfile } from "./types";
import { skillTagLabels } from "./sample-data";

const REQUIRED_TAG_SCORE_MAX = 60;
const OPTIONAL_TAG_SCORE_MAX = 15;
const KEYWORD_BONUS_PER_MATCH = 4;
const KEYWORD_BONUS_MAX = 8;
const PRIMARY_MAJOR_BONUS = 4;
const SECONDARY_MAJOR_BONUS = 2;

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function calcScore(
  career: Career,
  takenCourses: Course[],
  profile: StudentProfile
): ScoreBreakdown {
  const ownedTags = Array.from(
    new Set(takenCourses.flatMap((course) => course.tags))
  );
  const matchedRequired = career.requiredTags.filter((t) =>
    ownedTags.includes(t)
  );
  const matchedOptional = career.optionalTags.filter((t) =>
    ownedTags.includes(t)
  );

  const requiredCoverage =
    career.requiredTags.length > 0
      ? matchedRequired.length / career.requiredTags.length
      : 0;
  const optionalCoverage =
    career.optionalTags.length > 0
      ? matchedOptional.length / career.optionalTags.length
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

  const evidencePenalty =
    relatedCourseCount <= 1 ? -18 : relatedCourseCount === 2 ? -10 : relatedCourseCount === 3 ? -4 : 0;

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
