"use client";

import { useState } from "react";

import {
  ALOCACAO_EXEMPLO,
  CALCULOS_SIMULACAO,
  CAMPOS_REGISTRO,
  DIMENSOES_INVESTIDOR,
  EVENTOS_RELACIONAMENTO,
  FASES,
  FONTES_DADOS,
  INDICADORES_PATRIMONIAIS,
  KPIS_SUCESSO,
  METRICAS_CARTEIRA,
  PARAMETROS_INICIAIS,
  type ParametrosPainel,
} from "./referencia";

function reais(valor: number): string {
  const inteiro = Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${inteiro}`;
}

function Tabela({
  caption,
  colunas,
  linhas,
}: {
  caption: string;
  colunas: readonly string[];
  linhas: readonly (readonly string[])[];
}) {
  return (
    <div className="xp-table-wrap">
      <table className="xp-table wrap">
        <caption className="xp-sr">{caption}</caption>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna} scope="col">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha[0]}>
              {linha.map((celula, indice) =>
                indice === 0 ? (
                  <th key={celula} scope="row">
                    {celula}
                  </th>
                ) : (
                  <td key={`${linha[0]}-${indice}`}>{celula}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Campo({
  id,
  rotulo,
  valor,
  sufixo,
  onChange,
}: {
  id: keyof ParametrosPainel;
  rotulo: string;
  valor: number;
  sufixo: string;
  onChange: (id: keyof ParametrosPainel, valor: number) => void;
}) {
  return (
    <label className="xp-param" htmlFor={id}>
      {rotulo}
      <span>
        <input
          id={id}
          type="number"
          min={0}
          value={valor}
          onChange={(evento) => {
            const proximo = Number(evento.target.value);
            if (Number.isFinite(proximo) && proximo >= 0) onChange(id, proximo);
          }}
        />
        <small>{sufixo}</small>
      </span>
    </label>
  );
}

export function PainelMetricas() {
  const [parametros, setParametros] = useState<ParametrosPainel>(PARAMETROS_INICIAIS);

  function alterar(id: keyof ParametrosPainel, valor: number) {
    setParametros((atual) => ({ ...atual, [id]: valor }));
  }

  return (
    <>
      <header className="xp-head">
        <div>
          <div className="xp-kicker">REFERÊNCIA DO PAINEL</div>
          <h1>Métricas</h1>
          <p>
            Blocos para conhecer o investidor, ler a carteira e ajustar os limites usados neste painel. Os números
            abaixo são parâmetros de referência, não um cálculo da carteira do cliente.
          </p>
        </div>
        <button type="button" className="xp-btn" onClick={() => setParametros(PARAMETROS_INICIAIS)}>
          Restaurar referência
        </button>
      </header>

      <nav className="xp-metric-nav" aria-label="Seções de métricas">
        {[
          ["#investidor", "Investidor"],
          ["#carteira", "Carteira"],
          ["#simulacao", "Simulação"],
          ["#dados", "Dados"],
          ["#relacionamento", "Relacionamento"],
          ["#sucesso", "Sucesso"],
          ["#governanca", "Governança"],
          ["#fases", "Fases"],
        ].map(([href, rotulo]) => (
          <a key={href} className="xp-filter" href={href}>
            {rotulo}
          </a>
        ))}
      </nav>

      <section className="xp-card xp-band" aria-labelledby="parametros-titulo">
        <h2 id="parametros-titulo">Parâmetros deste painel</h2>
        <p className="xp-desc">
          Ajuste os limites de atenção. O texto das seções passa a usar o valor digitado. Isso não recalcula posições
          nem grava uma regra oficial.
        </p>
        <div className="xp-param-grid">
          <Campo id="reservaCriticaMeses" rotulo="Reserva crítica" valor={parametros.reservaCriticaMeses} sufixo="meses" onChange={alterar} />
          <Campo id="reservaAtencaoMeses" rotulo="Reserva em atenção" valor={parametros.reservaAtencaoMeses} sufixo="meses" onChange={alterar} />
          <Campo id="endividamentoPercent" rotulo="Endividamento crítico" valor={parametros.endividamentoPercent} sufixo="% dos ativos" onChange={alterar} />
          <Campo id="comprometimentoPercent" rotulo="Comprometimento de renda" valor={parametros.comprometimentoPercent} sufixo="% da renda" onChange={alterar} />
          <Campo id="poupancaPercent" rotulo="Poupança em atenção" valor={parametros.poupancaPercent} sufixo="% da renda" onChange={alterar} />
          <Campo id="imobiliarioPercent" rotulo="Concentração imobiliária" valor={parametros.imobiliarioPercent} sufixo="% do patrimônio" onChange={alterar} />
          <Campo id="coberturaPercent" rotulo="Cobertura de objetivos" valor={parametros.coberturaPercent} sufixo="% do capital" onChange={alterar} />
          <Campo id="emissorPercent" rotulo="Concentração por emissor" valor={parametros.emissorPercent} sufixo="% da carteira" onChange={alterar} />
          <Campo id="creditoAtencaoPercent" rotulo="Crédito privado em atenção" valor={parametros.creditoAtencaoPercent} sufixo="% da carteira" onChange={alterar} />
          <Campo id="creditoCriticoPercent" rotulo="Crédito privado crítico" valor={parametros.creditoCriticoPercent} sufixo="% da carteira" onChange={alterar} />
          <Campo id="desagioPercent" rotulo="Deságio em atenção" valor={parametros.desagioPercent} sufixo="% do valor de referência" onChange={alterar} />
          <Campo id="fgcPorInstituicao" rotulo="FGC por instituição" valor={parametros.fgcPorInstituicao} sufixo="R$" onChange={alterar} />
          <Campo id="fgcTetoQuatroAnos" rotulo="Teto FGC em quatro anos" valor={parametros.fgcTetoQuatroAnos} sufixo="R$" onChange={alterar} />
          <Campo id="fgcAlertaPercent" rotulo="Alerta de FGC" valor={parametros.fgcAlertaPercent} sufixo="% do limite" onChange={alterar} />
          <Campo id="choqueJurosBp" rotulo="Choque de juros" valor={parametros.choqueJurosBp} sufixo="pontos-base" onChange={alterar} />
          <Campo id="quedaBolsaPercent" rotulo="Queda da bolsa" valor={parametros.quedaBolsaPercent} sufixo="%" onChange={alterar} />
        </div>
      </section>

      <div className="xp-stack">
        <section className="xp-card xp-metric-section" id="investidor" aria-labelledby="investidor-titulo">
          <h2 id="investidor-titulo">Dados para conhecer o investidor</h2>
          <p className="xp-desc">
            A leitura junta carteira financeira, patrimônio global, obrigações, situação tributária e objetivos.
            Titularidade, regime de bens, estruturas societárias e exposição internacional também entram no planejamento.
          </p>
          <Tabela caption="Dimensões do investidor" colunas={["Dimensão", "Dados e parâmetros a coletar"]} linhas={DIMENSOES_INVESTIDOR} />
          <h3>Indicadores patrimoniais</h3>
          <Tabela caption="Indicadores patrimoniais" colunas={["Indicador", "Cálculo ou interpretação"]} linhas={INDICADORES_PATRIMONIAIS} />
          <p className="xp-desc">
            Com os parâmetros atuais, a reserva pede atenção abaixo de {parametros.reservaAtencaoMeses} meses e fica
            crítica abaixo de {parametros.reservaCriticaMeses}. O endividamento crítico é {parametros.endividamentoPercent}%
            dos ativos, o comprometimento de renda é {parametros.comprometimentoPercent}% e a poupança pede atenção
            abaixo de {parametros.poupancaPercent}% da renda. Imóveis acima de {parametros.imobiliarioPercent}% do
            patrimônio e objetivos cobertos em menos de {parametros.coberturaPercent}% do capital também pedem revisão.
          </p>
        </section>

        <section className="xp-card xp-metric-section" id="carteira" aria-labelledby="carteira-titulo">
          <h2 id="carteira-titulo">Métricas da carteira</h2>
          <p className="xp-desc">
            O recorte vale por ativo, emissor, instituição, classe, carteira e patrimônio consolidado. Esta tela explica
            o que cada família mede. Ela ainda não calcula VaR, TWR ou duration.
          </p>
          <Tabela caption="Métricas de carteira" colunas={["Categoria", "Métricas"]} linhas={METRICAS_CARTEIRA} />
          <h3>FGC</h3>
          <p>
            Mapear instituição ou conglomerado, produto elegível, titularidade, valor coberto e parcela descoberta. A
            referência deste painel é {reais(parametros.fgcPorInstituicao)} por CPF ou CNPJ e instituição, com teto de{" "}
            {reais(parametros.fgcTetoQuatroAnos)} em quatro anos. O alerta começa em {parametros.fgcAlertaPercent}% desse
            limite por instituição. O cálculo deve incluir principal e rendimentos elegíveis e confirmar a regra vigente.
          </p>
          <h3>Crédito privado</h3>
          <p>
            Over CP, neste painel, é concentração de crédito privado acima do teto de atenção. Atenção a partir de{" "}
            {parametros.creditoAtencaoPercent}% da carteira e caso crítico a partir de {parametros.creditoCriticoPercent}
            %. A leitura inclui spread, qualidade de crédito, garantias, subordinação, liquidez e risco de default. A
            definição operacional de “over CP” ainda precisa de confirmação.
          </p>
          <h3>Ágio, deságio e break-even</h3>
          <p>
            Ágio e deságio comparam o preço de mercado com o valor de referência do título e afetam a taxa até o
            vencimento, a venda antecipada e o imposto. Deságio a partir de {parametros.desagioPercent}% pede atenção.
            Um emissor acima de {parametros.emissorPercent}% da carteira pede revisão de concentração. O break-even é a
            taxa, o preço, o prazo ou a condição em que a troca passa a compensar, depois de custos, impostos, spreads e
            liquidez.
          </p>
        </section>

        <section className="xp-card xp-metric-section" id="simulacao" aria-labelledby="simulacao-titulo">
          <h2 id="simulacao-titulo">Simulação e comparação</h2>
          <p className="xp-desc">
            A carteira proposta se compara com a atual. Maior retorno esperado não significa, por si, uma recomendação
            melhor. A otimização futura precisa respeitar suitability, limite por emissor, liquidez, objetivos e
            preferências.
          </p>
          <div className="xp-alloc-legend">
            <span><i className="atual" />Atual</span>
            <span><i className="proposta" />Proposta</span>
          </div>
          <div className="xp-bars" aria-label="Alocação hipotética. Os percentuais somam 100% em cada cenário.">
            {ALOCACAO_EXEMPLO.map((item) => (
              <div key={item.classe} className="xp-bar-row">
                <b>{item.classe}</b>
                <div>
                  <div className="xp-bar" title={`Atual ${item.atual}%`}>
                    <span style={{ width: `${item.atual}%` }} />
                  </div>
                  <div className="xp-bar proposta" title={`Proposta ${item.proposta}%`}>
                    <span style={{ width: `${item.proposta}%` }} />
                  </div>
                </div>
                <small>
                  {item.atual}% · {item.proposta}%
                </small>
              </div>
            ))}
          </div>
          <p className="xp-desc">Carteiras hipotéticas para demonstrar a comparação. Não são recomendação de investimento.</p>
          <p>
            Perguntas que o simulador deve responder: qual a perda potencial em um choque de juros de {parametros.choqueJurosBp}{" "}
            pontos-base? Como a carteira se comportaria com queda de {parametros.quedaBolsaPercent}% da bolsa? Qual o
            efeito de um spread de crédito maior, de uma desvalorização cambial ou de uma necessidade inesperada de
            liquidez?
          </p>
          <ul className="xp-metric-list">
            {CALCULOS_SIMULACAO.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="xp-card xp-metric-section" id="dados" aria-labelledby="dados-titulo">
          <h2 id="dados-titulo">Dados e Open Finance</h2>
          <p className="xp-desc">
            O Open Finance é uma das fontes, não a única. A cobertura depende dos participantes, dos produtos, das
            permissões e do escopo compartilhado. Extratos externos, custódia e o que o investidor declara precisam ser
            conciliados.
          </p>
          <Tabela caption="Fontes e camadas de dados" colunas={["Camada", "Conteúdo"]} linhas={FONTES_DADOS} />
          <h3>Cada registro</h3>
          <ul className="xp-metric-list">
            {CAMPOS_REGISTRO.map((campo) => (
              <li key={campo}>{campo}</li>
            ))}
          </ul>
        </section>

        <section className="xp-card xp-metric-section" id="relacionamento" aria-labelledby="relacionamento-titulo">
          <h2 id="relacionamento-titulo">Relacionamento</h2>
          <p className="xp-desc">
            O assessor recebe uma próxima ação, não só um gráfico. O CRM guarda interações, pendências, compromissos e
            preferência de contato. Dado familiar só entra quando for pertinente, com transparência, controle de acesso
            e respeito à LGPD.
          </p>
          <Tabela
            caption="Eventos e próximas ações"
            colunas={["Evento", "Insight", "Próxima ação"]}
            linhas={EVENTOS_RELACIONAMENTO}
          />
        </section>

        <section className="xp-card xp-metric-section" id="sucesso" aria-labelledby="sucesso-titulo">
          <h2 id="sucesso-titulo">Indicadores de sucesso</h2>
          <p className="xp-desc">
            Metas numéricas ficam para depois de medir a operação atual. Esta tela não atribui meta interna de
            produtividade.
          </p>
          <Tabela caption="Indicadores de sucesso" colunas={["Indicador", "Como medir"]} linhas={KPIS_SUCESSO} />
        </section>

        <section className="xp-card xp-metric-section" id="governanca" aria-labelledby="governanca-titulo">
          <h2 id="governanca-titulo">Governança</h2>
          <p>
            A solução observa as normas aplicáveis da CVM, suitability, LGPD, segurança da informação e os requisitos do
            Banco Central ligados ao Open Finance.
          </p>
          <p>
            A IA apoia o assessor e não executa decisão de investimento sozinha. Cálculo financeiro crítico fica em
            motor verificável, com dado rastreável. Recomendação passa por validação humana, com conflito de interesse,
            custo, remuneração e política da instituição.
          </p>
        </section>

        <section className="xp-card xp-metric-section" id="fases" aria-labelledby="fases-titulo">
          <h2 id="fases-titulo">Ordem de implementação</h2>
          <p className="xp-desc">Primeiro a confiança no dado, depois a análise financeira e, por último, automação e IA generativa.</p>
          <Tabela caption="Fases de implementação" colunas={["Fase", "Entregável"]} linhas={FASES} />
        </section>
      </div>
    </>
  );
}
