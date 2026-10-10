import { env } from "@/core/env";
import { atualizarStatusAlerta } from "@/modules/integracoes";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!env.NEWS_INGEST_SECRET || request.headers.get("authorization") !== `Bearer ${env.NEWS_INGEST_SECRET}`) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const updated = await atualizarStatusAlerta(id, body);
  return updated ? Response.json({ status: "updated" }) : Response.json({ error: "Alerta ou status inválido" }, { status: 400 });
}
