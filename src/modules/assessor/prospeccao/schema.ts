import { z } from "zod";

/** DTOs de entrada e saída: prospecção com benchmark de perfis de clientes. */
export const ProspeccaoSchema = z.object({});

export type Prospeccao = z.infer<typeof ProspeccaoSchema>;
