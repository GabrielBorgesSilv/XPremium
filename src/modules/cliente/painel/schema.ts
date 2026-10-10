import { z } from "zod";

import { AnamneseSchema } from "../anamnese/schema";
import { OpenFinanceSchema } from "../open-finance/schema";

export const PainelClienteSchema = z.object({
  anamnese: AnamneseSchema,
  conexoes: OpenFinanceSchema.array(),
});

export type PainelCliente = z.infer<typeof PainelClienteSchema>;
