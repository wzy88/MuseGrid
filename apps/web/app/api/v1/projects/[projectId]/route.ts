import { apiError, apiSuccess } from "../../../../../lib/api/response";
import { getApiUser } from "../../../../../lib/auth/session";
import { getProject, listProjectGenerations } from "../../../../../lib/repositories/projects";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) {
    return apiError(401, "UNAUTHORIZED", "请先登录后再访问项目。");
  }

  const { projectId } = await context.params;
  const project = await getProject(projectId, user.id);
  if (!project) {
    return apiError(404, "NOT_FOUND", "项目不存在或无权访问。");
  }
  const generations = await listProjectGenerations(projectId, user.id);

  return apiSuccess({
    project: {
      id: project.id,
      title: project.title,
      status: project.status,
    },
    generations: generations.map((generation) => ({
      id: generation.id,
      provider: generation.provider,
      status: generation.status,
      model: generation.model,
      createdAt: generation.createdAt.toISOString(),
      audioUrl: generation.audioAsset?.storageUrl ?? null,
    })),
  });
}
