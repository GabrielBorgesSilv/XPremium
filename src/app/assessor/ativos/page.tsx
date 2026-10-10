import { obterVisaoAtivos } from "@/modules/assessor";
import { formatarData } from "@/shared/formatar";

import { Filtros } from "./_components/filtros";
import { PainelAtivo } from "./_components/painel-ativo";
import { Resumo } from "./_components/resumo";
import { ROTULO_ORIGEM } from "./_components/rotulos";
import { TabelaAtivos } from "./_components/tabela-ativos";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AtivosPage({ searchParams }: Props) {
  const visao = await obterVisaoAtivos(await searchParams);
  const { resumo, filtros } = visao;

  return (
    <>
      <div className="xp-head">
        <div>
          <div className="xp-kicker">INVESTIMENTOS DOS CLIENTES</div>
          <h1>Ativos da carteira</h1>
          <p>Posições dos seus clientes agrupadas por ativo, com alertas de notícias.</p>
        </div>
        <span className="xp-tag mix">
          {ROTULO_ORIGEM[visao.origem]} · ref. {formatarData(visao.asOf)}
        </span>
      </div>

      <Resumo visao={visao} />

      {resumo.semCotacao.length > 0 && (
        <div className="xp-warn">
          Cobertura parcial: {resumo.semCotacao.join(", ")} sem cotação no momento. Esses ativos aparecem na lista, mas
          ficam fora dos totais e dos percentuais.
        </div>
      )}

      <section className="xp-card">
        <h2>Ativos dos seus clientes</h2>
        <p className="xp-desc">Clique em um ativo para ver gráfico, notícias e quem tem o ativo.</p>
        <Filtros filtros={filtros} />
        <TabelaAtivos linhas={visao.linhas} filtros={filtros} />
      </section>

      {visao.detalhe && <PainelAtivo detalhe={visao.detalhe} filtros={filtros} />}
    </>
  );
}
