/**
 * Módulo de suporte: identidade, perfis (cliente/assessor) e permissões.
 *
 * Interface pública do módulo: src/app e outros módulos só importam daqui.
 */
export { entrar, sair, obterUsuarioAtual, exigirPapel, autorizarApi } from "./auth/service";
export { LoginSchema } from "./auth/schema";
export { caminhoInternoSeguro, destinoAposLogin } from "./auth/redirecionamento";
export type { AreaEscolhida } from "./auth/redirecionamento";
export type { Login } from "./auth/schema";
export {
  buscarAssessorDoUsuario,
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
  vincularAssessor,
} from "./perfis/service";
export { cadastrar, buscarDadosPessoais } from "./cadastro/service";
export type { ResultadoCadastro } from "./cadastro/service";
export {
  CadastroSchema,
  ESTADOS_CIVIS,
  FAIXAS_RENDA,
  IDADE_MINIMA,
  TEXTO_TERMO_CONSENTIMENTO,
  VERSAO_TERMO_CONSENTIMENTO,
} from "./cadastro/schema";
export type { Cadastro, DadosPessoais, EstadoCivil, FaixaRenda } from "./cadastro/schema";
export { linkRecuperacaoValido, redefinirSenha, solicitarRecuperacao } from "./recuperacao/service";
export {
  PedidoRecuperacaoSchema,
  RedefinicaoSenhaSchema,
  VALIDADE_LINK_MINUTOS,
} from "./recuperacao/schema";
export { papelAtende, paginaInicialDoPapel } from "./perfis/permissoes";
export { PapelSchema } from "./perfis/schema";
export type { Papel, Usuario } from "./perfis/schema";
