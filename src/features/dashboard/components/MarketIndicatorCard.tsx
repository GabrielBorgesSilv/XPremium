import type { MarketIndicator } from "../domain/types";
import { DataProvenance } from "./DataProvenance";
import { formatNumber, formatPercent } from "./format";

export function MarketIndicatorCard({ indicator }: { indicator: MarketIndicator }) {
  const headingId = `indicador-${indicator.id}`;
  const direction = indicator.changePercent > 0 ? "xp-up" : indicator.changePercent < 0 ? "xp-down" : undefined;

  return (
    <article aria-labelledby={headingId} className="xp-card">
      <label>
        <h4 id={headingId}>{indicator.name}</h4>
        <span>{indicator.region === "BR" ? "Brasil" : "Internacional"}</span>
      </label>
      <strong>
        {formatNumber(indicator.value)} {indicator.unit}
      </strong>
      <small className={direction}>Variação {formatPercent(indicator.changePercent)}</small>
      <DataProvenance dataStatus={indicator.dataStatus} />
    </article>
  );
}
