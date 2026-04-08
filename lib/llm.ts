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

const explainResponseSchema = z.object({
  headline: z.string(),
  fitSummary: z.string(),
  evidence: z.array(z.string()),
  caution: z.string(),
  roadmap: z.array(roadmapPhaseSchema),
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
    headline: `${rec.careerName} 적합도 ${rec.score}점`,
    fitSummary: rec.summary,
    evidence: rec.reasons,
    caution:
      rec.missingTags.length > 0
        ? `${missingNames} 역량을 보완하면 취업 경쟁력이 크게 향상됩니다.`
        : "현재 역량으로 충분히 진입 가능한 진로입니다.",
    roadmap,
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

추천 진로: ${rec.careerName} (적합도 ${rec.score}점)
보유 역량: ${rec.matchedTags.map((t) => skillTagLabels[t] ?? t).join(", ") || "없음"}
부족 역량: ${rec.missingTags.map((t) => skillTagLabels[t] ?? t).join(", ") || "없음"}
보완 추천 과목: ${recommendedNames || "없음"}

아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요:
{
  "headline": "한 줄 요약 (최대 30자)",
  "fitSummary": "이 진로와 학생의 적합성 설명 (2~3문장)",
  "evidence": ["근거1", "근거2", "근거3"],
  "caution": "보완 포인트 한 문장",
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
