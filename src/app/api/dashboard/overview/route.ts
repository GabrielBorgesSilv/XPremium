import { handleOverview } from "@/features/dashboard/api/handlers";
import { productionDeps } from "@/features/dashboard/api/runtime";

export async function GET() {
  const result = await handleOverview(productionDeps());
  return Response.json(result.body, { status: result.status });
}
