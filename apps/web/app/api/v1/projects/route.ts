import { assertValidInitialIdea, type SongProjectBrief } from "@musegrid/core";
import { NextResponse } from "next/server";
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
    return NextResponse.json({ error: "请先登录后再访问项目。" }, { status: 401 });
  }

  const projects = await listProjects(user.id);
  return NextResponse.json({
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
    return NextResponse.json({ error: "请先登录后再创建项目。" }, { status: 401 });
  }

  let body: ProjectRequest;
  try {
    body = (await request.json()) as ProjectRequest;
  } catch {
    return NextResponse.json({ error: "请求内容不是有效的 JSON。" }, { status: 400 });
  }

  const brief = normalizeProjectRequest(body);

  if (!brief.title || !brief.language || !brief.genre || !brief.mood || !brief.intendedUse) {
    return NextResponse.json({ error: "请补全项目名称、语言、曲风、情绪和用途。" }, { status: 400 });
  }

  try {
    assertValidInitialIdea(brief.initialIdea);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "歌曲灵感不符合要求。" },
      { status: 400 },
    );
  }

  const project = await createProject(user.id, brief);

  return NextResponse.json({
    project: {
      id: project.id,
      title: project.title,
      status: project.status,
    },
  });
}
