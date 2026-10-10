import type { DataStatus } from "../domain/types";
import { formatTimestamp } from "./format";

export function SimulatedChip() {
  return <span className="xp-tag lime">DADOS SIMULADOS</span>;
}

export function DataProvenance({ dataStatus }: { dataStatus: DataStatus }) {
  return (
    <div className="xp-desc" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {dataStatus.origin === "SIMULATED" ? <SimulatedChip /> : null}
      <span>Fonte {dataStatus.source}</span>
      <span>Referência {formatTimestamp(dataStatus.asOf)}</span>
      <span>Obtido em {formatTimestamp(dataStatus.fetchedAt)}</span>
    </div>
  );
}
