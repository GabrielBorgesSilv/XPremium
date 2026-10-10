import type {
  FixedIncomeResponse,
  NewsResponse,
  OverviewResponse,
  RankingQuery,
  RankingResponse,
  Region,
} from "../domain/types";

/**
 * Contratos dos provedores. Implementações reais ficam fora deste MVP:
 * nenhuma chamada externa parte daqui.
 * `NewsFeedPort` pertence ao módulo 5; a fixture local só ocupa o lugar até esse contrato existir.
 * `requireAssessor` pertence ao módulo 1 e ainda não existe no repositório.
 */
export type MarketDataProvider = {
  getOverview(): Promise<OverviewResponse>;
  getRankings(query: RankingQuery): Promise<RankingResponse>;
};

export type FixedIncomeProvider = {
  getFixedIncome(region: Region): Promise<FixedIncomeResponse>;
};

export type NewsFeedPort = {
  getNews(): Promise<NewsResponse>;
};

export type { RankingQuery };
