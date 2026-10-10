import { z } from "zod";

/** DTOs de entrada e saída: consentimento e conexão com outras instituições via Open Finance. */
export const OpenFinanceSchema = z.object({});

export type OpenFinance = z.infer<typeof OpenFinanceSchema>;
