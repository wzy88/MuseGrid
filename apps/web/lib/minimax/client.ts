type GenerateMusicDemoInput = {
  lyrics: string;
  prompt: string;
};

type GenerateMusicDemoResult = {
  audioUrl: string;
  durationMs?: number;
  providerTraceId?: string;
};

type MiniMaxJsonResponse =
  | {
      audio?: {
        url?: string;
        hex?: string;
        duration_ms?: number;
      };
      trace_id?: string;
      base_resp?: {
        status_code?: number;
        status_msg?: string;
      };
    }
  | undefined;

const MINIMAX_ENDPOINT = "https://api.minimax.io/v1/music_generation";

function isFallbackMode() {
  return !process.env.MINIMAX_API_KEY && process.env.NODE_ENV !== "production";
}

function validateInput(input: GenerateMusicDemoInput) {
  if (input.lyrics.length > 3500) {
    throw new Error("MiniMax lyrics must be 3500 characters or fewer.");
  }
  if (input.prompt.length > 2000) {
    throw new Error("MiniMax prompt must be 2000 characters or fewer.");
  }
}

function readBody(response: MiniMaxJsonResponse) {
  if (!response) {
    throw new Error("MiniMax returned an empty response.");
  }

  if (response.base_resp?.status_code && response.base_resp.status_code !== 0) {
    throw new Error(response.base_resp.status_msg || "MiniMax request failed.");
  }

  if (!response.audio?.url && !response.audio?.hex) {
    throw new Error("MiniMax response did not include audio output.");
  }

  return response;
}

export async function generateMusicDemo(
  input: GenerateMusicDemoInput,
): Promise<GenerateMusicDemoResult> {
  validateInput(input);

  if (isFallbackMode()) {
    return {
      audioUrl: "/samples/midnight-drive-sample.mp3",
      durationMs: 4000,
      providerTraceId: "sample-fallback",
    };
  }

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is required in production.");
  }

  const response = await fetch(MINIMAX_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.MINIMAX_MODEL ?? "music-2.6-free",
      prompt: input.prompt,
      lyrics: input.lyrics,
      audio_setting: {
        sample_rate: 44100,
        bitrate: 256000,
        format: "mp3",
      },
      output_format: process.env.MINIMAX_OUTPUT_FORMAT ?? "url",
    }),
  });

  const json = readBody((await response.json()) as MiniMaxJsonResponse);
  return {
    audioUrl: json.audio?.url ?? json.audio?.hex ?? "",
    durationMs: json.audio?.duration_ms,
    providerTraceId: json.trace_id,
  };
}
