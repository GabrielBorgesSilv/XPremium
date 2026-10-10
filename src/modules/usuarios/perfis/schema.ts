import { z } from "zod";

/** DTOs de entrada e saída: perfis de usuário e permissões. */
export const PerfisSchema = z.object({});

export type Perfis = z.infer<typeof PerfisSchema>;
