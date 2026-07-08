import { describe, expect, it } from "vitest";
import {
  PRODUCTION_STEPS,
  assertValidInitialIdea,
  canGenerateStep,
  getNextProductionStep,
} from "../src";

describe("MuseGrid core domain", () => {
  it("keeps the song production chain in the required order", () => {
    expect(PRODUCTION_STEPS).toEqual(["lyrics", "composition", "arrangement", "voice", "production"]);
    expect(getNextProductionStep("lyrics")).toBe("composition");
    expect(getNextProductionStep("composition")).toBe("arrangement");
    expect(getNextProductionStep("arrangement")).toBe("voice");
    expect(getNextProductionStep("voice")).toBe("production");
    expect(getNextProductionStep("production")).toBeNull();
  });

  it("allows generation only for draft or failed step states", () => {
    expect(canGenerateStep("draft")).toBe(true);
    expect(canGenerateStep("failed")).toBe(true);
    expect(canGenerateStep("ready")).toBe(false);
    expect(canGenerateStep("generating")).toBe(false);
    expect(canGenerateStep("completed")).toBe(false);
  });

  it("rejects empty or too-short song ideas", () => {
    expect(() => assertValidInitialIdea("")).toThrow("请输入至少 6 个字的歌曲灵感");
    expect(() => assertValidInitialIdea("想唱歌")).toThrow("请输入至少 6 个字的歌曲灵感");
    expect(() => assertValidInitialIdea("想写一首深夜开车听的中文 R&B")).not.toThrow();
  });
});
