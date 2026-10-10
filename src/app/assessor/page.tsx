import { AgendaDoDia } from "@/features/dashboard/components/AgendaDoDia";
import { atividadesDaAgenda } from "@/features/dashboard/fixtures/atividades.fixture";
import { obterVisaoAtivos } from "@/modules/assessor";
import { exigirPapel } from "@/modules/usuarios";
import { listarAlertas, listarNoticias } from "@/modules/integracoes";
import { MarketRadar } from "@/shared/ui/market-radar";

export const dynamic = "force-dynamic";

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

export default async function AssessorPage() {
  const [usuario, news, alerts, ativos] = await Promise.all([
    exigirPapel("assessor"),
    listarNoticias(),
    listarAlertas(),
    obterVisaoAtivos({}),
  ]);
  const investments = ativos.linhas.map(({ ativo }) => ({ ticker: ativo.ticker, nome: ativo.nome }));

  return <><MarketRadar news={news} alerts={alerts} investments={investments}/><AgendaDoDia atividades={atividadesDaAgenda} nome={primeiroNome(usuario.nome)}/></>;
}