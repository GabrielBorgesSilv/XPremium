import { z } from "zod";

export const ObjetivoInvestimentoSchema = z.enum([
  "preservacao",
  "renda",
  "crescimento",
  "lucratividade",
]);

export const HorizonteInvestimentoSchema = z.enum(["curto", "medio", "longo"]);
export const PerfilInvestidorSchema = z.enum(["conservador", "moderado", "agressivo"]);
export const ToleranciaRiscoSchema = z.enum(["baixa", "media", "alta"]);

/** DTOs de entrada e saída: questionário de perfil do investidor (suitability). */
export const AnamneseSchema = z.object({
  id: z.number().int().positive().optional(),
  usuarioId: z.string().min(1),
  objetivo: ObjetivoInvestimentoSchema,
  horizonte: HorizonteInvestimentoSchema,
  perfilInvestidor: PerfilInvestidorSchema,
  toleranciaRisco: ToleranciaRiscoSchema,
  idade: z.number().int().nonnegative(),
  profissao: z.string(),
  experienciaMercado: z.string(),
  toleranciaRiscoDetalhada: z.string(),
  objetivoDetalhado: z.string(),
  alocacaoRendaFixa: z.number().min(0).max(1),
  alocacaoMultimercado: z.number().min(0).max(1),
  alocacaoFiis: z.number().min(0).max(1),
  alocacaoRendaVariavel: z.number().min(0).max(1),
  alocacaoInternacional: z.number().min(0).max(1),
  situacaoFinanceira: z.string().min(1),
  rendaMensal: z.number().nonnegative(),
  patrimonioAtual: z.number().nonnegative(),
  atualizadoEm: z.string().datetime().optional(),
});

export type Anamnese = z.infer<typeof AnamneseSchema>;
