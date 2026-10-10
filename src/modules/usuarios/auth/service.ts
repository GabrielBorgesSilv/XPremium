import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { eq, lte } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/core/db";
import { CABECALHO_CAMINHO } from "@/core/requisicao";

import { decidirAcesso, paginaInicialDoPapel } from "../perfis/permissoes";
import type { Papel, Usuario } from "../perfis/schema";
import { buscarContaPorEmail, buscarUsuarioPorId } from "../perfis/service";
import { usuariosSessoes } from "./db";
import { caminhoInternoSeguro } from "./redirecionamento";
import type { Login } from "./schema";
import { gerarHashSenha, verificarSenha } from "./senha";

/** Regras de negócio: autenticação e sessão. */

const COOKIE_SESSAO = "hub_sessao";
const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000;

function hashDoToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Hash de uma senha aleatória, para conferir quando o e-mail não existe: o login
// leva o mesmo tempo nos dois casos e não revela quais e-mails têm conta.
let hashFicticio: Promise<string> | undefined;
function obterHashFicticio(): Promise<string> {
  hashFicticio ??= gerarHashSenha(randomBytes(32).toString("hex"));
  return hashFicticio;
}

/**
 * Valida as credenciais, cria a sessão e grava o cookie.
 * Só pode ser chamada em Server Action ou Route Handler (escreve cookie).
 * Retorna null para e-mail inexistente ou senha errada, sem distinguir os casos.
 */
export async function entrar(dados: Login): Promise<Usuario | null> {
  const conta = await buscarContaPorEmail(dados.email);
  const senhaConfere = await verificarSenha(dados.senha, conta?.senhaHash ?? (await obterHashFicticio()));
  if (!conta || !senhaConfere) return null;

  const loja = await cookies();
  // Novo login encerra a sessão anterior deste navegador e limpa as expiradas.
  const tokenAnterior = loja.get(COOKIE_SESSAO)?.value;
  if (tokenAnterior) {
    await db.delete(usuariosSessoes).where(eq(usuariosSessoes.tokenHash, hashDoToken(tokenAnterior)));
  }
  await db.delete(usuariosSessoes).where(lte(usuariosSessoes.expiraEm, new Date().toISOString()));

  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DURACAO_SESSAO_MS);
  await db.insert(usuariosSessoes).values({
    tokenHash: hashDoToken(token),
    usuarioId: conta.id,
    expiraEm: expiraEm.toISOString(),
    criadoEm: new Date().toISOString(),
  });

  loja.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiraEm,
  });

  return { id: conta.id, nome: conta.nome, email: conta.email, papel: conta.papel };
}

/** Encerra a sessão no banco e apaga o cookie. Só em Server Action ou Route Handler. */
export async function sair(): Promise<void> {
  const loja = await cookies();
  const token = loja.get(COOKIE_SESSAO)?.value;
  if (token) {
    await db.delete(usuariosSessoes).where(eq(usuariosSessoes.tokenHash, hashDoToken(token)));
  }
  loja.delete(COOKIE_SESSAO);
}

/** Usuário da sessão atual, ou null. Memoizado por requisição. */
export const obterUsuarioAtual = cache(async (): Promise<Usuario | null> => {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!token) return null;

  const tokenHash = hashDoToken(token);
  const [sessao] = await db
    .select()
    .from(usuariosSessoes)
    .where(eq(usuariosSessoes.tokenHash, tokenHash));
  if (!sessao) return null;

  if (new Date(sessao.expiraEm) <= new Date()) {
    await db.delete(usuariosSessoes).where(eq(usuariosSessoes.tokenHash, tokenHash));
    return null;
  }

  return buscarUsuarioPorId(sessao.usuarioId);
});

/** /login, com ?voltar=<página pedida> quando o proxy informou um caminho interno. */
async function caminhoDoLogin(): Promise<string> {
  const voltar = caminhoInternoSeguro((await headers()).get(CABECALHO_CAMINHO));
  return voltar ? `/login?voltar=${encodeURIComponent(voltar)}` : "/login";
}

/**
 * Para páginas, layouts e Server Actions: garante o papel mínimo ou redireciona.
 * Sem login → /login?voltar=<página pedida>. Sem permissão → área inicial do próprio usuário.
 */
export async function exigirPapel(papel: Papel): Promise<Usuario> {
  const usuario = await obterUsuarioAtual();
  const decisao = decidirAcesso(usuario, papel);
  if (decisao === "nao-autenticado" || !usuario) redirect(await caminhoDoLogin());
  if (decisao === "sem-permissao") redirect(paginaInicialDoPapel(usuario.papel));
  return usuario;
}

/**
 * Para Route Handlers: devolve o usuário ou a resposta de erro pronta (401/403).
 *
 *   const acesso = await autorizarApi("assessor");
 *   if (acesso instanceof Response) return acesso;
 */
export async function autorizarApi(papel: Papel): Promise<Usuario | Response> {
  const usuario = await obterUsuarioAtual();
  const decisao = decidirAcesso(usuario, papel);
  if (decisao === "nao-autenticado" || !usuario) {
    return Response.json({ erro: "Não autenticado." }, { status: 401 });
  }
  if (decisao === "sem-permissao") {
    return Response.json({ erro: "Sem permissão." }, { status: 403 });
  }
  return usuario;
}
