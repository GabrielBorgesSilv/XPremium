import { describe, expect, it, vi } from "vitest";

import type { MarketDataProvider, NewsFeedPort } from "../providers/contracts";
import { createLocalDashboardPorts, loadDashboardView } from "../services/dashboardService";

describe("visão do dashboard", () => {
  it("monta panorama, universo, renda fixa e notícias simuladas", async () => {
    const view = await loadDashboardView();

    expect(view.overview.dataStatus.origin).toBe("SIMULATED");
    expect(view.overview.indicators.length).toBeGreaterThan(0);
    expect(view.overview.indicators.every((item) => item.dataStatus.origin === "SIMULATED")).toBe(true);
    expect(view.assets.every((asset) => asset.origin === "SIMULATED" && !asset.symbol.startsWith("DEMO_"))).toBe(true);
    expect(view.assets.some((asset) => asset.name === "Solar do Cerrado")).toBe(true);
    expect(view.fixedIncome.BR.region).toBe("BR");
    expect(view.fixedIncome.INTL.region).toBe("INTL");
    expect(view.fixedIncome.BR.dataStatus.origin).toBe("SIMULATED");
    expect(view.fixedIncome.INTL.dataStatus.origin).toBe("SIMULATED");
    expect(view.news.articles).toHaveLength(3);
    expect(view.news.articles.every((article) => article.summary.generatedByAI === false)).toBe(true);
    expect(view.news.dataStatus.origin).toBe("SIMULATED");
  });

  it("consulta as portas recebidas", async () => {
    const ports = createLocalDashboardPorts();
    const market: MarketDataProvider = {
      getOverview: vi.fn(ports.market.getOverview),
      getRankings: vi.fn(ports.market.getRankings),
    };
    const news: NewsFeedPort = {
      getNews: vi.fn(ports.news.getNews),
    };

    const view = await loadDashboardView({ ...ports, market, news });

    expect(market.getOverview).toHaveBeenCalledOnce();
    expect(news.getNews).toHaveBeenCalledOnce();
    expect(view.news.selection).toEqual({ strategy: "RECENCY_RELEVANCE", limit: 3 });
  });
});
