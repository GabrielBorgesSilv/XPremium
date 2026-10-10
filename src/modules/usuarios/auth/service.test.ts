import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Banco SQLite em memória e cookies/cabeçalhos simulados (fora do Next).
const simulado = vi.hoisted(() => {
  process.env.DATABASE_URL = ":memory:";
  class Redirecionou extends Error {
    constructor(public destino: string) {
      super(`redirect ${destino}`);
    }
  }
  return {
    cookies: new Map<string, { valor: string; opcoes: Record<string, unknown> }>(),
    cabecalhos: new Headers(),
    Redirecionou,
  };
});

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nome: string) => {
      const c = simulado.cookies.get(nome);
      return c ? { name: nome, value: c.valor } : undefined;
    },
    set: (nome: string, valor: string, opcoes: Record<string, unknown>) =>
      simulado.cookies.set(nome, { valor, opcoes }),
    delete: (nome: string) => simulado.cookies.delete(nome),
  }),
  headers: async () => simulado.cabecalhos,
}));

vi.mock("next/navigation", () => ({
  redirect: (destino: string) => {
    throw new simulado.Redirecionou(destino);
  },
}));

const { db } = await import("@/core/db");
const authDb = await import("./db");
const perfisDb = await import("../perfis/db");
const { criarUsuario } = await import("../perfis/service");
const { autorizarApi, entrar, exigirPapel, obterUsuarioAtual, sair } = await import("./service");

const SENHA = "senha-ficticia";
const COOKIE = "hub_sessao";

async function sessoesNoBanco() {
  return db.select().from(authDb.usuariosSessoes);
}

async function esperarRedirect(promessa: Promise<unknown>): Promise<string> {
  try {
    await promessa;
  } catch (erro) {
    if (erro instanceof simulado.Redirecionou) return erro.destino;
    throw erro;
  }
  throw new Error("esperava redirect");
}

beforeAll(async () => {
  const { pushSQLiteSchema } = await import("drizzle-kit/api");
  await (await pushSQLiteSchema({ ...authDb, ...perfisDb }, db)).apply();
});

beforeEach(async () => {
  simulado.cookies.clear();
  simulado.cabecalhos = new Headers();
  await db.delete(authDb.usuariosSessoes);
  await db.delete(perfisDb.usuariosContas);
  await criarUsuario({ nome: "Usuária Fictícia", email: "usuario@hubxp.test", senha: SENHA, papel: "usuario" });
  await criarUsuario({ nome: "Assessor Fictício", email: "assessor@hubxp.test", senha: SENHA, papel: "assessor" });
});

