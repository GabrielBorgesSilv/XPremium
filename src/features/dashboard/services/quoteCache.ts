import "server-only";

import { QUOTE_CACHE_MS } from "./quoteCachePolicy";

export type CacheOutcome = "CACHE_REUSED" | "SIMULATED";

export type CacheRead<T> =
  | { ok: true; value: T; outcome: CacheOutcome }
  | { ok: false; outcome: "UNAVAILABLE" };

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

/**
 * Cache de cotações em memória, só neste processo.
 * Não é compartilhado entre instâncias serverless.
 */
export function createQuoteCache(options?: { ttlMs?: number; timeoutMs?: number }) {
  const ttlMs = options?.ttlMs ?? QUOTE_CACHE_MS;
  const timeoutMs = options?.timeoutMs ?? 1_000;
  const entries = new Map<string, CacheEntry>();
  const inflight = new Map<string, Promise<unknown>>();

  function readStored(key: string, now: number): unknown | undefined {
    const entry = entries.get(key);
    if (!entry) return undefined;
    if (now >= entry.expiresAt) {
      entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async function read<T>(key: string, now: number, load: () => Promise<T> | T): Promise<CacheRead<T>> {
    const stored = readStored(key, now);
    if (stored !== undefined) {
      return { ok: true, value: stored as T, outcome: "CACHE_REUSED" };
    }

    const pending = inflight.get(key);
    if (pending) {
      const joined = await settle(pending, timeoutMs);
      if (!joined.ok) return { ok: false, outcome: "UNAVAILABLE" };
      return { ok: true, value: joined.value as T, outcome: "SIMULATED" };
    }

    const promise = Promise.resolve().then(() => load());
    inflight.set(key, promise);
    try {
      const loaded = await settle(promise, timeoutMs);
      if (!loaded.ok) return { ok: false, outcome: "UNAVAILABLE" };
      entries.set(key, { value: loaded.value, expiresAt: now + ttlMs });
      return { ok: true, value: loaded.value as T, outcome: "SIMULATED" };
    } finally {
      inflight.delete(key);
    }
  }

  function keys(prefix: string): string[] {
    return [...entries.keys()].filter((key) => key.startsWith(prefix));
  }

  function fresh(prefix: string, now: number): boolean {
    const matched = keys(prefix);
    return matched.length > 0 && matched.every((key) => readStored(key, now) !== undefined);
  }

  return { read, keys, fresh };
}

export type QuoteCache = ReturnType<typeof createQuoteCache>;

function settle<T>(promise: Promise<T>, timeoutMs: number): Promise<{ ok: true; value: T } | { ok: false }> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ ok: false }), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve({ ok: true, value });
      },
      () => {
        clearTimeout(timer);
        resolve({ ok: false });
      },
    );
  });
}
