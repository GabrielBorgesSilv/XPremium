"use client";

import { useState } from "react";

import type { RankingAsset } from "../domain/types";
import { LoadingErrorEmpty } from "./LoadingErrorEmpty";
import { formatMoney, formatPercent, priceBasisLabel } from "./format";

const LINHAS_INICIAIS = 5;

export function RankingTable({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: RankingAsset[];
  tone: "up" | "down";
}) {
  const assinatura = rows.map((row) => row.assetId).join("|");
  const [expandido, setExpandido] = useState(false);
  const [visto, setVisto] = useState(assinatura);
  if (visto !== assinatura) {
    setVisto(assinatura);
    setExpandido(false);
  }

  if (rows.length === 0) {
    return <LoadingErrorEmpty state="empty" title={`Nenhum ativo em ${title.toLowerCase()} neste filtro.`} />;
  }

  const visiveis = expandido ? rows : rows.slice(0, LINHAS_INICIAIS);

  return (
    <div className={`xp-rank xp-rank-${tone}`}>
      <div
        className="xp-table-wrap"
        tabIndex={0}
        aria-label={`Tabela de ${title}. Role na horizontal para ver preço, variação e metodologia.`}
      >
        <table className="xp-table">
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Ativo</th>
              <th scope="col">Preço</th>
              <th scope="col">Variação</th>
              <th scope="col">Metodologia</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((row) => {
              const positive = row.changePercent > 0;
              return (
                <tr key={row.assetId}>
                  <th scope="row">
                    <span>{row.name}</span>
                    <span style={{ display: "block", fontWeight: 400 }}>{row.symbol}</span>
                  </th>
                  <td>{row.price ? formatMoney(row.price.value, row.price.currency) : "Preço indisponível"}</td>
                  <td className={positive ? "xp-up" : "xp-down"}>{formatPercent(row.changePercent)}</td>
                  <td>{priceBasisLabel(row.priceBasis)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {visiveis.length < rows.length ? (
        <button type="button" className="xp-rank-more" aria-label={`Ver mais ${title.toLowerCase()}`} onClick={() => setExpandido(true)}>
          Ver mais
        </button>
      ) : null}
    </div>
  );
}
