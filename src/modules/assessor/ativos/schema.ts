import { z } from "zod";

/** DTOs de entrada e saída: ativos sob gestão do assessor. */
export const AtivosSchema = z.object({});

export type Ativos = z.infer<typeof AtivosSchema>;
