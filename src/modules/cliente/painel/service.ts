import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/core/db";

import { clienteAnamnese } from "../anamnese/db";
import { clienteOpenFinance } from "../open-finance/db";
import { AnamneseSchema } from "../anamnese/schema";
import { OpenFinanceSchema } from "../open-finance/schema";
import { PainelClienteSchema, type PainelCliente } from "./schema";

export async function obterPainelCliente(usuarioId: string): Promise<PainelCliente | null> {
  const [anamnese, conexoes] = await Promise.all([
    db
      .select()
      .from(clienteAnamnese)
      .where(eq(clienteAnamnese.usuarioId, usuarioId))
      .get(),
    db
      .select()
      .from(clienteOpenFinance)
      .where(eq(clienteOpenFinance.usuarioId, usuarioId)),
  ]);

  if (!anamnese) {
    return null;
  }

  return PainelClienteSchema.parse({
    anamnese: AnamneseSchema.parse(anamnese),
    conexoes: OpenFinanceSchema.array().parse(conexoes),
  });
}
