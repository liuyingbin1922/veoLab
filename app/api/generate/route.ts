import { NextRequest, NextResponse } from "next/server";
import { cacheKey, getCache, setCache } from "@/lib/cache";
import { generateGeminiContent } from "@/lib/content";
import { generateStoryboard } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimit";
import { requestSchema } from "@/lib/schema";

function clientIp(req: NextRequest) {
  const header = req.headers.get("x-forwarded-for");
  if (header) return header.split(",")[0];
  // @ts-expect-error NextRequest has ip in node runtime
  return req.ip || "anonymous";
}

async function retry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Unknown error");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = requestSchema.parse(body);
    const ip = clientIp(req);
    const limit = checkRateLimit(ip, Number(process.env.RATE_LIMIT_PER_IP ?? 3));
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Rate limit exceeded", meta: { resetAt: limit.resetAt } },
        { status: 429 }
      );
    }

    const contentModel = process.env.GEMINI_TEXT_MODEL || process.env.GEMINI_MODEL || "gemini-1.5-pro";
    const storyboardModel = process.env.GEMINI_MODEL || "gemini-1.5-pro";
    const key = cacheKey(input);
    const cached = getCache(key);
    if (cached) {
      return NextResponse.json({
        ok: true,
        data: cached,
        meta: {
          cached: true,
          provider: { content: contentModel, storyboard: storyboardModel },
          latency_ms: 0,
        },
      });
    }

    const start = Date.now();
    const content = await retry(() => generateGeminiContent(input));
    
    // 输出解析后的 content 用于调试
    console.log("[api] Content result:", JSON.stringify(content, null, 2));
    
    const storyboard = await retry(() => generateStoryboard(content.voiceover, input, content));
    
    // 输出解析后的 storyboard 用于调试
    console.log("[api] Storyboard result:", JSON.stringify(storyboard, null, 2));

    setCache(key, storyboard);

    return NextResponse.json({
      ok: true,
      data: storyboard,
      meta: {
        cached: false,
        provider: { content: contentModel, storyboard: storyboardModel },
        latency_ms: Date.now() - start,
      },
    });
  } catch (error) {
    console.error("/api/generate error", error);
    
    // 如果错误包含原始响应，在返回中也包含它
    const errorMessage = error instanceof Error ? error.message : "Unexpected error";
    const errorResponse: any = { ok: false, error: errorMessage };
    
    if (error && typeof error === "object" && "rawResponse" in error) {
      errorResponse.rawResponse = (error as any).rawResponse;
      console.error("/api/generate raw response:", (error as any).rawResponse);
    }
    
    if (error && typeof error === "object" && "cleanedResponse" in error) {
      errorResponse.cleanedResponse = (error as any).cleanedResponse;
    }
    
    if (error && typeof error === "object" && "fullResponse" in error) {
      errorResponse.fullResponse = (error as any).fullResponse;
    }
    
    // 如果错误包含 parsed JSON，也返回它
    if (error && typeof error === "object" && "parsed" in error) {
      errorResponse.parsed = (error as any).parsed;
    }
    
    const status = errorMessage.toLowerCase().includes("rate limit") ? 429 : errorMessage.toLowerCase().includes("invalid") ? 400 : 500;
    return NextResponse.json(errorResponse, { status });
  }
}
