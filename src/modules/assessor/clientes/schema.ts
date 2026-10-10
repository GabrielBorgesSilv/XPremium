import { z } from "zod";

/** DTOs de entrada e saída: carteira de clientes do assessor. */

/** Cliente vinculado a um assessor. O id é o da conta do usuário (M1). */
export type ClienteVinculado = { id: string; nome: string };

/** Filtros da lista, vindos da URL (?busca=ana&atencao=1). Valor inválido vira "sem filtro". */
export const FiltrosClientesSchema = z.object({
  busca: z.string().trim().max(80).optional().catch(undefined),
  atencao: z.literal("1").optional().catch(undefined),
});
export type FiltrosClientes = z.infer<typeof FiltrosClientesSchema>;
