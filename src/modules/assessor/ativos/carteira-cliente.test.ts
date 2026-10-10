import { describe, expect, it } from "vitest";

import { clientesDoAtivo, type DadosCarteiras } from "./calculos";
import { evolucaoCarteira, pontosDeAtencao, resumirCarteiraCliente } from "./carteira-cliente";
import type { ExposicaoFGC } from "./fgc";
import { resumirAlertas } from "./impactos";
import type { Ativo, ImpactoNoticia, SeriePrecos } from "./schema";

// Dados fictícios com contas fáceis: carteira do c1 = R$ 600 + R$ 200 + R$ 200 = R$ 1.000.
const A: Ativo = { ticker: "A", nome: "Ação fictícia", categoria: "ACOES", moeda: "BRL" };
const B: Ativo = { ticker: "B", nome: "ETF fictício", categoria: "ETF", moeda: "USD" };
const RF: Ativo = { ticker: "RF", nome: "Título fictício", categoria: "RENDA_FIXA", moeda: "BRL" };
const SEM: Ativo = { ticker: "SEM", nome: "Sem cotação", categoria: "ACOES", moeda: "BRL" };
const asOf = "2026-10-09T18:00:00-03:00";

const dados: DadosCarteiras = {
  ativos: [A, B, RF, SEM],
  posicoes: [
    { clienteId: "c1", ticker: "A", quantidade: 60 },
    { clienteId: "c1", ticker: "B", quantidade: 20 },
    { clienteId: "c1", ticker: "RF", quantidade: 2 },
    { clienteId: "c1", ticker: "SEM", quantidade: 5 },
    { clienteId: "c2", ticker: "A", quantidade: 10 },
    // c3: R$ 1.000 em renda fixa (91%) e R$ 100 em ação.
    { clienteId: "c3", ticker: "RF", quantidade: 10 },
    { clienteId: "c3", ticker: "A", quantidade: 10 },
  ],
  cotacoes: [
    { ticker: "A", preco: 10, origem: "SIMULADO", asOf },
    { ticker: "B", preco: 2, origem: "REAL", asOf },
    { ticker: "RF", preco: 100, origem: "SIMULADO", asOf },
  ],
  cambio: { USD: 5 },
};

const carteira = resumirCarteiraCliente("c1", dados);

describe("resumirCarteiraCliente", () => {
  it("soma só as posições do cliente, com câmbio", () => {
    expect(carteira.total).toBe(1000);
    expect(resumirCarteiraCliente("c2", dados).total).toBe(100);
  });

  it("lista posições do maior valor para o menor, com peso e origem do preço", () => {
    expect(carteira.posicoes.map((p) => [p.ativo.ticker, p.valor, p.peso, p.origemPreco])).toEqual([
      ["A", 600, 0.6, "SIMULADO"],
      ["B", 200, 0.2, "REAL"],
      ["RF", 200, 0.2, "SIMULADO"],
      ["SEM", null, null, null],
    ]);
    expect(carteira.semCotacao).toEqual(["SEM"]);
  });

  it("agrupa por categoria", () => {
    expect(carteira.composicao).toEqual([
      { categoria: "ACOES", valor: 600, fracao: 0.6 },
      { categoria: "ETF", valor: 200, fracao: 0.2 },
      { categoria: "RENDA_FIXA", valor: 200, fracao: 0.2 },
    ]);
  });

  it("devolve carteira vazia para cliente sem posições", () => {
    expect(resumirCarteiraCliente("ninguem", dados)).toEqual({ total: 0, posicoes: [], composicao: [], semCotacao: [] });
  });
});

