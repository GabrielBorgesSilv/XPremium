import {
  DEMO_NEWS_SOURCE,
  DEMO_SCENARIO,
  demoReferenceStatus,
  type NewsArticle,
  type NewsResponse,
} from "../domain/types";
import { newsResponseSchema } from "../schemas/dashboardSchemas";

/**
 * Fixture temporária. O owner de GET /api/dashboard/news é o módulo 5.
 * Textos pré-carregados: generatedByAI permanece false.
 */
const articles: NewsArticle[] = [
  {
    id: "DEMO_NEWS_01",
    title: "Notícia demonstrativa 01",
    source: DEMO_NEWS_SOURCE,
    url: null,
    region: "BR",
    publishedAt: "2026-01-15T12:00:00.000Z",
    summary: {
      text: "Texto de demonstração pré-carregado. Este resumo não foi produzido por IA.",
      whyItMatters: "Contexto de demonstração, sem análise gerada por IA.",
      generatedByAI: false,
      status: "DEMO",
    },
    origin: "SIMULATED",
  },
  {
    id: "DEMO_NEWS_02",
    title: "Notícia demonstrativa 02",
    source: DEMO_NEWS_SOURCE,
    url: null,
    region: "INTL",
    publishedAt: "2026-01-14T12:00:00.000Z",
    summary: {
      text: "Texto de demonstração pré-carregado. Este resumo não foi produzido por IA.",
      whyItMatters: "Contexto de demonstração, sem análise gerada por IA.",
      generatedByAI: false,
      status: "DEMO",
    },
    origin: "SIMULATED",
  },
  {
    id: "DEMO_NEWS_03",
    title: "Notícia demonstrativa 03",
    source: DEMO_NEWS_SOURCE,
    url: null,
    region: null,
    publishedAt: "2026-01-13T12:00:00.000Z",
    summary: {
      text: "Texto de demonstração pré-carregado. Este resumo não foi produzido por IA.",
      whyItMatters: "Contexto de demonstração, sem análise gerada por IA.",
      generatedByAI: false,
      status: "DEMO",
    },
    origin: "SIMULATED",
  },
];

export const newsFixture: NewsResponse = newsResponseSchema.parse({
  selection: { strategy: "RECENCY_RELEVANCE", limit: 3 },
  articles,
  dataStatus: demoReferenceStatus(
    `${DEMO_SCENARIO}. Três notícias de demonstração em ordem de recência. O resumo não foi gerado por IA.`,
  ),
} satisfies NewsResponse);
