import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.DATABASE_URL = ":memory:";
});

const { db } = await import("@/core/db");
const perfisDb = await import("../perfis/db");
const authDb = await import("../auth/db");
const cadastroDb = await import("./db");
const { verificarSenha } = await import("../auth/senha");
const { buscarDadosPessoais, cadastrar } = await import("./service");
const { VERSAO_TERMO_CONSENTIMENTO } = await import("./schema");

import type { Cadastro } from "./schema";

const dados: Cadastro = {
  nome: "Pessoa Fictícia",
  email: "pessoa@hubxp.test",
  senha: "senha-ficticia",
  confirmacaoSenha: "senha-ficticia",
  nascimento: "1990-05-20",
  celular: "11912345678",
  profissao: "Engenheira",
  estadoCivil: "solteiro",
  rendaFaixa: "5k-15k",
  consentimento: true,
};

beforeAll(async () => {
  const { pushSQLiteSchema } = await import("drizzle-kit/api");
  await (await pushSQLiteSchema({ ...perfisDb, ...authDb, ...cadastroDb }, db)).apply();
});

beforeEach(async () => {
  await db.delete(cadastroDb.usuariosDadosPessoais);
  await db.delete(perfisDb.usuariosContas);
});

describe("cadastrar", () => {
  it("cria a conta sempre com papel usuario e a senha só como hash", async () => {
    const r = await cadastrar(dados);
    expect(r).toMatchObject({ ok: true, usuario: { email: "pessoa@hubxp.test", papel: "usuario" } });

    const [conta] = await db.select().from(perfisDb.usuariosContas);
    expect(conta.senhaHash).not.toContain("senha-ficticia");
    expect(await verificarSenha("senha-ficticia", conta.senhaHash)).toBe(true);
  });

  it("grava os dados pessoais e o consentimento com data e versão do termo", async () => {
    const r = await cadastrar(dados);
    if (!r.ok) throw new Error("cadastro falhou");
    const pessoais = await buscarDadosPessoais(r.usuario.id);
    expect(pessoais).toMatchObject({
      nascimento: "1990-05-20",
      celular: "11912345678",
      profissao: "Engenheira",
      estadoCivil: "solteiro",
      rendaFaixa: "5k-15k",
      consentimentoVersao: VERSAO_TERMO_CONSENTIMENTO,
    });
    expect(Number.isNaN(Date.parse(pessoais!.consentimentoEm))).toBe(false);
  });

  it("e-mail já cadastrado (mesmo com maiúsculas) → email-em-uso, sem criar nada", async () => {
    await cadastrar(dados);
    const r = await cadastrar({ ...dados, email: "PESSOA@hubxp.test" });
    expect(r).toEqual({ ok: false, motivo: "email-em-uso" });
    expect(await db.select().from(perfisDb.usuariosContas)).toHaveLength(1);
  });

  it("conta e dados pessoais são gravados juntos ou nada", async () => {
    // Força falha na gravação dos dados pessoais (campo obrigatório nulo).
    await expect(cadastrar({ ...dados, profissao: null as unknown as string })).rejects.toThrow();
    expect(await db.select().from(perfisDb.usuariosContas)).toHaveLength(0);
    expect(await db.select().from(cadastroDb.usuariosDadosPessoais)).toHaveLength(0);
  });
});

describe("buscarDadosPessoais", () => {
  it("conta sem dados pessoais (ex.: seed) → null", async () => {
    expect(await buscarDadosPessoais("id-inexistente")).toBeNull();
  });
});
