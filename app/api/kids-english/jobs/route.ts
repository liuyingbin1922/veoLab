import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateKidsEnglishPlan } from "@/packages/core/src/kidsEnglish/generatePlan";
import { createKidsEnglishJob } from "@/lib/jobs";

const requestSchema = z.object({
  type: z.enum(["word", "grammar"]),
  key: z.string().min(1),
  grade: z.string().min(1),
  resolution: z.union([z.literal(720), z.literal(1080)]),
});

export async function POST(req: NextRequest) {
  try {
    const payload = requestSchema.parse(await req.json());
    const plan = generateKidsEnglishPlan({ type: payload.type, key: payload.key, grade: payload.grade });
    const job = createKidsEnglishJob({
      type: payload.type,
      key: payload.key,
      grade: payload.grade,
      resolution: payload.resolution,
      plan,
    });
    return NextResponse.json({ ok: true, data: job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create job";
    const status = message.toLowerCase().includes("invalid") ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
