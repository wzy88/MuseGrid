import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

type CreatorApplicationInput = {
  capabilityDirection: string;
  profileData: Prisma.InputJsonValue;
  workSamples: Prisma.InputJsonValue;
  questionnaireAnswers: Prisma.InputJsonValue;
};

export async function submitCreatorApplication(userId: string, input: CreatorApplicationInput) {
  return prisma.creatorApplication.create({
    data: {
      userId,
      capabilityDirection: input.capabilityDirection,
      profileData: input.profileData,
      workSamples: input.workSamples,
      questionnaireAnswers: input.questionnaireAnswers,
      status: "submitted",
    },
  });
}
