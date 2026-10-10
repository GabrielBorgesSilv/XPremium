import { handleRefresh } from "@/features/dashboard/api/handlers";
import { productionDeps } from "@/features/dashboard/api/runtime";

export async function POST(request: Request) {
  const result = await handleRefresh(request, productionDeps());
  return Response.json(result.body, { status: result.status });
}
