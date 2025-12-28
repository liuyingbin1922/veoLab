import { GenerateRequest } from "./schema";
import { buildClaudePrompt, enforceTitles } from "./prompts";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";

async function requestClaude(body: unknown) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing");
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude request failed: ${res.status} ${text}`);
  }

  return res.json();
}

export type ClaudeResult = {
  titles: string[];
  hook: string;
  voiceover: string;
  cta: string;
};

export async function generateClaudeContent(input: GenerateRequest): Promise<ClaudeResult> {
  const prompt = buildClaudePrompt(input);
  const payload = {
    model: CLAUDE_MODEL,
    max_tokens: 1200,
    temperature: 0.6,
    system: "你是 ToC 短视频运营专家，擅长抖音/视频号/小红书爆款结构。语言自然，不夸大，不虚假承诺。",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  } as const;

  const response = await requestClaude(payload);
  const content = (response?.content?.[0]?.text as string | undefined) || "";
  const parsed = tryParseJSON(content) ?? tryParseJSON(extractJSON(content));
  if (!parsed) {
    throw new Error("Claude response is not valid JSON");
  }

  return {
    titles: enforceTitles(parsed.titles || []),
    hook: parsed.hook || "",
    voiceover: parsed.voiceover || "",
    cta: parsed.cta || "",
  };
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
