import { NextResponse } from "next/server";
import { generateExplanation } from "@/lib/llm";
import { ExplainApiResponse, ExplainRequest } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ExplainRequest>;

    if (
      !body.recommendation ||
      !body.profile ||
      typeof body.recommendation.careerId !== "string" ||
      typeof body.recommendation.careerName !== "string"
    ) {
      return NextResponse.json<ExplainApiResponse>(
        { error: "recommendation과 profile 필드가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await generateExplanation(body.recommendation, body.profile);
    return NextResponse.json<ExplainApiResponse>(result);
  } catch {
    return NextResponse.json<ExplainApiResponse>(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
