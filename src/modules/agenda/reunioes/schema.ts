import { z } from "zod";

/** DTOs de entrada e saída: reuniões entre assessor e cliente. */

export const CATEGORIAS_MOTIVO = {
  REVISAO_CARTEIRA: "Revisão de carteira",
  NOVO_INVESTIMENTO: "Novo investimento",
  RESGATE: "Resgate ou liquidez",
  PLANEJAMENTO: "Planejamento e objetivos",
  DUVIDAS: "Dúvidas",
  OUTRO: "Outro",
} as const;
export type CategoriaMotivo = keyof typeof CATEGORIAS_MOTIVO;

export const MODALIDADES = { ONLINE: "Online", PRESENCIAL: "Presencial" } as const;
export type Modalidade = keyof typeof MODALIDADES;

export const DURACOES_MIN = [30, 45, 60, 90, 120] as const;

/** PENDENTE bloqueia o horário até alguém responder; RECUSADA e CANCELADA liberam. */
export const STATUS_REUNIAO = ["PENDENTE", "ACEITA", "RECUSADA", "CANCELADA"] as const;
export type StatusReuniao = (typeof STATUS_REUNIAO)[number];

/** Quem convocou. O convidado é sempre o outro lado. */
export type Lado = "ASSESSOR" | "CLIENTE";

export type Reuniao = {
  id: string;
  assessorId: string;
  clienteId: string;
  convocante: Lado;
  /** Instantes em ISO UTC (ex.: "2026-10-15T17:30:00.000Z"). */
  inicio: string;
  fim: string;
  motivoCategoria: CategoriaMotivo;
  motivoDescricao: string;
  modalidade: Modalidade;
  local: string | null;
  status: StatusReuniao;
  /** Motivo opcional de quem recusou ou cancelou. */
  justificativa: string | null;
  respondidaEm: string | null;
  criadoEm: string;
};

const vazioParaUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

/** Formulário de nova reunião (vem do navegador: tudo é validado). Data e hora no horário de Brasília. */
export const NovaReuniaoSchema = z
  .object({
    participanteId: z.string().min(1, "Escolha com quem é a reunião."),
    data: z.iso.date({ error: "Informe uma data válida." }),
    hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horário válido."),
    duracaoMin: z.coerce
      .number()
      .refine((v) => (DURACOES_MIN as readonly number[]).includes(v), "Escolha uma duração da lista."),
    modalidade: z.enum(["ONLINE", "PRESENCIAL"], { error: "Escolha online ou presencial." }),
    local: z.preprocess(vazioParaUndefined, z.string().trim().max(200, "Local muito longo.").optional()),
    motivoCategoria: z.enum(Object.keys(CATEGORIAS_MOTIVO) as [CategoriaMotivo, ...CategoriaMotivo[]], {
      error: "Escolha o motivo da reunião.",
    }),
    motivoDescricao: z
      .string()
      .trim()
      .min(10, "Explique o motivo da reunião (mínimo de 10 caracteres).")
      .max(500, "Descrição muito longa (máximo de 500 caracteres)."),
  })
  .superRefine((v, ctx) => {
    if (v.modalidade === "PRESENCIAL" && (!v.local || v.local.length < 3)) {
      ctx.addIssue({ code: "custom", path: ["local"], message: "Informe o local da reunião presencial." });
    }
  });
export type NovaReuniao = z.infer<typeof NovaReuniaoSchema>;

/** Motivo opcional ao recusar ou cancelar. */
export const JustificativaSchema = z.preprocess(
  vazioParaUndefined,
  z.string().trim().max(300, "Motivo muito longo (máximo de 300 caracteres).").optional(),
);
