import { GenerateRequest, StoryboardResult } from "./schema";
import { buildGeminiPrompt } from "./prompts";
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

// 清理文本，移除 markdown 代码块标记
function cleanText(text: string): string {
  if (!text) return text;
  
  // 移除 markdown 代码块标记（```json 或 ```）
  let cleaned = text.trim();
  
  // 移除开头的 ```json 或 ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  
  // 移除结尾的 ```
  cleaned = cleaned.replace(/\s*```$/g, "");
  
  return cleaned.trim();
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
  // 先清理 markdown 代码块
  const cleaned = cleanText(text);
  
  // 尝试直接解析清理后的文本
  if (tryParseJSON(cleaned)) {
    return cleaned;
  }
  
  // 如果不行，尝试提取 JSON 对象
  const match = cleaned.match(/\{[\s\S]*\}/);
  return match?.[0] ?? "";
}

export async function generateStoryboard(
  voiceover: string,
  input: GenerateRequest,
  contentMeta: { hook: string; cta: string; titles: string[] }
): Promise<StoryboardResult> {
  const prompt = buildGeminiPrompt(voiceover, input);
  const result = await requestGemini(prompt);
  const rawText = extractText(result);
  
  // 输出原始响应用于调试
  console.log("[storyboard] ===== Raw Gemini Response =====");
  console.log(rawText);
  console.log("[storyboard] ===== End Raw Response =====");
  console.log("[storyboard] Full response object:", JSON.stringify(result, null, 2));
  
  // 清理并提取 JSON
  const cleanedText = cleanText(rawText);
  console.log("[storyboard] Cleaned text:", cleanedText);
  
  const parsed = tryParseJSON(cleanedText) ?? tryParseJSON(extractJSON(cleanedText));
  
  if (!parsed) {
    const error = new Error("Gemini did not return valid JSON");
    (error as any).rawResponse = rawText;
    (error as any).cleanedResponse = cleanedText;
    (error as any).fullResponse = result;
    throw error;
  }
  
  console.log("[storyboard] Parsed JSON:", JSON.stringify(parsed, null, 2));

  // 提取 shots，支持多种数据结构
  let shots: any[] = [];
  if (parsed.shots && Array.isArray(parsed.shots)) {
    shots = parsed.shots;
  } else if (parsed.video_script?.shots && Array.isArray(parsed.video_script.shots)) {
    shots = parsed.video_script.shots;
  } else if (parsed.video_script && Array.isArray(parsed.video_script)) {
    shots = parsed.video_script;
  }

  // 转换字段名，做兜底兼容处理
  const transformedShots = shots.map((shot: any, index: number) => {
    // 字段映射，如果映射不上则使用原始值或默认值
    return {
      shot: shot.shot ?? shot.shot_num ?? index + 1,
      sec: shot.sec ?? shot.duration ?? 0,
      visual: shot.visual ?? shot.veo_prompt ?? "",
      camera: shot.camera ?? "",
      subtitle: shot.subtitle ?? shot.voiceover ?? "",
      bgm_sfx: shot.bgm_sfx ?? "",
      veo_prompt: shot.veo_prompt ?? "",
      negative_prompt: shot.negative_prompt ?? "",
      // 保留所有原始字段，以便前端可以访问
      ...shot,
    };
  });

  // 返回数据，保留原始结构的同时添加必需字段
  return {
    shots: transformedShots,
    hook: contentMeta.hook,
    cta: contentMeta.cta,
    titles: contentMeta.titles,
    voiceover,
    platform: input.platform,
    duration_sec: input.duration,
    template: input.template,
    style: "to_c_natural",
    // 保留原始解析的数据，以便调试和兜底
    _raw: parsed,
  } as any;
}
