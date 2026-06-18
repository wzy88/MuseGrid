import type { CapabilityDirection } from "@musegrid/core";
import { seedCreatorAvatars } from "../../prisma/seed";
import { prisma } from "../db/prisma";

export async function listSeededAvatars(direction?: CapabilityDirection) {
  const avatars = await prisma.creatorAvatar.findMany({
    where: {
      status: "seeded",
      ...(direction ? { capabilityDirection: direction } : {}),
    },
    orderBy: [{ level: "desc" }, { simulatedCallCount: "desc" }],
  });

  if (avatars.length > 0) {
    return avatars;
  }

  await seedCreatorAvatars(prisma);
  return prisma.creatorAvatar.findMany({
    where: {
      status: "seeded",
      ...(direction ? { capabilityDirection: direction } : {}),
    },
    orderBy: [{ level: "desc" }, { simulatedCallCount: "desc" }],
  });
}
