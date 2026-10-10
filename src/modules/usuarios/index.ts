/**
 * Módulo de suporte: identidade, perfis (cliente/assessor) e permissões.
 *
 * Interface pública do módulo: src/app e outros módulos só importam daqui.
 */
export { entrar, sair, obterUsuarioAtual, exigirPapel, autorizarApi } from "./auth/service";
export { LoginSchema } from "./auth/schema";
export type { Login } from "./auth/schema";
export { buscarUsuarioPorId } from "./perfis/service";
export { papelAtende, paginaInicialDoPapel } from "./perfis/permissoes";
export { PapelSchema } from "./perfis/schema";
export type { Papel, Usuario } from "./perfis/schema";

// Só para desenvolvimento: chamado por scripts/db/seed.ts.
export { semearUsuarios } from "./seed";
