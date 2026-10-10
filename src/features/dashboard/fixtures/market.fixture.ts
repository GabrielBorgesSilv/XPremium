import {
  CRYPTO_WINDOW_NOTE,
  DEMO_AS_OF,
  DEMO_ELIGIBILITY_NOTE,
  RANKING_CATEGORIES,
  REGIONS,
  demoQuoteStatus,
  type AssetType,
  type FixtureRole,
  type MarketFixtureAsset,
  type MarketIndicator,
  type OverviewResponse,
  type Period,
  type PriceBasis,
  type RankingCategory,
  type Region,
} from "../domain/types";
import { expectedAssetType, expectedQuoteCurrency } from "../domain/selectors";
import { marketFixtureListSchema, overviewResponseSchema } from "../schemas/dashboardSchemas";

const PERIOD_FACTOR: Record<Period, number> = {
  "1D": 1,
  "7D": 3,
  "30D": 5,
};

const ROLE_PLAN: { role: FixtureRole; count: number }[] = [
  { role: "gainer", count: 12 },
  { role: "loser", count: 12 },
  { role: "flat", count: 1 },
  { role: "ineligible", count: 1 },
  { role: "foreign-currency", count: 1 },
  { role: "missing-price", count: 1 },
  { role: "missing-change", count: 1 },
];

function symbolToken(region: Region, category: RankingCategory): AssetType {
  return expectedAssetType(region, category);
}

function changesFor(role: FixtureRole, magnitude: number): Record<Period, number | null> {
  if (role === "missing-change") {
    return { "1D": null, "7D": null, "30D": null };
  }
  if (role === "flat") {
    return { "1D": 0, "7D": 0, "30D": 0 };
  }
  const sign = role === "loser" ? -1 : 1;
  return {
    "1D": sign * magnitude * PERIOD_FACTOR["1D"],
    "7D": sign * magnitude * PERIOD_FACTOR["7D"],
    "30D": sign * magnitude * PERIOD_FACTOR["30D"],
  };
}

function priceBasisFor(category: RankingCategory, role: FixtureRole): PriceBasis {
  if (category === "CRYPTO") return "UNADJUSTED";
  if (role === "gainer") return "ADJUSTED";
  if (role === "loser") return "UNADJUSTED";
  return "NOT_APPLICABLE";
}

function buildAsset(
  region: Region,
  category: RankingCategory,
  role: FixtureRole,
  sequence: number,
  magnitude: number,
): MarketFixtureAsset {
  const token = symbolToken(region, category);
  const symbol = `DEMO_${region}_${token}_${String(sequence).padStart(2, "0")}`;
  const currency = role === "foreign-currency" ? "EUR" : expectedQuoteCurrency(region);
  const quoteContext =
    category === "CRYPTO"
      ? `Cotação de demonstração em ${currency}. Região editorial ${region}; o conjunto não afirma restrição territorial do mercado.`
      : `Cotação de demonstração em ${currency}.`;

  return {
    assetId: symbol,
    symbol,
    name: `Ativo demonstrativo ${token} ${region} ${String(sequence).padStart(2, "0")}`,
    region,
    category,
    assetType: token,
    editorialRegion: region,
    quoteContext,
    eligible: role !== "ineligible",
    liquidityMetric: role === "ineligible" ? 100 : role === "gainer" && magnitude === 12 ? 1 : 50,
    eligibilityNote: DEMO_ELIGIBILITY_NOTE,
    exclusionReason:
      role === "ineligible"
        ? "Excluído do universo de demonstração por eligible=false. Sem threshold de liquidez aprovado."
        : null,
    currency,
    priceValue: role === "missing-price" ? null : 100 + sequence,
    priceBasis: priceBasisFor(category, role),
    changes: changesFor(role, magnitude),
    marketWindowNote: category === "CRYPTO" ? CRYPTO_WINDOW_NOTE : null,
    asOf: DEMO_AS_OF,
    origin: "SIMULATED",
    role,
  };
}

function buildMarketFixtures(): MarketFixtureAsset[] {
  const assets: MarketFixtureAsset[] = [];
  for (const region of REGIONS) {
    for (const category of RANKING_CATEGORIES) {
      let sequence = 1;
      for (const step of ROLE_PLAN) {
        for (let index = 0; index < step.count; index += 1) {
          const magnitude = step.count > 1 ? index + 1 : 1;
          assets.push(buildAsset(region, category, step.role, sequence, magnitude));
          sequence += 1;
        }
      }
    }
  }
  return assets;
}

/** Universo fictício. Símbolos `DEMO_*` e variações estáveis por período. */
export const marketFixtures: readonly MarketFixtureAsset[] = marketFixtureListSchema.parse(
  buildMarketFixtures(),
);

const indicatorPlan: Array<{
  id: string;
  name: string;
  region: Region;
  value: number;
  changePercent: number;
}> = [
  {
    id: "DEMO_IND_BR_01",
    name: "Indicador demonstrativo Brasil 01",
    region: "BR",
    value: 10,
    changePercent: 1,
  },
  {
    id: "DEMO_IND_BR_02",
    name: "Indicador demonstrativo Brasil 02",
    region: "BR",
    value: 20,
    changePercent: -1,
  },
  {
    id: "DEMO_IND_INTL_01",
    name: "Indicador demonstrativo internacional 01",
    region: "INTL",
    value: 30,
    changePercent: 2,
  },
  {
    id: "DEMO_IND_INTL_02",
    name: "Indicador demonstrativo internacional 02",
    region: "INTL",
    value: 40,
    changePercent: -2,
  },
];

function buildOverview(): OverviewResponse {
  const indicators: MarketIndicator[] = indicatorPlan.map((indicator) => ({
    ...indicator,
    unit: "pontos de demonstração",
    dataStatus: demoQuoteStatus(),
  }));
  return {
    indicators,
    dataStatus: demoQuoteStatus(),
  };
}

/**
 * Indicadores ilustrativos. A seleção final do panorama não foi aprovada;
 * os ids DEMO são configuráveis neste arquivo.
 */
export const overviewFixture: OverviewResponse = overviewResponseSchema.parse(buildOverview());

export const DEMO_INDICATOR_IDS = indicatorPlan.map((indicator) => indicator.id);
