import Link from "next/link";

import type { FiltrosVisao, LinhaAtivo } from "@/modules/assessor";
import { formatarMoeda, formatarPercentual } from "@/shared/formatar";

import { hrefAtivos, ROTULO_CATEGORIA, SELO_DIRECAO } from "./rotulos";

type Props = { linhas: LinhaAtivo[]; filtros: FiltrosVisao };

export function TabelaAtivos({ linhas, filtros }: Props) {
  if (linhas.length === 0) {
    return <div className="xp-placeholder">Nenhum ativo encontrado com esses filtros.</div>;
  }

  return (
    <div className="xp-table-wrap">
      <table className="xp-table">
        <thead>
          <tr>
            <th>Ativo</th>
            <th>Categoria</th>
            <th>Clientes</th>
            <th>Valor total</th>
            <th>% do total</th>
            <th>Notícias</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => {
            const { ativo, alerta } = linha;
            const selecionado = filtros.ativo === ativo.ticker;
            return (
              <tr key={ativo.ticker} className={selecionado ? "selected" : undefined}>
                <td>
                  <Link className="xp-row-link" href={hrefAtivos(filtros, { ativo: ativo.ticker })} scroll={false}>
                    {ativo.ticker}
                    <small>{ativo.nome}</small>
                  </Link>
                </td>
                <td>{ROTULO_CATEGORIA[ativo.categoria]}</td>
                <td>{linha.numClientes}</td>
                <td>
                  {linha.valorTotal === null ? <span className="xp-tag">Sem cotação</span> : formatarMoeda(linha.valorTotal)}
                </td>
                <td>{formatarPercentual(linha.participacao)}</td>
                <td>
                  {alerta ? (
                    <span className={`xp-tag ${SELO_DIRECAO[alerta.direcao].classe}`}>
                      {SELO_DIRECAO[alerta.direcao].texto} · {alerta.impactos.length}
                    </span>
                  ) : (
                    <span className="xp-note">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
