import { z } from "zod";

export const requestSchema = z.object({
  topic: z.string().min(1).max(120),
  platform: z.enum(["douyin", "shipinhao", "xiaohongshu"]),
  duration: z.union([z.literal(15), z.literal(30), z.literal(60)]),
  template: z.enum(["pain_point_hook", "product_reco", "story_emotion"]),
  persona: z
    .enum(["natural", "professional", "funny", "warm"])
    .optional()
    .default("natural"),
  must_include: z.string().max(200).optional().default(""),
  avoid: z.string().max(200).optional().default(""),
});

const shotSchema = z.object({
  shot: z.number().int().positive(),
  sec: z.number().int().positive(),
  visual: z.string(),
  camera: z.string(),
  subtitle: z.string(),
  bgm_sfx: z.string(),
  veo_prompt: z.string(),
  negative_prompt: z.string(),
});

export const storyboardSchema = z.object({
  platform: z.enum(["douyin", "shipinhao", "xiaohongshu"]),
  duration_sec: z.union([z.literal(15), z.literal(30), z.literal(60)]),
  template: z.enum(["pain_point_hook", "product_reco", "story_emotion"]),
  style: z.literal("to_c_natural"),
  titles: z.array(z.string()).length(10),
  hook: z.string(),
  voiceover: z.string(),
  cta: z.string(),
  shots: z.array(shotSchema),
});

export type StoryboardResult = z.infer<typeof storyboardSchema>;
export type GenerateRequest = z.infer<typeof requestSchema>;

export function checkShotCounts(shots: StoryboardResult["shots"], duration: StoryboardResult["duration_sec"]): boolean {
  const length = shots.length;
  const rules: Record<StoryboardResult["duration_sec"], [number, number]> = {
    15: [4, 6],
    30: [6, 9],
    60: [10, 14],
  };
  const [min, max] = rules[duration];
  return length >= min && length <= max;
}

export function checkDuration(shots: StoryboardResult["shots"], duration: StoryboardResult["duration_sec"]): boolean {
  const total = shots.reduce((acc, shot) => acc + shot.sec, 0);
  return Math.abs(total - duration) <= 3;
}

export function validateStoryboard(payload: unknown): StoryboardResult {
  const parsed = storyboardSchema.parse(payload);
  if (!checkShotCounts(parsed.shots, parsed.duration_sec)) {
    throw new Error("Shot count does not meet duration rules");
  }
  if (!checkDuration(parsed.shots, parsed.duration_sec)) {
    throw new Error("Shot durations do not sum to expected range");
  }
  return parsed;
}
