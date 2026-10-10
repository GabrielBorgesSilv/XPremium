/**
 * Série de preços para o gráfico do ativo: variação por período e série simulada de fallback.
 * Funções puras: a série simulada é determinística (mesmo ticker → mesmo gráfico).
 */
import { criarAleatorio } from "@/shared/aleatorio";

import type { Ativo, Periodo, SeriePrecos } from "./schema";

const DIAS_POR_PERIODO: Record<Periodo, number> = { "7D": 7, "30D": 30 };
const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Preço varia em %; taxa (renda fixa) varia em pontos percentuais. */
export type Variacao = { tipo: "PERCENTUAL"; valor: number } | { tipo: "PONTOS"; valor: number };

function paraMs(data: string): number {
  const [ano, mes, dia] = data.split("-").map(Number);
  return Date.UTC(ano, mes - 1, dia);
}

function paraData(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Variação entre o primeiro ponto dentro do período e o último ponto da série.
 * Null quando não há pelo menos dois pontos no período.
 */
export function calcularVariacao(serie: SeriePrecos, periodo: Periodo): Variacao | null {
  const pontos = [...serie.pontos].sort((a, b) => a.data.localeCompare(b.data));
  const ultimo = pontos.at(-1);
  if (!ultimo) return null;

  const inicioMs = paraMs(ultimo.data) - DIAS_POR_PERIODO[periodo] * MS_POR_DIA;
  const primeiro = pontos.find((p) => paraMs(p.data) >= inicioMs);
  if (!primeiro || primeiro === ultimo) return null;

  if (serie.medida === "TAXA") return { tipo: "PONTOS", valor: ultimo.valor - primeiro.valor };
  if (primeiro.valor === 0) return null;
  return { tipo: "PERCENTUAL", valor: ultimo.valor / primeiro.valor - 1 };
}

/** Semente estável a partir do ticker (hash djb2). */
function sementeDoTicker(ticker: string): number {
  let hash = 5381;
  for (const char of ticker) hash = (Math.imul(hash, 33) + char.charCodeAt(0)) >>> 0;
  return hash;
}

/** Oscilação diária máxima da série simulada, por categoria (em renda fixa, em pontos de taxa). */
const OSCILACAO: Record<Ativo["categoria"], number> = {
  ACOES: 0.02,
  FII_REIT: 0.01,
  ETF: 0.015,
  CRIPTO: 0.05,
  RENDA_FIXA: 0.05,
};

/**
 * Série fictícia, rotulada como SIMULADO, que termina exatamente em `valorAtual` na data `ate`.
 * Usada quando o M2 não tem histórico do ativo. Pula fins de semana, exceto em cripto.
 */
export function gerarSerieSimulada(ativo: Ativo, valorAtual: number, ate: string, dias = 30): SeriePrecos {
  const aleatorio = criarAleatorio(sementeDoTicker(ativo.ticker));
  const oscilacao = OSCILACAO[ativo.categoria];
  const taxa = ativo.categoria === "RENDA_FIXA";
  const pulaFimDeSemana = ativo.categoria !== "CRIPTO";

  const pontos: SeriePrecos["pontos"] = [];
  let valor = valorAtual;
  const fimMs = paraMs(ate);

  // Caminha do presente para o passado, para o último ponto bater com a cotação atual.
  for (let i = 0; i <= dias; i++) {
    const ms = fimMs - i * MS_POR_DIA;
    const diaSemana = new Date(ms).getUTCDay();
    if (pulaFimDeSemana && (diaSemana === 0 || diaSemana === 6)) continue;

    pontos.push({ data: paraData(ms), valor: Math.round(valor * 100) / 100 });
    const passo = aleatorio.decimal(-oscilacao, oscilacao, 4);
    valor = taxa ? valor - passo : valor / (1 + passo);
  }

  return {
    ticker: ativo.ticker,
    medida: taxa ? "TAXA" : "PRECO",
    moeda: ativo.moeda,
    origem: "SIMULADO",
    pontos: pontos.reverse(),
  };
}
