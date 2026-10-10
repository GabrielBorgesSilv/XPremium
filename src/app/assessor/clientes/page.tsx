import Link from "next/link";

import { listarClientes } from "@/modules/assessor";
import { formatarData, formatarMoeda } from "@/shared/formatar";

import { hrefCliente } from "../_components/rotas";
import { ROTULO_ORIGEM } from "../ativos/_components/rotulos";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Monta a URL da lista mantendo a busca e alternando o filtro de atenção. */
function hrefLista(busca: string | undefined, atencao: boolean): string {
  const params = new URLSearchParams();
  if (busca) params.set("busca", busca);
  if (atencao) params.set("atencao", "1");
  const query = params.toString();
  return query ? `/assessor/clientes?${query}` : "/assessor/clientes";
}

export default async function ClientesPage({ searchParams }: Props) {
  const lista = await listarClientes(await searchParams);
  const { filtros } = lista;

  return (
    <>
      <div className="xp-head">
        <div>
          <div className="xp-kicker">CARTEIRA DE CLIENTES</div>
          <h1>Meus clientes</h1>
          <p>Clientes vinculados a você. Clique em um cliente para ver o dash com patrimônio e pontos de atenção.</p>
        </div>
        <span className="xp-tag mix">
          {ROTULO_ORIGEM[lista.origem]} · ref. {formatarData(lista.asOf)}
        </span>
      </div>

      <div className="xp-grid-stats xp-grid-2">
        <section className="xp-card xp-stat">
          <label>Clientes vinculados</label>
          <strong>{lista.totalClientes}</strong>
          <p className="xp-note">Carteira deste assessor</p>
        </section>
        <section className="xp-card xp-stat">
          <label>Com pontos de atenção</label>
          <strong>{lista.comAtencao}</strong>
          <p className="xp-note">Alta ou média severidade (notícias, FGC, concentração)</p>
        </section>
      </div>

      <section className="xp-card">
        <h2>Clientes</h2>
        <p className="xp-desc">Ordem alfabética.</p>

        <div className="xp-filters">
          <form className="xp-search" action="/assessor/clientes" method="GET" role="search">
            <input
              type="search"
              name="busca"
              defaultValue={filtros.busca ?? ""}
              placeholder="Buscar por nome"
              aria-label="Buscar cliente por nome"
            />
            {filtros.atencao && <input type="hidden" name="atencao" value="1" />}
            <button className="xp-filter" type="submit">Buscar</button>
          </form>
          <Link className={`xp-filter${filtros.atencao ? " active" : ""}`} href={hrefLista(filtros.busca, !filtros.atencao)}>
            ⚠ Só com pontos de atenção
          </Link>
          {(filtros.busca || filtros.atencao) && (
            <Link className="xp-filter" href="/assessor/clientes">Limpar</Link>
          )}
        </div>

        {lista.linhas.length === 0 ? (
          <div className="xp-placeholder">Nenhum cliente encontrado com esses filtros.</div>
        ) : (
          <div className="xp-table-wrap">
            <table className="xp-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Patrimônio</th>
                  <th>Ativos</th>
                  <th>Pontos de atenção</th>
                </tr>
              </thead>
              <tbody>
                {lista.linhas.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link className="xp-row-link" href={hrefCliente(c.id)}>
                        {c.nome}
                        <small>{c.principal ?? "Sem pontos de atenção relevantes"}</small>
                      </Link>
                    </td>
                    <td>{formatarMoeda(c.patrimonio)}</td>
                    <td>{c.numAtivos}</td>
                    <td>
                      <div className="xp-cell-tags">
                        {c.pontos.alta > 0 && <span className="xp-tag neg">{c.pontos.alta} alta</span>}
                        {c.pontos.media > 0 && <span className="xp-tag mix">{c.pontos.media} média</span>}
                        {c.pontos.info > 0 && <span className="xp-tag ind">{c.pontos.info} info</span>}
                        {c.pontos.alta + c.pontos.media + c.pontos.info === 0 && <span className="xp-note">—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
