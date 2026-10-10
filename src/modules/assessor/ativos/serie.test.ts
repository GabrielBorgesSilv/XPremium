import { describe, expect, it } from "vitest";

import type { Ativo, SeriePrecos } from "./schema";
import { calcularVariacao, gerarSerieSimulada } from "./serie";

const acao: Ativo = { ticker: "PETR4", nome: "Ação fictícia", categoria: "ACOES", moeda: "BRL" };
const cripto: Ativo = { ticker: "BTC", nome: "Cripto fictícia", categoria: "CRIPTO", moeda: "BRL" };
const titulo: Ativo = { ticker: "IPCA-2035", nome: "Título fictício", categoria: "RENDA_FIXA", moeda: "BRL" };

function serie(medida: SeriePrecos["medida"], pontos: [string, number][]): SeriePrecos {
  return {
    ticker: "X",
    medida,
    moeda: "BRL",
    origem: "SIMULADO",
    pontos: pontos.map(([data, valor]) => ({ data, valor })),
  };
}

describe("calcularVariacao", () => {
  const precos = serie("PRECO", [
    ["2026-09-01", 50],
    ["2026-10-02", 40],
    ["2026-10-09", 44],
  ]);

  it("calcula a variação percentual no período", () => {
    expect(calcularVariacao(precos, "7D")).toEqual({ tipo: "PERCENTUAL", valor: expect.closeTo(0.1) });
  });

  it("usa o primeiro ponto dentro da janela", () => {
    // 30D antes de 09/10 é 09/09: o ponto de 01/09 fica fora, então a base é 40.
    expect(calcularVariacao(precos, "30D")).toEqual({ tipo: "PERCENTUAL", valor: expect.closeTo(0.1) });
  });

  it("calcula taxa em pontos percentuais, não em %", () => {
    const taxas = serie("TAXA", [
      ["2026-10-02", 6.0],
      ["2026-10-09", 6.3],
    ]);
    expect(calcularVariacao(taxas, "7D")).toEqual({ tipo: "PONTOS", valor: expect.closeTo(0.3) });
  });

  it("devolve null sem dois pontos no período", () => {
    expect(calcularVariacao(serie("PRECO", [["2026-10-09", 44]]), "7D")).toBeNull();
    expect(calcularVariacao(serie("PRECO", []), "7D")).toBeNull();
  });

  it("não depende da ordem dos pontos", () => {
    const fora = serie("PRECO", [
      ["2026-10-09", 44],
      ["2026-10-02", 40],
    ]);
    expect(calcularVariacao(fora, "7D")).toEqual({ tipo: "PERCENTUAL", valor: expect.closeTo(0.1) });
  });
});

describe("gerarSerieSimulada", () => {
  // 09/10/2026 é sexta-feira.
  const ate = "2026-10-09";

  it("é rotulada como simulada e termina no valor atual", () => {
    const s = gerarSerieSimulada(acao, 38.5, ate);
    expect(s.origem).toBe("SIMULADO");
    expect(s.medida).toBe("PRECO");
    expect(s.pontos.at(-1)).toEqual({ data: ate, valor: 38.5 });
  });

  it("é igual a cada execução para o mesmo ticker", () => {
    expect(gerarSerieSimulada(acao, 38.5, ate)).toEqual(gerarSerieSimulada(acao, 38.5, ate));
  });

  it("pula fins de semana, exceto em cripto", () => {
    const fimDeSemana = (d: string) => [0, 6].includes(new Date(`${d}T00:00:00Z`).getUTCDay());
    expect(gerarSerieSimulada(acao, 38.5, ate).pontos.some((p) => fimDeSemana(p.data))).toBe(false);
    expect(gerarSerieSimulada(cripto, 300000, ate).pontos).toHaveLength(31);
  });

  it("fica em ordem cronológica e com preços positivos", () => {
    const { pontos } = gerarSerieSimulada(acao, 38.5, ate);
    expect(pontos.map((p) => p.data)).toEqual([...pontos.map((p) => p.data)].sort());
    expect(pontos.every((p) => p.valor > 0)).toBe(true);
  });

  it("usa taxa para renda fixa", () => {
    expect(gerarSerieSimulada(titulo, 6.25, ate).medida).toBe("TAXA");
  });
});
