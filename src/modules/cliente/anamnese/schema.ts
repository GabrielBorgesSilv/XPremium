import { z } from "zod";

/** DTOs de entrada e saída: questionário de perfil do investidor (suitability). */
export const AnamneseSchema = z.object({});

export type Anamnese = z.infer<typeof AnamneseSchema>;
