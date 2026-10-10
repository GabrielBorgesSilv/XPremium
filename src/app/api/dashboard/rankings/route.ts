import { handleRankings } from "@/features/dashboard/api/handlers";
import { productionDeps } from "@/features/dashboard/api/runtime";

export async function GET(request: Request) {
  const result = await handleRankings(request, productionDeps());
  return Response.json(result.body, { status: result.status });
}
