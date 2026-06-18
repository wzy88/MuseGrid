import { apiError, apiSuccess } from "../../../../../../../../lib/api/response";
import { getApiUser } from "../../../../../../../../lib/auth/session";
import { selectProjectStepAvatar } from "../../../../../../../../lib/repositories/projects";

type RouteContext = {
  params: Promise<{
    projectId: string;
    stepType: string;
  }>;
};

type AvatarSelectionRequest = {
  selectedAvatarId?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) {
    return apiError(401, "UNAUTHORIZED", "请先登录后再选择创作人分身。");
  }

  let body: AvatarSelectionRequest;
  try {
    body = (await request.json()) as AvatarSelectionRequest;
  } catch {
    return apiError(400, "BAD_REQUEST", "请求内容不是有效的 JSON。");
  }

  if (!body.selectedAvatarId?.trim()) {
    return apiError(400, "BAD_REQUEST", "请先选择创作人分身。");
  }

  const { projectId, stepType } = await context.params;
  const result = await selectProjectStepAvatar(projectId, user.id, stepType, body.selectedAvatarId.trim());
  if (!result.ok) {
    return apiError(result.status, result.status === 404 ? "NOT_FOUND" : result.status === 409 ? "CONFLICT" : "BAD_REQUEST", result.error);
  }

  return apiSuccess({ step: result.step });
}
