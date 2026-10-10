/**
 * Módulo de suporte: identidade, perfis (cliente/assessor) e permissões.
 *
 * Interface pública do módulo: src/app e outros módulos só importam daqui.
 */
export { listarAuth } from "./auth/service";
export type { Auth } from "./auth/schema";
export { listarPerfis } from "./perfis/service";
export type { Perfis } from "./perfis/schema";

// Só para desenvolvimento: chamado por scripts/db/seed.ts.
export { semearUsuarios } from "./seed";
