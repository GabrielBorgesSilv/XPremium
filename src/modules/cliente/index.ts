/**
 * Módulo Cliente: o investidor administra seus investimentos.
 *
 * Interface pública do módulo: src/app e outros módulos só importam daqui.
 */
export { listarAnamnese } from "./anamnese/service";
export type { Anamnese } from "./anamnese/schema";
export { listarOpenFinance } from "./open-finance/service";
export type { OpenFinance } from "./open-finance/schema";
export { listarPatrimonio } from "./patrimonio/service";
export type { Patrimonio } from "./patrimonio/schema";
export { obterPainelCliente } from "./painel/service";
export type { PainelCliente } from "./painel/schema";
