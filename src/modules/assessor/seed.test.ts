import { afterEach, describe, expect, it, vi } from "vitest";

import { criarAleatorio } from "@/shared/aleatorio";
import type { ContextoSeed } from "@/shared/contexto-seed";

/** Roda o seed do assessor num banco em memória novo, com as contas informadas. */
async function semear(contexto: ContextoSeed) {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", ":memory:");

  const { db } = await import("@/core/db");
  const ativosDb = await import("./ativos/db");
  const clientesDb = await import("./clientes/db");
  const { pushSQLiteSchema } = await import("drizzle-kit/api");
  await (await pushSQLiteSchema({ ...ativosDb, ...clientesDb }, db)).apply();

  const { semearAssessor } = await import("./seed");
  await semearAssessor(criarAleatorio(42), contexto);
  return {
    vinculos: await db.select().from(clientesDb.assessorVinculos).orderBy(clientesDb.assessorVinculos.clienteId),
    posicoes: await db.select().from(ativosDb.assessorPosicoes),
  };
}

// Contas fictícias, como o script de seed entrega depois do seed do M1 (ordenadas por e-mail).
const contas = [
  { id: "a1", email: "assessor@hubxp.test", papel: "assessor" },
  { id: "u1", email: "usuario1@hubxp.test", papel: "usuario" },
  { id: "u2", email: "usuario2@hubxp.test", papel: "usuario" },
  { id: "u3", email: "usuario3@hubxp.test", papel: "usuario" },
  { id: "u4", email: "usuario4@hubxp.test", papel: "usuario" },
];

afterEach(() => vi.unstubAllEnvs());

describe("semearAssessor", { timeout: 30_000 }, () => {
  it("vincula todos os clientes de demo ao assessor de demo", async () => {
    const { vinculos } = await semear({ contas });
    expect(vinculos.map((v) => [v.clienteId, v.assessorId])).toEqual([
      ["u1", "a1"],
      ["u2", "a1"],
      ["u3", "a1"],
      ["u4", "a1"],
    ]);
  });

  it("entrega as carteiras-modelo em ordem (carteira-1 ao usuario1...)", async () => {
    const { posicoes } = await semear({ contas });
    const tickersDe = (id: string) => posicoes.filter((p) => p.clienteId === id).map((p) => p.ticker).sort();
    expect(tickersDe("u1")).toEqual(["CDB-ALFA-2027", "HGLG11", "IPCA-2035", "ITUB4", "LCI-ALFA-2026"]);
    expect(tickersDe("u4")).toEqual(["BOVA11", "PETR4", "VALE3", "XPML11"]);
    expect(posicoes.some((p) => p.clienteId.startsWith("carteira-"))).toBe(false);
  });

  it("não faz nada sem assessor ou sem clientes", async () => {
    expect(await semear({ contas: contas.filter((c) => c.papel !== "assessor") })).toEqual({ vinculos: [], posicoes: [] });
    expect(await semear({ contas: contas.filter((c) => c.papel === "assessor") })).toEqual({ vinculos: [], posicoes: [] });
  });
});
