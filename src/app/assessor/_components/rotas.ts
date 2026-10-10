/** Endereços da área do assessor usados por mais de uma tela. Mudou a rota? Muda só aqui. */

export const hrefCliente = (clienteId: string) => `/assessor/clientes/${encodeURIComponent(clienteId)}`;

export const hrefAtivo = (ticker: string) => `/assessor/ativos?ativo=${encodeURIComponent(ticker)}`;
