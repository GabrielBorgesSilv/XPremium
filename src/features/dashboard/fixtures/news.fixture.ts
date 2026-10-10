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
    title: "O panorama fica fixo enquanto você filtra",
    source: DEMO_NEWS_SOURCE,
    url: null,
    region: "BR",
    publishedAt: "2026-01-15T12:00:00.000Z",
    summary: {
      text: "Os quatro cartões do topo resumem a bolsa no Brasil, os juros, a bolsa internacional e o dólar. Trocar região, categoria ou período não mexe nesses números.",
      whyItMatters: "Use o panorama para situar o dia e os filtros para olhar um recorte específico com o cliente.",
      generatedByAI: false,
      status: "DEMO",
    },
    origin: "SIMULATED",
  },
  {
    id: "DEMO_NEWS_02",
    title: "Altas e baixas seguem o recorte escolhido",
    source: DEMO_NEWS_SOURCE,
    url: null,
    region: "INTL",
    publishedAt: "2026-01-14T12:00:00.000Z",
    summary: {
      text: "Ações, FIIs ou REITs, ETFs e cripto mostram até dez altas e dez baixas. O período 1D, 7D ou 30D muda a variação. Renda fixa abre outra tabela, com taxa, preço e vencimento, sem ranking.",
      whyItMatters: "A lista responde à pergunta do cliente sem misturar Brasil com exterior nem cripto com fundo imobiliário.",
      generatedByAI: false,
      status: "DEMO",
    },
    origin: "SIMULATED",
  },
  {
    id: "DEMO_NEWS_03",
    title: "Atualizar reaproveita a cotação recente",
    source: DEMO_NEWS_SOURCE,
    url: null,
    region: null,
    publishedAt: "2026-01-13T12:00:00.000Z",
    summary: {
      text: "O botão Atualizar pede as cotações de novo. Se a última leitura tiver menos de 15 minutos, o painel reutiliza o mesmo conjunto e os preços não mudam.",
      whyItMatters: "A data de referência permanece a do cenário, para a conversa não misturar horários diferentes.",
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
    `${DEMO_SCENARIO}. Três notas do guia do painel, em ordem de recência. O resumo não foi gerado por IA.`,
  ),
} satisfies NewsResponse);
