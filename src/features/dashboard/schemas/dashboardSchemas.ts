import { z } from "zod";

import {
  ASSET_TYPES,
  CATEGORIES,
  COVERAGE_STATUSES,
  DATA_ORIGINS,
  FIXTURE_ROLES,
  FRESHNESS_VALUES,
  NEWS_SUMMARY_STATUSES,
  PERIODS,
  PRICE_BASES,
  RANKING_CATEGORIES,
  REFRESH_OUTCOMES,
  REFRESH_RESOURCES,
  REFRESH_STATUSES,
  REGIONS,
} from "../domain/types";

const isoDateTimeSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const finiteNumberSchema = z.number().refine((value) => Number.isFinite(value), {
  message: "Número finito obrigatório",
});

export const regionSchema = z.enum(REGIONS);
export const categorySchema = z.enum(CATEGORIES);
export const rankingCategorySchema = z.enum(RANKING_CATEGORIES);
export const periodSchema = z.enum(PERIODS);
export const dataOriginSchema = z.enum(DATA_ORIGINS);
export const freshnessSchema = z.enum(FRESHNESS_VALUES);
export const priceBasisSchema = z.enum(PRICE_BASES);

export const dataStatusSchema = z.object({
  origin: dataOriginSchema,
  freshness: freshnessSchema,
  source: z.string().min(1),
  asOf: isoDateTimeSchema.nullable(),
  fetchedAt: isoDateTimeSchema.nullable(),
  expiresAt: isoDateTimeSchema.nullable(),
  message: z.string().min(1),
});

export const moneySchema = z.object({
  value: finiteNumberSchema,
  currency: z.string().min(1),
});

export const marketIndicatorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  region: regionSchema,
  value: finiteNumberSchema,
  unit: z.string().min(1),
  changePercent: finiteNumberSchema,
  dataStatus: dataStatusSchema,
});

export const overviewResponseSchema = z.object({
  indicators: z.array(marketIndicatorSchema),
  dataStatus: dataStatusSchema,
});

export const rankingAssetSchema = z.object({
  assetId: z.string().min(1),
  symbol: z.string().min(1),
  name: z.string().min(1),
  price: moneySchema.nullable(),
  changePercent: finiteNumberSchema.refine((value) => value !== 0, {
    message: "Zero não entra no ranking",
  }),
  priceBasis: priceBasisSchema,
  asOf: isoDateTimeSchema,
  origin: dataOriginSchema,
});

export const rankingQuerySchema = z.object({
  region: regionSchema,
  category: rankingCategorySchema,
  period: periodSchema,
});

export const rankingResponseSchema = z.object({
  filters: rankingQuerySchema,
  metric: z.string().min(1),
  gainers: z.array(rankingAssetSchema).max(10),
  losers: z.array(rankingAssetSchema).max(10),
  coverage: z.object({
    eligibleCount: z.number().int().nonnegative(),
    analyzedCount: z.number().int().nonnegative(),
    status: z.enum(COVERAGE_STATUSES),
    description: z.string().min(1),
  }),
  dataStatus: dataStatusSchema,
});

export const fixedIncomeInstrumentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  currency: z.string().min(1),
  country: z.string().min(1),
  referenceDate: isoDateSchema,
  maturityDate: isoDateSchema.nullable(),
  yieldRate: z
    .object({
      value: finiteNumberSchema,
      unit: z.string().min(1),
      type: z.string().min(1),
    })
    .nullable(),
  unitPrice: z
    .object({
      value: finiteNumberSchema,
      type: z.string().min(1),
    })
    .nullable(),
  historicalReturn: z
    .object({
      value: finiteNumberSchema,
      period: z.string().min(1),
      methodology: z.string().min(1),
    })
    .nullable(),
  dataStatus: dataStatusSchema,
});

export const fixedIncomeResponseSchema = z.object({
  region: regionSchema,
  instruments: z.array(fixedIncomeInstrumentSchema),
  dataStatus: dataStatusSchema,
});

export const newsArticleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  source: z.string().min(1),
  url: z.string().min(1).nullable(),
  region: regionSchema.nullable(),
  publishedAt: isoDateTimeSchema,
  summary: z.object({
    text: z.string().nullable(),
    whyItMatters: z.string().nullable(),
    generatedByAI: z.boolean(),
    status: z.enum(NEWS_SUMMARY_STATUSES),
  }),
  origin: dataOriginSchema,
});

export const newsResponseSchema = z.object({
  selection: z.object({
    strategy: z.literal("RECENCY_RELEVANCE"),
    limit: z.literal(3),
  }),
  articles: z.array(newsArticleSchema).max(3),
  dataStatus: dataStatusSchema,
});

export const refreshRequestSchema = z.object({
  resources: z.array(z.enum(REFRESH_RESOURCES)).min(1),
});

export const refreshResponseSchema = z.object({
  status: z.enum(REFRESH_STATUSES),
  results: z.array(
    z.object({
      resource: z.enum(REFRESH_RESOURCES),
      outcome: z.enum(REFRESH_OUTCOMES),
    }),
  ),
  requestedAt: isoDateTimeSchema,
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z
      .object({
        allowedValues: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

export const marketFixtureAssetSchema = z.object({
  assetId: z.string().min(1),
  symbol: z.string().regex(/^DEMO_[A-Z0-9_]+$/),
  name: z.string().min(1),
  region: regionSchema,
  category: rankingCategorySchema,
  assetType: z.enum(ASSET_TYPES),
  editorialRegion: regionSchema,
  quoteContext: z.string().min(1),
  eligible: z.boolean(),
  liquidityMetric: finiteNumberSchema,
  eligibilityNote: z.string().min(1),
  exclusionReason: z.string().nullable(),
  currency: z.string().min(1),
  priceValue: finiteNumberSchema.nullable(),
  priceBasis: priceBasisSchema,
  changes: z.object({
    "1D": finiteNumberSchema.nullable(),
    "7D": finiteNumberSchema.nullable(),
    "30D": finiteNumberSchema.nullable(),
  }),
  marketWindowNote: z.string().nullable(),
  asOf: isoDateTimeSchema,
  origin: dataOriginSchema,
  role: z.enum(FIXTURE_ROLES),
});

export const marketFixtureListSchema = z.array(marketFixtureAssetSchema).min(1);
