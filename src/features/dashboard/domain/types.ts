/**
 * Contratos do Dashboard do Assessor.
 * Valores de mercado deste módulo são de demonstração; a seleção final de
 * indicadores, limites de liquidez e o universo elegível ainda não foram aprovados.
 */

export const REGIONS = ["BR", "INTL"] as const;
export const CATEGORIES = ["STOCK", "REAL_ESTATE", "ETF", "CRYPTO", "FIXED_INCOME"] as const;
export const RANKING_CATEGORIES = ["STOCK", "REAL_ESTATE", "ETF", "CRYPTO"] as const;
export const PERIODS = ["1D", "7D", "15D", "30D"] as const;
export const DATA_ORIGINS = ["REAL", "SIMULATED"] as const;
export const FRESHNESS_VALUES = ["CURRENT", "STALE", "UNAVAILABLE"] as const;
export const PRICE_BASES = ["ADJUSTED", "UNADJUSTED", "NOT_APPLICABLE"] as const;
export const ASSET_TYPES = ["STOCK", "ETF", "CRYPTO", "FII", "REIT"] as const;
export const FIXTURE_ROLES = [
  "gainer",
  "loser",
  "flat",
  "ineligible",
  "foreign-currency",
  "missing-price",
  "missing-change",
] as const;
export const COVERAGE_STATUSES = ["COMPLETE_FOR_UNIVERSE", "PARTIAL"] as const;
export const NEWS_SUMMARY_STATUSES = ["DEMO", "GENERATED", "VALIDATED", "UNAVAILABLE"] as const;
export const REFRESH_RESOURCES = ["overview", "rankings", "fixed-income", "news"] as const;
export const REFRESH_OUTCOMES = [
  "REFRESHED",
  "CACHE_REUSED",
  "STALE_FALLBACK",
  "SIMULATED",
  "UNAVAILABLE",
] as const;
export const REFRESH_STATUSES = ["COMPLETED", "PARTIAL"] as const;

export type Region = (typeof REGIONS)[number];
export type Category = (typeof CATEGORIES)[number];
export type RankingCategory = (typeof RANKING_CATEGORIES)[number];
export type Period = (typeof PERIODS)[number];
export type DataOrigin = (typeof DATA_ORIGINS)[number];
export type Freshness = (typeof FRESHNESS_VALUES)[number];
export type PriceBasis = (typeof PRICE_BASES)[number];
export type AssetType = (typeof ASSET_TYPES)[number];
export type FixtureRole = (typeof FIXTURE_ROLES)[number];
export type CoverageStatus = (typeof COVERAGE_STATUSES)[number];
export type NewsSummaryStatus = (typeof NEWS_SUMMARY_STATUSES)[number];
export type RefreshResource = (typeof REFRESH_RESOURCES)[number];
export type RefreshOutcome = (typeof REFRESH_OUTCOMES)[number];
export type RefreshStatus = (typeof REFRESH_STATUSES)[number];

/** Moeda de cotação. O código acompanha o valor; preço sem moeda é inválido. */
export type Money = {
  value: number;
  currency: string;
};

/** Ponto de preço usado só quando a variação do período é calculada. */
export type QuotePoint = {
  value: number;
  currency: string;
  priceBasis: PriceBasis;
  origin: DataOrigin;
};

/** Par inicial e final. Os dois pontos precisam coincidir em moeda, base e origem. */
export type PeriodPricePair = {
  start: QuotePoint | null;
  end: QuotePoint | null;
};

/**
 * Snapshot de proveniência. `asOf` é a referência do conjunto e `fetchedAt` é
 * o momento em que o conjunto foi obtido. No MVP ambos são fixos e simulados.
 */
export type DataSnapshot = {
  origin: DataOrigin;
  freshness: Freshness;
  source: string;
  asOf: string | null;
  fetchedAt: string | null;
  expiresAt: string | null;
  message: string;
};

export type DataStatus = DataSnapshot;

export type MarketIndicator = {
  id: string;
  name: string;
  region: Region;
  value: number;
  unit: string;
  changePercent: number;
  dataStatus: DataStatus;
};

export type OverviewResponse = {
  indicators: MarketIndicator[];
  dataStatus: DataStatus;
};

export type RankingAsset = {
  assetId: string;
  symbol: string;
  name: string;
  price: Money | null;
  changePercent: number;
  priceBasis: PriceBasis;
  asOf: string;
  origin: DataOrigin;
};

export type RankingQuery = {
  region: Region;
  category: RankingCategory;
  period: Period;
};

export type RankingResponse = {
  filters: RankingQuery;
  metric: string;
  gainers: RankingAsset[];
  losers: RankingAsset[];
  coverage: {
    eligibleCount: number;
    analyzedCount: number;
    status: CoverageStatus;
    description: string;
  };
  dataStatus: DataStatus;
};

