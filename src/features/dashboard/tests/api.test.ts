import { describe, expect, it } from "vitest";

import { pendingAssessorGuard, type AssessorGuard } from "../auth/assessorGuard";
import { handleFixedIncome, handleOverview, handleRankings, handleRefresh, type DashboardDeps } from "../api/handlers";
import { DEMO_AS_OF } from "../domain/types";
import { loadDashboardNews } from "../services/newsService";
import { createQuoteCache } from "../services/quoteCache";
import { QUOTE_CACHE_MS } from "../services/quoteCachePolicy";
import {
  apiErrorSchema,
  fixedIncomeResponseSchema,
  overviewResponseSchema,
  rankingResponseSchema,
  refreshResponseSchema,
} from "../schemas/dashboardSchemas";
import { GET as getOverviewRoute } from "../../../app/api/dashboard/overview/route";
import { GET as getRankingsRoute } from "../../../app/api/dashboard/rankings/route";
import { GET as getFixedIncomeRoute } from "../../../app/api/dashboard/fixed-income/route";
import { POST as postRefreshRoute } from "../../../app/api/dashboard/refresh/route";

const NOW = Date.parse("2026-10-10T15:00:00.000Z");

function assessorGuard(): AssessorGuard {
  return async () => ({ ok: true, principal: { userId: "assessor-demo", role: "ASSESSOR" } });
}

function clientGuard(): AssessorGuard {
  return async () => ({
    ok: false,
    status: 403,
    error: { code: "FORBIDDEN", message: "Perfil sem acesso ao dashboard." },
  });
}

function deps(now = NOW): DashboardDeps {
  return { guard: assessorGuard(), now, cache: createQuoteCache() };
}

function rankingsUrl(query: string) {
  return new Request(`http://localhost/api/dashboard/rankings?${query}`);
}

