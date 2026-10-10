import { describe, expect, it } from "vitest";

import type { DadosCarteiras } from "./calculos";
import { avaliarFGC } from "./fgc";
import { AtivoSchema, type Posicao } from "./schema";

// Dados fictícios. Preço R$ 1 por unidade: a quantidade é o próprio valor em reais.
const base: Omit<DadosCarteiras, "posicoes"> = {
  ativos: [
    { ticker: "CDB-A", nome: "CDB fictício A", categoria: "RENDA_FIXA", moeda: "BRL", emissor: "Banco A", coberturaFGC: true },
    { ticker: "LCI-A", nome: "LCI fictícia A", categoria: "RENDA_FIXA", moeda: "BRL", emissor: "Banco A", coberturaFGC: true },
    { ticker: "LCA-B", nome: "LCA fictícia B", categoria: "RENDA_FIXA", moeda: "BRL", emissor: "Banco B", coberturaFGC: true },
    { ticker: "CDB-SEM", nome: "CDB sem cotação", categoria: "RENDA_FIXA", moeda: "BRL", emissor: "Banco A", coberturaFGC: true },
    { ticker: "TESOURO", nome: "Título público", categoria: "RENDA_FIXA", moeda: "BRL" },
    { ticker: "ACAO3", nome: "Ação fictícia", categoria: "ACOES", moeda: "BRL" },
  ],
  cotacoes: ["CDB-A", "LCI-A", "LCA-B", "TESOURO", "ACAO3"].map((ticker) => ({
    ticker,
    preco: 1,
    origem: "SIMULADO" as const,
    asOf: "2026-10-09T18:00:00-03:00",
  })),
  cambio: { USD: 5 },
};

const avaliar = (posicoes: Posicao[]) => avaliarFGC({ ...base, posicoes });
const pos = (clienteId: string, ticker: string, quantidade: number): Posicao => ({ clienteId, ticker, quantidade });

describe("avaliarFGC", () => {
  it("soma títulos do mesmo emissor e mostra quanto ficou descoberto", () => {
    expect(avaliar([pos("c1", "CDB-A", 150_000), pos("c1", "LCI-A", 120_000)])).toEqual([
      { clienteId: "c1", emissor: "Banco A", valorCoberto: 270_000, descoberto: 20_000, situacao: "ACIMA", tickers: ["CDB-A", "LCI-A"] },
    ]);
  });

  it("não soma emissores diferentes", () => {
    expect(avaliar([pos("c1", "CDB-A", 200_000), pos("c1", "LCA-B", 200_000)])).toEqual([]);
  });

  it("não soma clientes diferentes", () => {
    expect(avaliar([pos("c1", "CDB-A", 200_000), pos("c2", "LCI-A", 200_000)])).toEqual([]);
  });

  it("classifica os limites: abaixo de 90%, perto, exatamente no limite e acima", () => {
    expect(avaliar([pos("c1", "CDB-A", 224_999)])).toEqual([]);
    expect(avaliar([pos("c1", "CDB-A", 225_000)])[0]).toMatchObject({ situacao: "PERTO", descoberto: 0 });
    expect(avaliar([pos("c1", "CDB-A", 250_000)])[0]).toMatchObject({ situacao: "PERTO", descoberto: 0 });
    expect(avaliar([pos("c1", "CDB-A", 250_001)])[0]).toMatchObject({ situacao: "ACIMA", descoberto: 1 });
  });

  it("ignora o que o FGC não cobre, mesmo com valor alto", () => {
    expect(avaliar([pos("c1", "TESOURO", 900_000), pos("c1", "ACAO3", 900_000)])).toEqual([]);
  });

  it("ignora título sem cotação", () => {
    expect(avaliar([pos("c1", "CDB-SEM", 900_000)])).toEqual([]);
  });

  it("ordena do maior valor descoberto para o menor", () => {
    const resultado = avaliar([pos("c1", "CDB-A", 260_000), pos("c2", "CDB-A", 300_000), pos("c3", "LCA-B", 230_000)]);
    expect(resultado.map((e) => e.clienteId)).toEqual(["c2", "c1", "c3"]);
  });

  it("aceita outro limite", () => {
    expect(avaliarFGC({ ...base, posicoes: [pos("c1", "CDB-A", 120_000)] }, 100_000)[0]).toMatchObject({
      situacao: "ACIMA",
      descoberto: 20_000,
    });
  });
});

describe("AtivoSchema", () => {
  it("recusa título coberto pelo FGC sem emissor", () => {
    const semEmissor = { ticker: "CDB-X", nome: "CDB", categoria: "RENDA_FIXA", moeda: "BRL", coberturaFGC: true };
    expect(AtivoSchema.safeParse(semEmissor).success).toBe(false);
    expect(AtivoSchema.safeParse({ ...semEmissor, emissor: "Banco X" }).success).toBe(true);
  });
});
