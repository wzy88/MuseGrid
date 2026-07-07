import type { ApiFailureCode } from "../api/response";
import { prisma } from "../db/prisma";
import { getSampleAudioAsset, persistHexAudioAsMp3 } from "../minimax/audio-storage";
import { generateMusicDemo } from "../minimax/client";
import { buildMiniMaxInputForProject } from "./step-generator";

type DemoGenerationSuccess = {
  ok: true;
  generation: {
    id: string;
    status: string;
    provider: string;
    model: string;
    createdAt: string;
  };
  audioAsset: {
    id: string;
    storageUrl: string;
    duration: number | null;
    format: string;
  };
};

type DemoGenerationFailure = {
  ok: false;
  status: number;
  code: ApiFailureCode;
  error: string;
};

export type DemoGenerationResult = DemoGenerationSuccess | DemoGenerationFailure;

function isSampleProvider(traceId?: string) {
  return traceId === "sample-fallback";
}

export async function generateProjectDemo(userId: string, projectId: string): Promise<DemoGenerationResult> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { steps: true },
  });

  if (!project) {
    return { ok: false, status: 404, code: "NOT_FOUND", error: "项目不存在或无权访问。" };
  }

  const productionStep = project.steps.find((step) => step.stepType === "production");
  if (!productionStep || productionStep.status !== "completed") {
    return { ok: false, status: 409, code: "CONFLICT", error: "请先确认制作步骤，再生成可播放 Demo。" };
  }

  const input = await buildMiniMaxInputForProject(userId, projectId);
  if (!input?.lyrics || !input.prompt) {
    return { ok: false, status: 400, code: "BAD_REQUEST", error: "当前项目缺少生成 Demo 所需的已确认内容。" };
  }

  const model = process.env.MINIMAX_MODEL ?? "music-2.6-free";
  let generationJobId: string | null = null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const freshUser = await tx.user.findUnique({
        where: { id: userId },
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
          userId,
          provider: process.env.MINIMAX_API_KEY ? "minimax" : "sample",
          model,
          lyrics: input.lyrics,
          prompt: input.prompt,
          status: "generating",
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { quotaBalance: { decrement: 1 } },
      });

      return { job } as const;
    });

    if ("error" in result) {
      const status = result.status ?? 402;
      const message = result.error ?? "可用生成次数不足，请稍后再试。";
      return { ok: false, status, code: "PAYMENT_REQUIRED", error: message };
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

    return {
      ok: true,
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
    };
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
    return { ok: false, status: 500, code: "INTERNAL_ERROR", error: message };
  }
}
