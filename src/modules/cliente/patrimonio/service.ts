import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/core/db";

import { clientePatrimonio } from "./db";
import { PatrimonioSchema, type Patrimonio } from "./schema";

/** Regras de negócio: visão consolidada de ativos e investimentos do cliente. */
export async function listarPatrimonio(usuarioId: string): Promise<Patrimonio[]> {
  const registros = await db
    .select()
    .from(clientePatrimonio)
    .where(eq(clientePatrimonio.usuarioId, usuarioId));
  return PatrimonioSchema.array().parse(registros);
}
