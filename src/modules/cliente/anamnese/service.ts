import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/core/db";

import { clienteAnamnese } from "./db";
import { AnamneseSchema, type Anamnese } from "./schema";

/** Regras de negócio: questionário de perfil do investidor (suitability). */
export async function listarAnamnese(usuarioId: string): Promise<Anamnese | null> {
  const registro = await db
    .select()
    .from(clienteAnamnese)
    .where(eq(clienteAnamnese.usuarioId, usuarioId))
    .get();
  return registro ? AnamneseSchema.parse(registro) : null;
}
