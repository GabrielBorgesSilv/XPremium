import "server-only";

/** Agent bancário: importa e normaliza dados das instituições do cliente (Open Finance). */
export async function executarAgentBancario(clienteId: string): Promise<void> {
  throw new Error(`Não implementado (cliente ${clienteId})`);
}
