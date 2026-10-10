import { formatTimestamp } from "./format";
import { QUOTE_CACHE_MS } from "../services/quoteCachePolicy";

export { QUOTE_CACHE_MS };

export type QuoteRefreshDecision = {
  outcome: "CACHE_REUSED" | "SIMULATED";
  message: string;
  requestedAt: string;
  cacheUntil: number;
};

export function decideQuoteRefresh(
  now: number,
  cacheUntil: number | null,
  fixtureExpiresAt: string | null,
): QuoteRefreshDecision {
  const fixtureExpiry = fixtureExpiresAt ? Date.parse(fixtureExpiresAt) : Number.NaN;
  const validUntil = cacheUntil ?? (Number.isFinite(fixtureExpiry) ? fixtureExpiry : 0);
  const requestedAt = new Date(now).toISOString();

  if (now < validUntil) {
    return {
      outcome: "CACHE_REUSED",
      requestedAt,
      cacheUntil: validUntil,
      message: `Cache de cotações reutilizado até ${formatTimestamp(new Date(validUntil).toISOString())}. Os preços não foram alterados.`,
    };
  }

  const nextExpiry = now + QUOTE_CACHE_MS;
  return {
    outcome: "SIMULATED",
    requestedAt,
    cacheUntil: nextExpiry,
    message:
      "Cotações relidas. Os preços permanecem os mesmos. O cache de cotações vale 15 minutos.",
  };
}
