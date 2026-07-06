import { apiError, apiSuccess } from "../../../../../../../../lib/api/response";
import { getApiUser } from "../../../../../../../../lib/auth/session";
import { generateSelfStepOutput, generateStepOutput, reviseStepOutput, saveEditedStepOutput } from "../../../../../../../../lib/server/step-generator";

type RouteContext = {
  params: Promise<{
    projectId: string;
    stepType: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) {
    return apiError(401, "UNAUTHORIZED", "请先登录后再生成步骤内容。");
  }

  const { projectId, stepType } = await context.params;
  const body = await request.json().catch(() => ({})) as { mode?: string; revisionNote?: string; text?: string };
  const result = body.mode === "self"
    ? await generateSelfStepOutput(user.id, projectId, stepType, body.text ?? "")
    : body.mode === "edit"
      ? await saveEditedStepOutput(user.id, projectId, stepType, body.text ?? "")
      : body.mode === "revise"
        ? await reviseStepOutput(user.id, projectId, stepType, body.revisionNote ?? "", body.text ?? "")
      : await generateStepOutput(user.id, projectId, stepType);
  if (!result.ok) {
    return apiError(result.status, result.status === 404 ? "NOT_FOUND" : result.status === 409 ? "CONFLICT" : "BAD_REQUEST", result.error);
  }

  return apiSuccess({
    step: result.step,
  });
}
