import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/core/db";
import { buscarDadosPessoais, buscarUsuarioPorId, type DadosPessoais, exigirPapel } from "@/modules/usuarios";

import { assessorVinculos } from "./db";
import type { ClienteVinculado } from "./schema";

/**
 * Vínculo assessor ↔ cliente: o ÚNICO lugar que decide quais clientes um assessor pode ver.
 * Lê a tabela assessor_vinculos e os nomes das contas do M1.
 * Não importa nada de ativos (evita ciclo: ativos usa o vínculo e o dash do cliente usa ativos).
 */

/** Assessor da sessão. Sem login ou sem o papel, o M1 redireciona. */
export async function assessorAtual(): Promise<string> {
  return (await exigirPapel("assessor")).id;
}

/** Clientes vinculados ao assessor, em ordem alfabética. Contas apagadas no M1 ficam de fora. */
export async function listarClientesDoAssessor(assessorId: string): Promise<ClienteVinculado[]> {
  const vinculos = await db.select().from(assessorVinculos).where(eq(assessorVinculos.assessorId, assessorId));
  const clientes = await Promise.all(vinculos.map((v) => buscarUsuarioPorId(v.clienteId)));
  return clientes
    .flatMap((u) => (u ? [{ id: u.id, nome: u.nome }] : []))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** O cliente, se for vinculado a este assessor; senão null (a tela trata como "não encontrado"). */
export async function buscarClienteDoAssessor(
  assessorId: string,
  clienteId: string,
): Promise<(ClienteVinculado & { cadastro: DadosPessoais | null }) | null> {
  const [vinculo] = await db.select().from(assessorVinculos).where(eq(assessorVinculos.clienteId, clienteId));
  if (!vinculo || vinculo.assessorId !== assessorId) return null;
  const conta = await buscarUsuarioPorId(clienteId);
  if (!conta) return null;
  return { id: conta.id, nome: conta.nome, cadastro: await buscarDadosPessoais(conta.id) };
}

/** O assessor do cliente (para a agenda do cliente); null se o cliente ainda não tem assessor. */
export async function buscarAssessorDoCliente(clienteId: string): Promise<ClienteVinculado | null> {
  const [vinculo] = await db.select().from(assessorVinculos).where(eq(assessorVinculos.clienteId, clienteId));
  if (!vinculo) return null;
  const conta = await buscarUsuarioPorId(vinculo.assessorId);
  return conta ? { id: conta.id, nome: conta.nome } : null;
}

/** Se o assessor atende o cliente (para a agenda validar quem pode marcar com quem). */
export async function saoVinculados(assessorId: string, clienteId: string): Promise<boolean> {
  const [vinculo] = await db.select().from(assessorVinculos).where(eq(assessorVinculos.clienteId, clienteId));
  return vinculo?.assessorId === assessorId;
}
