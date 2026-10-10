/**
 * Módulo Assessor: gestão e relacionamento com clientes.
 *
 * Interface pública do módulo: src/app e outros módulos só importam daqui.
 */
export { listarClientes } from "./clientes/service";
export type { Clientes } from "./clientes/schema";
export { listarAtivos } from "./ativos/service";
export { clientesDoAtivo, LIMITE_CONCENTRACAO_PADRAO, resumirCarteiras } from "./ativos/calculos";
export { filtrarImpactos, resumirAlertas, type AlertaAtivo } from "./ativos/impactos";
export { calcularVariacao, gerarSerieSimulada, type Variacao } from "./ativos/serie";
export type {
  Ativo,
  Categoria,
  ClienteDoAtivo,
  Cotacao,
  ImpactoNoticia,
  Moeda,
  OrigemDado,
  Periodo,
  Posicao,
  ResumoAtivo,
  ResumoCarteiras,
  SeriePrecos,
  TaxasCambio,
} from "./ativos/schema";
export { listarMetricas } from "./metricas/service";
export type { Metricas } from "./metricas/schema";
export { listarProspeccao } from "./prospeccao/service";
export type { Prospeccao } from "./prospeccao/schema";

// Só para desenvolvimento: chamado por scripts/db/seed.ts.
export { semearAssessor } from "./seed";
