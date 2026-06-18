import { assertValidInitialIdea, type SongProjectBrief } from "@musegrid/core";
import { apiError, apiSuccess } from "../../../../lib/api/response";
import { getApiUser } from "../../../../lib/auth/session";
import { createProject, listProjects } from "../../../../lib/repositories/projects";

type ProjectRequest = Partial<SongProjectBrief>;

function normalizeProjectRequest(body: ProjectRequest): SongProjectBrief {
  return {
    title: body.title?.trim() ?? "",
    initialIdea: body.initialIdea?.trim() ?? "",
    language: body.language?.trim() ?? "",
    genre: body.genre?.trim() ?? "",
    mood: body.mood?.trim() ?? "",
    intendedUse: body.intendedUse?.trim() ?? "",
  };
}

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return apiError(401, "UNAUTHORIZED", "请先登录后再访问项目。");
  }

  const projects = await listProjects(user.id);
  return apiSuccess({
    projects: projects.map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return apiError(401, "UNAUTHORIZED", "请先登录后再创建项目。");
  }

  let body: ProjectRequest;
  try {
    body = (await request.json()) as ProjectRequest;
  } catch {
    return apiError(400, "BAD_REQUEST", "请求内容不是有效的 JSON。");
  }

  const brief = normalizeProjectRequest(body);

  if (!brief.title || !brief.language || !brief.genre || !brief.mood || !brief.intendedUse) {
    return apiError(400, "BAD_REQUEST", "请补全项目名称、语言、曲风、情绪和用途。");
  }

  try {
    assertValidInitialIdea(brief.initialIdea);
  } catch (error) {
    return apiError(400, "BAD_REQUEST", error instanceof Error ? error.message : "歌曲灵感不符合要求。");
  }

  const project = await createProject(user.id, brief);

  return apiSuccess({
    project: {
      id: project.id,
      title: project.title,
      status: project.status,
    },
  });
}
