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

function compactText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength - 1).trimEnd();
}

function promptLine(label: string, value: string) {
  return value ? `${label}: ${value}` : "";
}

function fitPrompt(requiredLines: string[], optionalLines: string[], maxLength: number) {
  const requiredPrompt = requiredLines.filter(Boolean).join("\n");
  const optionalPrompt = optionalLines.filter(Boolean).join("\n");

  if (!optionalPrompt) {
    return compactText(requiredPrompt, maxLength);
  }

  const separatorLength = requiredPrompt ? 1 : 0;
  const optionalBudget = maxLength - requiredPrompt.length - separatorLength;
  if (optionalBudget <= 0) {
    return compactText(requiredPrompt, maxLength);
  }

  return [requiredPrompt, compactText(optionalPrompt, optionalBudget)].filter(Boolean).join("\n");
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

  const prompt = fitPrompt(
    [
      promptLine("Song", project.title),
      promptLine("Language", project.language),
      promptLine("Genre", project.genre),
      promptLine("Mood", project.mood),
      promptLine("Use", project.intendedUse),
      promptLine(
        "Composition",
        [
          readOutput(composition, "tempo"),
          readOutput(composition, "structure"),
          readOutput(composition, "hookMood"),
          readOutput(composition, "melodyDescription"),
        ]
          .filter(Boolean)
          .join("; "),
      ),
      promptLine(
        "Arrangement",
        [
          readOutput(arrangement, "instruments"),
          readOutput(arrangement, "rhythm"),
          readOutput(arrangement, "sectionDevelopment"),
          readOutput(arrangement, "soundTexture"),
        ]
          .filter(Boolean)
          .join("; "),
      ),
      promptLine(
        "Production",
        [
          readOutput(production, "vocalTone"),
          readOutput(production, "mixDirection"),
          readOutput(production, "finalPrompt"),
        ]
          .filter(Boolean)
          .join("; "),
      ),
    ],
    [promptLine("Idea", project.initialIdea)],
    1999,
  );

  return {
    lyrics: lyricDraft,
    prompt,
  };
}
