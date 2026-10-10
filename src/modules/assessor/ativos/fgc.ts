/**
 * Garantia do FGC: soma, por cliente e por emissor, os títulos cobertos e compara com o limite.
 * Função pura: recebe os mesmos dados dos outros cálculos.
 */
import { type DadosCarteiras, valorizar } from "./calculos";

/**
 * Limite do FGC por CPF, por instituição (conglomerado), somando principal e rendimentos.
 * Valor de referência: confirmar o vigente em fgc.org.br antes de usar com dados reais.
 */
export const LIMITE_FGC = 250_000;

/** A partir desta fração do limite, o cliente aparece como "perto do limite". */
export const FRACAO_ALERTA_FGC = 0.9;

export type SituacaoFGC = "ACIMA" | "PERTO";

export type ExposicaoFGC = {
  clienteId: string;
  emissor: string;
  /** Soma em reais dos títulos cobertos do cliente neste emissor. */
  valorCoberto: number;
  /** Quanto passa do limite (0 quando está só perto). */
  descoberto: number;
  situacao: SituacaoFGC;
  tickers: string[];
};

/** Só devolve os casos acima ou perto do limite, do maior valor descoberto para o menor. */
export function avaliarFGC(
  dados: DadosCarteiras,
  limite: number = LIMITE_FGC,
  fracaoAlerta: number = FRACAO_ALERTA_FGC,
): ExposicaoFGC[] {
  const { ativoPorTicker, quantidades, valorDe } = valorizar(dados);

  // clienteId|emissor -> soma e títulos
  const somas = new Map<string, { clienteId: string; emissor: string; valor: number; tickers: string[] }>();
  for (const [ticker, porCliente] of quantidades) {
    const ativo = ativoPorTicker.get(ticker);
    if (!ativo?.coberturaFGC || !ativo.emissor) continue;

    for (const [clienteId, quantidade] of porCliente) {
      const valor = valorDe(ticker, quantidade);
      if (valor === null) continue; // sem cotação não dá para comparar com o limite

      const chave = `${clienteId}|${ativo.emissor}`;
      const atual = somas.get(chave) ?? { clienteId, emissor: ativo.emissor, valor: 0, tickers: [] };
      atual.valor += valor;
      atual.tickers.push(ticker);
      somas.set(chave, atual);
    }
  }

  const exposicoes: ExposicaoFGC[] = [];
  for (const { clienteId, emissor, valor, tickers } of somas.values()) {
    if (valor < limite * fracaoAlerta) continue;
    exposicoes.push({
      clienteId,
      emissor,
      valorCoberto: valor,
      descoberto: Math.max(0, valor - limite),
      situacao: valor > limite ? "ACIMA" : "PERTO",
      tickers: tickers.sort(),
    });
  }

  return exposicoes.sort(
    (a, b) => b.descoberto - a.descoberto || b.valorCoberto - a.valorCoberto || a.clienteId.localeCompare(b.clienteId),
  );
}
