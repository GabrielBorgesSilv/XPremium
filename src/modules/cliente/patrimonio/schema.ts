import { z } from "zod";

/** DTOs de entrada e saída: visão consolidada de ativos e investimentos do cliente. */
export const PatrimonioSchema = z.object({});

export type Patrimonio = z.infer<typeof PatrimonioSchema>;
