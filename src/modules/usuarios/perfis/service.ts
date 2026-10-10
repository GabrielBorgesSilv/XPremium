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

export async function criarUsuario(dados: {
  /** Opcional: o seed passa ids determinísticos. */
  id?: string;
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
}): Promise<Usuario> {
  const conta: Conta = {
    id: dados.id ?? randomUUID(),
    nome: dados.nome,
    email: dados.email.trim().toLowerCase(),
    senhaHash: await gerarHashSenha(dados.senha),
    papel: dados.papel,
    criadoEm: new Date().toISOString(),
  };
  await db.insert(usuariosContas).values(conta);
  return paraUsuario(conta);
}
