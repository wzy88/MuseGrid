import { describe, expect, it } from "vitest";
import { buildMiniMaxInput, demoProject, demoStepOutputs } from "../src";

describe("MiniMax prompt builder", () => {
  it("builds lyrics and a compact prompt from confirmed production steps", () => {
    const input = buildMiniMaxInput(demoProject, demoStepOutputs);

    expect(input.lyrics).toContain("[Verse]");
    expect(input.lyrics).toContain("[Chorus]");
    expect(input.prompt.length).toBeLessThan(2000);
    expect(input.prompt).toContain(demoProject.genre);
    expect(input.prompt).toContain(demoProject.mood);
    expect(input.prompt).toContain("Arrangement:");
    expect(input.prompt).toContain("Production:");
  });

  it("keeps required composition, arrangement, and production directions with a very long idea", () => {
    const input = buildMiniMaxInput(
      {
        ...demoProject,
        initialIdea: "这是一段很长的创作想法。".repeat(500),
      },
      demoStepOutputs,
    );

    expect(input.prompt.length).toBeLessThan(2000);
    expect(input.prompt).toContain(`Genre: ${demoProject.genre}`);
    expect(input.prompt).toContain(`Mood: ${demoProject.mood}`);
    expect(input.prompt).toContain("Composition:");
    expect(input.prompt).toContain("Arrangement:");
    expect(input.prompt).toContain("Production:");
  });
});
