import type { FixedIncomeResponse } from "../domain/types";
import { DataProvenance } from "./DataProvenance";
import { LoadingErrorEmpty } from "./LoadingErrorEmpty";
import { formatDate, formatMoney, formatNumber } from "./format";

function unavailable() {
  return <span>Indisponível</span>;
}

export function FixedIncomePanel({ data }: { data: FixedIncomeResponse }) {
  return (
    <section aria-labelledby="renda-fixa-titulo" className="xp-card">
      <h2 id="renda-fixa-titulo">Renda fixa</h2>
      <DataProvenance dataStatus={data.dataStatus} />
      <p className="xp-desc">
        Taxas, preços e vencimentos aparecem só quando o conjunto de demonstração os traz. Nada aqui é calculado a
        partir da taxa.
      </p>
      {data.instruments.length === 0 ? (
        <LoadingErrorEmpty state="empty" title="Nenhuma referência de renda fixa neste recorte." />
      ) : (
        <div
          className="xp-table-wrap"
          tabIndex={0}
          aria-label="Tabela de renda fixa. Role na horizontal para ver taxa, preço e vencimento."
        >
          <table className="xp-table">
            <caption className="sr-only">Referências de renda fixa, sem ranking de alta ou baixa</caption>
            <thead>
              <tr>
                <th scope="col">Referência</th>
                <th scope="col">Taxa</th>
                <th scope="col">Preço</th>
                <th scope="col">Vencimento</th>
                <th scope="col">Data de referência</th>
              </tr>
            </thead>
            <tbody>
              {data.instruments.map((instrument) => (
                <tr key={instrument.id}>
                  <th scope="row">
                    <span>{instrument.name}</span>
                    <span style={{ display: "block", fontWeight: 400 }}>{instrument.country}</span>
                  </th>
                  <td>
                    {instrument.yieldRate
                      ? `${formatNumber(instrument.yieldRate.value)} ${instrument.yieldRate.unit} (${instrument.yieldRate.type})`
                      : unavailable()}
                  </td>
                  <td>
                    {instrument.unitPrice
                      ? `${formatMoney(instrument.unitPrice.value, instrument.currency)} (${instrument.unitPrice.type})`
                      : unavailable()}
                  </td>
                  <td>{instrument.maturityDate ? formatDate(instrument.maturityDate) : unavailable()}</td>
                  <td>{formatDate(instrument.referenceDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
