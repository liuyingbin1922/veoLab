import { GenerateRequest, StoryboardResult } from "./schema";

export function buildClaudePrompt(input: GenerateRequest): string {
  const { topic, platform, duration, template, persona = "natural", must_include = "", avoid = "" } = input;
  return `选题：${topic}
平台：${platform}
时长：${duration}秒
模板：${template}
人设：${persona}
必须出现：${must_include}
禁忌：${avoid}

请只输出 JSON：
{
  "titles": ["...共10个"],
  "hook": "1句3秒开头",
  "voiceover": "完整口语旁白稿",
  "cta": "结尾互动引导"
}
要求：
- ToC 真实自然，避免营销腔
- 不出现夸张承诺（如“保证”“100%”“立刻变现”等)`;
}

export function buildGeminiPrompt(voiceover: string, input: GenerateRequest): string {
  const { platform, duration, template, must_include = "", avoid = "" } = input;
  return `你是短视频编导。请将旁白改写为分镜，并只输出符合 schema 的 JSON。

参数：
- 平台：${platform}
- 时长：${duration}秒
- 模板：${template}
- 风格：真实自然、普通人可拍
- 必须出现：${must_include}
- 禁忌：${avoid}

旁白稿：
${voiceover}

硬性要求：
- 15s=4~6镜头；30s=6~9；60s=10~14
- 每镜头必须包含 veo_prompt 与 negative_prompt
- veo_prompt 要包含：场景、主体、动作、风格、光线、镜头、画质、比例（9:16）
- negative_prompt 包含禁忌项与常见不希望出现内容（水印、logo、文字错误、畸形手、糊、闪烁等）
- 只输出 JSON，不要解释`;
}

export function enforceTitles(titles: string[]): string[] {
  const normalized = titles.filter((title) => title && title.trim());
  while (normalized.length < 10) {
    normalized.push(`${normalized.length + 1}. 待补充标题`);
  }
  return normalized.slice(0, 10);
}

export function coerceStoryboard(raw: StoryboardResult): StoryboardResult {
  return {
    ...raw,
    titles: enforceTitles(raw.titles),
    shots: raw.shots.map((shot, index) => ({ ...shot, shot: shot.shot || index + 1 })),
  };
}
