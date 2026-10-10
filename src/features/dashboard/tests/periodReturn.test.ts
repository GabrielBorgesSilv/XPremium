import { describe, expect, it } from "vitest";

import { changePercentFromPair } from "../domain/periodReturn";
import type { QuotePoint } from "../domain/types";

function point(overrides: Partial<QuotePoint> = {}): QuotePoint {
  return {
    value: 100,
    currency: "BRL",
    priceBasis: "ADJUSTED",
    origin: "SIMULATED",
    ...overrides,
  };
}

describe("variação entre dois preços", () => {
  it("calcula o percentual e devolve o preço final", () => {
    const result = changePercentFromPair({ start: point({ value: 80 }), end: point({ value: 100 }) });
    expect(result?.changePercent).toBe(25);
    expect(result?.end.currency).toBe("BRL");
    expect(result?.end.priceBasis).toBe("ADJUSTED");
  });

  it("aceita queda e recusa zero, nulo, NaN e infinito", () => {
    expect(changePercentFromPair({ start: point({ value: 200 }), end: point({ value: 150 }) })?.changePercent).toBe(
      -25,
    );
    expect(changePercentFromPair({ start: null, end: point() })).toBeNull();
    expect(changePercentFromPair({ start: point(), end: null })).toBeNull();
    expect(changePercentFromPair({ start: point({ value: 0 }), end: point({ value: 10 }) })).toBeNull();
    expect(changePercentFromPair({ start: point({ value: Number.NaN }), end: point() })).toBeNull();
    expect(
      changePercentFromPair({ start: point(), end: point({ value: Number.POSITIVE_INFINITY }) }),
    ).toBeNull();
  });

  it("recusa moeda, base ou origem diferentes", () => {
    expect(
      changePercentFromPair({ start: point({ currency: "BRL" }), end: point({ currency: "USD", value: 110 }) }),
    ).toBeNull();
    expect(
      changePercentFromPair({
        start: point({ priceBasis: "ADJUSTED" }),
        end: point({ priceBasis: "UNADJUSTED", value: 110 }),
      }),
    ).toBeNull();
    expect(
      changePercentFromPair({
        start: point({ origin: "SIMULATED" }),
        end: point({ origin: "REAL", value: 110 }),
      }),
    ).toBeNull();
  });
});
