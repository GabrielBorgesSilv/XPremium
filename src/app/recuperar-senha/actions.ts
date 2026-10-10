"use server";

import { z } from "zod";

import { PedidoRecuperacaoSchema, solicitarRecuperacao } from "@/modules/usuarios";

export type EstadoPedido = { email?: string; erro?: string; enviado?: boolean };

export async function solicitarAction(_anterior: EstadoPedido, dados: FormData): Promise<EstadoPedido> {
  const email = String(dados.get("email") ?? "");
  const entrada = PedidoRecuperacaoSchema.safeParse({ email });
  if (!entrada.success) {
    return { email, erro: z.flattenError(entrada.error).fieldErrors.email?.[0] };
  }
  await solicitarRecuperacao(entrada.data.email);
  // Mesma resposta exista ou não a conta.
  return { enviado: true };
}
