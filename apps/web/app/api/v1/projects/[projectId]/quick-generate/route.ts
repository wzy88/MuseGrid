import { apiError, apiSuccess } from "../../../../../../lib/api/response";
import { getApiUser } from "../../../../../../lib/auth/session";
import { generateProjectDemo } from "../../../../../../lib/server/demo-generator";
import { runQuickProduction } from "../../../../../../lib/server/step-generator";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) {
    return apiError(401, "UNAUTHORIZED", "请先登录后再使用极速生成。");
  }

  const { projectId } = await context.params;
  const production = await runQuickProduction(user.id, projectId);
  if (!production.ok) {
    return apiError(production.status, "CONFLICT", production.error);
  }

  const demo = await generateProjectDemo(user.id, projectId);
  if (!demo.ok) {
    return apiError(demo.status, demo.code, demo.error);
  }

  return apiSuccess({
    projectId,
    workUrl: `/works/${projectId}`,
    production,
    generation: demo.generation,
    audioAsset: demo.audioAsset,
  });
}
