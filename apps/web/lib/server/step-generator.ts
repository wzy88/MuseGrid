import { Prisma, type ContributionRecord } from "@prisma/client";
import {
  PRODUCTION_STEPS,
  buildMiniMaxInput,
  type ProductionStepType,
  type SongProjectBrief,
} from "@musegrid/core";
import { prisma } from "../db/prisma";
import { isStepUnlocked } from "../studio/step-progression";

type StepGeneratorSuccess = {
  ok: true;
  step: {
    id: string;
    projectId: string;
    stepType: string;
    selectedAvatarId: string | null;
    outputPayload: Prisma.JsonValue;
    status: string;
  };
};

type StepGeneratorFailure = {
  ok: false;
  status: number;
  error: string;
};

type ConfirmStepSuccess = StepGeneratorSuccess & {
  contribution: {
    id: string;
    projectId: string;
    stepType: string;
    avatarId: string;
    avatarLevelAtTime: number;
    contributionWeight: number;
  };
};

export type StepGeneratorResult = StepGeneratorSuccess | StepGeneratorFailure;
export type ConfirmStepResult = ConfirmStepSuccess | StepGeneratorFailure;

function isProductionStepType(value: string): value is ProductionStepType {
  return (PRODUCTION_STEPS as readonly string[]).includes(value);
}

function stableNumber(seed: string, modulo: number) {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash % modulo;
}

function asStringArray(value: Prisma.JsonValue | null) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function projectBrief(project: {
  title: string;
  initialIdea: string;
  language: string;
  genre: string;
  mood: string;
  intendedUse: string;
}): SongProjectBrief {
  return {
    title: project.title,
    initialIdea: project.initialIdea,
    language: project.language,
    genre: project.genre,
    mood: project.mood,
    intendedUse: project.intendedUse,
  };
}

function generateLyrics(project: SongProjectBrief, avatarName: string, styleTags: string[], seed: number) {
  const hookOptions = [
    `${project.mood}留在第一句`,
    `${project.title}成为副歌记忆点`,
    `${styleTags[0] ?? project.genre}里的未说出口`,
  ];

  return {
    theme: `${project.initialIdea}。由${avatarName}提炼为${project.mood}的${project.genre}歌词主题。`,
    hookOptions,
    fullLyricDraft: `[Verse]\n${project.title}的街灯慢慢亮起\n${project.initialIdea}\n我把心事藏进${project.language}的呼吸\n\n[Chorus]\n${hookOptions[seed % hookOptions.length]}\n让${project.mood}随着旋律靠近\n这一刻只为${project.intendedUse}留下回音`,
  };
}

function generateComposition(project: SongProjectBrief, avatarName: string, seed: number) {
  const tempos = [78, 84, 92, 104, 116];
  const tempo = tempos[seed % tempos.length];

  return {
    tempo: `${tempo} BPM`,
    structure: "Intro - Verse - Pre-Chorus - Chorus - Verse - Chorus - Bridge - Final Chorus",
    hookMood: `${project.mood}但有清晰上扬的副歌记忆点`,
    melodyDescription: `${avatarName}建议主歌用短句级进，副歌在标题“${project.title}”处拉开放长音。`,
  };
}

function generateArrangement(project: SongProjectBrief, avatarName: string, styleTags: string[], seed: number) {
  const percussion = seed % 2 === 0 ? "soft rim clicks" : "tight electronic kick";

  return {
    instruments: ["warm electric piano", "round bass", percussion, styleTags[2] ?? "ambient pad"],
    rhythm: `${project.genre} groove with controlled push and ${project.mood} dynamics`,
    sectionDevelopment: `${avatarName}建议 Verse 保持留白，Chorus 加入和声与低频，Bridge 短暂抽空后回到完整编制。`,
    soundTexture: `适合${project.intendedUse}的清晰空间感，整体温暖、克制、可继续制作。`,
  };
}

function generateProduction(project: SongProjectBrief, avatarName: string, styleTags: string[], seed: number) {
  const vocalDistance = seed % 2 === 0 ? "近距离干声" : "轻微房间感主唱";

  return {
    vocalTone: `${vocalDistance}，保留${project.mood}里的细小呼吸`,
    mixDirection: `${avatarName}建议人声靠前，低频圆润，鼓组不过度压缩，保持${project.genre}空间。`,
    finalPrompt: `${project.language} ${project.genre}, ${project.mood}, ${styleTags.join(", ")}, clear vocal, polished demo for ${project.intendedUse}.`,
  };
}

