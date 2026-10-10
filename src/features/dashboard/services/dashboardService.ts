import "server-only";

import type { FixedIncomeResponse, MarketFixtureAsset, NewsResponse, OverviewResponse, Region } from "../domain/types";
import { fixedIncomeFixtures } from "../fixtures/fixedIncome.fixture";
import { marketFixtures, overviewFixture } from "../fixtures/market.fixture";
import type { FixedIncomeProvider, MarketDataProvider, NewsFeedPort } from "../providers/contracts";
import { overviewResponseSchema } from "../schemas/dashboardSchemas";
import { createFixedIncomeProvider } from "./fixedIncomeService";
import { localNewsFeed } from "./newsService";
import { createRankingProvider } from "./rankingService";

export type DashboardView = {
  overview: OverviewResponse;
  assets: readonly MarketFixtureAsset[];
  fixedIncome: Record<Region, FixedIncomeResponse>;
  news: NewsResponse;
};

export type DashboardPorts = {
  market: MarketDataProvider;
  fixedIncome: FixedIncomeProvider;
  news: NewsFeedPort;
  assets: readonly MarketFixtureAsset[];
};

/** Provedor local. Não consulta rede nem apresenta a fixture como cotação real. */
export function createLocalMarketProvider(
  assets: readonly MarketFixtureAsset[] = marketFixtures,
): MarketDataProvider {
  return {
    async getOverview() {
      return overviewResponseSchema.parse(overviewFixture);
    },
    ...createRankingProvider(assets),
  };
}

export function createLocalDashboardPorts(
  assets: readonly MarketFixtureAsset[] = marketFixtures,
): DashboardPorts {
  return {
    market: createLocalMarketProvider(assets),
    fixedIncome: createFixedIncomeProvider(fixedIncomeFixtures),
    news: localNewsFeed,
    assets,
  };
}

/**
 * Visão inicial da tela. O shell continua filtrando o universo no cliente.
 * Os provedores reais substituem estas portas sem mudar o formato.
 */
export async function loadDashboardView(ports: DashboardPorts = createLocalDashboardPorts()): Promise<DashboardView> {
  const [overview, brazil, international, news] = await Promise.all([
    ports.market.getOverview(),
    ports.fixedIncome.getFixedIncome("BR"),
    ports.fixedIncome.getFixedIncome("INTL"),
    ports.news.getNews(),
  ]);

  return {
    overview,
    assets: ports.assets,
    fixedIncome: { BR: brazil, INTL: international },
    news,
  };
}
