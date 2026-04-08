import { NextResponse } from "next/server";
import { generateExplanation } from "@/lib/llm";
import { ExplainRequest } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ExplainRequest;

    if (!body.recommendation || !body.profile) {
      return NextResponse.json(
        { error: "recommendation과 profile 필드가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await generateExplanation(body.recommendation, body.profile);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
