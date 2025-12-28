import { GenerateRequest, StoryboardResult, validateStoryboard } from "./schema";
import { buildGeminiPrompt, coerceStoryboard } from "./prompts";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
const GEMINI_BASE_URL =
  process.env.GEMINI_API_BASE ||
  process.env.GOOGLE_CLOUD_API_BASE ||
  "https://generativelanguage.googleapis.com";
const GEMINI_URL = `${GEMINI_BASE_URL}/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function requestGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY/GOOGLE_API_KEY/GOOGLE_CLOUD_API_KEY is missing");
  }

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
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
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini request failed: ${res.status} ${text}`);
  }

  return res.json();
}

function extractText(response: any): string {
  const candidates = response?.candidates || [];
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
  claudeMeta: { hook: string; cta: string; titles: string[] }
): Promise<StoryboardResult> {
  const prompt = buildGeminiPrompt(voiceover, input);
  const result = await requestGemini(prompt);
  const text = extractText(result);
  const parsed = parseStoryboard(text);
  return {
    ...parsed,
    hook: claudeMeta.hook,
    cta: claudeMeta.cta,
    titles: claudeMeta.titles,
    voiceover,
    platform: input.platform,
    duration_sec: input.duration,
    template: input.template,
    style: "to_c_natural",
  };
}
