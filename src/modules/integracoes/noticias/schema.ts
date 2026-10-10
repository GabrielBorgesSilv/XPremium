import { z } from "zod";

export const DirecaoImpactoSchema = z.enum(["positivo", "negativo", "misto", "incerto"]);
export const CriticidadeSchema = z.enum(["P1", "P2", "P3", "informativo"]);
export const TipoEventoSchema = z.enum(["empresa", "setor", "macro", "regulatorio", "politica_fiscal", "politica_monetaria", "corporativo", "geopolitico", "outro"]);
export const HorizonteSchema = z.enum(["imediato", "curto_prazo", "medio_prazo", "longo_prazo", "incerto"]);
export const StatusAlertaSchema = z.enum(["aberto", "revisado", "acompanhamento", "descartado", "resolvido"]);

export const NoticiaSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  descricao: z.string().nullable(),
  url: z.string().url(),
  fonte: z.string(),
  publicadoEm: z.string().datetime({ offset: true }).nullable(),
  coletadoEm: z.string().datetime({ offset: true }),
  ticker: z.string().nullable(),
  resumo: z.string().nullable(),
  resumoGerado: z.boolean(),
  origemAnalise: z.enum(["openai", "heuristica", "nenhuma"]),
});
export type Noticia = z.infer<typeof NoticiaSchema>;

export const AlertaSchema = z.object({
  id: z.string(),
  noticiaId: z.string(),
  ticker: z.string(),
  criticidade: CriticidadeSchema,
  tipoEvento: TipoEventoSchema,
  horizonte: HorizonteSchema,
  direcao: DirecaoImpactoSchema,
  justificativa: z.string(),
  evidencia: z.string(),
  confianca: z.number().min(0).max(1),
  resumo: z.string(),
  titulo: z.string(),
  url: z.string().url(),
  fonte: z.string(),
  publicadoEm: z.string().datetime({ offset: true }).nullable(),
  criadoEm: z.string().datetime({ offset: true }),
  status: StatusAlertaSchema,
  emailStatus: z.enum(["nao_aplicavel", "nao_configurado", "pendente", "enviado", "falhou"]),
  escopo: z.literal("instrumento_monitorado"),
});
export type Alerta = z.infer<typeof AlertaSchema>;
export const ResumoAlertasSchema = z.object({ items: z.array(AlertaSchema), status: z.enum(["available", "unavailable"]) });
export type ResumoAlertas = z.infer<typeof ResumoAlertasSchema>;

export const ResumoNoticiasSchema = z.object({
  items: z.array(NoticiaSchema).max(12),
  updatedAt: z.string().datetime({ offset: true }).nullable(),
  status: z.enum(["fresh", "stale", "unavailable"]),
});
export type ResumoNoticias = z.infer<typeof ResumoNoticiasSchema>;

export const AnaliseIAZodSchema = z.object({
  resumo: z.string().min(1).max(600),
  direcao: DirecaoImpactoSchema,
  ticker: z.string().nullable(),
  criticidadeSugerida: CriticidadeSchema,
  tipoEvento: TipoEventoSchema,
  horizonte: HorizonteSchema,
  justificativa: z.string().min(1).max(500),
  evidencia: z.string().min(1).max(400),
  confianca: z.number().min(0).max(1),
});
export type AnaliseIA = z.infer<typeof AnaliseIAZodSchema>;

export const AtualizarStatusAlertaSchema = z.object({
  status: StatusAlertaSchema,
}).strict();
