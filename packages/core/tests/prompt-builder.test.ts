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
    expect(input.prompt).toContain("Voice:");
    expect(input.prompt).toContain("近距离耳语女声");
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
    expect(input.prompt).toContain("Voice:");
    expect(input.prompt).toContain("Production:");
  });

  it("preserves arrangement and production labels with compacted content when both sections are very long", () => {
    const input = buildMiniMaxInput(demoProject, [
      ...demoStepOutputs.filter((step) => step.stepType !== "arrangement" && step.stepType !== "voice" && step.stepType !== "production"),
      {
        stepType: "arrangement",
        output: {
          instruments: ["signature kalimba", "felt piano", "brushed drums"],
          rhythm: "late-night half-time pulse ".repeat(120),
          sectionDevelopment: "recognizable bridge lift ".repeat(120),
          soundTexture: "warm tape haze ".repeat(120),
        },
      },
      {
        stepType: "voice",
        output: {
          voiceType: "breathy female lead ".repeat(120),
          performanceStyle: "close whispered emotional delivery ".repeat(120),
          pronunciation: "soft Mandarin consonants ".repeat(120),
          referenceMood: "lonely night drive ".repeat(120),
        },
      },
      {
        stepType: "production",
        output: {
          vocalTone: "intimate close vocal ".repeat(120),
          mixDirection: "recognizable front vocal with soft stereo guitars ".repeat(120),
          finalPrompt: "polished demo master ".repeat(120),
        },
      },
    ]);

    expect(input.prompt.length).toBeLessThan(2000);
    expect(input.prompt).toContain("Arrangement:");
    expect(input.prompt).toContain("signature kalimba");
    expect(input.prompt).toContain("Voice:");
    expect(input.prompt).toContain("breathy female lead");
    expect(input.prompt).toContain("Production:");
    expect(input.prompt).toContain("intimate close vocal");
  });
});
