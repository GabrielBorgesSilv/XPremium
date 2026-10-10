import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { loadDashboardView } from "@/features/dashboard/services/dashboardService";
import { listarAlertas, listarNoticias } from "@/modules/integracoes";

export const dynamic = "force-dynamic";

/** Loads market data and the persisted radar from the integrations module. */
export default async function AssessorDashboardPage() {
  const [view, attentionNews, attentionAlerts] = await Promise.all([
    loadDashboardView(),
    listarNoticias(),
    listarAlertas(),
  ]);

  return (
    <DashboardShell
      overview={view.overview}
      assets={view.assets}
      fixedIncome={view.fixedIncome}
      news={view.news}
      attentionNews={attentionNews}
      attentionAlerts={attentionAlerts}
    />
  );
}
