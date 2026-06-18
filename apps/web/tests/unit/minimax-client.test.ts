import { afterEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
});

describe("MiniMax client", () => {
  it("posts the expected request with bearer auth", async () => {
    vi.stubEnv("MINIMAX_API_KEY", "mini-secret");
    vi.stubEnv("MINIMAX_MODEL", "music-2.6");
    vi.stubEnv("MINIMAX_OUTPUT_FORMAT", "url");
    vi.stubEnv("NODE_ENV", "production");

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          audio: {
            url: "https://cdn.minimax.local/demo.mp3",
            duration_ms: 12345,
          },
          trace_id: "trace-123",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const { generateMusicDemo } = await import("../../lib/minimax/client");
    const result = await generateMusicDemo({
      lyrics: "[Verse]\n城市还没睡\n\n[Chorus]\n我们继续飞",
      prompt: "Mandopop, luminous synth, warm bass, radio-ready chorus",
    });

    expect(result).toEqual({
      audioUrl: "https://cdn.minimax.local/demo.mp3",
      durationMs: 12345,
      providerTraceId: "trace-123",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.minimax.io/v1/music_generation",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer mini-secret",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          model: "music-2.6",
          prompt: "Mandopop, luminous synth, warm bass, radio-ready chorus",
          lyrics: "[Verse]\n城市还没睡\n\n[Chorus]\n我们继续飞",
          audio_setting: {
            sample_rate: 44100,
            bitrate: 256000,
            format: "mp3",
          },
          output_format: "url",
        }),
      }),
    );
  });

  it("uses the playable sample fallback when the MiniMax key is empty in production", async () => {
    vi.stubEnv("MINIMAX_API_KEY", "");
    vi.stubEnv("NODE_ENV", "production");

    const { generateMusicDemo } = await import("../../lib/minimax/client");
    const result = await generateMusicDemo({
      lyrics: "[Verse]\n城市还没睡",
      prompt: "Mandopop, luminous synth",
    });

    expect(result).toEqual({
      audioUrl: "/samples/midnight-drive-sample.mp3",
      durationMs: 4000,
      providerTraceId: "sample-fallback",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects lyrics longer than 3500 characters before calling MiniMax", async () => {
    vi.stubEnv("MINIMAX_API_KEY", "mini-secret");
    vi.stubEnv("NODE_ENV", "production");

    const { generateMusicDemo } = await import("../../lib/minimax/client");

    await expect(
      generateMusicDemo({
        lyrics: "超".repeat(3501),
        prompt: "still valid",
      }),
    ).rejects.toThrow("MiniMax lyrics must be 3500 characters or fewer.");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects prompt longer than 2000 characters before calling MiniMax", async () => {
    vi.stubEnv("MINIMAX_API_KEY", "mini-secret");
    vi.stubEnv("NODE_ENV", "production");

    const { generateMusicDemo } = await import("../../lib/minimax/client");

    await expect(
      generateMusicDemo({
        lyrics: "[Verse]\nhello",
        prompt: "p".repeat(2001),
      }),
    ).rejects.toThrow("MiniMax prompt must be 2000 characters or fewer.");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
