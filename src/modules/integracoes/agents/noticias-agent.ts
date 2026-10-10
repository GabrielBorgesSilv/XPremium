import "server-only";

/** Agent de notícias: relaciona notícias de mercado a ativos/clientes para embasar o assessor. */
export async function executarAgentNoticias(ativos: string[]): Promise<void> {
  throw new Error(`Não implementado (${ativos.length} ativos)`);
}
