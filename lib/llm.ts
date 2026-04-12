import "server-only";

import OpenAI from "openai";
import { z } from "zod";

import { courseMap, skillTagLabels } from "./sample-data";
import {
  CareerRecommendation,
  ExplainResponse,
  RoadmapPhase,
  StudentProfile,
} from "./types";

const roadmapPhaseSchema = z.object({
  phase: z.number().int(),
  title: z.string(),
  description: z.string(),
  courseIds: z.array(z.string()),
});

const certificationRecommendationSchema = z.object({
  name: z.string(),
  reason: z.string(),
  priority: z.enum(["high", "medium", "low"]).optional(),
});

const explainResponseSchema = z.object({
  headline: z.string(),
  fitSummary: z.string(),
  evidence: z.array(z.string()),
  caution: z.string(),
  roadmap: z.array(roadmapPhaseSchema),
  recommendedCertifications: z.array(certificationRecommendationSchema),
});

function buildFallback(
  rec: CareerRecommendation
): ExplainResponse {
  const matchedNames = rec.matchedTags
    .slice(0, 3)
    .map((t) => skillTagLabels[t] ?? t)
    .join(", ");
  const missingNames = rec.missingTags
    .map((t) => skillTagLabels[t] ?? t)
    .join(", ");
  const confidenceSupport = rec.confidenceHighlights.join(", ");

  const roadmap: RoadmapPhase[] = [
    {
      phase: 1,
      title: "기초 역량 점검",
      description: `현재 보유한 ${matchedNames || "역량"}을 바탕으로 관련 프로젝트를 경험해보세요.`,
      courseIds: rec.recommendedCourseIds.slice(0, 1),
    },
    {
      phase: 2,
      title: "부족 역량 보완",
      description:
        missingNames
          ? `${missingNames} 관련 과목을 수강해 핵심 역량을 채우세요.`
          : confidenceSupport
          ? `${confidenceSupport}를 통해 추천 근거를 더 보강하세요.`
          : "심화 과목을 통해 전문성을 높이세요.",
      courseIds: rec.recommendedCourseIds.slice(1, 2),
    },
    {
      phase: 3,
      title: "실전 적용",
      description: `${rec.careerName} 직무에 맞는 포트폴리오 또는 인턴십 경험을 쌓으세요.`,
      courseIds: rec.recommendedCourseIds.slice(2),
    },
  ];

  return {
    headline: `${rec.careerName} 탐색 적합도 ${rec.fitScore}점`,
    fitSummary: `${rec.fitSummary} ${rec.confidenceSummary}`,
    evidence: [rec.reasonSummary, ...rec.reasons, ...rec.recommendationNotes].slice(0, 4),
    caution:
      rec.lowGradeWarnings.length > 0
        ? rec.lowGradeWarnings[0]
        : rec.missingTags.length > 0
        ? `${missingNames} 역량을 보완하면 탐색 적합도를 더 높일 수 있습니다.`
        : rec.confidenceLevel === "low"
        ? rec.confidenceSummary
        : "현재 점수 기준으로는 방향성과 추천 근거가 함께 확인됩니다.",
    roadmap,
    recommendedCertifications: rec.recommendedCertifications,
  };
}

function buildPrompt(rec: CareerRecommendation, profile: StudentProfile): string {
  const takenCourseNames = profile.takenCourseIds
    .map((id) => courseMap[id]?.name ?? id)
    .join(", ");
  const recommendedNames = rec.recommendedCourseIds
    .map((id) => courseMap[id]?.name ?? id)
    .join(", ");

  return `당신은 대학생 진로 상담 전문가입니다. 아래 데이터를 바탕으로 한국어로 진로 해설을 작성해주세요.
규칙: 제공된 데이터에 없는 정보를 만들어내지 마세요.

학생 정보:
- 학번 트랙: ${profile.studentYearTrack}
- 주전공: ${profile.primaryMajor}
- 복수전공: ${profile.secondaryMajor ?? "없음"}
- 수강 과목: ${takenCourseNames || "없음"}
- 관심 키워드: ${profile.interestKeywords.join(", ") || "없음"}

추천 진로: ${rec.careerName} (탐색 적합도 ${rec.fitScore}점, 추천 확신도 ${rec.confidenceScore}점, 확신도 ${rec.confidenceLabel})
방향 설명: ${rec.fitSummary}
근거 설명: ${rec.confidenceSummary}
보유 역량: ${rec.matchedTags.map((t) => skillTagLabels[t] ?? t).join(", ") || "없음"}
부족 역량: ${rec.missingTags.map((t) => skillTagLabels[t] ?? t).join(", ") || "없음"}
추천 근거 보강 포인트: ${rec.confidenceHighlights.join(", ") || "없음"}
보완 추천 과목: ${recommendedNames || "없음"}
저성적 경고: ${rec.lowGradeWarnings.join(" | ") || "없음"}
재수강 권장: ${rec.retakeRecommendations.join(" | ") || "없음"}
추천 자격증: ${rec.recommendedCertifications.map((item) => item.name).join(", ") || "없음"}

아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요:
중요:
- "방향성"과 "근거 충분도"를 섞지 마세요.
- 부족 역량이 없으면 근거 부족을 역량 부족처럼 쓰지 마세요.
- 필수 역량이 충족된 경우 "핵심 역량 공백" 같은 표현을 쓰지 마세요.
{
  "headline": "한 줄 요약 (최대 30자)",
  "fitSummary": "방향성과 근거를 구분한 해설 (2~3문장)",
  "evidence": ["근거1", "근거2", "근거3"],
  "caution": "보완 포인트 한 문장",
  "recommendedCertifications": [
    { "name": "자격증명", "reason": "추천 이유", "priority": "high" }
  ],
  "roadmap": [
    { "phase": 1, "title": "단계명", "description": "설명", "courseIds": [] },
    { "phase": 2, "title": "단계명", "description": "설명", "courseIds": [] },
    { "phase": 3, "title": "단계명", "description": "설명", "courseIds": [] }
  ]
}`;
}

export async function generateExplanation(
  rec: CareerRecommendation,
  profile: StudentProfile
): Promise<ExplainResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildFallback(rec);
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: buildPrompt(rec, profile) }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return buildFallback(rec);
    }

    const parsed = explainResponseSchema.safeParse(JSON.parse(content));
    return parsed.success ? parsed.data : buildFallback(rec);
  } catch {
    return buildFallback(rec);
  }
}
