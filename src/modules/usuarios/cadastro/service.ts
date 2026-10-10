import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/core/db";

import { usuariosContas } from "../perfis/db";
import type { Usuario } from "../perfis/schema";
import { buscarContaPorEmail, montarConta } from "../perfis/service";
import { usuariosDadosPessoais } from "./db";
import { type Cadastro, type DadosPessoais, VERSAO_TERMO_CONSENTIMENTO } from "./schema";

/** Regras de negócio: cadastro de conta e dados pessoais. */

export type ResultadoCadastro = { ok: true; usuario: Usuario } | { ok: false; motivo: "email-em-uso" };

function emailDuplicado(erro: unknown): boolean {
  const texto = String((erro as { cause?: unknown })?.cause ?? erro);
  return texto.includes("UNIQUE") && texto.includes("usuarios_contas.email");
}

/**
 * Cria a conta (sempre com papel "usuario") e os dados pessoais, juntos ou nada.
 * Registra data e versão do termo de consentimento aceito.
 */
export async function cadastrar(dados: Cadastro): Promise<ResultadoCadastro> {
  if (await buscarContaPorEmail(dados.email)) return { ok: false, motivo: "email-em-uso" };

  const conta = await montarConta({
    nome: dados.nome,
    email: dados.email,
    senha: dados.senha,
    papel: "usuario",
  });

  try {
    await db.batch([
      db.insert(usuariosContas).values(conta),
      db.insert(usuariosDadosPessoais).values({
        usuarioId: conta.id,
        nascimento: dados.nascimento,
        celular: dados.celular,
        profissao: dados.profissao,
        estadoCivil: dados.estadoCivil,
        rendaFaixa: dados.rendaFaixa,
        consentimentoEm: conta.criadoEm,
        consentimentoVersao: VERSAO_TERMO_CONSENTIMENTO,
      }),
    ]);
  } catch (erro) {
    // Duas pessoas cadastrando o mesmo e-mail ao mesmo tempo: o banco garante a unicidade.
    if (emailDuplicado(erro)) return { ok: false, motivo: "email-em-uso" };
    throw erro;
  }

  return {
    ok: true,
    usuario: { id: conta.id, nome: conta.nome, email: conta.email, papel: conta.papel },
  };
}

/** Dados pessoais de uma conta, ou null se ela não tiver (ex.: contas do seed). */
export async function buscarDadosPessoais(usuarioId: string): Promise<DadosPessoais | null> {
  const [linha] = await db
    .select()
    .from(usuariosDadosPessoais)
    .where(eq(usuariosDadosPessoais.usuarioId, usuarioId));
  return linha ?? null;
}