describe("entrar", () => {
  it("com credenciais certas cria a sessão, grava o cookie httpOnly e não expõe a senha", async () => {
    const usuario = await entrar({ email: "usuario@hubxp.test", senha: SENHA });
    expect(usuario).toMatchObject({ email: "usuario@hubxp.test", papel: "usuario" });
    expect(usuario).not.toHaveProperty("senhaHash");

    const cookie = simulado.cookies.get(COOKIE);
    expect(cookie?.opcoes).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });

    const sessoes = await sessoesNoBanco();
    expect(sessoes).toHaveLength(1);
    // No banco fica só o hash do token, nunca o token do cookie.
    expect(sessoes[0].tokenHash).not.toBe(cookie?.valor);
    expect(sessoes[0].tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("a sessão dura 7 dias", async () => {
    await entrar({ email: "usuario@hubxp.test", senha: SENHA });
    const [sessao] = await sessoesNoBanco();
    const dias = (new Date(sessao.expiraEm).getTime() - Date.now()) / 86_400_000;
    expect(dias).toBeGreaterThan(6.99);
    expect(dias).toBeLessThanOrEqual(7);
  });

  it("senha errada e e-mail inexistente dão o mesmo resultado, sem sessão nem cookie", async () => {
    expect(await entrar({ email: "usuario@hubxp.test", senha: "errada" })).toBeNull();
    expect(await entrar({ email: "ninguem@hubxp.test", senha: "errada" })).toBeNull();
    expect(simulado.cookies.has(COOKIE)).toBe(false);
    expect(await sessoesNoBanco()).toHaveLength(0);
  });

  it("novo login no mesmo navegador encerra a sessão anterior", async () => {
    await entrar({ email: "usuario@hubxp.test", senha: SENHA });
    await entrar({ email: "assessor@hubxp.test", senha: SENHA });
    const sessoes = await sessoesNoBanco();
    expect(sessoes).toHaveLength(1);
    expect((await obterUsuarioAtual())?.email).toBe("assessor@hubxp.test");
  });

  it("login apaga sessões expiradas", async () => {
    await entrar({ email: "usuario@hubxp.test", senha: SENHA });
    await db.update(authDb.usuariosSessoes).set({ expiraEm: "2000-01-01T00:00:00.000Z" });
    simulado.cookies.clear(); // outro navegador
    await entrar({ email: "assessor@hubxp.test", senha: SENHA });
    expect(await sessoesNoBanco()).toHaveLength(1);
  });
});

describe("obterUsuarioAtual", () => {
  it("sem cookie ou com token desconhecido → null", async () => {
    expect(await obterUsuarioAtual()).toBeNull();
    simulado.cookies.set(COOKIE, { valor: "token-inventado", opcoes: {} });
    expect(await obterUsuarioAtual()).toBeNull();
  });

  it("sessão expirada → null e a sessão é apagada", async () => {
    await entrar({ email: "usuario@hubxp.test", senha: SENHA });
    await db.update(authDb.usuariosSessoes).set({ expiraEm: "2000-01-01T00:00:00.000Z" });
    expect(await obterUsuarioAtual()).toBeNull();
    expect(await sessoesNoBanco()).toHaveLength(0);
  });
});

describe("sair", () => {
  it("apaga a sessão e o cookie; um cookie copiado antes deixa de valer", async () => {
    await entrar({ email: "usuario@hubxp.test", senha: SENHA });
    const copia = simulado.cookies.get(COOKIE)!;
    await sair();
    expect(simulado.cookies.has(COOKIE)).toBe(false);
    expect(await sessoesNoBanco()).toHaveLength(0);

    simulado.cookies.set(COOKIE, copia);
    expect(await obterUsuarioAtual()).toBeNull();
  });
});

describe("exigirPapel (páginas)", () => {
  it("sem login → /login com voltar para a página pedida", async () => {
    simulado.cabecalhos.set("x-hub-caminho", "/assessor/clientes?aba=2");
    expect(await esperarRedirect(exigirPapel("assessor"))).toBe(
      "/login?voltar=%2Fassessor%2Fclientes%3Faba%3D2",
    );
  });

  it("sem login e caminho externo no cabeçalho → /login sem voltar", async () => {
    simulado.cabecalhos.set("x-hub-caminho", "https://site-externo.com");
    expect(await esperarRedirect(exigirPapel("usuario"))).toBe("/login");
  });

  it("usuario na área de assessor → /cliente", async () => {
    await entrar({ email: "usuario@hubxp.test", senha: SENHA });
    expect(await esperarRedirect(exigirPapel("assessor"))).toBe("/cliente");
  });

  it("assessor acessa a área de assessor e a de cliente", async () => {
    await entrar({ email: "assessor@hubxp.test", senha: SENHA });
    expect((await exigirPapel("assessor")).papel).toBe("assessor");
    expect((await exigirPapel("usuario")).papel).toBe("assessor");
  });
});

describe("autorizarApi (rotas de API)", () => {
  it("401 sem login, 403 sem papel, usuário quando permitido", async () => {
    const semLogin = await autorizarApi("usuario");
    expect(semLogin instanceof Response && semLogin.status).toBe(401);

    await entrar({ email: "usuario@hubxp.test", senha: SENHA });
    const semPapel = await autorizarApi("assessor");
    expect(semPapel instanceof Response && semPapel.status).toBe(403);

    const permitido = await autorizarApi("usuario");
    expect(permitido).toMatchObject({ email: "usuario@hubxp.test" });
  });
});
