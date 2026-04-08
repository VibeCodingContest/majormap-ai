import { Career, ScoreBreakdown, StudentProfile } from "./types";
import { skillTagLabels } from "./sample-data";

const REQUIRED_TAG_WEIGHT = 30;
const OPTIONAL_TAG_WEIGHT = 10;
const KEYWORD_BONUS_PER_MATCH = 8;
const MAJOR_COMBO_BONUS = 10;

// 점수 0~100 정규화 기준: 필수 태그 최대 3개 × 30 = 90, 선택 최대 3개 × 10 = 30 → 합산 후 /120 × 100
const MAX_RAW_SCORE = 120;

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

  // 관심 키워드가 진로 이름/태그와 겹치면 보너스
  const careerContext = [
    career.id,
    career.name,
    ...career.requiredTags,
    ...career.optionalTags,
  ]
    .join(" ")
    .toLowerCase();

  const keywordBonus = profile.interestKeywords.reduce((acc, kw) => {
    return careerContext.includes(kw.toLowerCase())
      ? acc + KEYWORD_BONUS_PER_MATCH
      : acc;
  }, 0);

  // 복수전공 보유 시 비즈니스/전략 태그에 보너스
  const majorComboBonus =
    profile.secondaryMajor &&
    (career.requiredTags.includes("business") ||
      career.requiredTags.includes("strategy") ||
      career.requiredTags.includes("consulting"))
      ? MAJOR_COMBO_BONUS
      : 0;

  const raw = requiredTagScore + optionalTagScore + keywordBonus + majorComboBonus;
  const total = Math.min(Math.round((raw / MAX_RAW_SCORE) * 100), 100);

  return {
    requiredTagScore,
    optionalTagScore,
    keywordBonus,
    majorComboBonus,
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

  if (profile.secondaryMajor) {
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
