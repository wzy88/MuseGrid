import { describe, expect, it, beforeAll } from "vitest";
import { prisma } from "../../lib/db/prisma";
import { createProject } from "../../lib/repositories/projects";
import { seedCreatorAvatars } from "../../prisma/seed";
import { confirmStepOutput, generateStepOutput } from "../../lib/server/step-generator";
import { resetUnitDatabase } from "./test-db";

beforeAll(async () => {
  resetUnitDatabase();
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

  it("does not create duplicate contribution records when confirming the same step twice", async () => {
    const user = await prisma.user.create({
      data: {
        email: `step-confirm-twice-${Date.now()}@musegrid.local`,
        name: "Step Confirm Twice",
        passwordHash: "test-hash",
      },
    });
    const project = await createProject(user.id, {
      title: "夜色回信",
      initialIdea: "一首关于凌晨收到旧友消息的歌",
      language: "中文",
      genre: "R&B",
      mood: "克制怀念",
      intendedUse: "Demo",
    });
    const avatar = await prisma.creatorAvatar.findFirstOrThrow({
      where: { capabilityDirection: "lyrics", status: "seeded" },
    });
    await prisma.productionStep.updateMany({
      where: { projectId: project.id, stepType: "lyrics" },
      data: { selectedAvatarId: avatar.id },
    });

    const generated = await generateStepOutput(user.id, project.id, "lyrics");
    expect(generated.ok).toBe(true);

    const first = await confirmStepOutput(user.id, project.id, "lyrics");
    const second = await confirmStepOutput(user.id, project.id, "lyrics");

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) {
      throw new Error("confirm unexpectedly failed");
    }
    expect(second.contribution.id).toBe(first.contribution.id);

    const contributionCount = await prisma.contributionRecord.count({
      where: {
        projectId: project.id,
        stepType: "lyrics",
        avatarId: avatar.id,
      },
    });
    expect(contributionCount).toBe(1);
  });

  it("enforces one contribution per project step and avatar at the database level", async () => {
    const user = await prisma.user.create({
      data: {
        email: `step-unique-contribution-${Date.now()}@musegrid.local`,
        name: "Step Unique Contribution",
        passwordHash: "test-hash",
      },
    });
    const project = await createProject(user.id, {
      title: "重复光点",
      initialIdea: "一首验证贡献记录唯一性的歌",
      language: "中文",
      genre: "Dream Pop",
      mood: "轻盈",
      intendedUse: "Demo",
    });
    const avatar = await prisma.creatorAvatar.findFirstOrThrow({
      where: { capabilityDirection: "lyrics", status: "seeded" },
    });

    await prisma.contributionRecord.create({
      data: {
        projectId: project.id,
        stepType: "lyrics",
        avatarId: avatar.id,
        avatarLevelAtTime: avatar.level,
        outputSummary: "first contribution",
        contributionWeight: 25,
      },
    });

    await expect(
      prisma.contributionRecord.create({
        data: {
          projectId: project.id,
          stepType: "lyrics",
          avatarId: avatar.id,
          avatarLevelAtTime: avatar.level,
          outputSummary: "duplicate contribution",
          contributionWeight: 25,
        },
      }),
    ).rejects.toMatchObject({
      code: "P2002",
    });
  });

  it("rejects another user's private avatar assigned to a step", async () => {
    const owner = await prisma.user.create({
      data: {
        email: `step-private-owner-${Date.now()}@musegrid.local`,
        name: "Private Owner",
        passwordHash: "test-hash",
      },
    });
    const otherUser = await prisma.user.create({
      data: {
        email: `step-private-other-${Date.now()}@musegrid.local`,
        name: "Private Other",
        passwordHash: "test-hash",
      },
    });
    const project = await createProject(owner.id, {
      title: "隐藏频道",
      initialIdea: "一首关于无法公开播放的私密 Demo",
      language: "中文",
      genre: "Synth Pop",
      mood: "神秘",
      intendedUse: "内部试听",
    });
    const privateAvatar = await prisma.creatorAvatar.create({
      data: {
        ownerUserId: otherUser.id,
        avatarName: `私有作词人-${Date.now()}`,
        capabilityDirection: "lyrics",
        level: 3,
        styleTags: ["私有", "歌词"],
        intro: "Only visible to its owner.",
        sampleOutputs: [],
        status: "creator",
      },
    });
    await prisma.productionStep.updateMany({
      where: { projectId: project.id, stepType: "lyrics" },
      data: {
        selectedAvatarId: privateAvatar.id,
        outputPayload: { fullLyricDraft: "[Verse]\n秘密\n\n[Chorus]\n秘密" },
      },
    });

    await expect(generateStepOutput(owner.id, project.id, "lyrics")).resolves.toEqual({
      ok: false,
      status: 400,
      error: "所选创作人不可用于当前步骤。",
    });
    await expect(confirmStepOutput(owner.id, project.id, "lyrics")).resolves.toEqual({
      ok: false,
      status: 400,
      error: "所选创作人不可用于当前步骤。",
    });
  });
});