describe("evolucaoCarteira", () => {
  const series: Record<string, SeriePrecos> = {
    A: { ticker: "A", medida: "PRECO", moeda: "BRL", origem: "SIMULADO", pontos: [{ data: "2026-10-08", valor: 9 }, { data: "2026-10-09", valor: 10 }] },
    B: { ticker: "B", medida: "PRECO", moeda: "USD", origem: "SIMULADO", pontos: [{ data: "2026-10-07", valor: 1 }, { data: "2026-10-09", valor: 2 }] },
    RF: { ticker: "RF", medida: "TAXA", moeda: "BRL", origem: "SIMULADO", pontos: [{ data: "2026-10-09", valor: 6.5 }] },
  };
  const evolucao = evolucaoCarteira(carteira.posicoes, (a) => series[a.ticker] ?? null, dados.cambio);

  it("multiplica a quantidade atual pelo preço de cada dia e termina no total atual", () => {
    expect(evolucao.pontos).toEqual([
      // A antes do primeiro ponto usa o primeiro (9); B = 1 × 20 × 5; RF constante.
      { data: "2026-10-07", valor: 540 + 100 + 200 },
      // B não tem ponto em 08/10: vale o último anterior (1).
      { data: "2026-10-08", valor: 540 + 100 + 200 },
      { data: "2026-10-09", valor: 1000 },
    ]);
  });

  it("mantém constante o que não tem série de preço e ignora o que não tem cotação", () => {
    expect(evolucao.valorConstante).toBe(200);
    expect(evolucao.tickersConstantes).toEqual(["RF"]);
  });

  it("devolve só a parte constante quando nada tem série", () => {
    expect(evolucaoCarteira(carteira.posicoes, () => null, dados.cambio)).toEqual({
      pontos: [],
      valorConstante: 1000,
      tickersConstantes: ["A", "B", "RF"],
    });
  });
});

describe("pontosDeAtencao", () => {
  const impacto = (ticker: string, direcao: ImpactoNoticia["direcao"], noticiaId: string): ImpactoNoticia => ({
    noticiaId,
    ticker,
    direcao,
    motivo: "Motivo fictício",
    publicadoEm: asOf,
    geradoPorIA: true,
  });
  const alertas = resumirAlertas([impacto("B", "NEGATIVO", "n1"), impacto("A", "POSITIVO", "n2")]);
  const fgc: ExposicaoFGC[] = [
    { clienteId: "c1", emissor: "Banco X", valorCoberto: 270_000, descoberto: 20_000, situacao: "ACIMA", tickers: ["RF"] },
    { clienteId: "c2", emissor: "Banco Y", valorCoberto: 230_000, descoberto: 0, situacao: "PERTO", tickers: ["RF"] },
  ];
  const titulos: Record<string, string> = { n1: "Notícia fictícia 1", n2: "Notícia fictícia 2" };
  const pontos = pontosDeAtencao("c1", carteira, alertas, fgc, (id) => titulos[id]);

  it("ordena por severidade e só inclui o FGC do próprio cliente", () => {
    expect(pontos.map((p) => [p.tipo, p.severidade, p.ticker])).toEqual([
      ["FGC", "ALTA", undefined],
      ["NOTICIA", "ALTA", "B"],
      ["CONCENTRACAO", "MEDIA", "A"],
      ["NOTICIA", "INFO", "A"],
      ["SEM_COTACAO", "INFO", "SEM"],
    ]);
  });

  it("descreve fatos com valores e pesos, sem recomendação", () => {
    expect(pontos[0].titulo).toBe("Acima da garantia do FGC no Banco X");
    expect(pontos[1].titulo).toBe("Notícia com possível impacto negativo em B");
    expect(pontos[1].detalhe).toBe("B representa 20,0% da carteira · Notícia fictícia 1");
    expect(pontos[2].titulo).toBe("A concentra 60,0% da carteira");
  });

  it("não aponta concentração exatamente no limite (B e RF têm 20%)", () => {
    expect(pontos.filter((p) => p.tipo === "CONCENTRACAO").map((p) => p.ticker)).toEqual(["A"]);
  });

  it("ignora renda fixa na regra de concentração, nas duas telas", () => {
    const c3 = resumirCarteiraCliente("c3", dados);
    expect(c3.posicoes[0]).toMatchObject({ ativo: { ticker: "RF" }, valor: 1000 });
    expect(c3.posicoes[0].peso).toBeCloseTo(1000 / 1100);
    expect(pontosDeAtencao("c3", c3, new Map(), [], () => "").filter((p) => p.tipo === "CONCENTRACAO")).toEqual([]);
    expect(clientesDoAtivo("RF", dados).find((c) => c.clienteId === "c3")?.acimaDoLimite).toBe(false);
  });
});
