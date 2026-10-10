import type { PeriodPricePair, QuotePoint } from "./types";

export type ComputedPeriodReturn = {
  changePercent: number;
  end: QuotePoint;
};

/**
 * Variação entre dois preços da mesma moeda, da mesma base e da mesma origem.
 * Não mistura ponto real com ponto simulado e não usa preço inicial zero.
 */
export function changePercentFromPair(pair: PeriodPricePair): ComputedPeriodReturn | null {
  const start = pair.start;
  const end = pair.end;
  if (!start || !end) return null;
  if (!Number.isFinite(start.value) || !Number.isFinite(end.value)) return null;
  if (start.value === 0) return null;
  if (start.currency !== end.currency) return null;
  if (start.priceBasis !== end.priceBasis) return null;
  if (start.origin !== end.origin) return null;

  const changePercent = ((end.value - start.value) / start.value) * 100;
  if (!Number.isFinite(changePercent)) return null;
  return { changePercent, end };
}
