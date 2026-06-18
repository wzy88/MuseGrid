import { PRODUCTION_STEPS, type SongProjectBrief } from "@musegrid/core";
import { prisma } from "../db/prisma";

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

export async function listProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { generations: true },
  });
}
