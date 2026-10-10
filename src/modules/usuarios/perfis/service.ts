import "server-only";

import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/core/db";

import { gerarHashSenha } from "../auth/senha";
import { usuariosContas } from "./db";
import type { Papel, Usuario } from "./schema";

/** Regras de negócio: perfis de usuário e permissões. */

type Conta = typeof usuariosContas.$inferSelect;

function paraUsuario(conta: Conta): Usuario {
  return { id: conta.id, nome: conta.nome, email: conta.email, papel: conta.papel };
}

export async function buscarUsuarioPorId(id: string): Promise<Usuario | null> {
  const [conta] = await db.select().from(usuariosContas).where(eq(usuariosContas.id, id));
  return conta ? paraUsuario(conta) : null;
}

/** Uso interno do módulo (login): inclui o hash da senha. */
export async function buscarContaPorEmail(email: string): Promise<Conta | null> {
  const [conta] = await db
    .select()
    .from(usuariosContas)
    .where(eq(usuariosContas.email, email.trim().toLowerCase()));
  return conta ?? null;
}

type NovaConta = {
  /** Só o seed passa id, data e sal fixos, para o banco gerado ser igual a cada reset. */
  id?: string;
  criadoEm?: string;
  salSenha?: Buffer;
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
};

/** Monta a linha da conta (normaliza o e-mail e gera o hash da senha) sem gravar. */
export async function montarConta(dados: NovaConta): Promise<Conta> {
  return {
    id: dados.id ?? randomUUID(),
    nome: dados.nome,
    email: dados.email.trim().toLowerCase(),
    senhaHash: await gerarHashSenha(dados.senha, dados.salSenha),
    papel: dados.papel,
    assessorId: null,
    criadoEm: dados.criadoEm ?? new Date().toISOString(),
  };
}

export async function criarUsuario(dados: NovaConta): Promise<Usuario> {
  const conta = await montarConta(dados);
  await db.insert(usuariosContas).values(conta);
  return paraUsuario(conta);
}

/** Usuário pelo e-mail (normalizado), sem dados de credencial. */
export async function buscarUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const conta = await buscarContaPorEmail(email);
  return conta ? paraUsuario(conta) : null;
}

/** Assessor que atende o usuário (vínculo em usuarios_contas.assessor_id), ou null. */
export async function buscarAssessorDoUsuario(usuarioId: string): Promise<Usuario | null> {
  const [conta] = await db
    .select({ assessorId: usuariosContas.assessorId })
    .from(usuariosContas)
    .where(eq(usuariosContas.id, usuarioId));
  return conta?.assessorId ? buscarUsuarioPorId(conta.assessorId) : null;
}

/** Liga o cliente ao assessor que o atende (substitui o vínculo anterior). */
export async function vincularAssessor(clienteId: string, assessorId: string): Promise<void> {
  await db.update(usuariosContas).set({ assessorId }).where(eq(usuariosContas.id, clienteId));
}
