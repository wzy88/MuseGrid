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
  if (maxLength <= 0) {
    return "";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength - 1).trimEnd();
}

function promptLine(label: string, value: string) {
  return value ? `${label}: ${value}` : "";
}

type PromptSection = {
  label: string;
  value: string;
  required?: boolean;
};

function fitSections(sections: PromptSection[], maxLength: number) {
  const presentSections = sections.filter((section) => section.value);
  const requiredSections = presentSections.filter((section) => section.required);
  const optionalSections = presentSections.filter((section) => !section.required);

  if (presentSections.length === 0) {
    return "";
  }

  const lineOverhead = presentSections.reduce((total, section) => total + section.label.length + 2, 0);
  const newlineOverhead = Math.max(presentSections.length - 1, 0);
  let valueBudget = maxLength - lineOverhead - newlineOverhead;
  if (valueBudget <= 0) {
    return compactText(
      presentSections.map((section) => `${section.label}:`).join("\n"),
      maxLength,
    );
  }

  const fittedValues = new Map<PromptSection, string>();
  const budgetedSections = requiredSections.length > 0 ? requiredSections : presentSections;
  let remainingRequiredBudget = valueBudget;
  budgetedSections.forEach((section, index) => {
    const remainingSections = budgetedSections.length - index;
    const sectionBudget = Math.min(section.value.length, Math.floor(remainingRequiredBudget / remainingSections));
    fittedValues.set(section, compactText(section.value, sectionBudget));
    remainingRequiredBudget -= sectionBudget;
  });

  let remainingOptionalBudget = remainingRequiredBudget;
  optionalSections.forEach((section, index) => {
    const remainingSections = optionalSections.length - index;
    const sectionBudget = Math.min(section.value.length, Math.floor(remainingOptionalBudget / remainingSections));
    fittedValues.set(section, compactText(section.value, sectionBudget));
    remainingOptionalBudget -= sectionBudget;
  });

  return presentSections
    .map((section) => promptLine(section.label, fittedValues.get(section) ?? ""))
    .filter(Boolean)
    .join("\n");
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

  const prompt = fitSections(
    [
      { label: "Song", value: project.title },
      { label: "Language", value: project.language },
      { label: "Genre", value: project.genre, required: true },
      { label: "Mood", value: project.mood, required: true },
      { label: "Use", value: project.intendedUse },
      {
        label: "Composition",
        required: true,
        value: [
          readOutput(composition, "tempo"),
          readOutput(composition, "structure"),
          readOutput(composition, "hookMood"),
          readOutput(composition, "melodyDescription"),
        ]
          .filter(Boolean)
          .join("; "),
      },
      {
        label: "Arrangement",
        required: true,
        value: [
          readOutput(arrangement, "instruments"),
          readOutput(arrangement, "rhythm"),
          readOutput(arrangement, "sectionDevelopment"),
          readOutput(arrangement, "soundTexture"),
        ]
          .filter(Boolean)
          .join("; "),
      },
      {
        label: "Production",
        required: true,
        value: [
          readOutput(production, "vocalTone"),
          readOutput(production, "mixDirection"),
          readOutput(production, "finalPrompt"),
        ]
          .filter(Boolean)
          .join("; "),
      },
      { label: "Idea", value: project.initialIdea },
    ],
    1999,
  );

  return {
    lyrics: lyricDraft,
    prompt,
  };
}
