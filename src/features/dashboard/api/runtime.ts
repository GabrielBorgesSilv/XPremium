import { pendingAssessorGuard } from "../auth/assessorGuard";
import { createQuoteCache, type QuoteCache } from "../services/quoteCache";
import type { DashboardDeps } from "./handlers";

/**
 * Dependências das rotas publicadas.
 * O guard pendente recusa tudo até o módulo 1 integrar requireAssessor().
 * O cache abaixo vive só neste processo.
 */
export const dashboardCache: QuoteCache = createQuoteCache();

export function productionDeps(now = Date.now()): DashboardDeps {
  return {
    guard: pendingAssessorGuard,
    now,
    cache: dashboardCache,
  };
}
