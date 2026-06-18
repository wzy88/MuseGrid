import { NextResponse } from "next/server";
import { getApiUser } from "../../../../../../../../lib/auth/session";
import { generateStepOutput } from "../../../../../../../../lib/server/step-generator";

type RouteContext = {
  params: Promise<{
    projectId: string;
    stepType: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录后再生成步骤内容。" }, { status: 401 });
  }

  const { projectId, stepType } = await context.params;
  const result = await generateStepOutput(user.id, projectId, stepType);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    step: result.step,
  });
}
