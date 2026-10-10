import { describe, expect, it } from "vitest";

import {
  conflitos,
  ehConvidado,
  instanteDe,
  ladoDe,
  podeCancelar,
  podeResponder,
  situacaoPara,
  sobrepoe,
  somarMinutos,
} from "./regras";
import { NovaReuniaoSchema, type Reuniao } from "./schema";

// Ids fictícios: a1 = assessor, c1/c2 = clientes, x = alguém de fora.
function reuniao(parcial: Partial<Reuniao> = {}): Reuniao {
  return {
    id: "r1",
    assessorId: "a1",
    clienteId: "c1",
    convocante: "ASSESSOR",
    inicio: "2026-10-15T17:00:00.000Z", // 14h em Brasília
    fim: "2026-10-15T18:00:00.000Z",
    motivoCategoria: "REVISAO_CARTEIRA",
    motivoDescricao: "Revisão trimestral da carteira",
    modalidade: "ONLINE",
    local: null,
    status: "PENDENTE",
    justificativa: null,
    respondidaEm: null,
    criadoEm: "2026-10-10T12:00:00.000Z",
    ...parcial,
  };
}
const ANTES = "2026-10-14T12:00:00.000Z";
const DEPOIS = "2026-10-16T12:00:00.000Z";

describe("horários", () => {
  it("converte data e hora de Brasília para UTC", () => {
    expect(instanteDe("2026-10-15", "14:00")).toBe("2026-10-15T17:00:00.000Z");
    expect(somarMinutos("2026-10-15T17:00:00.000Z", 90)).toBe("2026-10-15T18:30:00.000Z");
  });

  it("detecta sobreposição, mas não reuniões que só encostam", () => {
    const a = { inicio: "2026-10-15T17:00:00.000Z", fim: "2026-10-15T18:00:00.000Z" };
    expect(sobrepoe(a, { inicio: "2026-10-15T17:30:00.000Z", fim: "2026-10-15T18:30:00.000Z" })).toBe(true);
    expect(sobrepoe(a, { inicio: "2026-10-15T18:00:00.000Z", fim: "2026-10-15T19:00:00.000Z" })).toBe(false);
  });
});

describe("conflitos", () => {
  const pedido = { assessorId: "a1", clienteId: "c2", inicio: "2026-10-15T17:30:00.000Z", fim: "2026-10-15T18:30:00.000Z" };

  it("bloqueia o horário do assessor, mesmo com outro cliente", () => {
    expect(conflitos(pedido, [reuniao()]).map((r) => r.id)).toEqual(["r1"]);
  });

  it("bloqueia o horário do cliente, mesmo com outro assessor", () => {
    expect(conflitos({ ...pedido, assessorId: "a2", clienteId: "c1" }, [reuniao()])).toHaveLength(1);
  });

  it("ignora reuniões recusadas e canceladas, e de outras pessoas", () => {
    const existentes = [
      reuniao({ id: "rec", status: "RECUSADA" }),
      reuniao({ id: "can", status: "CANCELADA" }),
      reuniao({ id: "outros", assessorId: "a9", clienteId: "c9" }),
    ];
    expect(conflitos(pedido, existentes)).toEqual([]);
  });

  it("ignora a própria reunião ao checar na hora de aceitar", () => {
    expect(conflitos({ ...pedido, clienteId: "c1" }, [reuniao()], "r1")).toEqual([]);
  });
});

describe("quem pode fazer o quê", () => {
  const doAssessor = reuniao({ convocante: "ASSESSOR" });
  const doCliente = reuniao({ convocante: "CLIENTE" });

  it("identifica o lado de cada participante", () => {
    expect(ladoDe(doAssessor, "a1")).toBe("ASSESSOR");
    expect(ladoDe(doAssessor, "c1")).toBe("CLIENTE");
    expect(ladoDe(doAssessor, "x")).toBeNull();
  });

  it("só o convidado aceita: quem convocou não precisa aceitar", () => {
    expect(ehConvidado(doAssessor, "c1")).toBe(true);
    expect(podeResponder(doAssessor, "c1", ANTES)).toBe(true);
    expect(podeResponder(doAssessor, "a1", ANTES)).toBe(false);
    expect(podeResponder(doCliente, "a1", ANTES)).toBe(true);
    expect(podeResponder(doCliente, "c1", ANTES)).toBe(false);
  });

  it("ninguém de fora responde ou cancela", () => {
    expect(podeResponder(doAssessor, "x", ANTES)).toBe(false);
    expect(podeCancelar(doAssessor, "x", ANTES)).toBe(false);
  });

  it("não responde reunião já respondida nem que já começou", () => {
    expect(podeResponder(reuniao({ status: "ACEITA" }), "c1", ANTES)).toBe(false);
    expect(podeResponder(doAssessor, "c1", DEPOIS)).toBe(false);
  });

  it("pendente: só quem convocou cancela; confirmada: qualquer participante", () => {
    expect(podeCancelar(doAssessor, "a1", ANTES)).toBe(true);
    expect(podeCancelar(doAssessor, "c1", ANTES)).toBe(false);
    const confirmada = reuniao({ status: "ACEITA" });
    expect(podeCancelar(confirmada, "a1", ANTES)).toBe(true);
    expect(podeCancelar(confirmada, "c1", ANTES)).toBe(true);
    expect(podeCancelar(confirmada, "c1", DEPOIS)).toBe(false);
    expect(podeCancelar(reuniao({ status: "RECUSADA" }), "a1", ANTES)).toBe(false);
  });

  it("mostra a situação do ponto de vista de cada um", () => {
    expect(situacaoPara(doAssessor, "c1")).toBe("AGUARDANDO_VOCE");
    expect(situacaoPara(doAssessor, "a1")).toBe("AGUARDANDO_OUTRO");
    expect(situacaoPara(reuniao({ status: "ACEITA" }), "a1")).toBe("CONFIRMADA");
  });
});

describe("NovaReuniaoSchema", () => {
  const valido = {
    participanteId: "c1",
    data: "2026-10-15",
    hora: "14:00",
    duracaoMin: "60",
    modalidade: "ONLINE",
    motivoCategoria: "REVISAO_CARTEIRA",
    motivoDescricao: "Revisão trimestral da carteira",
  };
  const erros = (dados: Record<string, unknown>) => {
    const r = NovaReuniaoSchema.safeParse(dados);
    return r.success ? [] : r.error.issues.map((i) => i.path.join("."));
  };

  it("aceita um pedido completo (online, sem local)", () => {
    expect(erros(valido)).toEqual([]);
  });

  it("exige motivo: categoria e descrição de pelo menos 10 caracteres", () => {
    expect(erros({ ...valido, motivoCategoria: undefined })).toEqual(["motivoCategoria"]);
    expect(erros({ ...valido, motivoDescricao: "reunião" })).toEqual(["motivoDescricao"]);
  });

  it("exige local quando é presencial", () => {
    expect(erros({ ...valido, modalidade: "PRESENCIAL" })).toEqual(["local"]);
    expect(erros({ ...valido, modalidade: "PRESENCIAL", local: "   " })).toEqual(["local"]);
    expect(erros({ ...valido, modalidade: "PRESENCIAL", local: "Escritório Av. Paulista, 1000" })).toEqual([]);
  });

  it("recusa duração fora da lista e hora inválida", () => {
    expect(erros({ ...valido, duracaoMin: "50" })).toEqual(["duracaoMin"]);
    expect(erros({ ...valido, hora: "25:00" })).toEqual(["hora"]);
  });
});
