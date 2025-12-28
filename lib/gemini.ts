import { GenerateRequest, StoryboardResult, validateStoryboard } from "./schema";
import { buildGeminiPrompt, coerceStoryboard } from "./prompts";
import { getGenerativeModel } from "./vertex";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";

async function requestGemini(prompt: string) {
  const model = getGenerativeModel(GEMINI_MODEL);
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.6,
      topK: 40,
      topP: 0.95,
    },
  });
  return result.response;
}

function extractText(response: any): string {
  const payload = response?.response ?? response;
  const candidates = payload?.candidates || [];
  const first = candidates[0];
  const parts = first?.content?.parts || [];
  const textPart = parts.find((part: any) => part.text);
  return textPart?.text || "";
}

function parseStoryboard(text: string): StoryboardResult {
  const primary = tryParseJSON(text);
  const fallback = tryParseJSON(extractJSON(text));
  const parsed = primary || fallback;
  if (!parsed) {
    throw new Error("Gemini did not return valid JSON");
  }
  const coerced = coerceStoryboard(parsed as StoryboardResult);
  return validateStoryboard(coerced);
}

function tryParseJSON(text: string | null | undefined): any {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

function extractJSON(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  return match?.[0] ?? "";
}

export async function generateStoryboard(
  voiceover: string,
  input: GenerateRequest,
  contentMeta: { hook: string; cta: string; titles: string[] }
): Promise<StoryboardResult> {
  const prompt = buildGeminiPrompt(voiceover, input);
  const result = await requestGemini(prompt);
  const text = extractText(result);
  const parsed = parseStoryboard(text);
  return {
    ...parsed,
    hook: contentMeta.hook,
    cta: contentMeta.cta,
    titles: contentMeta.titles,
    voiceover,
    platform: input.platform,
    duration_sec: input.duration,
    template: input.template,
    style: "to_c_natural",
  };
}
