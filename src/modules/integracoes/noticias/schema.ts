import { z } from "zod";

/** DTOs de entrada e saída: notícias de mercado via API externa. */
export const NoticiasSchema = z.object({});

export type Noticias = z.infer<typeof NoticiasSchema>;
