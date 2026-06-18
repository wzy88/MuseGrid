import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

export type CreatorApplicationInput = {
  capabilityDirection: string;
  profileData: Prisma.InputJsonValue;
  workSamples: Prisma.InputJsonValue;
  questionnaireAnswers: Prisma.InputJsonValue;
};

type PendingAvatarInput = {
  avatarName: string;
  capabilityDirection: string;
  intro: string;
  styleTags: Prisma.InputJsonValue;
  sampleOutputs: Prisma.InputJsonValue;
};

function buildUniqueAvatarName(baseName: string, collisionCount: number) {
  if (collisionCount === 0) {
    return baseName;
  }

  return `${baseName} ${collisionCount + 1}`;
}

export async function submitCreatorApplicationWithAvatar(
  userId: string,
  input: CreatorApplicationInput,
  avatarInput: PendingAvatarInput,
) {
  return prisma.$transaction(async (tx) => {
    const collisions = await tx.creatorAvatar.count({
      where: {
        capabilityDirection: avatarInput.capabilityDirection,
        avatarName: {
          startsWith: avatarInput.avatarName,
        },
      },
    });

    const avatar = await tx.creatorAvatar.create({
      data: {
        ownerUserId: userId,
        avatarName: buildUniqueAvatarName(avatarInput.avatarName, collisions),
        capabilityDirection: avatarInput.capabilityDirection,
        level: 1,
        styleTags: avatarInput.styleTags,
        intro: avatarInput.intro,
        sampleOutputs: avatarInput.sampleOutputs,
        maintenanceScore: 0,
        status: "pending_review",
        simulatedCallCount: 0,
      },
    });

    const application = await tx.creatorApplication.create({
      data: {
        userId,
        capabilityDirection: input.capabilityDirection,
        profileData: input.profileData,
        workSamples: input.workSamples,
        questionnaireAnswers: input.questionnaireAnswers,
        status: "submitted",
      },
    });

    return { application, avatar };
  });
}

export async function submitCreatorApplication(userId: string, input: CreatorApplicationInput) {
  const result = await submitCreatorApplicationWithAvatar(
    userId,
    input,
    {
      avatarName: "待审核创作人分身",
      capabilityDirection: input.capabilityDirection,
      intro: "等待审核中。",
      styleTags: [],
      sampleOutputs: [],
    },
  );

  return result.application;
}
