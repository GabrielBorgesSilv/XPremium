import Link from "next/link";
import { notFound } from "next/navigation";

import { ESTADOS_CIVIS, FAIXAS_RENDA, obterContatoWhatsApp, obterDashCliente, ROTULO_BLOCO, type Severidade } from "@/modules/assessor";
import { exigirPapel } from "@/modules/usuarios";
import { formatarData, formatarMoeda, formatarMoedaCompacta, formatarNumero, formatarPercentual } from "@/shared/formatar";

import { GraficoLinha } from "../../_components/grafico-linha";
import { hrefAtivo } from "../../_components/rotas";
import { ROTULO_CATEGORIA, ROTULO_ORIGEM } from "../../ativos/_components/rotulos";
import { EnviarWhatsApp } from "./enviar-whatsapp";

type Props = { params: Promise<{ clienteId: string }> };

const SELO_SEVERIDADE: Record<Severidade, { texto: string; classe: string }> = {
  ALTA: { texto: "Alta", classe: "neg" },
  MEDIA: { texto: "Média", classe: "mix" },
  INFO: { texto: "Info", classe: "ind" },
};

export default async function DashClientePage({ params }: Props) {
  const { clienteId } = await params;
  const usuario = await exigirPapel("assessor");
  const id = decodeURIComponent(clienteId);
  const dash = await obterDashCliente(id);
  // Cliente inexistente ou de outro assessor: a mesma resposta, para não revelar quem existe.
  if (!dash) notFound();
  const whatsapp = await obterContatoWhatsApp(id, usuario.nome);

  const { cliente, cadastro, carteira, evolucao, pontos } = dash;
  const maior = carteira.posicoes.find((p) => p.valor !== null);
  const relevantes = pontos.filter((p) => p.severidade !== "INFO").length;

  return (
    <>
      <Link className="xp-back" href="/assessor/clientes">← Meus clientes</Link>

      <div className="xp-head">
        <div>
          <div className="xp-kicker">CLIENTE</div>
          <h1>{cliente.nome}</h1>
          <p>
            {cadastro.idade} anos · {cadastro.profissao}
          </p>
        </div>
        <span className="xp-tag mix">
          {ROTULO_ORIGEM[dash.origem]} · ref. {formatarData(dash.asOf)}
        </span>
      </div>

      <div className="xp-grid-stats">
        <section className="xp-card xp-stat">
          <label>Patrimônio</label>
          <strong>{formatarMoedaCompacta(carteira.total)}</strong>
          <p className="xp-note">{formatarMoeda(carteira.total)} em posições com cotação</p>
        </section>
        <section className="xp-card xp-stat">
          <label>Ativos</label>
          <strong>{carteira.posicoes.length}</strong>
          <p className="xp-note">{carteira.composicao.length} categoria(s)</p>
        </section>
        <section className="xp-card xp-stat">
          <label>Maior posição</label>
          <strong>{maior ? maior.ativo.ticker : "—"}</strong>
          <p className="xp-note">{maior ? `${formatarPercentual(maior.peso)} da carteira` : "Sem posições com cotação"}</p>
        </section>
        <section className="xp-card xp-stat">
          <label>Pontos de atenção</label>
          <strong>{relevantes}</strong>
          <p className="xp-note">De severidade alta ou média</p>
        </section>
      </div>

      {whatsapp && (
        <EnviarWhatsApp
          clienteId={id}
          celular={whatsapp.celular}
          origemCelular={whatsapp.origemCelular}
          disponiveis={whatsapp.disponiveis.map((bloco) => ({ bloco, rotulo: ROTULO_BLOCO[bloco] }))}
          mensagens={whatsapp.mensagens}
        />
      )}

      <section className="xp-card xp-section">
        <h2>Pontos de atenção</h2>
        <p className="xp-desc">Fatos calculados a partir da carteira, das notícias e do FGC. Não são recomendações de investimento.</p>
        {pontos.length === 0 ? (
          <p className="xp-note">Nenhum ponto de atenção para este cliente.</p>
        ) : (
          <ul className="xp-points">
            {pontos.map((p, i) => (
              <li key={`${p.tipo}-${p.ticker ?? ""}-${i}`}>
                <span className={`xp-tag ${SELO_SEVERIDADE[p.severidade].classe}`}>{SELO_SEVERIDADE[p.severidade].texto}</span>
                <div>
                  <b>{p.titulo}</b>
                  <p>{p.detalhe}</p>
                </div>
                {p.ticker && (
                  <Link className="xp-filter" href={hrefAtivo(p.ticker)}>Ver ativo</Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="xp-columns">
        <section className="xp-card">
          <h2>Evolução do patrimônio · 30 dias</h2>
          <p className="xp-desc">Quantidade atual × preço de cada dia (sem compras e vendas no período) · {ROTULO_ORIGEM[dash.origem]}</p>
          {evolucao.pontos.length > 0 ? (
            <GraficoLinha
              pontos={evolucao.pontos}
              medida="PRECO"
              moeda="BRL"
              nome="Patrimônio"
              descricao={`Evolução do patrimônio de ${cliente.nome} em 30 dias`}
            />
          ) : (
            <div className="xp-placeholder">Sem histórico de preços para os ativos deste cliente.</div>
          )}
          {evolucao.valorConstante > 0 && (
            <p className="xp-note">
              {formatarMoeda(evolucao.valorConstante)} ({evolucao.tickersConstantes.join(", ")}) entram pelo valor atual,
              constante: renda fixa é acompanhada pela taxa, não pelo preço.
            </p>
          )}
        </section>

        <section className="xp-card">
          <h2>Cadastro</h2>
          <p className="xp-desc">Dados de cadastro fictícios (virão do cadastro do M1)</p>
          <div className="xp-metrics xp-metrics-2">
            <div><span>Idade</span><b>{cadastro.idade} anos</b></div>
            <div><span>Profissão</span><b>{cadastro.profissao}</b></div>
            <div><span>Estado civil</span><b>{ESTADOS_CIVIS[cadastro.estadoCivil]}</b></div>
            <div><span>Renda mensal</span><b>{FAIXAS_RENDA[cadastro.rendaFaixa]}</b></div>
          </div>
        </section>
      </div>

      <section className="xp-card xp-section">
        <h2>Composição da carteira</h2>
        <p className="xp-desc">Por categoria, só posições com cotação</p>
        <div className="xp-bars">
          {carteira.composicao.map((c) => (
            <div key={c.categoria} className="xp-bar-row">
              <span>{ROTULO_CATEGORIA[c.categoria]}</span>
              <div className="xp-bar" aria-hidden="true"><i style={{ width: `${(c.fracao * 100).toFixed(1)}%` }} /></div>
              <b>{formatarPercentual(c.fracao)}</b>
              <small>{formatarMoeda(c.valor)}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="xp-card">
        <h2>Posições</h2>
        <p className="xp-desc">Clique no ativo para ver gráfico, notícias e outros clientes que o têm.</p>
        <div className="xp-table-wrap">
          <table className="xp-table">
            <thead>
              <tr><th>Ativo</th><th>Categoria</th><th>Quantidade</th><th>Valor</th><th>% da carteira</th></tr>
            </thead>
            <tbody>
              {carteira.posicoes.map((p) => (
                <tr key={p.ativo.ticker}>
                  <td>
                    <Link className="xp-row-link" href={hrefAtivo(p.ativo.ticker)}>
                      {p.ativo.ticker}
                      <small>{p.ativo.nome}</small>
                    </Link>
                  </td>
                  <td>{ROTULO_CATEGORIA[p.ativo.categoria]}</td>
                  <td>{formatarNumero(p.quantidade, 4)}</td>
                  <td>{p.valor === null ? <span className="xp-tag">Sem cotação</span> : formatarMoeda(p.valor)}</td>
                  <td>{formatarPercentual(p.peso)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
