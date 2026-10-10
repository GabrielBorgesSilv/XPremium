import { listarAlertas } from "@/modules/integracoes";

export async function GET() {
  const alerts = await listarAlertas();
  return Response.json({ ...alerts, scope: "instrument_monitoring_only" }, { headers: { "Cache-Control": "private, no-store" } });
}
