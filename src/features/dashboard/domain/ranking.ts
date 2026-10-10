import { changePercentFromPair } from "./periodReturn";
import { expectedQuoteCurrency, selectForQuery } from "./selectors";
import {
  DEMO_ELIGIBILITY_NOTE,
  DEMO_PRICE_METHODOLOGY,
  DEMO_SCENARIO,
  RANKING_LIMIT,
  RANKING_METRIC,
  demoQuoteStatus,
  type DataOrigin,
  type MarketFixtureAsset,
  type Period,
  type PriceBasis,
  type RankingAsset,
  type RankingQuery,
  type RankingResponse,
} from "./types";

function compareSymbol(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function finiteChange(value: number | null): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function uniqueByAssetId(assets: readonly MarketFixtureAsset[]): MarketFixtureAsset[] {
  const seen = new Set<string>();
  const unique: MarketFixtureAsset[] = [];
  for (const asset of assets) {
    if (seen.has(asset.assetId)) continue;
    seen.add(asset.assetId);
    unique.push(asset);
  }
  return unique;
}

type AnalyzedRow = {
  asset: MarketFixtureAsset;
  changePercent: number;
  priceValue: number;
  currency: string;
  priceBasis: PriceBasis;
  origin: DataOrigin;
};

function hasHistoricalReference(asset: MarketFixtureAsset): boolean {
  return asset.asOf.trim().length > 0;
}

function analyze(asset: MarketFixtureAsset, period: Period): AnalyzedRow | null {
  if (!asset.eligible || !hasHistoricalReference(asset)) return null;
  const expectedCurrency = expectedQuoteCurrency(asset.region);
  if (asset.currency !== expectedCurrency) return null;

  const pair = asset.periodQuotes?.[period];
  if (pair) {
    const computed = changePercentFromPair(pair);
    if (!computed) return null;
    if (computed.end.currency !== asset.currency || computed.end.currency !== expectedCurrency) return null;
    if (computed.end.priceBasis !== asset.priceBasis) return null;
    if (computed.end.origin !== asset.origin) return null;
    return {
      asset,
      changePercent: computed.changePercent,
      priceValue: computed.end.value,
      currency: computed.end.currency,
      priceBasis: computed.end.priceBasis,
      origin: computed.end.origin,
    };
  }

  if (asset.priceValue === null) return null;
  const changePercent = finiteChange(asset.changes[period]);
  if (changePercent === null) return null;
  return {
    asset,
    changePercent,
    priceValue: asset.priceValue,
    currency: asset.currency,
    priceBasis: asset.priceBasis,
    origin: asset.origin,
  };
}

function toRankingAsset(row: AnalyzedRow): RankingAsset {
  return {
    assetId: row.asset.assetId,
    symbol: row.asset.symbol,
    name: row.asset.name,
    price: { value: row.priceValue, currency: row.currency },
    changePercent: row.changePercent,
    priceBasis: row.priceBasis,
    asOf: row.asset.asOf,
    origin: row.origin,
  };
}

function describeCoverage(
  eligibleCount: number,
  analyzedCount: number,
  gainerCount: number,
  loserCount: number,
  partial: boolean,
): string {
  const base = `${DEMO_SCENARIO}. ${DEMO_ELIGIBILITY_NOTE} ${DEMO_PRICE_METHODOLOGY} Universo de demonstração analisado neste filtro. Elegíveis: ${eligibleCount}. Analisados: ${analyzedCount}. Altas no universo: ${gainerCount}. Baixas no universo: ${loserCount}.`;
  if (partial) {
    return `${base} Cobertura parcial: o universo analisado não reúne 10 itens em cada lado. Nenhum ativo foi duplicado.`;
  }
  return `${base} Cobertura completa para o universo de demonstração deste filtro.`;
}

/**
 * Monta altas e baixas do universo já filtrado.
 * Zero, nulo, NaN, infinito, preço ausente, moeda inconsistente e `eligible=false`
 * ficam de fora. Não completa a lista até 10.
 */
export function buildRanking(
  assets: readonly MarketFixtureAsset[],
  query: RankingQuery,
): RankingResponse {
  const matched = selectForQuery(uniqueByAssetId(assets), query);
  const eligibleCount = matched.filter((asset) => asset.eligible).length;
  const analyzed = matched.flatMap((asset) => {
    const row = analyze(asset, query.period);
    return row ? [row] : [];
  });

  const positive = analyzed
    .filter((row) => row.changePercent > 0)
    .sort(
      (left, right) =>
        right.changePercent - left.changePercent ||
        compareSymbol(left.asset.symbol, right.asset.symbol),
    );
  const negative = analyzed
    .filter((row) => row.changePercent < 0)
    .sort(
      (left, right) =>
        left.changePercent - right.changePercent ||
        compareSymbol(left.asset.symbol, right.asset.symbol),
    );
  const partial = positive.length < RANKING_LIMIT || negative.length < RANKING_LIMIT;

  return {
    filters: query,
    metric: RANKING_METRIC,
    gainers: positive.slice(0, RANKING_LIMIT).map(toRankingAsset),
    losers: negative.slice(0, RANKING_LIMIT).map(toRankingAsset),
    coverage: {
      eligibleCount,
      analyzedCount: analyzed.length,
      status: partial ? "PARTIAL" : "COMPLETE_FOR_UNIVERSE",
      description: describeCoverage(
        eligibleCount,
        analyzed.length,
        positive.length,
        negative.length,
        partial,
      ),
    },
    dataStatus: demoQuoteStatus(),
  };
}
