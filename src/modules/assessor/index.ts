/**
 * Módulo Assessor: gestão e relacionamento com clientes.
 *
 * Interface pública do módulo: src/app e outros módulos só importam daqui.
 */
export { listarClientes } from "./clientes/service";
export type { Clientes } from "./clientes/schema";
export {
  obterVisaoAtivos,
  type DetalheAtivo,
  type ExposicaoFGCCliente,
  type LinhaAtivo,
  type ResumoFGC,
  type NoticiaDoAtivo,
  type VisaoAtivos,
} from "./ativos/service";
export { clientesDoAtivo, LIMITE_CONCENTRACAO_PADRAO, resumirCarteiras } from "./ativos/calculos";
export { filtrarImpactos, resumirAlertas, type AlertaAtivo } from "./ativos/impactos";
export {
  avaliarFGC,
  FRACAO_ALERTA_FGC,
  LIMITE_FGC,
  type ExposicaoFGC,
  type SituacaoFGC,
} from "./ativos/fgc";
export { calcularVariacao, gerarSerieSimulada, type Variacao } from "./ativos/serie";
export type {
  Ativo,
  Categoria,
  ClienteDoAtivo,
  Cotacao,
  FiltrosVisao,
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
