import { z } from "zod";

/** DTOs de entrada e saída: autenticação e sessão. */
export const LoginSchema = z.object({
  // Regra: ignora espaços nas pontas e maiúsculas. Limpa antes de validar
  // (no Zod 4 o formato é checado antes do .trim()).
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.")),
  senha: z.string().min(1, "Informe a senha."),
});

export type Login = z.infer<typeof LoginSchema>;
