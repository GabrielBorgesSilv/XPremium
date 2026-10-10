import { describe, expect, it } from "vitest";

import {
  filtrarAtividades,
  filtrarPorPeriodo,
  LIMITE_FGC_REAIS,
  atividadesDoDia,
  type ClienteDoDia,
} from "../domain/atividades";
import { atividadesDaAgenda, clientesDoDia } from "../fixtures/atividades.fixture";

const saudavel: ClienteDoDia = {
  id: "ok",
  nome: "Cliente Estável",
  emDias: 0,
  horario: "18:00",
  compromisso: "Revisão",
  suitabilityDesalinhado: false,
  reservaMeses: 12,
  taxaPoupanca: 0.2,
  endividamento: 0.1,
  comprometimentoRenda: 0.05,
  fgcCobertoReais: 40_000,
  concentracaoEmissor: 0.05,
  creditoPrivado: 0.1,
  desagio: 0,
  concentracaoImobiliaria: 0.2,
  coberturaObjetivos: 1.3,
  prazoObjetivoMeses: 80,
  prejuizoCompensavel: false,
  realizacaoPrevista: false,
  eventoFamiliarAutorizado: false,
};

describe("atividades do dia", () => {
  it("ordena do crítico para a menor criticidade", () => {
    const ordem = atividadesDaAgenda.map((item) => item.criticidade);
    const rank = { CRITICO: 0, ATENCAO: 1, MENOR: 2 };
    const ordenado = [...ordem].sort((a, b) => rank[a] - rank[b]);
    expect(ordem).toEqual(ordenado);
    expect(atividadesDaAgenda[0]?.criticidade).toBe("CRITICO");
    expect(atividadesDaAgenda.at(-1)?.criticidade).toBe("MENOR");
    expect(atividadesDaAgenda.some((item) => item.cliente === "Lívia Campos" && item.criticidade === "MENOR")).toBe(
      true,
    );
  });

  it("marca FGC descoberto e reserva curta como críticos", () => {
    const helena = clientesDoDia.find((cliente) => cliente.id === "helena");
    const ricardo = clientesDoDia.find((cliente) => cliente.id === "ricardo");
    expect(helena).toBeDefined();
    expect(ricardo).toBeDefined();
    if (!helena || !ricardo) return;

    const atividades = atividadesDoDia([helena, ricardo, saudavel]);
    expect(atividades.some((item) => item.cliente === "Helena Prado" && item.titulo.includes("FGC"))).toBe(true);
    expect(helena.fgcCobertoReais).toBeGreaterThan(LIMITE_FGC_REAIS);
    expect(atividades.some((item) => item.cliente === "Ricardo Nogueira" && item.dimensao === "FLUXO")).toBe(true);
    expect(atividades.find((item) => item.cliente === "Cliente Estável")?.criticidade).toBe("MENOR");
  });

  it("filtra criticidade e dimensão sem reordenar o recorte", () => {
    const soCarteira = filtrarAtividades(atividadesDaAgenda, "CRITICO", "CARTEIRA");
    expect(soCarteira.length).toBeGreaterThan(0);
    expect(soCarteira.every((item) => item.criticidade === "CRITICO" && item.dimensao === "CARTEIRA")).toBe(true);
    expect(filtrarAtividades(atividadesDaAgenda, "MENOR", "PASSIVOS")).toEqual([]);
  });

  it("alarga o recorte de hoje até 30 dias sem deixar de fora o que já entrou", () => {
    const hoje = filtrarPorPeriodo(atividadesDaAgenda, 0);
    const semana = filtrarPorPeriodo(atividadesDaAgenda, 7);
    const quinzena = filtrarPorPeriodo(atividadesDaAgenda, 15);
    const mes = filtrarPorPeriodo(atividadesDaAgenda, 30);

    expect(hoje.every((item) => item.emDias === 0)).toBe(true);
    expect(hoje.some((item) => item.cliente === "Paulo Esteves")).toBe(false);
    expect(semana.some((item) => item.cliente === "Paulo Esteves")).toBe(true);
    expect(semana.some((item) => item.cliente === "Otávio Duarte")).toBe(false);
    expect(quinzena.some((item) => item.cliente === "Otávio Duarte")).toBe(true);
    expect(quinzena.some((item) => item.cliente === "Miguel Antunes")).toBe(false);
    expect(mes.some((item) => item.cliente === "Miguel Antunes")).toBe(true);
    expect(mes.length).toBe(atividadesDaAgenda.length);
  });
});
