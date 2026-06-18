import { PRODUCTION_STEPS, type SongProjectBrief } from "@musegrid/core";
import { prisma } from "../db/prisma";
import { isStepUnlocked } from "../studio/step-progression";

export async function createProject(userId: string, brief: SongProjectBrief) {
  return prisma.project.create({
    data: {
      userId,
      title: brief.title,
      initialIdea: brief.initialIdea,
      language: brief.language,
      genre: brief.genre,
      mood: brief.mood,
      intendedUse: brief.intendedUse,
      steps: {
        create: PRODUCTION_STEPS.map((stepType) => ({
          stepType,
          inputPayload: {},
          status: "draft",
        })),
      },
    },
    include: { steps: true },
  });
}

export async function getProject(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { steps: true, contributions: true, generations: true },
  });
}

export async function listProjectGenerations(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });

  if (!project) {
    return [];
  }

  return prisma.generationJob.findMany({
    where: { projectId, userId },
    orderBy: { createdAt: "asc" },
    include: {
      audioAsset: true,
    },
  });
}

export async function listProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { generations: true },
  });
}

export async function listWorks(userId: string) {
  return prisma.project.findMany({
    where: {
      userId,
      generations: {
        some: {},
      },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      generations: {
        orderBy: { createdAt: "desc" },
        include: {
          audioAsset: true,
        },
      },
    },
  });
}

export async function getWorkDetail(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    include: {
      steps: {
        orderBy: { createdAt: "asc" },
      },
      contributions: {
        orderBy: { createdAt: "asc" },
      },
      generations: {
        orderBy: { createdAt: "asc" },
        include: {
          audioAsset: true,
        },
      },
    },
  });
}

export async function selectProjectStepAvatar(
  projectId: string,
  userId: string,
  stepType: string,
  avatarId: string,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { steps: true },
  });

  if (!project) {
    return { ok: false as const, status: 404, error: "项目不存在或无权访问。" };
  }

  const step = project.steps.find((item) => item.stepType === stepType);
  if (!step) {
    return { ok: false as const, status: 404, error: "生产步骤不存在。" };
  }

  const normalizedSteps = project.steps
    .filter((item): item is typeof item & { stepType: typeof PRODUCTION_STEPS[number] } =>
      (PRODUCTION_STEPS as readonly string[]).includes(item.stepType),
    )
    .map((item) => ({
      stepType: item.stepType,
      status: item.status,
    }));

  if (!isStepUnlocked(normalizedSteps, stepType as (typeof PRODUCTION_STEPS)[number])) {
    return { ok: false as const, status: 409, error: "请先完成并确认前一步，再选择当前步骤的创作人分身。" };
  }

  const avatar = await prisma.creatorAvatar.findFirst({
    where: {
      id: avatarId,
      capabilityDirection: stepType,
      OR: [{ ownerUserId: null }, { ownerUserId: userId }],
      status: {
        in: ["seeded", "creator"],
      },
    },
  });

  if (!avatar) {
    return { ok: false as const, status: 400, error: "所选创作人分身不可用于当前步骤。" };
  }

  const updatedStep = await prisma.productionStep.update({
    where: { id: step.id },
    data: { selectedAvatarId: avatar.id },
  });

  return { ok: true as const, step: updatedStep };
}
