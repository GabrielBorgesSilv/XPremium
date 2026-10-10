/**
 * Cálculos puros da visão de investimentos dos clientes por ativo.
 * Sem banco e sem rede: recebem os dados prontos, então são reproduzíveis e testáveis.
 */
import type {
  Ativo,
  ClienteDoAtivo,
  Cotacao,
  Moeda,
  Posicao,
  ResumoAtivo,
  ResumoCarteiras,
  TaxasCambio,
} from "./schema";

/** Peso de um ativo na carteira do cliente a partir do qual a tela destaca concentração. */
export const LIMITE_CONCENTRACAO_PADRAO = 0.2;

export type DadosCarteiras = {
  ativos: Ativo[];
  posicoes: Posicao[];
  cotacoes: Cotacao[];
  cambio: TaxasCambio;
};

function fatorCambio(moeda: Moeda, cambio: TaxasCambio): number {
  return moeda === "BRL" ? 1 : cambio[moeda];
}

/** Indexa os dados e valoriza cada posição em reais (null quando o ativo não tem cotação). */
function valorizar({ ativos, posicoes, cotacoes, cambio }: DadosCarteiras) {
  const ativoPorTicker = new Map(ativos.map((a) => [a.ticker, a]));
  const cotacaoPorTicker = new Map(cotacoes.map((c) => [c.ticker, c]));

  // Soma posições repetidas do mesmo cliente no mesmo ativo.
  const quantidades = new Map<string, Map<string, number>>(); // ticker -> clienteId -> quantidade
  for (const p of posicoes) {
    if (!ativoPorTicker.has(p.ticker)) {
      throw new Error(`Posição com ativo não cadastrado: ${p.ticker}`);
    }
    const porCliente = quantidades.get(p.ticker) ?? new Map<string, number>();
    porCliente.set(p.clienteId, (porCliente.get(p.clienteId) ?? 0) + p.quantidade);
    quantidades.set(p.ticker, porCliente);
  }

  const valorDe = (ticker: string, quantidade: number): number | null => {
    const cotacao = cotacaoPorTicker.get(ticker);
    const ativo = ativoPorTicker.get(ticker);
    if (!cotacao || !ativo) return null;
    return quantidade * cotacao.preco * fatorCambio(ativo.moeda, cambio);
  };

  // Total de cada cliente, só com posições que têm cotação.
  const totalPorCliente = new Map<string, number>();
  for (const [ticker, porCliente] of quantidades) {
    for (const [clienteId, quantidade] of porCliente) {
      const valor = valorDe(ticker, quantidade);
      if (valor !== null) totalPorCliente.set(clienteId, (totalPorCliente.get(clienteId) ?? 0) + valor);
    }
  }

  return { ativoPorTicker, cotacaoPorTicker, quantidades, valorDe, totalPorCliente };
}

/** Lista principal: cada ativo somado entre todos os clientes, do maior valor para o menor. */
export function resumirCarteiras(dados: DadosCarteiras): ResumoCarteiras {
  const { ativoPorTicker, cotacaoPorTicker, quantidades, valorDe } = valorizar(dados);

  const linhas: Omit<ResumoAtivo, "participacao">[] = [];
  const clientes = new Set<string>();
  const semCotacao: string[] = [];

  for (const [ticker, porCliente] of quantidades) {
    let quantidadeTotal = 0;
    for (const [clienteId, quantidade] of porCliente) {
      quantidadeTotal += quantidade;
      clientes.add(clienteId);
    }
    const valorTotal = valorDe(ticker, quantidadeTotal);
    if (valorTotal === null) semCotacao.push(ticker);

    linhas.push({
      ativo: ativoPorTicker.get(ticker)!,
      numClientes: porCliente.size,
      quantidadeTotal,
      valorTotal,
      origemPreco: cotacaoPorTicker.get(ticker)?.origem ?? null,
    });
  }

  const totalSobGestao = linhas.reduce((soma, l) => soma + (l.valorTotal ?? 0), 0);

  const ativos: ResumoAtivo[] = linhas
    .map((l) => ({
      ...l,
      participacao: l.valorTotal === null || totalSobGestao === 0 ? null : l.valorTotal / totalSobGestao,
    }))
    .sort((a, b) => (b.valorTotal ?? -1) - (a.valorTotal ?? -1) || a.ativo.ticker.localeCompare(b.ativo.ticker));

  return {
    totalSobGestao,
    numClientes: clientes.size,
    numAtivos: ativos.length,
    semCotacao: semCotacao.sort(),
    ativos,
  };
}

/** Painel lateral: clientes que têm o ativo e quanto ele pesa na carteira de cada um. */
export function clientesDoAtivo(
  ticker: string,
  dados: DadosCarteiras,
  limite: number = LIMITE_CONCENTRACAO_PADRAO,
): ClienteDoAtivo[] {
  const { quantidades, valorDe, totalPorCliente } = valorizar(dados);
  const porCliente = quantidades.get(ticker);
  if (!porCliente) return [];

  return [...porCliente]
    .map(([clienteId, quantidade]) => {
      const valor = valorDe(ticker, quantidade);
      const totalCliente = totalPorCliente.get(clienteId) ?? 0;
      const pesoNaCarteira = valor === null || totalCliente === 0 ? null : valor / totalCliente;
      return {
        clienteId,
        quantidade,
        valor,
        pesoNaCarteira,
        acimaDoLimite: pesoNaCarteira !== null && pesoNaCarteira > limite,
      };
    })
    .sort((a, b) => (b.valor ?? -1) - (a.valor ?? -1) || a.clienteId.localeCompare(b.clienteId));
}
