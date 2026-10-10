/**
 * Módulo de suporte: integrações externas e agents de IA.
 *
 * Interface pública do módulo: src/app e outros módulos só importam daqui.
 */
export { listarBancos } from "./bancos/service";
export type { Bancos } from "./bancos/schema";
export { listarNoticias } from "./noticias/service";
export type { Noticias } from "./noticias/schema";
export { executarAgentBancario } from "./agents/banco-agent";
export { executarAgentNoticias } from "./agents/noticias-agent";
