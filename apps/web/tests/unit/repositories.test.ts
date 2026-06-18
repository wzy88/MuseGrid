import type { CapabilityDirection } from "@musegrid/core";
import { describe, expect, it, beforeAll } from "vitest";
import { createProject, getProject, listProjects } from "../../lib/repositories/projects";
import { listSeededAvatars } from "../../lib/repositories/avatars";
import { submitCreatorApplication } from "../../lib/repositories/creator-applications";
import { prisma } from "../../lib/db/prisma";
import { seedCreatorAvatars } from "../../prisma/seed";
import { resetUnitDatabase } from "./test-db";

beforeAll(async () => {
  resetUnitDatabase();
  await seedCreatorAvatars(prisma);
});

describe("MuseGrid repositories", () => {
  it("creates a project with the four required production steps", async () => {
    const user = await prisma.user.create({
      data: {
        email: `repo-${Date.now()}@musegrid.local`,
        name: "Repo Tester",
        passwordHash: "test-hash",
      },
    });

    const project = await createProject(user.id, {
      title: "深夜开车",
      initialIdea: "想写一首深夜开车听的中文 R&B",
      language: "中文",
      genre: "R&B",
      mood: "克制想念",
      intendedUse: "个人 Demo",
    });

    const loaded = await getProject(project.id, user.id);
    expect(loaded?.steps.map((step) => step.stepType)).toEqual([
      "lyrics",
      "composition",
      "arrangement",
      "production",
    ]);

    const projects = await listProjects(user.id);
    expect(projects.some((item) => item.id === project.id)).toBe(true);
  });

  it("keeps project reads and lists scoped to the owning user", async () => {
    const owner = await prisma.user.create({
      data: {
        email: `owner-${Date.now()}@musegrid.local`,
        name: "Project Owner",
        passwordHash: "test-hash",
      },
    });
    const otherUser = await prisma.user.create({
      data: {
        email: `other-${Date.now()}@musegrid.local`,
        name: "Other User",
        passwordHash: "test-hash",
      },
    });

    const project = await createProject(owner.id, {
      title: "只属于我的歌",
      initialIdea: "一首只能由创建者看到的 Demo",
      language: "中文",
      genre: "Pop",
      mood: "安静",
      intendedUse: "私有创作",
    });

    await expect(getProject(project.id, otherUser.id)).resolves.toBeNull();
    const visibleProjects = await listProjects(otherUser.id);
    expect(visibleProjects.some((item) => item.id === project.id)).toBe(false);
  });

  it("lists seeded avatars by capability direction", async () => {
    const avatars = await listSeededAvatars("lyrics");
    expect(avatars.length).toBeGreaterThan(0);
    expect(avatars.every((avatar) => avatar.capabilityDirection === "lyrics")).toBe(true);
  });

  it("seeds avatars for every production direction", async () => {
    const directions: CapabilityDirection[] = ["lyrics", "composition", "arrangement", "production"];

    await expect(
      Promise.all(
        directions.map(async (direction) => {
          const avatars = await listSeededAvatars(direction);
          expect(avatars.length).toBeGreaterThan(0);
          expect(avatars.every((avatar) => avatar.capabilityDirection === direction)).toBe(true);
        }),
      ),
    ).resolves.toBeDefined();
  });

  it("submits a creator application", async () => {
    const user = await prisma.user.create({
      data: {
        email: `creator-${Date.now()}@musegrid.local`,
        name: "Creator Tester",
        passwordHash: "test-hash",
      },
    });

    const application = await submitCreatorApplication(user.id, {
      capabilityDirection: "lyrics",
      profileData: { displayName: "夜航作词人", styles: ["R&B"] },
      workSamples: [{ title: "样例作品", description: "情绪叙事歌词" }],
      questionnaireAnswers: { tone: "克制", boundary: "不模仿具体歌手" },
    });

    expect(application.status).toBe("submitted");
  });
});
