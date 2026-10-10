import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/core/db";

import { clienteOpenFinance } from "./db";
import { OpenFinanceSchema, type OpenFinance } from "./schema";

/** Regras de negócio: consentimento e conexão com outras instituições via Open Finance. */
export async function listarOpenFinance(usuarioId: string): Promise<OpenFinance[]> {
  const registros = await db
    .select()
    .from(clienteOpenFinance)
    .where(eq(clienteOpenFinance.usuarioId, usuarioId));
  return OpenFinanceSchema.array().parse(registros);
}
