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
});
