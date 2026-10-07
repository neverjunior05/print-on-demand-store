const windows = new Map<string, { hits: number; resetAt: number }>();

/** Small per-instance guard for demo auth/checkout routes; use a shared store in production. */
export function isRateLimited(key: string, limit = 12, windowMs = 60_000): boolean {
  const now = Date.now();
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { hits: 1, resetAt: now + windowMs });
    return false;
  }
  current.hits += 1;
  return current.hits > limit;
}
