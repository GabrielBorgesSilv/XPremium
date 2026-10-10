import { z } from "zod";

import { SenhaNovaSchema } from "../auth/schema";

/** DTOs de entrada e saída: cadastro de conta e dados pessoais. */

/** Versão do termo de consentimento exibido no cadastro (muda quando o texto mudar). */
export const VERSAO_TERMO_CONSENTIMENTO = "2026-10-10";

export const TEXTO_TERMO_CONSENTIMENTO =
  "Confirmo que as informações são verdadeiras e autorizo o uso para abertura e atendimento da minha conta, conforme a política de privacidade.";

export const IDADE_MINIMA = 18;
const IDADE_MAXIMA = 130;

export const ESTADOS_CIVIS = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  "uniao-estavel": "União estável",
  separado: "Separado(a)",
  divorciado: "Divorciado(a)",
  viuvo: "Viúvo(a)",
} as const;

export const FAIXAS_RENDA = {
  "ate-5k": "Até R$ 5 mil",
  "5k-15k": "R$ 5 mil – R$ 15 mil",
  "15k-50k": "R$ 15 mil – R$ 50 mil",
  "acima-50k": "Acima de R$ 50 mil",
} as const;

export type EstadoCivil = keyof typeof ESTADOS_CIVIS;
export type FaixaRenda = keyof typeof FAIXAS_RENDA;

/** Idade completa em anos na data `hoje`. */
export function idadeEm(nascimento: Date, hoje: Date): number {
  let idade = hoje.getUTCFullYear() - nascimento.getUTCFullYear();
  const antesDoAniversario =
    hoje.getUTCMonth() < nascimento.getUTCMonth() ||
    (hoje.getUTCMonth() === nascimento.getUTCMonth() && hoje.getUTCDate() < nascimento.getUTCDate());
  if (antesDoAniversario) idade--;
  return idade;
}

/** Data AAAA-MM-DD real (rejeita 2026-02-30 etc.). */
function dataReal(valor: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const data = new Date(`${valor}T00:00:00.000Z`);
  return Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor ? null : data;
}

/** Celular brasileiro: DDD (11–99, sem zero) + 9 + 8 dígitos. Aceita máscara; guarda só dígitos. */
const CelularSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => /^[1-9]{2}9\d{8}$/.test(v), "Informe um celular com DDD, ex.: (11) 91234-5678.");

export const CadastroSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome completo.").max(120, "Nome muito longo."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, "E-mail muito longo.")
      .pipe(z.email("Informe um e-mail válido.")),
    senha: SenhaNovaSchema,
    confirmacaoSenha: z.string(),
    nascimento: z.string().superRefine((valor, ctx) => {
      const data = dataReal(valor);
      if (!data) {
        ctx.addIssue({ code: "custom", message: "Informe uma data de nascimento válida." });
        return;
      }
      const idade = idadeEm(data, new Date());
      if (data > new Date() || idade > IDADE_MAXIMA) {
        ctx.addIssue({ code: "custom", message: "Informe uma data de nascimento válida." });
      } else if (idade < IDADE_MINIMA) {
        ctx.addIssue({ code: "custom", message: `É preciso ter ${IDADE_MINIMA} anos ou mais.` });
      }
    }),
    celular: CelularSchema,
    profissao: z.string().trim().min(2, "Informe sua profissão.").max(80, "Profissão muito longa."),
    estadoCivil: z.enum(Object.keys(ESTADOS_CIVIS) as [EstadoCivil, ...EstadoCivil[]], {
      error: "Selecione o estado civil.",
    }),
    rendaFaixa: z.enum(Object.keys(FAIXAS_RENDA) as [FaixaRenda, ...FaixaRenda[]], {
      error: "Selecione a renda mensal.",
    }),
    consentimento: z.literal(true, { error: "É preciso aceitar o termo para criar a conta." }),
  })
  .refine((d) => d.senha === d.confirmacaoSenha, {
    path: ["confirmacaoSenha"],
    message: "As senhas não conferem.",
  });

export type Cadastro = z.infer<typeof CadastroSchema>;

/** Dados pessoais como os outros módulos os enxergam (ex.: perfil do cliente, M3). */
export type DadosPessoais = {
  usuarioId: string;
  nascimento: string;
  /** Pode faltar em contas carregadas do seed exportado (o celular não vai para o git). */
  celular: string | null;
  profissao: string;
  estadoCivil: EstadoCivil;
  rendaFaixa: FaixaRenda;
  consentimentoEm: string;
  consentimentoVersao: string;
};
