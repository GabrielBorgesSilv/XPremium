/**
 * Cálculos puros da carteira de UM cliente (dash do cliente e lista de clientes).
 * Reaproveitam a valorização de calculos.ts; as frases dos pontos de atenção são fatos, nunca recomendações.
 */
import { formatarMoeda, formatarPercentual } from "@/shared/formatar";

import { type DadosCarteiras, fatorCambio, LIMITE_CONCENTRACAO_PADRAO, valorizar } from "./calculos";
import type { ExposicaoFGC } from "./fgc";
import type { AlertaAtivo } from "./impactos";
import type { Ativo, Categoria, OrigemDado, SeriePrecos, TaxasCambio } from "./schema";

export type PosicaoCliente = {
  ativo: Ativo;
  quantidade: number;
  /** Em reais; null quando o ativo não tem cotação. */
  valor: number | null;
  /** Fração (0 a 1) da carteira do cliente; null sem cotação. */
  peso: number | null;
  origemPreco: OrigemDado | null;
};

export type CarteiraCliente = {
  /** Soma em reais das posições com cotação. */
  total: number;
  posicoes: PosicaoCliente[];
  /** Por categoria, do maior valor para o menor (só posições com cotação). */
  composicao: { categoria: Categoria; valor: number; fracao: number }[];
  semCotacao: string[];
};

/** Carteira do cliente: posições do maior valor para o menor, composição por categoria e total. */
export function resumirCarteiraCliente(clienteId: string, dados: DadosCarteiras): CarteiraCliente {
  const { ativoPorTicker, cotacaoPorTicker, quantidades, valorDe, totalPorCliente } = valorizar(dados);
  const total = totalPorCliente.get(clienteId) ?? 0;

  const posicoes: PosicaoCliente[] = [];
  for (const [ticker, porCliente] of quantidades) {
    const quantidade = porCliente.get(clienteId);
    if (quantidade === undefined) continue;
    const valor = valorDe(ticker, quantidade);
    posicoes.push({
      ativo: ativoPorTicker.get(ticker)!,
      quantidade,
      valor,
      peso: valor === null || total === 0 ? null : valor / total,
      origemPreco: cotacaoPorTicker.get(ticker)?.origem ?? null,
    });
  }
  posicoes.sort((a, b) => (b.valor ?? -1) - (a.valor ?? -1) || a.ativo.ticker.localeCompare(b.ativo.ticker));

  const porCategoria = new Map<Categoria, number>();
  for (const p of posicoes) {
    if (p.valor !== null) porCategoria.set(p.ativo.categoria, (porCategoria.get(p.ativo.categoria) ?? 0) + p.valor);
  }
  const composicao = [...porCategoria]
    .map(([categoria, valor]) => ({ categoria, valor, fracao: total === 0 ? 0 : valor / total }))
    .sort((a, b) => b.valor - a.valor);

  return {
    total,
    posicoes,
    composicao,
    semCotacao: posicoes.filter((p) => p.valor === null).map((p) => p.ativo.ticker).sort(),
  };
}

export type EvolucaoCarteira = {
  pontos: { data: string; valor: number }[];
  /** Parte da carteira mantida constante (renda fixa ou ativo sem série de preço), em reais. */
  valorConstante: number;
  tickersConstantes: string[];
};

/**
 * Patrimônio dia a dia = quantidade ATUAL × preço de cada dia (sem compras/vendas no período).
 * Posições sem série de PREÇO (renda fixa usa taxa) entram pelo valor atual, constante.
 * Num dia sem preço de um ativo (ex.: fim de semana), vale o último preço anterior.
 */
export function evolucaoCarteira(
  posicoes: PosicaoCliente[],
  serieDe: (ativo: Ativo) => SeriePrecos | null,
  cambio: TaxasCambio,
): EvolucaoCarteira {
  const comSerie: { posicao: PosicaoCliente; pontos: SeriePrecos["pontos"] }[] = [];
  let valorConstante = 0;
  const tickersConstantes: string[] = [];

  for (const posicao of posicoes) {
    if (posicao.valor === null) continue; // sem cotação: fora do patrimônio, como no total
    const serie = serieDe(posicao.ativo);
    if (serie && serie.medida === "PRECO" && serie.pontos.length > 0) {
      comSerie.push({ posicao, pontos: [...serie.pontos].sort((a, b) => a.data.localeCompare(b.data)) });
    } else {
      valorConstante += posicao.valor;
      tickersConstantes.push(posicao.ativo.ticker);
    }
  }

  const datas = [...new Set(comSerie.flatMap((s) => s.pontos.map((p) => p.data)))].sort();
  const pontos = datas.map((data) => {
    let valor = valorConstante;
    for (const { posicao, pontos: serie } of comSerie) {
      // Último preço até a data; antes do primeiro ponto, usa o primeiro.
      const preco = serie.filter((p) => p.data <= data).at(-1)?.valor ?? serie[0].valor;
      valor += posicao.quantidade * preco * fatorCambio(posicao.ativo.moeda, cambio);
    }
    return { data, valor };
  });

  return { pontos, valorConstante, tickersConstantes: tickersConstantes.sort() };
}

