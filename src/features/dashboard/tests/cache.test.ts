import { describe, expect, it } from "vitest";

import { createQuoteCache } from "../services/quoteCache";

describe("cache de cotações em memória", () => {
  it("compartilha uma consulta em andamento e guarda o valor até o TTL", async () => {
    const cache = createQuoteCache({ ttlMs: 1_000, timeoutMs: 500 });
    let calls = 0;
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const first = cache.read("overview", 0, async () => {
      calls += 1;
      await gate;
      return { asOf: "2026-01-15T18:00:00.000Z" };
    });
    const second = cache.read("overview", 0, async () => {
      calls += 1;
      return { asOf: "outro" };
    });
    await Promise.resolve();
    release?.();

    const [left, right] = await Promise.all([first, second]);
    expect(calls).toBe(1);
    expect(left.ok && right.ok && left.value).toEqual(right.ok ? right.value : null);
    expect(left.ok && left.outcome).toBe("SIMULATED");

    const reused = await cache.read("overview", 500, async () => ({ asOf: "novo" }));
    expect(reused).toMatchObject({ ok: true, outcome: "CACHE_REUSED", value: { asOf: "2026-01-15T18:00:00.000Z" } });

    const expired = await cache.read("overview", 1_000, async () => ({ asOf: "2026-01-15T18:00:00.000Z" }));
    expect(expired).toMatchObject({ ok: true, outcome: "SIMULATED" });
  });

  it("encerra consulta que não responde", async () => {
    const cache = createQuoteCache({ timeoutMs: 20 });
    const read = await cache.read("overview", 0, () => new Promise(() => undefined));
    expect(read).toEqual({ ok: false, outcome: "UNAVAILABLE" });
  });
});
