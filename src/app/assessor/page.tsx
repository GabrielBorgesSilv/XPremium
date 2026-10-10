import { exigirPapel } from "@/modules/usuarios";
import { obterVisaoAtivos } from "@/modules/assessor";
import { DashboardAssessoria } from "@/shared/ui/dashboard";
import { listarAlertas, listarNoticias } from "@/modules/integracoes";

export const dynamic = "force-dynamic";

export default async function AssessorPage() {
  const usuario = await exigirPapel("assessor");
  const [news, alerts, ativos] = await Promise.all([listarNoticias(), listarAlertas(), obterVisaoAtivos({})]);
  const investments = ativos.linhas.map(({ ativo }) => ({ ticker: ativo.ticker, nome: ativo.nome }));
  return <DashboardAssessoria news={news} alerts={alerts} investments={investments} userName={usuario.nome} />;
}
