import { z } from "zod";

/** DTOs de entrada e saída: autenticação e sessão. */
export const AuthSchema = z.object({});

export type Auth = z.infer<typeof AuthSchema>;
