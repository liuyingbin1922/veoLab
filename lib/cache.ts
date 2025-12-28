import crypto from "crypto";
import { GenerateRequest, StoryboardResult } from "./schema";

type CacheEntry = {
  value: StoryboardResult;
  expiresAt: number;
};

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const globalCache = globalThis as unknown as { __storyboardCache?: Map<string, CacheEntry> };

const cache = (globalCache.__storyboardCache ||= new Map<string, CacheEntry>());

export function cacheKey(input: GenerateRequest): string {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        topic: input.topic,
        platform: input.platform,
        duration: input.duration,
        template: input.template,
        persona: input.persona,
        must_include: input.must_include,
        avoid: input.avoid,
      })
    )
    .digest("hex");
}

export function getCache(key: string): StoryboardResult | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

export function setCache(key: string, value: StoryboardResult) {
  cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
}
