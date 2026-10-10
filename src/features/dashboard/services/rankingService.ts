import { buildRanking } from "../domain/ranking";
import { RANKING_CATEGORIES, type MarketFixtureAsset, type RankingQuery, type RankingResponse } from "../domain/types";
import { marketFixtures } from "../fixtures/market.fixture";
import type { MarketDataProvider } from "../providers/contracts";
import { rankingQuerySchema } from "../schemas/dashboardSchemas";

export type RankingServiceError = {
  code: "INVALID_CATEGORY" | "INVALID_QUERY";
  message: string;
  details?: { allowedValues: string[] };
};

export type RankingReadResult =
  | { ok: true; data: RankingResponse }
  | { ok: false; error: RankingServiceError };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Ranking do universo recebido. A consulta já precisa ser uma categoria de mercado. */
export function getRankings(
  query: RankingQuery,
  assets: readonly MarketFixtureAsset[] = marketFixtures,
): RankingResponse {
  return buildRanking(assets, query);
}

/**
 * Valida a entrada externa. Renda fixa é recusada aqui e não vira ranking vazio.
 */
export function queryRankings(
  input: unknown,
  assets: readonly MarketFixtureAsset[] = marketFixtures,
): RankingReadResult {
  if (isRecord(input) && input.category === "FIXED_INCOME") {
    return {
      ok: false,
      error: {
        code: "INVALID_CATEGORY",
        message: "Renda fixa não participa do ranking.",
        details: { allowedValues: [...RANKING_CATEGORIES] },
      },
    };
  }

  const parsed = rankingQuerySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: { code: "INVALID_QUERY", message: "Filtro de ranking inválido." },
    };
  }

  return { ok: true, data: getRankings(parsed.data, assets) };
}

export function createRankingProvider(
  assets: readonly MarketFixtureAsset[] = marketFixtures,
): Pick<MarketDataProvider, "getRankings"> {
  return {
    async getRankings(query: RankingQuery): Promise<RankingResponse> {
      return getRankings(query, assets);
    },
  };
}
