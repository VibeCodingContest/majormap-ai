import { Career, ScoreBreakdown, StudentProfile } from "./types";
import { skillTagLabels } from "./sample-data";

const REQUIRED_TAG_WEIGHT = 30;
const OPTIONAL_TAG_WEIGHT = 10;
const KEYWORD_BONUS_PER_MATCH = 6;
const PRIMARY_MAJOR_BONUS = 10;
const SECONDARY_MAJOR_BONUS = 6;

// 점수 정규화 기준: 필수 90 + 선택 30 + 키워드 18 + 주전공 10 + 복수전공 6
const MAX_RAW_SCORE = 154;

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase();
}

export function calcScore(
  career: Career,
  ownedTags: string[],
  profile: StudentProfile
): ScoreBreakdown {
  const matchedRequired = career.requiredTags.filter((t) =>
    ownedTags.includes(t)
  );
  const matchedOptional = career.optionalTags.filter((t) =>
    ownedTags.includes(t)
  );

  const requiredTagScore = matchedRequired.length * REQUIRED_TAG_WEIGHT;
  const optionalTagScore = matchedOptional.length * OPTIONAL_TAG_WEIGHT;

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
  const keywordBonus = keywordMatches.length * KEYWORD_BONUS_PER_MATCH;

  const primaryMajorBonus = career.preferredMajors?.includes(profile.primaryMajor)
    ? PRIMARY_MAJOR_BONUS
    : 0;
  const secondaryMajorBonus =
    profile.secondaryMajor && career.preferredMajors?.includes(profile.secondaryMajor)
      ? SECONDARY_MAJOR_BONUS
      : 0;

  const raw =
    requiredTagScore +
    optionalTagScore +
    keywordBonus +
    primaryMajorBonus +
    secondaryMajorBonus;
  const total = Math.min(Math.round((raw / MAX_RAW_SCORE) * 100), 100);

  return {
    requiredTagScore,
    optionalTagScore,
    keywordBonus,
    primaryMajorBonus,
    secondaryMajorBonus,
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
