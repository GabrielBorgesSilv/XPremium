import { describe, expect, it } from "vitest";

import { buildRanking } from "../domain/ranking";
import {
  DEMO_AS_OF,
  DEMO_ELIGIBILITY_NOTE,
  type MarketFixtureAsset,
  type RankingQuery,
} from "../domain/types";
import { marketFixtures } from "../fixtures/market.fixture";

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

describe("ranking de demonstração", () => {
  it("ordena altas em ordem decrescente, baixas em ordem crescente e desempatam pelo símbolo", () => {
    const ranking = buildRanking(
      [
        demoAsset({ assetId: "DEMO_B", symbol: "DEMO_B", changes: { "1D": 5, "7D": 5, "30D": 5 } }),
        demoAsset({ assetId: "DEMO_A", symbol: "DEMO_A", changes: { "1D": 5, "7D": 5, "30D": 5 } }),
        demoAsset({
          assetId: "DEMO_C",
          symbol: "DEMO_C",
          changes: { "1D": -4, "7D": -4, "30D": -4 },
          role: "loser",
        }),
        demoAsset({
          assetId: "DEMO_D",
          symbol: "DEMO_D",
          changes: { "1D": -8, "7D": -8, "30D": -8 },
          role: "loser",
        }),
        demoAsset({
          assetId: "DEMO_E",
          symbol: "DEMO_E",
          changes: { "1D": -4, "7D": -4, "30D": -4 },
          role: "loser",
        }),
      ],
      query,
    );

    expect(ranking.gainers.map((row) => row.symbol)).toEqual(["DEMO_A", "DEMO_B"]);
    expect(ranking.losers.map((row) => row.symbol)).toEqual(["DEMO_D", "DEMO_C", "DEMO_E"]);
    expect(ranking.coverage.status).toBe("PARTIAL");
  });

  it("ignora zero, nulo, NaN e infinito e não completa a lista", () => {
    const ranking = buildRanking(
      [
        demoAsset({ assetId: "DEMO_ZERO", symbol: "DEMO_ZERO", changes: { "1D": 0, "7D": 0, "30D": 0 }, role: "flat" }),
        demoAsset({
          assetId: "DEMO_NAN",
          symbol: "DEMO_NAN",
          changes: { "1D": Number.NaN, "7D": null, "30D": Number.POSITIVE_INFINITY },
        }),
        demoAsset({
          assetId: "DEMO_NULL",
          symbol: "DEMO_NULL",
          changes: { "1D": null, "7D": null, "30D": null },
          role: "missing-change",
        }),
        demoAsset({
          assetId: "DEMO_OK",
          symbol: "DEMO_OK",
          changes: { "1D": 2, "7D": 2, "30D": 2 },
        }),
      ],
      query,
    );

    expect(ranking.gainers.map((row) => row.symbol)).toEqual(["DEMO_OK"]);
    expect(ranking.losers).toEqual([]);
    expect(ranking.coverage).toMatchObject({ eligibleCount: 4, analyzedCount: 2, status: "PARTIAL" });
    expect(ranking.coverage.description).toContain("Nenhum ativo foi duplicado");
  });

  it("não duplica o mesmo ativo para preencher dez posições", () => {
    const asset = demoAsset({
      assetId: "DEMO_DUP",
      symbol: "DEMO_DUP",
      changes: { "1D": 4, "7D": 4, "30D": 4 },
    });
    const ranking = buildRanking(Array.from({ length: 15 }, () => asset), query);
    expect(ranking.gainers).toHaveLength(1);
    expect(ranking.coverage.status).toBe("PARTIAL");
  });

  it("não mistura REIT no Brasil nem ativo de outra região", () => {
    const foreign = marketFixtures.find((asset) => asset.symbol === "DEMO_INTL_REIT_01");
    expect(foreign).toBeDefined();
    if (!foreign) return;
    const ranking = buildRanking(
      [...marketFixtures, { ...foreign, region: "BR", editorialRegion: "BR" }],
      { region: "BR", category: "REAL_ESTATE", period: "30D" },
    );
    expect(ranking.gainers.concat(ranking.losers).some((row) => row.symbol.includes("REIT"))).toBe(false);
    expect(ranking.gainers.concat(ranking.losers).every((row) => row.symbol.startsWith("DEMO_BR_FII_"))).toBe(
      true,
    );
  });
});
