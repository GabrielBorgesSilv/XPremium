import { z } from "zod";

/** DTOs de entrada e saída: carteira de clientes do assessor. */

/**
 * Espelho TEMPORÁRIO dos valores do cadastro do M1 (usuarios/cadastro/schema.ts, ainda fora da develop).
 * Quando o M1 entrar, trocar por import de "@/modules/usuarios" (ESTADOS_CIVIS, FAIXAS_RENDA, DadosPessoais).
 */
export const ESTADOS_CIVIS = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  "uniao-estavel": "União estável",
  divorciado: "Divorciado(a)",
} as const;
export const FAIXAS_RENDA = {
  "ate-5k": "Até R$ 5 mil",
  "5k-15k": "R$ 5 mil – R$ 15 mil",
  "15k-50k": "R$ 15 mil – R$ 50 mil",
  "acima-50k": "Acima de R$ 50 mil",
} as const;
export type EstadoCivil = keyof typeof ESTADOS_CIVIS;
export type FaixaRenda = keyof typeof FAIXAS_RENDA;

/** Cliente vinculado a um assessor. O id é o mesmo da conta do usuário (M1). */
export type ClienteVinculado = { id: string; nome: string };

/** Parte do cadastro que o assessor vê no dash (sem contato: só o útil para a análise). */
export type CadastroCliente = {
  nascimento: string;
  profissao: string;
  estadoCivil: EstadoCivil;
  rendaFaixa: FaixaRenda;
};

/** Filtros da lista, vindos da URL (?busca=ana&atencao=1). Valor inválido vira "sem filtro". */
export const FiltrosClientesSchema = z.object({
  busca: z.string().trim().max(80).optional().catch(undefined),
  atencao: z.literal("1").optional().catch(undefined),
});
export type FiltrosClientes = z.infer<typeof FiltrosClientesSchema>;
