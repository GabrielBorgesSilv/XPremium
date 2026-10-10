import { z } from "zod";

/** DTOs de entrada e saída: carteira de clientes do assessor. */
export const ClientesSchema = z.object({});

export type Clientes = z.infer<typeof ClientesSchema>;
