import { newsFixture } from "../fixtures/news.fixture";
import type { NewsFeedPort } from "../providers/contracts";
import { newsResponseSchema } from "../schemas/dashboardSchemas";

/**
 * Porta local. O owner de GET /api/dashboard/news é o módulo 5;
 * esta função não chama essa rota nem nenhum provedor de IA.
 */
export const localNewsFeed: NewsFeedPort = {
  async getNews() {
    return newsResponseSchema.parse(newsFixture);
  },
};

export async function loadDashboardNews(port: NewsFeedPort = localNewsFeed) {
  return port.getNews();
}
