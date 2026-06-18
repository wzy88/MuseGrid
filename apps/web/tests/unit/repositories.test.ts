import { describe, expect, it } from "vitest";
import { createProject, getProject, listProjects } from "../../lib/repositories/projects";
import { listSeededAvatars } from "../../lib/repositories/avatars";
import { submitCreatorApplication } from "../../lib/repositories/creator-applications";
import { prisma } from "../../lib/db/prisma";

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

  it("lists seeded avatars by capability direction", async () => {
    const avatars = await listSeededAvatars("lyrics");
    expect(avatars.length).toBeGreaterThan(0);
    expect(avatars.every((avatar) => avatar.capabilityDirection === "lyrics")).toBe(true);
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
