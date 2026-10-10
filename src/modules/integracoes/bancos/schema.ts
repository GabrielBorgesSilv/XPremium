import { z } from "zod";

/** DTOs de entrada e saída: dados bancários via Open Finance. */
export const BancosSchema = z.object({});

export type Bancos = z.infer<typeof BancosSchema>;
