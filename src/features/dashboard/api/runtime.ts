import { assessorGuard } from "../auth/assessorGuard";
import { createQuoteCache, type QuoteCache } from "../services/quoteCache";
import type { DashboardDeps } from "./handlers";

/**
 * Dependências das rotas publicadas.
 * O guard confirma a sessão com autorizarApi("assessor").
 * O cache abaixo vive só neste processo.
 */
export const dashboardCache: QuoteCache = createQuoteCache();

export function productionDeps(now = Date.now()): DashboardDeps {
  return {
    guard: assessorGuard,
    now,
    cache: dashboardCache,
  };
}
