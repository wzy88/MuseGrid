import { NextResponse } from "next/server";
import { getApiUser } from "../../../../../../lib/auth/session";
import { prisma } from "../../../../../../lib/db/prisma";
import { getSampleAudioAsset, persistHexAudioAsMp3 } from "../../../../../../lib/minimax/audio-storage";
import { generateMusicDemo } from "../../../../../../lib/minimax/client";
import { buildMiniMaxInputForProject } from "../../../../../../lib/server/step-generator";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

function isSampleProvider(traceId?: string) {
  return traceId === "sample-fallback";
}

export async function POST(_request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录后再生成 Demo。" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
    include: { steps: true },
  });

  if (!project) {
    return NextResponse.json({ error: "项目不存在或无权访问。" }, { status: 404 });
  }

  const productionStep = project.steps.find((step) => step.stepType === "production");
  if (!productionStep || productionStep.status !== "completed") {
    return NextResponse.json({ error: "请先确认制作步骤，再生成可播放 Demo。" }, { status: 409 });
  }

  const input = await buildMiniMaxInputForProject(user.id, projectId);
  if (!input?.lyrics || !input.prompt) {
    return NextResponse.json({ error: "当前项目缺少生成 Demo 所需的已确认内容。" }, { status: 400 });
  }

  const model = process.env.MINIMAX_MODEL ?? "music-2.6-free";
  let generationJobId: string | null = null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const freshUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { quotaBalance: true },
      });
      if (!freshUser) {
        throw new Error("当前用户不存在。");
      }
      if (freshUser.quotaBalance <= 0) {
        return { error: "可用生成次数不足，请稍后再试。", status: 402 } as const;
      }

      const job = await tx.generationJob.create({
        data: {
          projectId,
          userId: user.id,
          provider: process.env.MINIMAX_API_KEY ? "minimax" : "sample",
          model,
          lyrics: input.lyrics,
          prompt: input.prompt,
          status: "generating",
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { quotaBalance: { decrement: 1 } },
      });

      return { job } as const;
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    generationJobId = result.job.id;

    const generated = await generateMusicDemo(input);
    const useSample = isSampleProvider(generated.providerTraceId);
    const storageAsset = useSample
      ? getSampleAudioAsset()
      : generated.audioUrl.startsWith("http")
        ? {
            // MiniMax URL outputs expire after 24 hours in production and must be persisted elsewhere.
            storageUrl: generated.audioUrl,
            format: "mp3",
          }
        : await persistHexAudioAsMp3(projectId, generated.audioUrl);

    const completed = await prisma.$transaction(async (tx) => {
      const audioAsset = await tx.audioAsset.create({
        data: {
          projectId,
          storageUrl: storageAsset.storageUrl,
          duration: generated.durationMs,
          format: storageAsset.format,
        },
      });

      const job = await tx.generationJob.update({
        where: { id: result.job.id },
        data: {
          status: "completed",
          provider: useSample ? "sample" : result.job.provider,
          providerRequestId: generated.providerTraceId,
          audioAssetId: audioAsset.id,
        },
      });

      return { audioAsset, job };
    });

    return NextResponse.json({
      generation: {
        id: completed.job.id,
        status: completed.job.status,
        provider: completed.job.provider,
        model: completed.job.model,
        createdAt: completed.job.createdAt.toISOString(),
      },
      audioAsset: {
        id: completed.audioAsset.id,
        storageUrl: completed.audioAsset.storageUrl,
        duration: completed.audioAsset.duration,
        format: completed.audioAsset.format,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Demo 生成失败，请稍后重试。";
    if (generationJobId) {
      await prisma.generationJob.update({
        where: { id: generationJobId },
        data: {
          status: "failed",
          errorMessage: message,
        },
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
