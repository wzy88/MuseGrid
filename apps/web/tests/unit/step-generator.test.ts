import { execFileSync } from "node:child_process";
import { describe, expect, it, beforeAll } from "vitest";
import { prisma } from "../../lib/db/prisma";
import { createProject } from "../../lib/repositories/projects";
import { seedCreatorAvatars } from "../../prisma/seed";
import { confirmStepOutput, generateStepOutput } from "../../lib/server/step-generator";

beforeAll(async () => {
  execFileSync(
    "corepack",
    ["pnpm", "prisma", "db", "push", "--skip-generate", "--accept-data-loss"],
    {
      cwd: process.cwd(),
      env: { ...process.env, RUST_LOG: "trace" },
      stdio: "pipe",
    },
  );
  await seedCreatorAvatars(prisma);
});

describe("step generator", () => {
  it("requires the user to own the project and select an avatar before generation", async () => {
    const owner = await prisma.user.create({
      data: {
        email: `step-owner-${Date.now()}@musegrid.local`,
        name: "Step Owner",
        passwordHash: "test-hash",
      },
    });
    const otherUser = await prisma.user.create({
      data: {
        email: `step-other-${Date.now()}@musegrid.local`,
        name: "Other User",
        passwordHash: "test-hash",
      },
    });
    const project = await createProject(owner.id, {
      title: "远方城市",
      initialIdea: "写一首关于离开旧城市之后慢慢释怀的歌",
      language: "中文",
      genre: "Indie Pop",
      mood: "温柔坚定",
      intendedUse: "Demo",
    });

    await expect(generateStepOutput(otherUser.id, project.id, "lyrics")).resolves.toEqual({
      ok: false,
      status: 404,
      error: "项目不存在或无权访问。",
    });

    await expect(generateStepOutput(owner.id, project.id, "lyrics")).resolves.toEqual({
      ok: false,
      status: 400,
      error: "请先选择创作人。",
    });
  });

  it("saves deterministic generated output and contribution records on confirm", async () => {
    const user = await prisma.user.create({
      data: {
        email: `step-generate-${Date.now()}@musegrid.local`,
        name: "Step Generator",
        passwordHash: "test-hash",
      },
    });
    const project = await createProject(user.id, {
      title: "晨光列车",
      initialIdea: "一首清晨坐列车去见朋友的轻快歌曲",
      language: "中文",
      genre: "City Pop",
      mood: "明亮期待",
      intendedUse: "短视频配乐",
    });
    const avatar = await prisma.creatorAvatar.findFirstOrThrow({
      where: { capabilityDirection: "lyrics", status: "seeded" },
      orderBy: [{ level: "desc" }, { simulatedCallCount: "desc" }],
    });
    await prisma.productionStep.updateMany({
      where: { projectId: project.id, stepType: "lyrics" },
      data: { selectedAvatarId: avatar.id },
    });

    const first = await generateStepOutput(user.id, project.id, "lyrics");
    const second = await generateStepOutput(user.id, project.id, "lyrics");

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) {
      throw new Error("generation unexpectedly failed");
    }
    expect(first.step.outputPayload).toEqual(second.step.outputPayload);
    expect(first.step.outputPayload).toMatchObject({
      theme: expect.any(String),
      hookOptions: expect.any(Array),
      fullLyricDraft: expect.stringContaining("[Chorus]"),
    });
    expect(first.step.status).toBe("ready");

    const confirmed = await confirmStepOutput(user.id, project.id, "lyrics");

    expect(confirmed.ok).toBe(true);
    if (!confirmed.ok) {
      throw new Error("confirm unexpectedly failed");
    }
    expect(confirmed.step.status).toBe("completed");
    expect(confirmed.contribution).toMatchObject({
      projectId: project.id,
      stepType: "lyrics",
      avatarId: avatar.id,
      avatarLevelAtTime: avatar.level,
      contributionWeight: 25,
    });
  });
});
