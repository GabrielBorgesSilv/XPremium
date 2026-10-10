import { z } from "zod";

export const StatusOpenFinanceSchema = z.enum(["pendente", "ativo", "bloqueado"]);

/** DTOs de entrada e saída: consentimento e conexão com outras instituições via Open Finance. */
export const OpenFinanceSchema = z.object({
  id: z.number().int().positive().optional(),
  usuarioId: z.string().min(1),
  instituicao: z.string().min(1),
  tipoConta: z.string(),
  saldoDisponivel: z.number().nonnegative(),
  faturaAtual: z.number().nonnegative(),
  scoreCredito: z.number().int().nonnegative(),
  dataAutorizacao: z.string(),
  portabilidadeEmAndamento: z.boolean(),
  detalhesPortabilidade: z.string().nullable(),
  status: StatusOpenFinanceSchema,
  consentimento: z.boolean(),
  ultimoSyncEm: z.string().datetime().optional(),
});

export type OpenFinance = z.infer<typeof OpenFinanceSchema>;
