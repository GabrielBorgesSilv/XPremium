import type { AssessorGuard } from "../auth/assessorGuard";
import { RANKING_CATEGORIES, type RankingQuery, type RefreshOutcome, type RefreshResource } from "../domain/types";
import { overviewFixture } from "../fixtures/market.fixture";
import { getFixedIncome } from "../services/fixedIncomeService";
import { getRankings } from "../services/rankingService";
import type { QuoteCache } from "../services/quoteCache";
import { rankingQuerySchema, refreshRequestSchema, regionSchema } from "../schemas/dashboardSchemas";

export type DashboardDeps = {
  guard: AssessorGuard;
  now: number;
  cache: QuoteCache;
};

export type HttpResult = {
  status: number;
  body: unknown;
};

const DEFAULT_RANKING: RankingQuery = { region: "BR", category: "STOCK", period: "1D" };

function errorResult(
  status: number,
  code: string,
  message: string,
  details?: { allowedValues: string[] },
): HttpResult {
  return {
    status,
    body: {
      error: details ? { code, message, details } : { code, message },
    },
  };
}

async function authorize(deps: DashboardDeps): Promise<HttpResult | null> {
  const decision = await deps.guard();
  if (decision.ok) return null;
  return { status: decision.status, body: { error: decision.error } };
}

function rankingKey(query: RankingQuery): string {
  return `rankings:${query.region}:${query.category}:${query.period}`;
}

function queryFromRankingKey(key: string): RankingQuery | null {
  const [, region, category, period] = key.split(":");
  const parsed = rankingQuerySchema.safeParse({ region, category, period });
  return parsed.success ? parsed.data : null;
}

export async function handleOverview(deps: DashboardDeps): Promise<HttpResult> {
  const denied = await authorize(deps);
  if (denied) return denied;

  const read = await deps.cache.read("overview", deps.now, () => overviewFixture);
  if (!read.ok) {
    return errorResult(503, "UNAVAILABLE", "Consulta de demonstração excedeu o tempo limite.");
  }
  return { status: 200, body: read.value };
}

export async function handleRankings(request: Request, deps: DashboardDeps): Promise<HttpResult> {
  const denied = await authorize(deps);
  if (denied) return denied;

  const params = new URL(request.url).searchParams;
  const input = {
    region: params.get("region"),
    category: params.get("category"),
    period: params.get("period"),
  };
  if (input.category === "FIXED_INCOME") {
    return errorResult(400, "INVALID_CATEGORY", "Categoria inválida.", {
      allowedValues: [...RANKING_CATEGORIES],
    });
  }
  const parsed = rankingQuerySchema.safeParse(input);
  if (!parsed.success) {
    return errorResult(400, "INVALID_QUERY", "Filtro de ranking inválido.");
  }

  const read = await deps.cache.read(rankingKey(parsed.data), deps.now, () => getRankings(parsed.data));
  if (!read.ok) {
    return errorResult(503, "UNAVAILABLE", "Consulta de demonstração excedeu o tempo limite.");
  }
  return { status: 200, body: read.value };
}

export async function handleFixedIncome(request: Request, deps: DashboardDeps): Promise<HttpResult> {
  const denied = await authorize(deps);
  if (denied) return denied;

  const parsed = regionSchema.safeParse(new URL(request.url).searchParams.get("region"));
  if (!parsed.success) {
    return errorResult(400, "INVALID_REGION", "Região inválida.", {
      allowedValues: ["BR", "INTL"],
    });
  }

  return { status: 200, body: getFixedIncome(parsed.data) };
}

export async function handleRefresh(request: Request, deps: DashboardDeps): Promise<HttpResult> {
  const denied = await authorize(deps);
  if (denied) return denied;

  const payload = await request.json().catch(() => null);
  const parsed = refreshRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResult(400, "INVALID_BODY", "Pedido de atualização inválido.");
  }

  const results: { resource: RefreshResource; outcome: RefreshOutcome }[] = [];
  for (const resource of parsed.data.resources) {
    results.push({ resource, outcome: await refreshResource(resource, deps) });
  }

  const partial = results.some((item) => item.outcome === "UNAVAILABLE" || item.outcome === "STALE_FALLBACK");
  return {
    status: 200,
    body: {
      status: partial ? "PARTIAL" : "COMPLETED",
      results,
      requestedAt: new Date(deps.now).toISOString(),
    },
  };
}

async function refreshResource(resource: RefreshResource, deps: DashboardDeps): Promise<RefreshOutcome> {
  if (resource === "news") return "UNAVAILABLE";
  if (resource === "fixed-income") return "SIMULATED";
  if (resource === "overview") {
    const read = await deps.cache.read("overview", deps.now, () => overviewFixture);
    return read.ok ? read.outcome : "UNAVAILABLE";
  }
  return refreshRankings(deps);
}

async function refreshRankings(deps: DashboardDeps): Promise<RefreshOutcome> {
  const stored = deps.cache.keys("rankings:");
  if (deps.cache.fresh("rankings:", deps.now)) return "CACHE_REUSED";

  const targets = stored.length > 0 ? stored : [rankingKey(DEFAULT_RANKING)];
  let reloaded = false;

  for (const key of targets) {
    const query = queryFromRankingKey(key) ?? DEFAULT_RANKING;
    const read = await deps.cache.read(key, deps.now, () => getRankings(query));
    if (!read.ok) return "UNAVAILABLE";
    if (read.outcome === "SIMULATED") reloaded = true;
  }

  return reloaded ? "SIMULATED" : "CACHE_REUSED";
}
