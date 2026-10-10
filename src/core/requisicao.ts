/**
 * Cabeçalho interno com o caminho da requisição (ex.: "/assessor/clientes?aba=1").
 * Definido sempre pelo src/proxy.ts (sobrescreve o que vier do navegador), porque
 * layouts e páginas do Next não recebem o próprio caminho.
 */
export const CABECALHO_CAMINHO = "x-hub-caminho";
