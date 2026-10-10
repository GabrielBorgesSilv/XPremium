import "server-only";

import { atualizarNoticias } from "../noticias/service";

/** Agent de notícias: analisa cenários simulados com ativos de referência da carteira demo. */
export async function executarAgentNoticias(ativos: string[]) {
  void ativos;
  // A amostra contém ativos da carteira demo e controles negativos; holdings individuais não são enviados ao modelo.
  return atualizarNoticias();
}
