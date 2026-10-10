import type { VisaoAtivos } from "@/modules/assessor";
import { formatarMoedaCompacta } from "@/shared/formatar";

/** Cards do topo: totais de todas as carteiras (não mudam com os filtros). */
export function Resumo({ visao }: { visao: VisaoAtivos }) {
  const { resumo, numAtivosComAlerta, impactosDescartados } = visao;
  const cards: { rotulo: string; valor: string; nota: string }[] = [
    { rotulo: "Patrimônio dos clientes", valor: formatarMoedaCompacta(resumo.totalSobGestao), nota: "Soma das posições com cotação" },
    { rotulo: "Clientes com posição", valor: String(resumo.numClientes), nota: "Clientes vinculados" },
    { rotulo: "Ativos diferentes", valor: String(resumo.numAtivos), nota: "Somando todas as carteiras" },
    {
      rotulo: "Ativos com alerta",
      valor: String(numAtivosComAlerta),
      nota: impactosDescartados > 0 ? `${impactosDescartados} alerta(s) da IA descartado(s) na validação` : "Notícias analisadas por IA",
    },
  ];

  return (
    <div className="xp-grid-stats">
      {cards.map((card) => (
        <section key={card.rotulo} className="xp-card xp-stat">
          <label>{card.rotulo}</label>
          <strong>{card.valor}</strong>
          <p className="xp-note">{card.nota}</p>
        </section>
      ))}
    </div>
  );
}
