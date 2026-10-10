import "server-only";

import type { ResumoCarteiras } from "./schema";

/** Regras de negócio: investimentos dos clientes do assessor, vistos por ativo. */
export async function listarAtivos(): Promise<ResumoCarteiras | null> {
  // TODO: buscar clientes vinculados (M3), posições e cotações e chamar resumirCarteiras.
  return null;
}
