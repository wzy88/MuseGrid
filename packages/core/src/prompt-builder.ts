import type { ProductionStepType, SongProjectBrief } from "./domain";

export type ConfirmedStepOutput = {
  stepType: ProductionStepType;
  output: Record<string, unknown>;
};

export type MiniMaxInput = {
  lyrics: string;
  prompt: string;
};

function stringifyValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(stringifyValue).filter(Boolean).join(", ");
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value && typeof value === "object") {
    return Object.values(value).map(stringifyValue).filter(Boolean).join(", ");
  }

  return "";
}

function findOutput(steps: ConfirmedStepOutput[], stepType: ProductionStepType) {
  return steps.find((step) => step.stepType === stepType)?.output ?? {};
}

function readOutput(output: Record<string, unknown>, key: string) {
  return stringifyValue(output[key]);
}

function compactPrompt(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength - 1).trimEnd();
}

export function buildMiniMaxInput(
  project: SongProjectBrief,
  steps: ConfirmedStepOutput[],
): MiniMaxInput {
  const lyrics = findOutput(steps, "lyrics");
  const composition = findOutput(steps, "composition");
  const arrangement = findOutput(steps, "arrangement");
  const production = findOutput(steps, "production");

  const lyricDraft = readOutput(lyrics, "fullLyricDraft");

  const prompt = [
    `Song: ${project.title}`,
    `Language: ${project.language}`,
    `Genre: ${project.genre}`,
    `Mood: ${project.mood}`,
    `Use: ${project.intendedUse}`,
    `Idea: ${project.initialIdea}`,
    `Composition: ${[
      readOutput(composition, "tempo"),
      readOutput(composition, "structure"),
      readOutput(composition, "hookMood"),
      readOutput(composition, "melodyDescription"),
    ]
      .filter(Boolean)
      .join("; ")}`,
    `Arrangement: ${[
      readOutput(arrangement, "instruments"),
      readOutput(arrangement, "rhythm"),
      readOutput(arrangement, "sectionDevelopment"),
      readOutput(arrangement, "soundTexture"),
    ]
      .filter(Boolean)
      .join("; ")}`,
    `Production: ${[
      readOutput(production, "vocalTone"),
      readOutput(production, "mixDirection"),
      readOutput(production, "finalPrompt"),
    ]
      .filter(Boolean)
      .join("; ")}`,
  ]
    .filter((line) => !line.endsWith(": "))
    .join("\n");

  return {
    lyrics: lyricDraft,
    prompt: compactPrompt(prompt, 1999),
  };
}
