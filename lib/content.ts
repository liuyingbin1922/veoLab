import { GenerateRequest } from "./schema";
import { buildContentPrompt, enforceTitles } from "./prompts";
import { getGenerativeModel } from "./vertex";

const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || process.env.GEMINI_MODEL || "gemini-1.5-pro";

export type ContentResult = {
  titles: string[];
  hook: string;
  voiceover: string;
  cta: string;
};

async function requestGeminiText(prompt: string) {
  const model = getGenerativeModel(GEMINI_TEXT_MODEL);
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
      maxOutputTokens: 1200,
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

function tryParseJSON(text: string | null | undefined): any {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJSON(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  return match?.[0] ?? "";
}

export async function generateGeminiContent(input: GenerateRequest): Promise<ContentResult> {
  const prompt = buildContentPrompt(input);
  const response = await requestGeminiText(prompt);
  const text = extractText(response);
  const parsed = tryParseJSON(text) ?? tryParseJSON(extractJSON(text));

  if (!parsed) {
    throw new Error("Gemini response is not valid JSON");
  }

  return {
    titles: enforceTitles(parsed.titles || []),
    hook: parsed.hook || "",
    voiceover: parsed.voiceover || "",
    cta: parsed.cta || "",
  };
}
