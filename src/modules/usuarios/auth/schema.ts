import { z } from "zod";

/** DTOs de entrada e saída: autenticação e sessão. */
export const LoginSchema = z.object({
  email: z.email("Informe um e-mail válido.").trim().toLowerCase(),
  senha: z.string().min(1, "Informe a senha."),
});

export type Login = z.infer<typeof LoginSchema>;
