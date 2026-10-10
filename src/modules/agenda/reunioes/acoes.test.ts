import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Ator } from "./acoes";

// Banco SQLite em memória novo a cada teste, com a tabela real de reuniões.
async function preparar() {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", ":memory:");
  const { db } = await import("@/core/db");
  const agendaDb = await import("./db");
  const { pushSQLiteSchema } = await import("drizzle-kit/api");
  await (await pushSQLiteSchema({ ...agendaDb }, db)).apply();
  return import("./acoes");
}

// Ids fictícios: assessor a1 com clientes c1 e c2; x é alguém sem vínculo.
const assessor: Ator = { id: "a1", lado: "ASSESSOR" };
const cliente1: Ator = { id: "c1", lado: "CLIENTE" };
const cliente2: Ator = { id: "c2", lado: "CLIENTE" };
const AGORA = "2026-10-10T12:00:00.000Z";

const pedido = (parcial: Record<string, unknown> = {}) => ({
  participanteId: "c1",
  data: "2026-10-15",
  hora: "14:00",
  duracaoMin: "60",
  modalidade: "ONLINE",
  motivoCategoria: "REVISAO_CARTEIRA",
  motivoDescricao: "Revisão trimestral da carteira",
  ...parcial,
});

let acoes: Awaited<ReturnType<typeof preparar>>;
beforeEach(async () => {
  acoes = await preparar();
});

describe("criar", { timeout: 30_000 }, () => {
  it("cria pendente, convocada por quem pediu", async () => {
    const r = await acoes.criar(assessor, new Set(["c1", "c2"]), pedido(), AGORA);
    expect(r.ok).toBe(true);
    const [reuniao] = await acoes.reunioesDe("c1");
    expect(reuniao).toMatchObject({
      assessorId: "a1",
      clienteId: "c1",
      convocante: "ASSESSOR",
      status: "PENDENTE",
      inicio: "2026-10-15T17:00:00.000Z",
      fim: "2026-10-15T18:00:00.000Z",
      local: null,
    });
  });

  it("o cliente também convoca o próprio assessor", async () => {
    const r = await acoes.criar(cliente1, new Set(["a1"]), pedido({ participanteId: "a1" }), AGORA);
    expect(r.ok).toBe(true);
    expect((await acoes.reunioesDe("a1"))[0]).toMatchObject({ convocante: "CLIENTE", clienteId: "c1" });
  });

  it("recusa quem não é vinculado", async () => {
    const r = await acoes.criar(assessor, new Set(["c1"]), pedido({ participanteId: "x" }), AGORA);
    expect(r).toMatchObject({ ok: false, campos: { participanteId: expect.any(String) } });
  });

  it("recusa horário no passado e formulário incompleto", async () => {
    expect((await acoes.criar(assessor, new Set(["c1"]), pedido({ data: "2026-10-01" }), AGORA)).ok).toBe(false);
    const incompleto = await acoes.criar(assessor, new Set(["c1"]), pedido({ modalidade: "PRESENCIAL" }), AGORA);
    expect(incompleto).toMatchObject({ ok: false, campos: { local: expect.any(String) } });
  });

  it("bloqueia conflito de horário do assessor e do cliente", async () => {
    await acoes.criar(assessor, new Set(["c1", "c2"]), pedido(), AGORA);
    const doAssessor = await acoes.criar(assessor, new Set(["c1", "c2"]), pedido({ participanteId: "c2", hora: "14:30" }), AGORA);
    expect(doAssessor.ok).toBe(false);
    // Encostando (15:00, logo após a das 14:00–15:00) é permitido.
    expect((await acoes.criar(assessor, new Set(["c2"]), pedido({ participanteId: "c2", hora: "15:00" }), AGORA)).ok).toBe(true);
  });
});

describe("responder e cancelar", { timeout: 30_000 }, () => {
  async function criada() {
    const r = await acoes.criar(assessor, new Set(["c1", "c2"]), pedido(), AGORA);
    if (!r.ok) throw new Error(r.erro);
    return r.id;
  }

  it("quem convocou não aceita; o convidado aceita", async () => {
    const id = await criada();
    expect((await acoes.responder(assessor, id, true, undefined, AGORA)).ok).toBe(false);
    expect((await acoes.responder(cliente1, id, true, undefined, AGORA)).ok).toBe(true);
    expect((await acoes.reunioesDe("c1"))[0]).toMatchObject({ status: "ACEITA", respondidaEm: AGORA });
  });

  it("o convidado recusa com motivo opcional", async () => {
    const id = await criada();
    expect((await acoes.responder(cliente1, id, false, "Estarei viajando", AGORA)).ok).toBe(true);
    expect((await acoes.reunioesDe("c1"))[0]).toMatchObject({ status: "RECUSADA", justificativa: "Estarei viajando" });
  });

  it("quem não participa recebe 'não encontrada'", async () => {
    const id = await criada();
    expect(await acoes.responder(cliente2, id, true, undefined, AGORA)).toEqual({ ok: false, erro: "Reunião não encontrada." });
    expect((await acoes.cancelar(cliente2, id, undefined, AGORA)).ok).toBe(false);
  });

  it("pendente: só quem convocou cancela; confirmada: qualquer participante", async () => {
    const id = await criada();
    expect((await acoes.cancelar(cliente1, id, undefined, AGORA)).ok).toBe(false);
    await acoes.responder(cliente1, id, true, undefined, AGORA);
    expect((await acoes.cancelar(cliente1, id, "Imprevisto", AGORA)).ok).toBe(true);
    expect((await acoes.reunioesDe("c1"))[0]).toMatchObject({ status: "CANCELADA", justificativa: "Imprevisto" });
  });

  it("reunião recusada libera o horário e não pode ser respondida de novo", async () => {
    const primeira = await criada(); // a1 ↔ c1, 14h, pendente
    await acoes.responder(cliente1, primeira, false, undefined, AGORA);
    // O horário das 14h do assessor ficou livre para outro cliente.
    expect((await acoes.criar(assessor, new Set(["c2"]), pedido({ participanteId: "c2" }), AGORA)).ok).toBe(true);
    expect((await acoes.responder(cliente1, primeira, true, undefined, AGORA)).ok).toBe(false);
  });
});
