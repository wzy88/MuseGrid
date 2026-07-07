import { apiError, apiSuccess } from "../../../../../../lib/api/response";
import { getApiUser } from "../../../../../../lib/auth/session";
import { generateProjectDemo } from "../../../../../../lib/server/demo-generator";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) {
    return apiError(401, "UNAUTHORIZED", "请先登录后再生成 Demo。");
  }

  const { projectId } = await context.params;
  const result = await generateProjectDemo(user.id, projectId);

  if (!result.ok) {
    return apiError(result.status, result.code, result.error);
  }

  return apiSuccess({
    generation: result.generation,
    audioAsset: result.audioAsset,
  });
}
