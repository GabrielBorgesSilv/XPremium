import type { RankingAsset } from "../domain/types";
import { LoadingErrorEmpty } from "./LoadingErrorEmpty";
import { formatMoney, formatPercent, priceBasisLabel } from "./format";

export function RankingTable({ title, rows }: { title: string; rows: RankingAsset[] }) {
  if (rows.length === 0) {
    return <LoadingErrorEmpty state="empty" title={`Nenhum ativo em ${title.toLowerCase()} neste filtro.`} />;
  }

  return (
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
          {rows.map((row) => {
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
  );
}