function generateOutput(
  stepType: ProductionStepType,
  project: SongProjectBrief,
  avatarName: string,
  styleTags: string[],
) {
  const seed = stableNumber(`${project.title}:${project.initialIdea}:${stepType}:${avatarName}`, 997);

  if (stepType === "lyrics") {
    return generateLyrics(project, avatarName, styleTags, seed);
  }
  if (stepType === "composition") {
    return generateComposition(project, avatarName, seed);
  }
  if (stepType === "arrangement") {
    return generateArrangement(project, avatarName, styleTags, seed);
  }

  return generateProduction(project, avatarName, styleTags, seed);
}

function summarizeOutput(stepType: ProductionStepType, output: Prisma.JsonValue) {
  if (!output || typeof output !== "object" || Array.isArray(output)) {
    return `${stepType} output`;
  }

  const values = Object.values(output)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  return (values[0] ?? `${stepType} output`).slice(0, 120);
}

function primaryOutputText(stepType: ProductionStepType, output: Prisma.JsonValue | null) {
  if (!output || typeof output !== "object" || Array.isArray(output)) {
    return "";
  }

  const record = output as Record<string, unknown>;
  const preferredKey = stepType === "lyrics" ? "fullLyricDraft" : "draft";
  const preferred = record[preferredKey] ?? record.text ?? record.finalPrompt ?? record.melodyDescription ?? record.sectionDevelopment;
  return typeof preferred === "string" ? preferred : "";
}

function selfOutput(stepType: ProductionStepType, text: string) {
  return {
    sourceType: "self",
    label: "本人创作",
    text,
    [stepType === "lyrics" ? "fullLyricDraft" : "draft"]: text,
  };
}

function isSelfOutput(output: Prisma.JsonValue | null) {
  return Boolean(
    output &&
      typeof output === "object" &&
      !Array.isArray(output) &&
      (output as Record<string, unknown>).sourceType === "self",
  );
}

function revisedOutput(
  stepType: ProductionStepType,
  currentOutput: Prisma.JsonValue | null,
  revisionNote: string,
  currentText?: string,
): Prisma.InputJsonValue {
  const currentRecord =
    currentOutput && typeof currentOutput === "object" && !Array.isArray(currentOutput)
      ? (currentOutput as Record<string, unknown>)
      : {};
  const baseText = currentText?.trim() || primaryOutputText(stepType, currentOutput);
  const revisionCount =
    typeof currentRecord.revisionCount === "number" ? currentRecord.revisionCount + 1 : 1;
  const revisedText = `${baseText.trim()}\n\n[修改意见 ${revisionCount}]\n${revisionNote}`;

  return {
    ...currentRecord,
    revisionCount,
    latestRevisionNote: revisionNote,
    revisedText,
    [stepType === "lyrics" ? "fullLyricDraft" : "draft"]: revisedText,
  } as Prisma.InputJsonValue;
}

function selectedAvatarWhere(userId: string, avatarId: string, stepType: ProductionStepType): Prisma.CreatorAvatarWhereInput {
  return {
    id: avatarId,
    capabilityDirection: stepType,
    OR: [{ ownerUserId: null }, { ownerUserId: userId }],
  };
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function findContribution(projectId: string, stepType: ProductionStepType, avatarId: string) {
  return prisma.contributionRecord.findFirst({
    where: {
      projectId,
      stepType,
      avatarId,
    },
  });
}

function enforceStepProgression(
  steps: Array<{
    stepType: string;
    status: string;
  }>,
  stepType: ProductionStepType,
) {
  const normalizedSteps = steps
    .filter((step): step is { stepType: ProductionStepType; status: string } => isProductionStepType(step.stepType))
    .map((step) => ({ stepType: step.stepType, status: step.status }));

  if (!isStepUnlocked(normalizedSteps, stepType)) {
    return { ok: false as const, status: 409, error: "请先完成并确认前一步，再进入当前步骤。" };
  }

  return { ok: true as const };
}

export async function generateStepOutput(
  userId: string,
  projectId: string,
  stepType: string,
): Promise<StepGeneratorResult> {
  if (!isProductionStepType(stepType)) {
    return { ok: false, status: 400, error: "生产步骤不符合要求。" };
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { steps: true },
  });
  if (!project) {
    return { ok: false, status: 404, error: "项目不存在或无权访问。" };
  }

  const step = project.steps.find((item) => item.stepType === stepType);
  if (!step) {
    return { ok: false, status: 404, error: "生产步骤不存在。" };
  }
  const progression = enforceStepProgression(project.steps, stepType);
  if (!progression.ok) {
    return progression;
  }
  if (!step.selectedAvatarId) {
    return { ok: false, status: 400, error: "请先选择创作人。" };
  }

  const avatar = await prisma.creatorAvatar.findFirst({
    where: selectedAvatarWhere(userId, step.selectedAvatarId, stepType),
  });
  if (!avatar) {
    return { ok: false, status: 400, error: "所选创作人不可用于当前步骤。" };
  }

  const output = generateOutput(
    stepType,
    projectBrief(project),
    avatar.avatarName,
    asStringArray(avatar.styleTags),
  );

  const updatedStep = await prisma.productionStep.update({
    where: { id: step.id },
    data: {
      outputPayload: output,
      status: "ready",
    },
  });

  return { ok: true, step: updatedStep };
}

