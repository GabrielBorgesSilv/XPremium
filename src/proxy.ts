import { type NextRequest, NextResponse } from "next/server";

import { CABECALHO_CAMINHO } from "@/core/requisicao";

/**
 * Repassa o caminho pedido para o servidor (usado pelo exigirPapel para montar
 * /login?voltar=...). Não faz autorização: isso é do exigirPapel/autorizarApi.
 */
export function proxy(request: NextRequest) {
  const cabecalhos = new Headers(request.headers);
  cabecalhos.set(CABECALHO_CAMINHO, request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers: cabecalhos } });
}

export const config = {
  // Tudo, menos APIs e arquivos estáticos.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
