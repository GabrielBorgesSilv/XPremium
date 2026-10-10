import { z } from "zod";

/** DTOs de entrada e saída: autenticação e sessão. */
export const LoginSchema = z.object({
  // Regra: ignora espaços nas pontas e maiúsculas. Limpa antes de validar
  // (no Zod 4 o formato é checado antes do .trim()).
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.")),
  // Limite evita gastar o scrypt com senhas enormes.
  senha: z.string().min(1, "Informe a senha.").max(200, "A senha pode ter no máximo 200 caracteres."),
});

export type Login = z.infer<typeof LoginSchema>;
