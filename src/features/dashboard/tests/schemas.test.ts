import { describe, expect, it } from "vitest";

import type { NewsResponse, OverviewResponse, RankingResponse } from "../domain/types";
import { newsFixture } from "../fixtures/news.fixture";
import { overviewFixture } from "../fixtures/market.fixture";
import {
  apiErrorSchema,
  categorySchema,
  moneySchema,
  newsResponseSchema,
  overviewResponseSchema,
  rankingCategorySchema,
  rankingQuerySchema,
  rankingResponseSchema,
  refreshRequestSchema,
} from "../schemas/dashboardSchemas";

describe("schemas do dashboard", () => {
  it("aceita os enums do contrato e rejeita categoria de ranking inválida", () => {
    expect(categorySchema.parse("FIXED_INCOME")).toBe("FIXED_INCOME");
    expect(rankingCategorySchema.safeParse("FIXED_INCOME").success).toBe(false);
    expect(
      rankingQuerySchema.safeParse({ region: "BR", category: "STOCK", period: "2W" }).success,
    ).toBe(false);
    expect(refreshRequestSchema.safeParse({ resources: ["quotes"] }).success).toBe(false);
    expect(refreshRequestSchema.safeParse({ resources: [] }).success).toBe(false);
    expect(moneySchema.safeParse({ value: 10, currency: "" }).success).toBe(false);
    expect(moneySchema.safeParse({ value: Number.NaN, currency: "BRL" }).success).toBe(false);
  });

  it("preserva o shape tipado das respostas de demonstração", () => {
    const overview: OverviewResponse = overviewResponseSchema.parse(overviewFixture);
    const news: NewsResponse = newsResponseSchema.parse(newsFixture);
    expect(overview.indicators.some((indicator) => indicator.region === "BR")).toBe(true);
    expect(overview.indicators.some((indicator) => indicator.region === "INTL")).toBe(true);
    expect(news.selection).toEqual({ strategy: "RECENCY_RELEVANCE", limit: 3 });
  });

  it("rejeita alta com variação zero e aceita o erro comum da API", () => {
    const invalidRanking: RankingResponse = {
      filters: { region: "BR", category: "STOCK", period: "1D" },
      metric: "changePercent",
      gainers: [
        {
          assetId: "DEMO_ZERO",
          symbol: "DEMO_ZERO",
          name: "Zero",
          price: { value: 10, currency: "BRL" },
          changePercent: 0,
          priceBasis: "ADJUSTED",
          asOf: "2026-01-15T18:00:00.000Z",
          origin: "SIMULATED",
        },
      ],
      losers: [],
      coverage: {
        eligibleCount: 1,
        analyzedCount: 1,
        status: "PARTIAL",
        description: "Cobertura parcial",
      },
      dataStatus: overviewFixture.dataStatus,
    };
    expect(rankingResponseSchema.safeParse(invalidRanking).success).toBe(false);
    expect(
      apiErrorSchema.parse({
        error: {
          code: "INVALID_CATEGORY",
          message: "Categoria inválida.",
          details: { allowedValues: ["STOCK", "REAL_ESTATE", "ETF", "CRYPTO"] },
        },
      }).error.code,
    ).toBe("INVALID_CATEGORY");
  });
});
