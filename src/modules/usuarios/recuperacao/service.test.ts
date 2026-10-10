import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.DATABASE_URL = ":memory:";
  process.env.APP_URL = "http://localhost:3000";
});

const { db } = await import("@/core/db");
const perfisDb = await import("../perfis/db");
const authDb = await import("../auth/db");
const recuperacaoDb = await import("./db");
const { verificarSenha } = await import("../auth/senha");
const { criarUsuario } = await import("../perfis/service");
const { linkRecuperacaoValido, redefinirSenha, solicitarRecuperacao } = await import("./service");

const SENHA_ANTIGA = "senha-antiga-ficticia";
const SENHA_NOVA = "senha-nova-ficticia";
let idPessoa = "";
let idOutra = "";

/** Pede o link e devolve o token mostrado no terminal. */
async function pedirToken(email = "pessoa@hubxp.test"): Promise<string> {
  const log = vi.spyOn(console, "info").mockImplementation(() => {});
  await solicitarRecuperacao(email);
  const texto = String(log.mock.calls.at(-1)?.[0] ?? "");
  log.mockRestore();
  const token = new URL(texto.match(/http\S+/)![0]).searchParams.get("token");
  return token!;
}

async function senhaHashDe(id: string): Promise<string> {
  const contas = await db.select().from(perfisDb.usuariosContas);
  return contas.find((c) => c.id === id)!.senhaHash;
}

beforeAll(async () => {
  const { pushSQLiteSchema } = await import("drizzle-kit/api");
  await (await pushSQLiteSchema({ ...perfisDb, ...authDb, ...recuperacaoDb }, db)).apply();
});

beforeEach(async () => {
  vi.unstubAllEnvs();
  await db.delete(recuperacaoDb.usuariosRecuperacoesSenha);
  await db.delete(authDb.usuariosSessoes);
  await db.delete(perfisDb.usuariosContas);
  idPessoa = (await criarUsuario({ nome: "Pessoa Fictícia", email: "pessoa@hubxp.test", senha: SENHA_ANTIGA, papel: "usuario" })).id;
  idOutra = (await criarUsuario({ nome: "Outra Fictícia", email: "outra@hubxp.test", senha: SENHA_ANTIGA, papel: "usuario" })).id;
});

afterEach(() => vi.restoreAllMocks());

describe("solicitarRecuperacao", () => {
  it("mostra no terminal só o link (com APP_URL), sem o e-mail", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    await solicitarRecuperacao("pessoa@hubxp.test");
    const texto = String(log.mock.calls[0][0]);
    expect(texto).toContain("http://localhost:3000/redefinir-senha?token=");
    expect(texto).not.toContain("pessoa@hubxp.test");
  });

  it("guarda só o hash do token, com validade de 30 minutos", async () => {
    const token = await pedirToken();
    const [pedido] = await db.select().from(recuperacaoDb.usuariosRecuperacoesSenha);
    expect(pedido.tokenHash).not.toBe(token);
    expect(pedido.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    const minutos = (new Date(pedido.expiraEm).getTime() - Date.now()) / 60_000;
    expect(minutos).toBeGreaterThan(29.9);
    expect(minutos).toBeLessThanOrEqual(30);
  });

  it("e-mail sem conta: não gera link nem erro", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    await expect(solicitarRecuperacao("ninguem@hubxp.test")).resolves.toBeUndefined();
    expect(log).not.toHaveBeenCalled();
    expect(await db.select().from(recuperacaoDb.usuariosRecuperacoesSenha)).toHaveLength(0);
  });

  it("em produção não mostra o link no terminal", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await solicitarRecuperacao("pessoa@hubxp.test");
    expect(log).not.toHaveBeenCalled();
  });

  it("novo pedido invalida o link anterior", async () => {
    const primeiro = await pedirToken();
    const segundo = await pedirToken();
    expect(await linkRecuperacaoValido(primeiro)).toBe(false);
    expect(await linkRecuperacaoValido(segundo)).toBe(true);
  });
});

describe("redefinirSenha", () => {
  it("troca a senha: a nova funciona e a antiga não", async () => {
    const token = await pedirToken();
    expect(await redefinirSenha(token, SENHA_NOVA)).toBe("ok");
    const hash = await senhaHashDe(idPessoa);
    expect(await verificarSenha(SENHA_NOVA, hash)).toBe(true);
    expect(await verificarSenha(SENHA_ANTIGA, hash)).toBe(false);
  });

  it("o link é de uso único", async () => {
    const token = await pedirToken();
    await redefinirSenha(token, SENHA_NOVA);
    expect(await redefinirSenha(token, "outra-senha-ficticia")).toBe("link-invalido");
  });

  it("link expirado ou inventado não vale", async () => {
    const token = await pedirToken();
    await db.update(recuperacaoDb.usuariosRecuperacoesSenha).set({ expiraEm: "2000-01-01T00:00:00.000Z" });
    expect(await redefinirSenha(token, SENHA_NOVA)).toBe("link-invalido");
    expect(await redefinirSenha("token-inventado", SENHA_NOVA)).toBe("link-invalido");
    expect(await verificarSenha(SENHA_ANTIGA, await senhaHashDe(idPessoa))).toBe(true);
  });

  it("encerra todas as sessões da conta, sem afetar as de outras contas", async () => {
    const sessao = (usuarioId: string, n: number) => ({
      tokenHash: `${usuarioId}-${n}`.padEnd(64, "0"),
      usuarioId,
      expiraEm: "2099-01-01T00:00:00.000Z",
      criadoEm: "2026-10-10T00:00:00.000Z",
    });
    await db.insert(authDb.usuariosSessoes).values([sessao(idPessoa, 1), sessao(idPessoa, 2), sessao(idOutra, 1)]);

    await redefinirSenha(await pedirToken(), SENHA_NOVA);
    const restantes = await db.select().from(authDb.usuariosSessoes);
    expect(restantes.map((s) => s.usuarioId)).toEqual([idOutra]);
  });
});
