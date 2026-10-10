import { describe, expect, it } from "vitest";

import { buildRanking } from "../domain/ranking";
import {
  DEMO_AS_OF,
  DEMO_ELIGIBILITY_NOTE,
  DEMO_FETCHED_AT,
  DEMO_QUOTE_EXPIRES_AT,
  DEMO_SOURCE,
  PERIODS,
  RANKING_CATEGORIES,
  REGIONS,
  SIMULATED_LABEL,
} from "../domain/types";
import { fixedIncomeFixtures } from "../fixtures/fixedIncome.fixture";
import { DEMO_INDICATOR_IDS, marketFixtures, overviewFixture } from "../fixtures/market.fixture";
import { newsFixture } from "../fixtures/news.fixture";
import {
  fixedIncomeResponseSchema,
  marketFixtureListSchema,
  newsResponseSchema,
  overviewResponseSchema,
  rankingResponseSchema,
} from "../schemas/dashboardSchemas";

describe("fixtures do dashboard", () => {
  it("valida o universo, o panorama, a renda fixa e as notícias", () => {
    expect(marketFixtureListSchema.parse(marketFixtures)).toHaveLength(marketFixtures.length);
    expect(overviewResponseSchema.parse(overviewFixture).indicators.map((item) => item.id)).toEqual(
      DEMO_INDICATOR_IDS,
    );
    expect(fixedIncomeResponseSchema.parse(fixedIncomeFixtures.BR).region).toBe("BR");
    expect(fixedIncomeResponseSchema.parse(fixedIncomeFixtures.INTL).region).toBe("INTL");
    expect(newsResponseSchema.parse(newsFixture).articles).toHaveLength(3);
  });

  it("marca origem simulada, fonte DEMO e a referência temporal fixa", () => {
    expect(marketFixtures.every((asset) => asset.origin === "SIMULATED" && asset.asOf === DEMO_AS_OF)).toBe(
      true,
    );
    expect(overviewFixture.dataStatus).toMatchObject({
      origin: "SIMULATED",
      source: DEMO_SOURCE,
      asOf: DEMO_AS_OF,
      fetchedAt: DEMO_FETCHED_AT,
      expiresAt: DEMO_QUOTE_EXPIRES_AT,
    });
    expect(overviewFixture.dataStatus.message).toContain(SIMULATED_LABEL);
    expect(overviewFixture.indicators.every((indicator) => indicator.dataStatus.origin === "SIMULATED")).toBe(
      true,
    );
    for (const response of [fixedIncomeFixtures.BR, fixedIncomeFixtures.INTL]) {
      expect(response.dataStatus.origin).toBe("SIMULATED");
      expect(response.dataStatus.source).toBe(DEMO_SOURCE);
      expect(response.dataStatus.expiresAt).toBeNull();
      expect(response.instruments.every((item) => item.dataStatus.origin === "SIMULATED")).toBe(true);
    }
    expect(newsFixture.dataStatus.origin).toBe("SIMULATED");
    expect(newsFixture.articles.every((article) => article.origin === "SIMULATED")).toBe(true);
  });

  it("usa só símbolos de demonstração e não mistura região, categoria nem tipo", () => {
    const symbols = marketFixtures.map((asset) => asset.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
    expect(symbols.some((symbol) => symbol.startsWith("DEMO_"))).toBe(false);
    expect(marketFixtures.some((asset) => asset.name.includes("demonstrativo"))).toBe(false);

    for (const region of REGIONS) {
      for (const category of RANKING_CATEGORIES) {
        const group = marketFixtures.filter((asset) => asset.region === region && asset.category === category);
        expect(group.every((asset) => asset.editorialRegion === region)).toBe(true);
        if (category === "REAL_ESTATE") {
          const assetType = region === "BR" ? "FII" : "REIT";
          expect(group.every((asset) => asset.assetType === assetType)).toBe(true);
        }
        if (category === "CRYPTO") {
          expect(group.every((asset) => asset.priceBasis === "UNADJUSTED")).toBe(true);
          expect(group.every((asset) => asset.marketWindowNote?.includes("não representa pregão"))).toBe(true);
          expect(group.every((asset) => asset.quoteContext.includes("não afirma restrição territorial"))).toBe(true);
        }
        const currency = region === "BR" ? "BRL" : "USD";
        expect(
          group.filter((asset) => asset.role !== "foreign-currency").every((asset) => asset.currency === currency),
        ).toBe(true);
        for (const period of PERIODS) {
          const positive = group.filter((asset) => asset.role === "gainer" && (asset.changes[period] ?? 0) > 0);
          const negative = group.filter((asset) => asset.role === "loser" && (asset.changes[period] ?? 0) < 0);
          expect(positive).toHaveLength(12);
          expect(negative).toHaveLength(12);
        }
      }
    }
  });

  it("trata liquidez como atributo de demonstração, sem threshold", () => {
    expect(DEMO_ELIGIBILITY_NOTE).toContain("não aplica threshold");
    expect(marketFixtures.every((asset) => asset.eligibilityNote === DEMO_ELIGIBILITY_NOTE)).toBe(true);
    const ineligible = marketFixtures.filter((asset) => asset.role === "ineligible");
    expect(ineligible.every((asset) => asset.eligible === false && asset.liquidityMetric === 100)).toBe(true);
    expect(ineligible.every((asset) => asset.exclusionReason !== null)).toBe(true);
  });

  it("isola o ranking por região, categoria e período e limita em 10 sem duplicar", () => {
    for (const region of REGIONS) {
      for (const category of RANKING_CATEGORIES) {
        for (const period of PERIODS) {
          const ranking = rankingResponseSchema.parse(
            buildRanking(marketFixtures, { region, category, period }),
          );
          expect(ranking.coverage.status).toBe("COMPLETE_FOR_UNIVERSE");
          expect(ranking.gainers).toHaveLength(10);
          expect(ranking.losers).toHaveLength(10);
          const rows = [...ranking.gainers, ...ranking.losers];
          expect(new Set(rows.map((row) => row.assetId)).size).toBe(rows.length);
          expect(rows.every((row) => row.origin === "SIMULATED" && row.price !== null)).toBe(true);
          expect(rows.every((row) => row.price?.currency === (region === "BR" ? "BRL" : "USD"))).toBe(true);
          const allowed = new Set(
            marketFixtures
              .filter((asset) => asset.region === region && asset.category === category)
              .map((asset) => asset.symbol),
          );
          expect(rows.every((row) => allowed.has(row.symbol))).toBe(true);
          expect(ranking.gainers.every((row) => row.changePercent > 0)).toBe(true);
          expect(ranking.losers.every((row) => row.changePercent < 0)).toBe(true);
        }
      }
    }
  });

  it("separa os períodos e não promove ativo inelegível nem moeda inconsistente", () => {
    const oneDay = buildRanking(marketFixtures, { region: "BR", category: "STOCK", period: "1D" });
    const sevenDays = buildRanking(marketFixtures, { region: "BR", category: "STOCK", period: "7D" });
    expect(oneDay.gainers[0]).toMatchObject({ symbol: "SOLR3", name: "Solar do Cerrado", changePercent: 12 });
    expect(sevenDays.gainers[0]).toMatchObject({ symbol: "SOLR3", changePercent: 36 });
    expect(oneDay.coverage).toMatchObject({ eligibleCount: 28, analyzedCount: 25 });

    const listed = [...oneDay.gainers, ...oneDay.losers].map((row) => row.symbol);
    const excluded = marketFixtures.filter(
      (asset) =>
        asset.region === "BR" &&
        asset.category === "STOCK" &&
        (asset.role === "ineligible" ||
          asset.role === "foreign-currency" ||
          asset.role === "flat" ||
          asset.role === "missing-price" ||
          asset.role === "missing-change"),
    );
    expect(excluded.every((asset) => !listed.includes(asset.symbol))).toBe(true);
    expect(marketFixtures.find((asset) => asset.symbol === "SOLR3")?.liquidityMetric).toBe(1);
  });

  it("mantém renda fixa sem derivar preço da taxa e sem URL falsa nas notícias", () => {
    const brazil = fixedIncomeFixtures.BR.instruments;
    expect(brazil.some((item) => item.yieldRate !== null && item.unitPrice === null)).toBe(true);
    expect(brazil.some((item) => item.yieldRate === null && item.unitPrice !== null)).toBe(true);
    expect(fixedIncomeFixtures.INTL.instruments.some((item) => item.yieldRate === null && item.unitPrice === null)).toBe(
      true,
    );
    expect(fixedIncomeFixtures.BR.instruments.every((item) => item.id.startsWith("DEMO_RF_BR_"))).toBe(true);
    expect(fixedIncomeFixtures.INTL.instruments.every((item) => item.currency === "USD")).toBe(true);

    expect(newsFixture.articles.map((article) => article.publishedAt)).toEqual([
      "2026-01-15T12:00:00.000Z",
      "2026-01-14T12:00:00.000Z",
      "2026-01-13T12:00:00.000Z",
    ]);
    expect(newsFixture.articles.every((article) => article.url === null)).toBe(true);
    expect(newsFixture.articles.every((article) => article.summary.generatedByAI === false)).toBe(true);
    expect(newsFixture.articles.every((article) => article.source === "Guia do painel")).toBe(true);
    expect(JSON.stringify(newsFixture).includes("http")).toBe(false);
    expect(newsFixture.dataStatus.message).toContain("não foi gerado por IA");
  });
});
