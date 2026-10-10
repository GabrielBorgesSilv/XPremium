import { afterEach, describe, expect, it, vi } from "vitest";

import { criarAleatorio } from "@/shared/aleatorio";

/** Carrega o módulo do zero com o ambiente informado, num banco em memória novo. */
async function semearComAmbiente(ambiente: { SENHA_DEMO?: string; NODE_ENV?: string }) {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", ":memory:");
  vi.stubEnv("SENHA_DEMO", ambiente.SENHA_DEMO ?? "");
  vi.stubEnv("NODE_ENV", ambiente.NODE_ENV ?? "development");

  const { db } = await import("@/core/db");
  const perfisDb = await import("./perfis/db");
  const authDb = await import("./auth/db");
  const { pushSQLiteSchema } = await import("drizzle-kit/api");
  await (await pushSQLiteSchema({ ...perfisDb, ...authDb }, db)).apply();

  const { semearUsuarios } = await import("./seed");
  await semearUsuarios(criarAleatorio(42));
  return db.select().from(perfisDb.usuariosContas).orderBy(perfisDb.usuariosContas.email);
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("semearUsuarios", () => {
  it("cria 1 assessor e 2 usuários com e-mails .test", async () => {
    const contas = await semearComAmbiente({ SENHA_DEMO: "senha-ficticia" });
    expect(contas.map((c) => [c.email, c.papel])).toEqual([
      ["assessor@hubxp.test", "assessor"],
      ["usuario1@hubxp.test", "usuario"],
      ["usuario2@hubxp.test", "usuario"],
    ]);
  });

  it("gera exatamente o mesmo banco a cada reset (ids, nomes, data e hash da senha)", async () => {
    const primeira = await semearComAmbiente({ SENHA_DEMO: "senha-ficticia" });
    const segunda = await semearComAmbiente({ SENHA_DEMO: "senha-ficticia" });
    expect(segunda).toEqual(primeira);
  });

  it("em desenvolvimento, sem SENHA_DEMO, usa a senha do .env.example e avisa", async () => {
    const aviso = vi.spyOn(console, "warn").mockImplementation(() => {});
    await semearComAmbiente({ NODE_ENV: "development" });
    expect(aviso).toHaveBeenCalledOnce();

    const { verificarSenha } = await import("./auth/senha");
    const { db } = await import("@/core/db");
    const { usuariosContas } = await import("./perfis/db");
    const [conta] = await db.select().from(usuariosContas).limit(1);
    expect(await verificarSenha("demo-hubxp", conta.senhaHash)).toBe(true);
  });

  it("em produção, sem SENHA_DEMO, recusa", async () => {
    await expect(semearComAmbiente({ NODE_ENV: "production" })).rejects.toThrow(/SENHA_DEMO/);
  });
});
