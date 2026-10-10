/**
 * Alertas de impacto de notícias nos ativos, a partir da resposta do agente de IA (M5).
 * A resposta da IA é tratada como dado não confiável: tudo é validado antes de virar alerta.
 */
import { type ImpactoNoticia, ImpactoNoticiaSchema } from "./schema";

export type ResultadoFiltroImpactos = {
  validos: ImpactoNoticia[];
  /** Itens recusados (formato inválido, ticker fora da carteira ou repetidos). */
  descartados: number;
};

/**
 * Mantém só impactos bem formados e de ativos que os clientes realmente têm,
 * o que impede a IA de criar alerta para ativo inventado ou fora da carteira.
 */
export function filtrarImpactos(resposta: unknown, tickersPermitidos: ReadonlySet<string>): ResultadoFiltroImpactos {
  const itens = Array.isArray(resposta) ? resposta : [];
  const vistos = new Set<string>();
  const validos: ImpactoNoticia[] = [];

  for (const item of itens) {
    const lido = ImpactoNoticiaSchema.safeParse(item);
    if (!lido.success || !tickersPermitidos.has(lido.data.ticker)) continue;

    const chave = `${lido.data.noticiaId}|${lido.data.ticker}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    validos.push(lido.data);
  }

  return { validos, descartados: itens.length - validos.length };
}

export type AlertaAtivo = {
  ticker: string;
  positivos: number;
  negativos: number;
  indefinidos: number;
  /** Direção do selo: MISTA quando há notícias positivas e negativas ao mesmo tempo. */
  direcao: "POSITIVO" | "NEGATIVO" | "INDEFINIDO" | "MISTA";
  /** Publicação da notícia mais recente (ISO), para ordenar a lista. */
  maisRecente: string;
  impactos: ImpactoNoticia[];
};

/**
 * Ativos com alerta primeiro (do alerta mais recente para o mais antigo);
 * os demais mantêm a ordem recebida. Não altera a lista original.
 */
export function ordenarComAlertas<T extends { ativo: { ticker: string } }>(
  linhas: T[],
  alertas: Map<string, AlertaAtivo>,
): T[] {
  const momento = (linha: T) => {
    const alerta = alertas.get(linha.ativo.ticker);
    return alerta ? Date.parse(alerta.maisRecente) : -Infinity;
  };
  // sort é estável: empates (inclusive "sem alerta") mantêm a ordem original.
  return [...linhas].sort((a, b) => {
    const ma = momento(a);
    const mb = momento(b);
    return ma === mb ? 0 : mb > ma ? 1 : -1;
  });
}

/** Agrupa os impactos por ativo, com as notícias mais recentes primeiro. */
export function resumirAlertas(impactos: ImpactoNoticia[]): Map<string, AlertaAtivo> {
  const porTicker = new Map<string, ImpactoNoticia[]>();
  for (const impacto of impactos) {
    porTicker.set(impacto.ticker, [...(porTicker.get(impacto.ticker) ?? []), impacto]);
  }

  const alertas = new Map<string, AlertaAtivo>();
  for (const [ticker, lista] of porTicker) {
    const ordenados = [...lista].sort((a, b) => Date.parse(b.publicadoEm) - Date.parse(a.publicadoEm));
    const contar = (direcao: ImpactoNoticia["direcao"]) => lista.filter((i) => i.direcao === direcao).length;
    const positivos = contar("POSITIVO");
    const negativos = contar("NEGATIVO");

    alertas.set(ticker, {
      ticker,
      positivos,
      negativos,
      indefinidos: contar("INDEFINIDO"),
      direcao:
        positivos > 0 && negativos > 0
          ? "MISTA"
          : positivos > 0
            ? "POSITIVO"
            : negativos > 0
              ? "NEGATIVO"
              : "INDEFINIDO",
      maisRecente: ordenados[0].publicadoEm,
      impactos: ordenados,
    });
  }
  return alertas;
}
