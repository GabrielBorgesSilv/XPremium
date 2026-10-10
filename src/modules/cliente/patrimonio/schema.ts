import { z } from "zod";

export const CategoriaPatrimonioSchema = z.enum([
  "renda_fixa",
  "renda_variavel",
  "fundos",
  "imoveis",
  "outros",
]);

/** DTOs de entrada e saída: visão consolidada de ativos e investimentos do cliente. */
export const PatrimonioSchema = z.object({
  id: z.number().int().positive().optional(),
  usuarioId: z.string().min(1),
  instituicao: z.string().min(1),
  categoria: CategoriaPatrimonioSchema,
  valorAtual: z.number().nonnegative(),
  moeda: z.string().min(3).max(3).default("BRL"),
  atualizadoEm: z.string().min(1).optional(),
});

export type Patrimonio = z.infer<typeof PatrimonioSchema>;