describe("API interna do dashboard", () => {
  it("recusa a rota publicada mesmo com papel vindo do cliente", async () => {
    const response = await getOverviewRoute();
    const body = apiErrorSchema.parse(await response.json());
    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHENTICATED");
    expect(body).not.toHaveProperty("indicators");

    const spoofed = await getRankingsRoute(
      new Request("http://localhost/api/dashboard/rankings?region=BR&category=STOCK&period=1D", {
        headers: { "x-user-role": "ASSESSOR" },
      }),
    );
    expect(spoofed.status).toBe(401);

    const refresh = await postRefreshRoute(
      new Request("http://localhost/api/dashboard/refresh", {
        method: "POST",
        body: JSON.stringify({ resources: ["overview"], role: "ASSESSOR" }),
      }),
    );
    expect(refresh.status).toBe(401);
    expect(await pendingAssessorGuard()).toMatchObject({ ok: false, status: 401 });
  });

  it("registra o bloqueio real: sem requireAssessor não há 403 nem 200", async () => {
    const anonymous = await getOverviewRoute();
    expect(anonymous.status).toBe(401);

    const asClient = await getRankingsRoute(
      new Request("http://localhost/api/dashboard/rankings?region=BR&category=STOCK&period=1D", {
        headers: { "x-user-role": "CLIENTE" },
      }),
    );
    expect(asClient.status).toBe(401);

    const asAssessor = await getRankingsRoute(
      new Request("http://localhost/api/dashboard/rankings?region=BR&category=STOCK&period=1D", {
        headers: { "x-user-role": "ASSESSOR" },
      }),
    );
    expect(asAssessor.status).toBe(401);

    const invalidPeriod = await getRankingsRoute(
      new Request("http://localhost/api/dashboard/rankings?region=BR&category=STOCK&period=2W"),
    );
    expect(invalidPeriod.status).toBe(401);

    const fixedIncomeCategory = await getRankingsRoute(
      new Request("http://localhost/api/dashboard/rankings?region=BR&category=FIXED_INCOME&period=1D"),
    );
    expect(fixedIncomeCategory.status).toBe(401);

    const fixedIncome = await getFixedIncomeRoute(
      new Request("http://localhost/api/dashboard/fixed-income?region=INTL"),
    );
    expect(fixedIncome.status).toBe(401);

    const invalidRefresh = await postRefreshRoute(
      new Request("http://localhost/api/dashboard/refresh", {
        method: "POST",
        body: JSON.stringify({ resources: ["quotes"] }),
      }),
    );
    expect(invalidRefresh.status).toBe(401);
  });

  it("responde 401, 403 e 400 sem entregar ranking", async () => {
    const anonymous = await handleRankings(rankingsUrl("region=BR&category=STOCK&period=1D"), {
      ...deps(),
      guard: pendingAssessorGuard,
    });
    expect(anonymous.status).toBe(401);
    expect(apiErrorSchema.parse(anonymous.body).error.code).toBe("UNAUTHENTICATED");

    const client = await handleRankings(rankingsUrl("region=BR&category=STOCK&period=1D"), {
      ...deps(),
      guard: clientGuard(),
    });
    expect(client.status).toBe(403);
    expect(apiErrorSchema.parse(client.body).error.code).toBe("FORBIDDEN");
    expect(client.body).not.toHaveProperty("gainers");

    const invalidPeriod = await handleRankings(rankingsUrl("region=BR&category=STOCK&period=2W"), deps());
    expect(invalidPeriod.status).toBe(400);
    expect(apiErrorSchema.parse(invalidPeriod.body).error.code).toBe("INVALID_QUERY");

    const fixedIncome = await handleRankings(rankingsUrl("region=BR&category=FIXED_INCOME&period=1D"), deps());
    expect(fixedIncome.status).toBe(400);
    const error = apiErrorSchema.parse(fixedIncome.body);
    expect(error.error.code).toBe("INVALID_CATEGORY");
    expect(error.error.details?.allowedValues).toEqual(["STOCK", "REAL_ESTATE", "ETF", "CRYPTO"]);
  });

  it("entrega overview, ranking e renda fixa simulados para assessor de teste", async () => {
    const overview = overviewResponseSchema.parse((await handleOverview(deps())).body);
    expect(overview.dataStatus.origin).toBe("SIMULATED");
    expect(overview.dataStatus.asOf).toBe(DEMO_AS_OF);
    expect(overview.indicators.every((item) => item.dataStatus.origin === "SIMULATED")).toBe(true);

    const ranking = rankingResponseSchema.parse(
      (await handleRankings(rankingsUrl("region=INTL&category=REAL_ESTATE&period=7D"), deps())).body,
    );
    expect(ranking.filters).toEqual({ region: "INTL", category: "REAL_ESTATE", period: "7D" });
    expect(ranking.gainers.every((item) => item.origin === "SIMULATED")).toBe(true);
    expect(ranking.losers.every((item) => item.origin === "SIMULATED")).toBe(true);

    const income = fixedIncomeResponseSchema.parse(
      (await handleFixedIncome(new Request("http://localhost/api/dashboard/fixed-income?region=INTL"), deps())).body,
    );
    expect(income.region).toBe("INTL");
    expect(income.dataStatus.origin).toBe("SIMULATED");
    expect(income.instruments.every((item) => item.dataStatus.origin === "SIMULATED")).toBe(true);

    const missingRegion = await handleFixedIncome(new Request("http://localhost/api/dashboard/fixed-income"), deps());
    expect(missingRegion.status).toBe(400);
    expect(apiErrorSchema.parse(missingRegion.body).error.code).toBe("INVALID_REGION");
  });

  it("reutiliza cotações por 15 minutos sem alterar asOf", async () => {
    const state = deps();
    const before = overviewResponseSchema.parse((await handleOverview(state)).body);

    const reused = await handleRefresh(jsonRequest({ resources: ["overview"] }), {
      ...state,
      now: NOW + 1_000,
    });
    const reusedBody = refreshResponseSchema.parse(reused.body);
    expect(reusedBody.status).toBe("COMPLETED");
    expect(reusedBody.results).toEqual([{ resource: "overview", outcome: "CACHE_REUSED" }]);

    const after = overviewResponseSchema.parse(
      (await handleOverview({ ...state, now: NOW + 1_000 })).body,
    );
    expect(after.dataStatus.asOf).toBe(before.dataStatus.asOf);

    const expired = refreshResponseSchema.parse(
      (
        await handleRefresh(jsonRequest({ resources: ["overview"] }), {
          ...state,
          now: NOW + QUOTE_CACHE_MS,
        })
      ).body,
    );
    expect(expired.results[0]?.outcome).toBe("SIMULATED");
    const reread = overviewResponseSchema.parse(
      (await handleOverview({ ...state, now: NOW + QUOTE_CACHE_MS })).body,
    );
    expect(reread.dataStatus.asOf).toBe(DEMO_AS_OF);
  });

  it("responde CACHE_REUSED em rajada dentro do TTL", async () => {
    const state = deps();
    await handleOverview(state);

    const first = refreshResponseSchema.parse(
      (await handleRefresh(jsonRequest({ resources: ["overview"] }), { ...state, now: NOW + 1_000 })).body,
    );
    const second = refreshResponseSchema.parse(
      (await handleRefresh(jsonRequest({ resources: ["overview"] }), { ...state, now: NOW + 2_000 })).body,
    );

    expect(first.results).toEqual([{ resource: "overview", outcome: "CACHE_REUSED" }]);
    expect(second.results).toEqual([{ resource: "overview", outcome: "CACHE_REUSED" }]);
    expect(first.requestedAt).not.toBe(second.requestedAt);
  });

  it("marca notícias como indisponíveis e não cria a rota do módulo 5", async () => {
    const state = deps();
    await handleOverview(state);
    const response = await handleRefresh(
      jsonRequest({ resources: ["overview", "news", "fixed-income"] }),
      { ...state, now: NOW + 1_000 },
    );
    const body = refreshResponseSchema.parse(response.body);
    expect(body.status).toBe("PARTIAL");
    expect(body.results).toEqual([
      { resource: "overview", outcome: "CACHE_REUSED" },
      { resource: "news", outcome: "UNAVAILABLE" },
      { resource: "fixed-income", outcome: "SIMULATED" },
    ]);

    const invalid = await handleRefresh(jsonRequest({ resources: ["quotes"] }), state);
    expect(invalid.status).toBe(400);
    expect(apiErrorSchema.parse(invalid.body).error.code).toBe("INVALID_BODY");
  });

  it("consome a porta local de notícias sem chamar o módulo 5", async () => {
    const news = await loadDashboardNews();
    expect(news.selection).toEqual({ strategy: "RECENCY_RELEVANCE", limit: 3 });
    expect(news.articles).toHaveLength(3);
    expect(news.articles.every((article) => article.summary.generatedByAI === false)).toBe(true);
    expect(news.articles.every((article) => article.url === null && article.origin === "SIMULATED")).toBe(true);
    expect(news.dataStatus.origin).toBe("SIMULATED");
  });
});

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/dashboard/refresh", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