export type YieldRate = {
  value: number;
  unit: string;
  type: string;
};

export type UnitPrice = {
  value: number;
  type: string;
};

export type HistoricalReturn = {
  value: number;
  period: string;
  methodology: string;
};

export type FixedIncomeInstrument = {
  id: string;
  name: string;
  currency: string;
  country: string;
  referenceDate: string;
  maturityDate: string | null;
  yieldRate: YieldRate | null;
  unitPrice: UnitPrice | null;
  historicalReturn: HistoricalReturn | null;
  dataStatus: DataStatus;
};

export type FixedIncomeResponse = {
  region: Region;
  instruments: FixedIncomeInstrument[];
  dataStatus: DataStatus;
};

export type NewsSummary = {
  text: string | null;
  whyItMatters: string | null;
  generatedByAI: boolean;
  status: NewsSummaryStatus;
};

export type NewsArticle = {
  id: string;
  title: string;
  source: string;
  url: string | null;
  region: Region | null;
  publishedAt: string;
  summary: NewsSummary;
  origin: DataOrigin;
};

export type NewsResponse = {
  selection: {
    strategy: "RECENCY_RELEVANCE";
    limit: 3;
  };
  articles: NewsArticle[];
  dataStatus: DataStatus;
};

export type RefreshRequest = {
  resources: RefreshResource[];
};

export type RefreshResult = {
  resource: RefreshResource;
  outcome: RefreshOutcome;
};

export type RefreshResponse = {
  status: RefreshStatus;
  results: RefreshResult[];
  requestedAt: string;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: {
      allowedValues?: string[];
    };
  };
};

/**
 * Ativo do universo de demonstração. `liquidityMetric` não é regra aprovada:
 * a participação no ranking depende só de `eligible` e da série válida.
 */
export type MarketFixtureAsset = {
  assetId: string;
  symbol: string;
  name: string;
  region: Region;
  category: RankingCategory;
  assetType: AssetType;
  editorialRegion: Region;
  quoteContext: string;
  eligible: boolean;
  liquidityMetric: number;
  eligibilityNote: string;
  exclusionReason: string | null;
  currency: string;
  priceValue: number | null;
  priceBasis: PriceBasis;
  changes: Record<Period, number | null>;
  /**
   * Quando o período está presente, a variação sai deste par.
   * A série pré-calculada em `changes` não preenche um par inválido.
   */
  periodQuotes?: Partial<Record<Period, PeriodPricePair>>;
  marketWindowNote: string | null;
  asOf: string;
  origin: DataOrigin;
  role: FixtureRole;
};

export const SIMULATED_LABEL = "Dados simulados";
export const DEMO_SOURCE = "DEMO";
export const DEMO_SCENARIO = "Cenário fictício";
export const DEMO_AS_OF = "2026-01-15T18:00:00.000Z";
export const DEMO_FETCHED_AT = "2026-01-15T18:00:00.000Z";
export const DEMO_QUOTE_EXPIRES_AT = "2026-01-15T18:15:00.000Z";
export const DEMO_REFERENCE_DATE = "2026-01-15";
export const DEMO_NEWS_SOURCE = "Guia do painel";
export const DEMO_ELIGIBILITY_NOTE =
  "Limite de liquidez não aprovado; liquidityMetric é atributo de demonstração e não aplica threshold.";
export const DEMO_PRICE_METHODOLOGY =
  "Variação fictícia na moeda de cotação. priceBasis é marca do conjunto de demonstração e não comprova retorno total.";
export const CRYPTO_WINDOW_NOTE =
  "Janela de cálculo contínua de demonstração; não representa pregão.";
export const RANKING_METRIC = "changePercent";
export const RANKING_LIMIT = 10;

export function demoQuoteStatus(): DataStatus {
  return {
    origin: "SIMULATED",
    freshness: "CURRENT",
    source: DEMO_SOURCE,
    asOf: DEMO_AS_OF,
    fetchedAt: DEMO_FETCHED_AT,
    expiresAt: DEMO_QUOTE_EXPIRES_AT,
    message: `${SIMULATED_LABEL}. ${DEMO_SCENARIO}. Referência fixa do conjunto; cache inicial de cotações de 15 minutos.`,
  };
}

/** Renda fixa e notícias não herdam o TTL de 15 minutos das cotações. */
export function demoReferenceStatus(message: string): DataStatus {
  return {
    origin: "SIMULATED",
    freshness: "CURRENT",
    source: DEMO_SOURCE,
    asOf: DEMO_AS_OF,
    fetchedAt: DEMO_FETCHED_AT,
    expiresAt: null,
    message: `${SIMULATED_LABEL}. ${message}`,
  };
}
