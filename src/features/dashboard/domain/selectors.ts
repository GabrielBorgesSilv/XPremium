import type { AssetType, MarketFixtureAsset, RankingCategory, RankingQuery, Region } from "./types";

/** Moeda de cotação do conjunto de demonstração. BR em BRL e INTL em USD. */
export function expectedQuoteCurrency(region: Region): "BRL" | "USD" {
  return region === "BR" ? "BRL" : "USD";
}

/**
 * Tipo coerente com a região. REIT não entra no Brasil e FII não entra no exterior.
 * A região de cripto é editorial do conjunto, não uma fronteira territorial do mercado.
 */
export function expectedAssetType(region: Region, category: RankingCategory): AssetType {
  if (category === "REAL_ESTATE") {
    return region === "BR" ? "FII" : "REIT";
  }
  if (category === "STOCK") return "STOCK";
  if (category === "ETF") return "ETF";
  return "CRYPTO";
}

export function matchesRankingScope(asset: MarketFixtureAsset, query: RankingQuery): boolean {
  return (
    asset.region === query.region &&
    asset.editorialRegion === query.region &&
    asset.category === query.category &&
    asset.assetType === expectedAssetType(query.region, query.category)
  );
}

export function selectForQuery(
  assets: readonly MarketFixtureAsset[],
  query: RankingQuery,
): MarketFixtureAsset[] {
  return assets.filter((asset) => matchesRankingScope(asset, query));
}
