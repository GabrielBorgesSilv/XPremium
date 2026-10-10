import "server-only";

import type { Aleatorio } from "@/shared/aleatorio";

/**
 * Dados sintéticos do módulo cliente para desenvolvimento e demo (npm run db:seed).
 * Só dados fictícios (LGPD). Use `aleatorio` em vez de Math.random para que o
 * banco gerado seja igual para toda a equipe. Assume tabelas vazias.
 */
export async function semearCliente(aleatorio: Aleatorio): Promise<void> {
  // TODO: inserir registros nas tabelas cliente_* com db (de @/core/db).
  void aleatorio;
}
