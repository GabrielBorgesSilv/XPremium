import { listarNoticias } from "@/modules/integracoes";

export async function GET() {
  const result = await listarNoticias();
  return Response.json(result, { headers: { "Cache-Control": "private, max-age=30" } });
}
