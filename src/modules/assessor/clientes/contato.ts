import "server-only";

import { randomUUID } from "node:crypto";

import { db } from "@/core/db";
import { env } from "@/core/env";
import { buscarDadosPessoais } from "@/modules/usuarios";
import { numeroInternacional } from "@/shared/whatsapp";

import { carregarDadosCarteiras } from "../ativos/carregar";
import { pontosDeAtencao, resumirCarteiraCliente } from "../ativos/carteira-cliente";
import { assessorContatos } from "./db";
import { BLOCOS_MENSAGEM, type BlocoMensagem, montarBlocos, montarMensagem } from "./mensagem";
import { assessorAtual, buscarClienteDoAssessor } from "./vinculo";

/** Regras de negócio: contato do assessor com o cliente pelo WhatsApp. */

export type OrigemCelular = "cadastro" | "teste" | "nenhum";

export type ContatoWhatsApp = {
  celular: string | null;
  origemCelular: OrigemCelular;
  /** Blocos com conteúdo para este cliente. */
  disponiveis: BlocoMensagem[];
  /** Mensagem pronta para cada combinação de blocos (chave: blocos na ordem fixa, unidos por "+"). */
  mensagens: Record<string, string>;
};

export const chaveDosBlocos = (blocos: readonly BlocoMensagem[]) =>
  BLOCOS_MENSAGEM.filter((b) => blocos.includes(b)).join("+");

/** Celular do cadastro (M1); para clientes sem cadastro (demonstração), o número de teste do .env. */
async function celularDoCliente(clienteId: string): Promise<{ celular: string | null; origem: OrigemCelular }> {
  const cadastro = await buscarDadosPessoais(clienteId);
  if (cadastro?.celular && numeroInternacional(cadastro.celular)) return { celular: cadastro.celular, origem: "cadastro" };
  if (env.WHATSAPP_DEMO && numeroInternacional(env.WHATSAPP_DEMO)) return { celular: env.WHATSAPP_DEMO, origem: "teste" };
  return { celular: null, origem: "nenhum" };
}

/**
 * Dados para o botão de WhatsApp. null se o cliente não for do assessor
 * (mesma resposta de "não existe", para não revelar quem existe).
 */
export async function obterContatoWhatsApp(clienteId: string, nomeAssessor: string): Promise<ContatoWhatsApp | null> {
  const cliente = buscarClienteDoAssessor(assessorAtual(), clienteId);
  if (!cliente) return null;

  const carregado = carregarDadosCarteiras(new Set([cliente.id]));
  const carteira = resumirCarteiraCliente(cliente.id, carregado.dados);
  const titulo = (id: string) => carregado.noticias.get(id)?.titulo ?? "Notícia sem título";
  const blocos = montarBlocos(carteira, pontosDeAtencao(cliente.id, carteira, carregado.alertas, carregado.exposicoesFGC, titulo));
  const disponiveis = BLOCOS_MENSAGEM.filter((b) => blocos[b] !== null);

  const mensagens: Record<string, string> = {};
  for (let mascara = 1; mascara < 1 << disponiveis.length; mascara++) {
    const escolhidos = disponiveis.filter((_, i) => mascara & (1 << i));
    mensagens[chaveDosBlocos(escolhidos)] = montarMensagem(cliente.nome, nomeAssessor, blocos, escolhidos);
  }

  const { celular, origem } = await celularDoCliente(cliente.id);
  return { celular, origemCelular: origem, disponiveis, mensagens };
}

/** Registra que o assessor abriu o WhatsApp para o cliente (só os blocos, nunca o texto). */
export async function registrarContatoWhatsApp(
  assessorId: string,
  clienteId: string,
  blocos: readonly BlocoMensagem[],
): Promise<"ok" | "nao-encontrado"> {
  if (!buscarClienteDoAssessor(assessorAtual(), clienteId)) return "nao-encontrado";
  await db.insert(assessorContatos).values({
    id: randomUUID(),
    assessorId,
    clienteId,
    canal: "whatsapp",
    blocos: BLOCOS_MENSAGEM.filter((b) => blocos.includes(b)).join(","),
    criadoEm: new Date().toISOString(),
  });
  return "ok";
}