export async function generateSelfStepOutput(
  userId: string,
  projectId: string,
  stepType: string,
  text: string,
): Promise<StepGeneratorResult> {
  if (!isProductionStepType(stepType)) {
    return { ok: false, status: 400, error: "生产步骤不符合要求。" };
  }

  const normalizedText = text.trim();
  if (!normalizedText) {
    return { ok: false, status: 400, error: "请先填写当前步骤内容。" };
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { steps: true },
  });
  if (!project) {
    return { ok: false, status: 404, error: "项目不存在或无权访问。" };
  }

  const step = project.steps.find((item) => item.stepType === stepType);
  if (!step) {
    return { ok: false, status: 404, error: "生产步骤不存在。" };
  }
  const progression = enforceStepProgression(project.steps, stepType);
  if (!progression.ok) {
    return progression;
  }

  const updatedStep = await prisma.productionStep.update({
    where: { id: step.id },
    data: {
      selectedAvatarId: null,
      outputPayload: selfOutput(stepType, normalizedText),
      userEdits: { text: normalizedText },
      status: "ready",
    },
  });

  return { ok: true, step: updatedStep };
}

export async function saveEditedStepOutput(
  userId: string,
  projectId: string,
  stepType: string,
  text: string,
): Promise<StepGeneratorResult> {
  if (!isProductionStepType(stepType)) {
    return { ok: false, status: 400, error: "生产步骤不符合要求。" };
  }

  const normalizedText = text.trim();
  if (!normalizedText) {
    return { ok: false, status: 400, error: "请先填写当前步骤内容。" };
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { steps: true },
  });
  if (!project) {
    return { ok: false, status: 404, error: "项目不存在或无权访问。" };
  }

  const step = project.steps.find((item) => item.stepType === stepType);
  if (!step) {
    return { ok: false, status: 404, error: "生产步骤不存在。" };
  }
  const progression = enforceStepProgression(project.steps, stepType);
  if (!progression.ok) {
    return progression;
  }

  const currentOutput =
    step.outputPayload && typeof step.outputPayload === "object" && !Array.isArray(step.outputPayload)
      ? (step.outputPayload as Record<string, unknown>)
      : {};
  const outputPayload: Prisma.InputJsonValue = {
    ...currentOutput,
    editedText: normalizedText,
    [stepType === "lyrics" ? "fullLyricDraft" : "draft"]: normalizedText,
  } as Prisma.InputJsonValue;
  const updatedStep = await prisma.productionStep.update({
    where: { id: step.id },
    data: {
      outputPayload,
      userEdits: { text: normalizedText },
      status: "ready",
    },
  });

  return { ok: true, step: updatedStep };
}

