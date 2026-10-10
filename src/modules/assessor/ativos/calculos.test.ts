import { describe, expect, it } from "vitest";

import { clientesDoAtivo, type DadosCarteiras, resumirCarteiras } from "./calculos";

// Dados fictícios, escolhidos para dar contas fáceis de conferir de cabeça.
const dados: DadosCarteiras = {
  ativos: [
    { ticker: "PETR4", nome: "Ação fictícia A", categoria: "ACOES", moeda: "BRL" },
    { ticker: "O", nome: "REIT fictício", categoria: "FII_REIT", moeda: "USD" },
    { ticker: "XPTO3", nome: "Ação sem cotação", categoria: "ACOES", moeda: "BRL" },
  ],
  posicoes: [
    { clienteId: "cliente-1", ticker: "PETR4", quantidade: 100 },
    { clienteId: "cliente-1", ticker: "O", quantidade: 4 },
    { clienteId: "cliente-2", ticker: "PETR4", quantidade: 50 },
    { clienteId: "cliente-2", ticker: "PETR4", quantidade: 50 },
    { clienteId: "cliente-2", ticker: "XPTO3", quantidade: 10 },
  ],
  cotacoes: [
    { ticker: "PETR4", preco: 40, origem: "SIMULADO", asOf: "2026-10-09T18:00:00-03:00" },
    { ticker: "O", preco: 50, origem: "SIMULADO", asOf: "2026-10-09T18:00:00-03:00" },
  ],
  cambio: { USD: 5 },
};

describe("resumirCarteiras", () => {
  const resumo = resumirCarteiras(dados);

  it("soma o total sob gestão em reais, convertendo moeda estrangeira", () => {
    expect(resumo.totalSobGestao).toBe(9000);
    expect(resumo.numClientes).toBe(2);
    expect(resumo.numAtivos).toBe(3);
  });

  it("agrega cada ativo entre clientes e calcula a participação", () => {
    const [petr, reit] = resumo.ativos;
    expect(petr).toMatchObject({ numClientes: 2, quantidadeTotal: 200, valorTotal: 8000 });
    expect(petr.participacao).toBeCloseTo(8 / 9);
    expect(reit).toMatchObject({ numClientes: 1, quantidadeTotal: 4, valorTotal: 1000 });
    expect(reit.participacao).toBeCloseTo(1 / 9);
  });

  it("deixa ativo sem cotação fora dos totais, sem tratá-lo como zero", () => {
    const xpto = resumo.ativos.find((a) => a.ativo.ticker === "XPTO3");
    expect(xpto).toMatchObject({ valorTotal: null, participacao: null, origemPreco: null });
    expect(resumo.semCotacao).toEqual(["XPTO3"]);
  });

  it("ordena do maior valor para o menor, com os sem cotação no fim", () => {
    expect(resumo.ativos.map((a) => a.ativo.ticker)).toEqual(["PETR4", "O", "XPTO3"]);
  });

  it("recusa posição de ativo não cadastrado", () => {
    const invalido = { ...dados, posicoes: [{ clienteId: "c", ticker: "NAOEXISTE", quantidade: 1 }] };
    expect(() => resumirCarteiras(invalido)).toThrow("NAOEXISTE");
  });

  it("devolve resumo vazio quando não há posições", () => {
    expect(resumirCarteiras({ ...dados, posicoes: [] })).toEqual({
      totalSobGestao: 0,
      numClientes: 0,
      numAtivos: 0,
      semCotacao: [],
      ativos: [],
    });
  });
});

describe("clientesDoAtivo", () => {
  it("calcula o peso do ativo na carteira de cada cliente", () => {
    const clientes = clientesDoAtivo("PETR4", dados);
    expect(clientes).toEqual([
      { clienteId: "cliente-1", quantidade: 100, valor: 4000, pesoNaCarteira: 0.8, acimaDoLimite: true },
      // Carteira do cliente-2 com cotação é só PETR4 (XPTO3 não tem preço), então o peso é 100%.
      { clienteId: "cliente-2", quantidade: 100, valor: 4000, pesoNaCarteira: 1, acimaDoLimite: true },
    ]);
  });

  it("só destaca concentração acima do limite, não igual a ele", () => {
    const [cliente] = clientesDoAtivo("O", dados);
    expect(cliente.pesoNaCarteira).toBeCloseTo(0.2);
    expect(cliente.acimaDoLimite).toBe(false);
  });

  it("aceita outro limite de concentração", () => {
    const [cliente] = clientesDoAtivo("O", dados, 0.1);
    expect(cliente.acimaDoLimite).toBe(true);
  });

  it("mantém o cliente com valor desconhecido quando o ativo não tem cotação", () => {
    expect(clientesDoAtivo("XPTO3", dados)).toEqual([
      { clienteId: "cliente-2", quantidade: 10, valor: null, pesoNaCarteira: null, acimaDoLimite: false },
    ]);
  });

  it("devolve lista vazia para ativo que ninguém tem", () => {
    expect(clientesDoAtivo("VALE3", dados)).toEqual([]);
  });
});
