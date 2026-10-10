import { z } from "zod";

/** DTOs de entrada e saída: métricas de desempenho da carteira e do relacionamento. */
export const MetricasSchema = z.object({});

export type Metricas = z.infer<typeof MetricasSchema>;
