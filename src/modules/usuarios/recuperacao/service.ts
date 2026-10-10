import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { and, eq, gt, lte } from "drizzle-orm";

import { db } from "@/core/db";
import { env } from "@/core/env";

import { usuariosSessoes } from "../auth/db";
import { gerarHashSenha } from "../auth/senha";
import { usuariosContas } from "../perfis/db";
import { buscarContaPorEmail } from "../perfis/service";
import { usuariosRecuperacoesSenha } from "./db";
import { VALIDADE_LINK_MINUTOS } from "./schema";

/** Regras de negócio: recuperação (redefinição) de senha. */

function hashDoToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * "Envia" o link. Sem serviço de e-mail: em desenvolvimento, mostra no terminal do
 * servidor só o link (sem o e-mail, regra de logs do CLAUDE.md). Em produção não mostra.
 */
function enviarLink(link: string): void {
  if (process.env.NODE_ENV === "production") {
    console.warn("Redefinição de senha pedida, mas o envio por e-mail ainda não está configurado.");
    return;
  }
  console.info(`\n🔑 Link para redefinir a senha (vale ${VALIDADE_LINK_MINUTOS} min, uso único):\n   ${link}\n`);
}

/**
 * Pede a redefinição. Não revela se o e-mail tem conta: para quem chama, o resultado é
 * sempre o mesmo. Se a conta existir, invalida os links anteriores dela e gera um novo.
 */
export async function solicitarRecuperacao(email: string): Promise<void> {
  const agora = new Date();
  await db.delete(usuariosRecuperacoesSenha).where(lte(usuariosRecuperacoesSenha.expiraEm, agora.toISOString()));

  const conta = await buscarContaPorEmail(email);
  if (!conta) return;

  const token = randomBytes(32).toString("base64url");
  await db.batch([
    // Só o último link vale.
    db.delete(usuariosRecuperacoesSenha).where(eq(usuariosRecuperacoesSenha.usuarioId, conta.id)),
    db.insert(usuariosRecuperacoesSenha).values({
      tokenHash: hashDoToken(token),
      usuarioId: conta.id,
      expiraEm: new Date(agora.getTime() + VALIDADE_LINK_MINUTOS * 60_000).toISOString(),
      criadoEm: agora.toISOString(),
    }),
  ]);

  const link = new URL(`/redefinir-senha?token=${encodeURIComponent(token)}`, env.APP_URL);
  enviarLink(link.toString());
}

async function buscarPedidoValido(token: string) {
  const [pedido] = await db
    .select()
    .from(usuariosRecuperacoesSenha)
    .where(
      and(
        eq(usuariosRecuperacoesSenha.tokenHash, hashDoToken(token)),
        gt(usuariosRecuperacoesSenha.expiraEm, new Date().toISOString()),
      ),
    );
  return pedido ?? null;
}

/** O link ainda vale? (existe, não foi usado e não expirou) */
export async function linkRecuperacaoValido(token: string): Promise<boolean> {
  return (await buscarPedidoValido(token)) !== null;
}

/**
 * Troca a senha com um link válido. Uso único: apaga os links da conta e encerra
 * todas as sessões dela (quem estava logado com a senha antiga sai).
 */
export async function redefinirSenha(token: string, novaSenha: string): Promise<"ok" | "link-invalido"> {
  const pedido = await buscarPedidoValido(token);
  if (!pedido) return "link-invalido";

  const senhaHash = await gerarHashSenha(novaSenha);
  await db.batch([
    db.update(usuariosContas).set({ senhaHash }).where(eq(usuariosContas.id, pedido.usuarioId)),
    db.delete(usuariosRecuperacoesSenha).where(eq(usuariosRecuperacoesSenha.usuarioId, pedido.usuarioId)),
    db.delete(usuariosSessoes).where(eq(usuariosSessoes.usuarioId, pedido.usuarioId)),
  ]);
  return "ok";
}
