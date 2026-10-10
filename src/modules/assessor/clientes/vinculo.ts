/**
 * Vínculo assessor ↔ cliente: o ÚNICO lugar que decide quais clientes um assessor pode ver.
 * Hoje lê os dados de demonstração; quando M1/M3 tiverem contas e vínculo no banco, troca só aqui.
 * Não importa nada de ativos (evita ciclo: ativos usa o vínculo e o dash do cliente usa ativos).
 */
import { ASSESSOR_DEMO_ID, CLIENTES_DEMO } from "./demo";
import type { CadastroCliente, ClienteVinculado } from "./schema";

/** Assessor da sessão. TODO(M1): trocar por obterUsuarioAtual() de @/modules/usuarios. */
export function assessorAtual(): string {
  return ASSESSOR_DEMO_ID;
}

/** Clientes vinculados ao assessor, em ordem alfabética. */
export function listarClientesDoAssessor(assessorId: string): ClienteVinculado[] {
  return CLIENTES_DEMO.filter((c) => c.assessorId === assessorId)
    .map(({ id, nome }) => ({ id, nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** O cliente, se for vinculado a este assessor; senão null (a tela trata como "não encontrado"). */
export function buscarClienteDoAssessor(
  assessorId: string,
  clienteId: string,
): (ClienteVinculado & { cadastro: CadastroCliente }) | null {
  const cliente = CLIENTES_DEMO.find((c) => c.id === clienteId && c.assessorId === assessorId);
  return cliente ? { id: cliente.id, nome: cliente.nome, cadastro: cliente.cadastro } : null;
}
