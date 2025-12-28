const globalBucket = globalThis as unknown as {
  __rateLimit__?: Map<string, { count: number; resetAt: number }>;
};

const bucket = (globalBucket.__rateLimit__ ||= new Map());

const ONE_DAY = 24 * 60 * 60 * 1000;

export function checkRateLimit(identifier: string, limit = 3) {
  const now = Date.now();
  const entry = bucket.get(identifier);
  if (!entry || entry.resetAt < now) {
    bucket.set(identifier, { count: 1, resetAt: now + ONE_DAY });
    return { allowed: true, remaining: limit - 1, resetAt: now + ONE_DAY };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  bucket.set(identifier, entry);
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
