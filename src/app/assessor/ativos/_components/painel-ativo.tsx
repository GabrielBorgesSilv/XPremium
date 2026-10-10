import Link from "next/link";

import { type DetalheAtivo, type FiltrosVisao, LIMITE_CONCENTRACAO_PADRAO, type Variacao } from "@/modules/assessor";
import { formatarData, formatarDataHora, formatarMoeda, formatarNumero, formatarPercentual } from "@/shared/formatar";

import { GraficoLinha } from "../../_components/grafico-linha";
import { hrefCliente } from "../../_components/rotas";
import { hrefAtivos, ROTULO_CATEGORIA, ROTULO_ORIGEM, SELO_DIRECAO, SELO_FGC } from "./rotulos";

function TextoVariacao({ variacao }: { variacao: Variacao | null }) {
  if (!variacao) return <span className="xp-note">sem dados</span>;
  const classe = variacao.valor > 0 ? "xp-up" : variacao.valor < 0 ? "xp-down" : undefined;
  const texto =
    variacao.tipo === "PONTOS"
      ? `${variacao.valor > 0 ? "+" : ""}${formatarNumero(variacao.valor, 2)} p.p.`
      : formatarPercentual(variacao.valor, { sinal: true });
  return <span className={classe}>{texto}</span>;
}

function nivelExposicao(valor: number | null, peso: number | null): { classe: string; rotulo: string } {
  if ((valor ?? 0) > 100_000 || (peso ?? 0) > 0.1) return { classe: "alto", rotulo: "Exposição alta" };
  if ((valor ?? 0) > 50_000 || (peso ?? 0) > 0.05) return { classe: "medio", rotulo: "Exposição média" };
  return { classe: "baixo", rotulo: "Exposição baixa" };
}

type Props = { detalhe: DetalheAtivo; filtros: FiltrosVisao };