export async function reviseStepOutput(
  userId: string,
  projectId: string,
  stepType: string,
  revisionNote: string,
  currentText?: string,
): Promise<StepGeneratorResult> {
  if (!isProductionStepType(stepType)) {
    return { ok: false, status: 400, error: "生产步骤不符合要求。" };
  }

  const normalizedNote = revisionNote.trim();
  if (!normalizedNote) {
    return { ok: false, status: 400, error: "请先写下修改意见。" };
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { steps: true },
  });
  if (!project) {
    return { ok: false, status: 404, error: "项目不存在或无权访问。" };
  }

  const step = project.steps.find((item) => item.stepType === stepType);
  if (!step) {
    return { ok: false, status: 404, error: "生产步骤不存在。" };
  }
  const progression = enforceStepProgression(project.steps, stepType);
  if (!progression.ok) {
    return progression;
  }
  if (!step.selectedAvatarId) {
    return { ok: false, status: 400, error: "请先选择创作人。" };
  }
  if (!step.outputPayload) {
    return { ok: false, status: 400, error: "请先生成一版草案，再提出修改意见。" };
  }

  const avatar = await prisma.creatorAvatar.findFirst({
    where: selectedAvatarWhere(userId, step.selectedAvatarId, stepType),
  });
  if (!avatar) {
    return { ok: false, status: 400, error: "所选创作人不可用于当前步骤。" };
  }

  const outputPayload = revisedOutput(stepType, step.outputPayload, normalizedNote, currentText);
  const updatedStep = await prisma.productionStep.update({
    where: { id: step.id },
    data: {
      outputPayload,
      userEdits: { revisionNote: normalizedNote },
      status: "ready",
    },
  });

  return { ok: true, step: updatedStep };
}

export async function confirmStepOutput(
  userId: string,
  projectId: string,
  stepType: string,
): Promise<ConfirmStepResult> {
  if (!isProductionStepType(stepType)) {
    return { ok: false, status: 400, error: "生产步骤不符合要求。" };
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { steps: true },
  });
  if (!project) {
    return { ok: false, status: 404, error: "项目不存在或无权访问。" };
  }

  const step = project.steps.find((item) => item.stepType === stepType);
  if (!step) {
    return { ok: false, status: 404, error: "生产步骤不存在。" };
  }
  const progression = enforceStepProgression(project.steps, stepType);
  if (!progression.ok) {
    return progression;
  }
  if (!step.outputPayload) {
    return { ok: false, status: 400, error: "请先生成步骤内容。" };
  }

  const avatar = step.selectedAvatarId
    ? await prisma.creatorAvatar.findFirst({
        where: selectedAvatarWhere(userId, step.selectedAvatarId, stepType),
      })
    : null;
  if (step.selectedAvatarId && !avatar) {
    return { ok: false, status: 400, error: "所选创作人不可用于当前步骤。" };
  }
  const contributionAvatarId = avatar?.id ?? (isSelfOutput(step.outputPayload) ? "self" : "");
  if (!contributionAvatarId) {
    return { ok: false, status: 400, error: "请先选择创作人或填写当前步骤内容。" };
  }

  const existingContribution = await findContribution(projectId, stepType, contributionAvatarId);
  if (existingContribution) {
    const updatedStep = await prisma.productionStep.update({
      where: { id: step.id },
      data: { status: "completed" },
    });

    return { ok: true, step: updatedStep, contribution: existingContribution };
  }

  let contribution: ContributionRecord;
  let updatedStep = step;
  try {
    [updatedStep, contribution] = await prisma.$transaction([
      prisma.productionStep.update({
        where: { id: step.id },
        data: { status: "completed" },
      }),
      prisma.contributionRecord.create({
        data: {
          projectId,
          stepType,
          avatarId: contributionAvatarId,
          avatarLevelAtTime: avatar?.level ?? 1,
          outputSummary: summarizeOutput(stepType, step.outputPayload),
          contributionWeight: 25,
        },
      }),
    ]);
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const existingRaceContribution = await findContribution(projectId, stepType, contributionAvatarId);
    if (!existingRaceContribution) {
      throw error;
    }

    updatedStep = await prisma.productionStep.update({
      where: { id: step.id },
      data: { status: "completed" },
    });
    contribution = existingRaceContribution;
  }

  return { ok: true, step: updatedStep, contribution };
}

export async function buildMiniMaxInputForProject(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { steps: true },
  });
  if (!project) {
    return null;
  }

  return buildMiniMaxInput(
    projectBrief(project),
    project.steps
      .filter((step) => step.status === "completed" && step.outputPayload)
      .map((step) => ({
        stepType: step.stepType as ProductionStepType,
        output: step.outputPayload as Record<string, unknown>,
      })),
  );
}
