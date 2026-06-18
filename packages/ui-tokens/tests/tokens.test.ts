import { describe, expect, it } from "vitest";
import { museGridTokens } from "../src";

describe("MuseGrid design tokens", () => {
  it("defines the required future music operating system colors", () => {
    expect(museGridTokens.color.accent).toBe("#21F3D0");
    expect(museGridTokens.color.growth).toBe("#B6FF4D");
    expect(museGridTokens.color.revenue).toBe("#FFB84D");
  });

  it("uses an 8px-first radius system", () => {
    expect(museGridTokens.radius.panel).toBe("12px");
    expect(museGridTokens.radius.control).toBe("8px");
  });
});
