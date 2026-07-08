import { describe, expect, it } from "vitest";
import { museGridTokens } from "../src";

describe("MuseGrid design tokens", () => {
  it("defines the required future music operating system colors", () => {
    expect(museGridTokens.color.accent).toBe("#67E8CD");
    expect(museGridTokens.color.growth).toBe("#9CE44F");
    expect(museGridTokens.color.revenue).toBe("#F1B765");
  });

  it("uses a compact soft radius system", () => {
    expect(museGridTokens.radius.panel).toBe("14px");
    expect(museGridTokens.radius.control).toBe("10px");
  });
});
