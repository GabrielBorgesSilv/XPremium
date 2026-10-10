import type { ResumoFGC } from "@/modules/assessor";
import { formatarMoeda, formatarPercentual } from "@/shared/formatar";

/** Aviso do topo: clientes acima (vermelho) ou perto (amarelo) do limite do FGC em algum emissor. */
export function AvisoFGC({ fgc }: { fgc: ResumoFGC }) {
  if (fgc.exposicoes.length === 0) return null;

  const titulo =
    fgc.clientesAcima > 0
      ? `${fgc.clientesAcima} cliente(s) com valores acima da garantia do FGC · ${formatarMoeda(fgc.totalDescoberto)} sem cobertura`
      : `${fgc.clientesPerto} cliente(s) perto do limite de garantia do FGC`;

  return (
    <section className={`xp-warn${fgc.clientesAcima > 0 ? " danger" : ""}`} aria-label="Garantia do FGC">
      <b>{titulo}</b>
      <ul className="xp-warn-list">
        {fgc.exposicoes.map((e) => (
          <li key={`${e.clienteId}-${e.emissor}`}>
            <span className={`xp-tag ${e.situacao === "ACIMA" ? "neg" : "mix"}`}>{e.situacao === "ACIMA" ? "Acima" : "Perto"}</span>{" "}
            <b>{e.nome}</b> · {e.emissor}: {formatarMoeda(e.valorCoberto)} em títulos cobertos
            {e.situacao === "ACIMA"
              ? ` · ${formatarMoeda(e.descoberto)} acima do limite`
              : ` · ${formatarPercentual(e.valorCoberto / fgc.limite, { casas: 0 })} do limite`}{" "}
            <span className="xp-note-inline">({e.tickers.join(" + ")})</span>
          </li>
        ))}
      </ul>
      <p className="xp-note">
        O FGC garante até {formatarMoeda(fgc.limite)} por CPF, por instituição financeira (principal + rendimentos).
        Valor de referência; não considera o teto global.
      </p>
    </section>
  );
}