/** Painel lateral do ativo selecionado (?ativo=). Fechar = voltar para a URL sem o ativo. */
export function PainelAtivo({ detalhe, filtros }: Props) {
  const { linha, cotacao, serie, variacoes, noticias, clientes, marcadores } = detalhe;
  const { ativo } = linha;
  const hrefFechar = hrefAtivos(filtros, { ativo: undefined });

  return (
    <>
      <Link className="xp-overlay" href={hrefFechar} scroll={false} aria-label="Fechar painel" />
      <aside className="xp-drawer" aria-label={`Detalhes de ${ativo.ticker}`}>
        <header className="xp-drawer-head">
          <div>
            <span className="xp-tag">{ROTULO_CATEGORIA[ativo.categoria]}</span>
            <h2>{ativo.ticker}</h2>
            <p>{ativo.nome}</p>
            {ativo.emissor && (
              <p>
                Emissor: {ativo.emissor} · {ativo.coberturaFGC ? "coberto pelo FGC" : "sem cobertura do FGC"}
              </p>
            )}
          </div>
          <Link className="xp-close" href={hrefFechar} scroll={false} aria-label="Fechar">
            ✕
          </Link>
        </header>

        <div className="xp-drawer-body">
          <section className="xp-card">
            <div className="xp-price">
              <strong>{cotacao ? formatarMoeda(cotacao.preco, ativo.moeda) : "Sem cotação"}</strong>
              <span>7D <TextoVariacao variacao={variacoes["7D"]} /></span>
              <span>30D <TextoVariacao variacao={variacoes["30D"]} /></span>
            </div>
            {cotacao && (
              <p className="xp-note">
                {ROTULO_ORIGEM[cotacao.origem]} · referência {formatarDataHora(cotacao.asOf)}
              </p>
            )}
            {serie ? (
              <>
                <h2 style={{ marginTop: 14 }}>{serie.medida === "TAXA" ? "Taxa nos últimos 30 dias" : "Preço nos últimos 30 dias"}</h2>
                <p className="xp-desc">{ROTULO_ORIGEM[serie.origem]} · linhas tracejadas marcam as notícias</p>
                <GraficoLinha
                  pontos={serie.pontos}
                  medida={serie.medida}
                  moeda={serie.moeda}
                  nome={serie.medida === "TAXA" ? "Taxa" : "Preço"}
                  descricao={`Evolução ${serie.medida === "TAXA" ? "da taxa" : "do preço"} de ${ativo.ticker} em 30 dias`}
                  marcadores={marcadores}
                />
              </>
            ) : (
              <div className="xp-placeholder">Histórico indisponível para este ativo.</div>
            )}
          </section>

          <section className="xp-card">
            <h2>Exposição dos seus clientes</h2>
            <p className="xp-desc">Soma das posições de todos os clientes neste ativo</p>
            <div className="xp-metrics">
              <div><span>Valor total</span><b>{formatarMoeda(linha.valorTotal)}</b></div>
              <div><span>% do patrimônio</span><b>{formatarPercentual(linha.participacao)}</b></div>
              <div><span>Clientes</span><b>{linha.numClientes}</b></div>
            </div>
          </section>

          <section className="xp-card">
            <h2>Notícias que podem impactar</h2>
            <p className="xp-desc">Análise automática por IA: pode conter erros e não é recomendação de investimento.</p>
            {noticias.length === 0 ? (
              <p className="xp-note">Nenhuma notícia relacionada a este ativo.</p>
            ) : (
              noticias.map(({ impacto, titulo, fonte }) => (
                <article key={impacto.noticiaId} className="xp-news">
                  <div className="xp-news-tags">
                    <span className={`xp-tag ${SELO_DIRECAO[impacto.direcao].classe}`}>{SELO_DIRECAO[impacto.direcao].texto}</span>
                    <span className="xp-tag ink">Gerado por IA</span>
                  </div>
                  <b>{titulo}</b>
                  <p>{impacto.motivo}</p>
                  <small>{fonte} · {formatarData(impacto.publicadoEm)}</small>
                </article>
              ))
            )}
          </section>

          <section className="xp-card">
            <h2>Clientes com este ativo</h2>
            <p className="xp-desc">Sinal vermelho: valor acima de R$ 100.000 ou peso acima de 10%. Amarelo: acima de R$ 50.000 ou 5%. Verde: abaixo desses limites.</p>
            <div className="xp-table-wrap">
              <table className="xp-table">
                <thead>
                  <tr><th>Cliente</th><th>Quantidade</th><th>Valor</th><th>Peso</th></tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.clienteId}>
                      <td>
                        {(() => {
                          const nivel = nivelExposicao(c.valor, c.pesoNaCarteira);
                          return <span className={`xp-risk-signal ${nivel.classe}`} role="img" aria-label={nivel.rotulo} title={nivel.rotulo} />;
                        })()}
                        <Link href={hrefCliente(c.clienteId)}>{c.nome}</Link>
                      </td>
                      <td>{formatarNumero(c.quantidade, 4)}</td>
                      <td>{formatarMoeda(c.valor)}</td>
                      <td>
                        {formatarPercentual(c.pesoNaCarteira)}
                        {(c.acimaDoLimite || c.fgc) && (
                          <div className="xp-cell-tags">
                            {c.acimaDoLimite && <span className="xp-tag mix">Concentrado</span>}
                            {c.fgc && (
                              <span
                                className={`xp-tag ${SELO_FGC[c.fgc.situacao].classe}`}
                                title={`${formatarMoeda(c.fgc.valorCoberto)} em títulos cobertos de ${c.fgc.emissor}`}
                              >
                                {c.fgc.situacao === "ACIMA"
                                  ? `Acima do FGC · ${formatarMoeda(c.fgc.descoberto)} descobertos`
                                  : `Perto do FGC · ${formatarMoeda(c.fgc.valorCoberto)} no emissor`}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
