import type { CapabilityDirection } from "@musegrid/core";
import { prisma } from "../db/prisma";

export async function listSeededAvatars(direction?: CapabilityDirection) {
  return prisma.creatorAvatar.findMany({
    where: {
      status: "seeded",
      ...(direction ? { capabilityDirection: direction } : {}),
    },
    orderBy: [{ level: "desc" }, { simulatedCallCount: "desc" }],
  });
}
