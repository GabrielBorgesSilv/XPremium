/**
 * Módulo de suporte: agenda de reuniões entre assessor e cliente (usado pelas duas áreas).
 *
 * Interface pública do módulo: src/app e outros módulos só importam daqui.
 */
export {
  cancelarReuniao,
  contarPendentesParaMim,
  criarReuniao,
  obterAgenda,
  responderReuniao,
  type Agenda,
  type AreaAgenda,
  type Pessoa,
  type ReuniaoVista,
} from "./reunioes/service";
export type { ResultadoAcao } from "./reunioes/acoes";
export type { Situacao } from "./reunioes/regras";
export {
  CATEGORIAS_MOTIVO,
  DURACOES_MIN,
  MODALIDADES,
  type CategoriaMotivo,
  type Modalidade,
  type StatusReuniao,
} from "./reunioes/schema";
