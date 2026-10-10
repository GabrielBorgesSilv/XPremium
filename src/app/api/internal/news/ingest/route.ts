import { env } from "@/core/env";
import { atualizarNoticias } from "@/modules/integracoes";

export async function POST(request: Request) {
  if (!env.NEWS_INGEST_SECRET || request.headers.get("authorization") !== `Bearer ${env.NEWS_INGEST_SECRET}`) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const result = await atualizarNoticias();
  return Response.json({ ...result, modo: "demonstracao" });
}
