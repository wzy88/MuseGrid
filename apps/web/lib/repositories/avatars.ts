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

  if ((!direction && avatars.length > 0) || (direction && avatars.length >= 3)) {
    return avatars;
  }

  try {
    await seedCreatorAvatars(prisma);
  } catch {
    return avatars;
  }

  return prisma.creatorAvatar.findMany({
    where: {
      status: "seeded",
      ...(direction ? { capabilityDirection: direction } : {}),
    },
    orderBy: [{ level: "desc" }, { simulatedCallCount: "desc" }],
  });
}
