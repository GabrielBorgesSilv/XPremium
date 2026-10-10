import { describe, expect, it } from "vitest";

import { changePercentFromPair } from "../domain/periodReturn";
import { buildRanking } from "../domain/ranking";
import {
  DEMO_AS_OF,
  DEMO_ELIGIBILITY_NOTE,
  type FixedIncomeResponse,
  type MarketFixtureAsset,
  type PeriodPricePair,
  type RankingQuery,
} from "../domain/types";
import { fixedIncomeFixtures } from "../fixtures/fixedIncome.fixture";
import { marketFixtures } from "../fixtures/market.fixture";
import { getFixedIncome, queryFixedIncome } from "../services/fixedIncomeService";
import { createRankingProvider, getRankings, queryRankings } from "../services/rankingService";

const query: RankingQuery = { region: "BR", category: "STOCK", period: "1D" };

function demoAsset(
  overrides: Partial<MarketFixtureAsset> & Pick<MarketFixtureAsset, "assetId" | "symbol" | "changes">,
): MarketFixtureAsset {
  return {
    name: overrides.symbol,
    region: "BR",
    category: "STOCK",
    assetType: "STOCK",
    editorialRegion: "BR",
    quoteContext: "Cotação de demonstração em BRL.",
    eligible: true,
    liquidityMetric: 1,
    eligibilityNote: DEMO_ELIGIBILITY_NOTE,
    exclusionReason: null,
    currency: "BRL",
    priceValue: 100,
    priceBasis: "ADJUSTED",
    marketWindowNote: null,
    asOf: DEMO_AS_OF,
    origin: "SIMULATED",
    role: "gainer",
    ...overrides,
  };
}

function pair(start: number, end: number, currency = "BRL"): PeriodPricePair {
  return {
    start: { value: start, currency, priceBasis: "ADJUSTED", origin: "SIMULATED" },
    end: { value: end, currency, priceBasis: "ADJUSTED", origin: "SIMULATED" },
  };
}

