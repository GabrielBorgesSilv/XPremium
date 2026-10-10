import { z } from "zod";

import { SenhaNovaSchema } from "../auth/schema";

/** DTOs de entrada e saída: recuperação (redefinição) de senha. */

export const VALIDADE_LINK_MINUTOS = 30;

export const PedidoRecuperacaoSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.")),
});

export const RedefinicaoSenhaSchema = z
  .object({
    token: z.string().min(1, "Link inválido."),
    senha: SenhaNovaSchema,
    confirmacaoSenha: z.string(),
  })
  .refine((d) => d.senha === d.confirmacaoSenha, {
    path: ["confirmacaoSenha"],
    message: "As senhas não conferem.",
  });

export type PedidoRecuperacao = z.infer<typeof PedidoRecuperacaoSchema>;
export type RedefinicaoSenha = z.infer<typeof RedefinicaoSenhaSchema>;