export type Severidade = "ALTA" | "MEDIA" | "INFO";

export type PontoDeAtencao = {
  tipo: "FGC" | "NOTICIA" | "CONCENTRACAO" | "SEM_COTACAO";
  severidade: Severidade;
  titulo: string;
  detalhe: string;
  ticker?: string;
  /** Só em NOTICIA: títulos das notícias, sem números (usados na mensagem de WhatsApp). */
  noticias?: string[];
  /** Só em FGC: emissor dos títulos (usado na mensagem de WhatsApp). */
  emissor?: string;
};

const ORDEM_SEVERIDADE: Record<Severidade, number> = { ALTA: 0, MEDIA: 1, INFO: 2 };
const ORDEM_TIPO: Record<PontoDeAtencao["tipo"], number> = { FGC: 0, NOTICIA: 1, CONCENTRACAO: 2, SEM_COTACAO: 3 };

const TEXTO_DIRECAO: Record<AlertaAtivo["direcao"], string> = {
  POSITIVO: "positivo",
  NEGATIVO: "negativo",
  MISTA: "misto",
  INDEFINIDO: "indefinido",
};

/** Regras fixas dos pontos de atenção do cliente, dos mais graves para os informativos. */
export function pontosDeAtencao(
  clienteId: string,
  carteira: CarteiraCliente,
  alertas: Map<string, AlertaAtivo>,
  exposicoesFGC: ExposicaoFGC[],
  tituloDaNoticia: (noticiaId: string) => string,
  limiteConcentracao: number = LIMITE_CONCENTRACAO_PADRAO,
): PontoDeAtencao[] {
  const pontos: PontoDeAtencao[] = [];

  for (const e of exposicoesFGC.filter((x) => x.clienteId === clienteId)) {
    pontos.push(
      e.situacao === "ACIMA"
        ? {
            tipo: "FGC",
            severidade: "ALTA",
            titulo: `Acima da garantia do FGC no ${e.emissor}`,
            emissor: e.emissor,
            detalhe: `${formatarMoeda(e.valorCoberto)} em títulos cobertos (${e.tickers.join(" + ")}): ${formatarMoeda(e.descoberto)} sem cobertura.`,
          }
        : {
            tipo: "FGC",
            severidade: "MEDIA",
            titulo: `Perto do limite do FGC no ${e.emissor}`,
            emissor: e.emissor,
            detalhe: `${formatarMoeda(e.valorCoberto)} em títulos cobertos (${e.tickers.join(" + ")}).`,
          },
    );
  }

  for (const posicao of carteira.posicoes) {
    const { ticker } = posicao.ativo;
    const alerta = alertas.get(ticker);
    if (alerta) {
      const severidade: Severidade =
        alerta.direcao === "NEGATIVO" ? "ALTA" : alerta.direcao === "POSITIVO" ? "INFO" : "MEDIA";
      const peso = posicao.peso === null ? "" : `${ticker} representa ${formatarPercentual(posicao.peso)} da carteira · `;
      pontos.push({
        tipo: "NOTICIA",
        severidade,
        titulo: `Notícia com possível impacto ${TEXTO_DIRECAO[alerta.direcao]} em ${ticker}`,
        detalhe: `${peso}${alerta.impactos.map((i) => tituloDaNoticia(i.noticiaId)).join("; ")}`,
        ticker,
        noticias: alerta.impactos.map((i) => tituloDaNoticia(i.noticiaId)),
      });
    }

    // Renda fixa não entra na regra de concentração (decisão de produto): o risco dela é tratado pelo FGC.
    if (posicao.ativo.categoria !== "RENDA_FIXA" && posicao.peso !== null && posicao.peso > limiteConcentracao) {
      pontos.push({
        tipo: "CONCENTRACAO",
        severidade: "MEDIA",
        titulo: `${ticker} concentra ${formatarPercentual(posicao.peso)} da carteira`,
        detalhe: `Acima de ${formatarPercentual(limiteConcentracao, { casas: 0 })} em um único ativo.`,
        ticker,
      });
    }

    if (posicao.valor === null) {
      pontos.push({
        tipo: "SEM_COTACAO",
        severidade: "INFO",
        titulo: `${ticker} sem cotação no momento`,
        detalhe: "Fica fora do patrimônio e dos percentuais até haver preço.",
        ticker,
      });
    }
  }

  return pontos.sort(
    (a, b) =>
      ORDEM_SEVERIDADE[a.severidade] - ORDEM_SEVERIDADE[b.severidade] ||
      ORDEM_TIPO[a.tipo] - ORDEM_TIPO[b.tipo] ||
      (a.ticker ?? "").localeCompare(b.ticker ?? ""),
  );
}
