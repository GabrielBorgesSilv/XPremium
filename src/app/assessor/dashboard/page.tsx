import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { fixedIncomeFixtures } from "@/features/dashboard/fixtures/fixedIncome.fixture";
import { marketFixtures, overviewFixture } from "@/features/dashboard/fixtures/market.fixture";
import { loadDashboardNews } from "@/features/dashboard/services/newsService";

/**
 * A página usa o guard pendente nas rotas e a porta local de notícias.
 * requireAssessor e GET /api/dashboard/news ainda não existem nos módulos 1 e 5.
 */
export default async function AssessorDashboardPage() {
  const news = await loadDashboardNews();

  return (
    <DashboardShell
      overview={overviewFixture}
      assets={marketFixtures}
      fixedIncome={fixedIncomeFixtures}
      news={news}
    />
  );
}
