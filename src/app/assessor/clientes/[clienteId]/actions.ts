"use server";

import { z } from "zod";

import { BLOCOS_MENSAGEM, registrarContatoWhatsApp } from "@/modules/assessor";
import { exigirPapel } from "@/modules/usuarios";

const EntradaSchema = z.object({
  clienteId: z.string().min(1),
  blocos: z.array(z.enum(BLOCOS_MENSAGEM)).min(1),
});

/** Registra a abertura do WhatsApp para o cliente (só os blocos, nunca o texto). */
export async function registrarWhatsAppAction(clienteId: string, blocos: string[]): Promise<{ ok: boolean }> {
  const usuario = await exigirPapel("assessor");
  const entrada = EntradaSchema.safeParse({ clienteId, blocos });
  if (!entrada.success) return { ok: false };
  const resultado = await registrarContatoWhatsApp(usuario.id, entrada.data.clienteId, entrada.data.blocos);
  return { ok: resultado === "ok" };
}
