import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { loadDashboardView } from "@/features/dashboard/services/dashboardService";

/**
 * A página pede a visão aos provedores locais.
 * requireAssessor e GET /api/dashboard/news ainda não existem nos módulos 1 e 5.
 */
export default async function AssessorDashboardPage() {
  const view = await loadDashboardView();

  return (
    <DashboardShell
      overview={view.overview}
      assets={view.assets}
      fixedIncome={view.fixedIncome}
      news={view.news}
    />
  );
}
