import type { ProductionStepType } from "@musegrid/core";

export type StepRecord = {
  id: string;
  projectId: string;
  stepType: ProductionStepType;
  selectedAvatarId: string | null;
  inputPayload: unknown;
  outputPayload: unknown;
  userEdits: unknown;
  status: string;
};

export type ContributionRecordView = {
  id: string;
  stepType: ProductionStepType;
  avatarId: string;
  avatarLevelAtTime: number;
  outputSummary: string;
  contributionWeight: number;
  createdAt: string;
};

export type GenerationRecordView = {
  id: string;
  status: string;
  provider: string;
  model: string;
  createdAt: string;
  audioUrl?: string | null;
  duration?: number | null;
};

export type AvatarRecordView = {
  id: string;
  avatarName: string;
  capabilityDirection: ProductionStepType;
  level: number;
  styleTags: string[];
  intro: string;
  sampleOutputs: Array<{ title?: string; excerpt?: string }>;
  simulatedCallCount: number;
  status: string;
};
