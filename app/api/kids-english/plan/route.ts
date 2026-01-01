import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateKidsEnglishPlan } from "@/packages/core/src/kidsEnglish/generatePlan";

const requestSchema = z.object({
  type: z.enum(["word", "grammar"]),
  key: z.string().min(1),
  grade: z.string().min(1),
  langPair: z.literal("zh+en").default("zh+en"),
  aspectRatio: z.literal("9:16").default("9:16"),
  segmentSeconds: z.literal(6).default(6),
});

export async function POST(req: NextRequest) {
  try {
    const payload = requestSchema.parse(await req.json());
    const plan = generateKidsEnglishPlan({ type: payload.type, key: payload.key, grade: payload.grade });
    return NextResponse.json({ ok: true, data: plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid payload";
    const status = message.toLowerCase().includes("invalid") ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
