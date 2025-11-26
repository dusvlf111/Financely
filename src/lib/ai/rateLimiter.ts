const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

const requestLog = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
}

function pruneOldEntries(timestamps: number[], now: number): number[] {
  return timestamps.filter((ts) => now - ts < WINDOW_MS);
}

export function consumeRateLimit(
  userId: string,
  now = Date.now()
): RateLimitResult {
  const previous = requestLog.get(userId) ?? [];
  const recent = pruneOldEntries(previous, now);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterMs = WINDOW_MS - (now - recent[0]);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 0),
    };
  }

  recent.push(now);
  requestLog.set(userId, recent);

  return {
    allowed: true,
    remaining: Math.max(MAX_REQUESTS_PER_WINDOW - recent.length, 0),
  };
}

export function resetRateLimiter(): void {
  requestLog.clear();
}