describe("serviços de ranking e renda fixa", () => {
  it("ordena, limita a 10 e isola região, categoria e período", async () => {
    const provider = createRankingProvider(marketFixtures);
    const ranking = await provider.getRankings({ region: "INTL", category: "REAL_ESTATE", period: "7D" });
    const direct = getRankings({ region: "INTL", category: "REAL_ESTATE", period: "7D" });

    expect(ranking.gainers.map((row) => row.symbol)).toEqual(direct.gainers.map((row) => row.symbol));
    expect(ranking.gainers).toHaveLength(10);
    expect(ranking.losers).toHaveLength(10);
    expect(ranking.gainers.map((row) => row.changePercent)).toEqual(
      [...ranking.gainers.map((row) => row.changePercent)].sort((left, right) => right - left),
    );
    expect(ranking.losers.map((row) => row.changePercent)).toEqual(
      [...ranking.losers.map((row) => row.changePercent)].sort((left, right) => left - right),
    );
    const intlReit = new Set(
      marketFixtures.filter((asset) => asset.region === "INTL" && asset.category === "REAL_ESTATE").map((asset) => asset.symbol),
    );
    expect(ranking.gainers.concat(ranking.losers).every((row) => intlReit.has(row.symbol))).toBe(true);
    expect(ranking.coverage.description.toLowerCase().includes("todo mercado")).toBe(false);
    expect(ranking.coverage.description).toContain("Universo de demonstração analisado neste filtro");
  });

  it("recusa renda fixa e filtro inválido sem montar ranking", () => {
    const fixedIncome = queryRankings({ region: "BR", category: "FIXED_INCOME", period: "1D" });
    expect(fixedIncome.ok).toBe(false);
    if (!fixedIncome.ok) {
      expect(fixedIncome.error.code).toBe("INVALID_CATEGORY");
      expect(fixedIncome.error.details?.allowedValues).toEqual(["STOCK", "REAL_ESTATE", "ETF", "CRYPTO"]);
    }

    const invalidPeriod = queryRankings({ region: "BR", category: "STOCK", period: "2W" });
    expect(invalidPeriod.ok).toBe(false);
    if (!invalidPeriod.ok) expect(invalidPeriod.error.code).toBe("INVALID_QUERY");
  });

  it("devolve vazio e parcial sem completar a lista", () => {
    const empty = buildRanking([], query);
    expect(empty.gainers).toEqual([]);
    expect(empty.losers).toEqual([]);
    expect(empty.coverage).toMatchObject({ eligibleCount: 0, analyzedCount: 0, status: "PARTIAL" });

    const assets = Array.from({ length: 12 }, (_, index) =>
      demoAsset({
        assetId: `DEMO_G_${index}`,
        symbol: `DEMO_G_${String(index).padStart(2, "0")}`,
        changes: { "1D": index + 1, "7D": index + 1, "15D": index + 1, "30D": index + 1 },
      }),
    );
    const partial = getRankings(query, assets);
    expect(partial.gainers).toHaveLength(10);
    expect(partial.losers).toEqual([]);
    expect(partial.coverage.status).toBe("PARTIAL");
    expect(new Set(partial.gainers.map((row) => row.assetId)).size).toBe(10);
  });

  it("exige par consistente e ignora série pré-calculada quando o período foi cotado", () => {
    const calculated = demoAsset({
      assetId: "DEMO_PAIR",
      symbol: "DEMO_PAIR",
      changes: { "1D": 1, "7D": 1, "15D": 1, "30D": 1 },
      priceValue: 50,
      periodQuotes: { "1D": pair(100, 110) },
    });
    const ranking = buildRanking([calculated], query);
    expect(ranking.gainers[0]).toMatchObject({
      changePercent: 10,
      price: { value: 110, currency: "BRL" },
      priceBasis: "ADJUSTED",
      origin: "SIMULATED",
    });

    const mixedOrigin = demoAsset({
      assetId: "DEMO_MIX",
      symbol: "DEMO_MIX",
      changes: { "1D": 40, "7D": 40, "15D": 40, "30D": 40 },
      periodQuotes: {
        "1D": {
          start: { value: 100, currency: "BRL", priceBasis: "ADJUSTED", origin: "SIMULATED" },
          end: { value: 140, currency: "BRL", priceBasis: "ADJUSTED", origin: "REAL" },
        },
      },
    });
    const mixedBasis = demoAsset({
      assetId: "DEMO_BASIS",
      symbol: "DEMO_BASIS",
      changes: { "1D": 20, "7D": 20, "15D": 20, "30D": 20 },
      periodQuotes: {
        "1D": {
          start: { value: 100, currency: "BRL", priceBasis: "ADJUSTED", origin: "SIMULATED" },
          end: { value: 120, currency: "BRL", priceBasis: "UNADJUSTED", origin: "SIMULATED" },
        },
      },
    });
    const mixedCurrency = demoAsset({
      assetId: "DEMO_FX",
      symbol: "DEMO_FX",
      changes: { "1D": 15, "7D": 15, "15D": 15, "30D": 15 },
      periodQuotes: {
        "1D": {
          start: { value: 100, currency: "BRL", priceBasis: "ADJUSTED", origin: "SIMULATED" },
          end: { value: 115, currency: "USD", priceBasis: "ADJUSTED", origin: "SIMULATED" },
        },
      },
    });
    const noHistory = demoAsset({
      assetId: "DEMO_NO_HISTORY",
      symbol: "DEMO_NO_HISTORY",
      asOf: " ",
      changes: { "1D": 8, "7D": 8, "15D": 8, "30D": 8 },
    });
    const flatPair = demoAsset({
      assetId: "DEMO_FLAT_PAIR",
      symbol: "DEMO_FLAT_PAIR",
      changes: { "1D": 3, "7D": 3, "15D": 3, "30D": 3 },
      periodQuotes: { "1D": pair(100, 100) },
    });

    const excluded = buildRanking([mixedOrigin, mixedBasis, mixedCurrency, noHistory, flatPair], query);
    expect(excluded.gainers).toEqual([]);
    expect(excluded.losers).toEqual([]);
    expect(excluded.coverage.analyzedCount).toBe(1);
    expect(changePercentFromPair({ start: null, end: pair(100, 110).end })).toBeNull();
    expect(changePercentFromPair(pair(0, 10))).toBeNull();
  });

  it("separa a renda fixa por região e preserva campos nulos", async () => {
    const brazil = getFixedIncome("BR");
    const international = await queryFixedIncome("INTL");
    expect(international.ok).toBe(true);
    if (!international.ok) return;

    expect(brazil.instruments.map((item) => item.id)).toEqual(["DEMO_RF_BR_01", "DEMO_RF_BR_02", "DEMO_RF_BR_03"]);
    expect(international.data.instruments.every((item) => item.currency === "USD")).toBe(true);
    expect(brazil.instruments.some((item) => item.yieldRate !== null && item.unitPrice === null)).toBe(true);
    expect(brazil.instruments.some((item) => item.yieldRate === null && item.unitPrice !== null)).toBe(true);
    expect(international.data.instruments.some((item) => item.yieldRate === null && item.unitPrice === null)).toBe(
      true,
    );

    const withBoth = brazil.instruments.find((item) => item.id === "DEMO_RF_BR_03");
    expect(withBoth?.yieldRate).toEqual({ value: 11.4, unit: "% a.a.", type: "prefixado" });
    expect(withBoth?.unitPrice).toEqual({ value: 912.5, type: "preço" });
    expect(Object.keys(brazil).sort()).toEqual(["dataStatus", "instruments", "region"]);
    expect(queryFixedIncome("EU").ok).toBe(false);
  });

  it("não cria instrumentos nem preço quando a região vem vazia ou com moeda trocada", () => {
    const emptySource: Record<"BR" | "INTL", FixedIncomeResponse> = {
      BR: { ...fixedIncomeFixtures.BR, instruments: [] },
      INTL: {
        ...fixedIncomeFixtures.INTL,
        instruments: [{ ...fixedIncomeFixtures.INTL.instruments[0], currency: "BRL", yieldRate: { value: 9, unit: "percentual", type: "taxa demonstrativa" }, unitPrice: null }],
      },
    };
    expect(getFixedIncome("BR", emptySource).instruments).toEqual([]);
    const international = getFixedIncome("INTL", emptySource);
    expect(international.instruments).toEqual([]);
    expect(international.region).toBe("INTL");
  });
});
