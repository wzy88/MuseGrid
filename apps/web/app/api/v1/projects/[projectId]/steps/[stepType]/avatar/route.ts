import { NextResponse } from "next/server";
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
    return NextResponse.json({ error: "请先登录后再选择创作人分身。" }, { status: 401 });
  }

  let body: AvatarSelectionRequest;
  try {
    body = (await request.json()) as AvatarSelectionRequest;
  } catch {
    return NextResponse.json({ error: "请求内容不是有效的 JSON。" }, { status: 400 });
  }

  if (!body.selectedAvatarId?.trim()) {
    return NextResponse.json({ error: "请先选择创作人分身。" }, { status: 400 });
  }

  const { projectId, stepType } = await context.params;
  const result = await selectProjectStepAvatar(projectId, user.id, stepType, body.selectedAvatarId.trim());
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ step: result.step });
}
