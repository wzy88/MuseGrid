export const PRODUCTION_STEPS = ["lyrics", "composition", "arrangement", "production"] as const;

export type ProductionStepType = (typeof PRODUCTION_STEPS)[number];
export type CapabilityDirection = ProductionStepType;
export type ProductionStepStatus = "draft" | "ready" | "generating" | "completed" | "failed";
export type GenerationStatus = "draft" | "ready" | "generating" | "completed" | "failed";
export type CreatorApplicationStatus = "draft" | "submitted" | "reviewing" | "approved" | "rejected";
export type UserRole = "creator_user" | "music_creator" | "operator";

export type CreatorAvatarSummary = {
  id: string;
  name: string;
  direction: CapabilityDirection;
  level: number;
  styleTags: string[];
  intro: string;
  simulatedCallCount: number;
  recommendedReason: string;
};

export type SongProjectBrief = {
  title: string;
  initialIdea: string;
  language: string;
  genre: string;
  mood: string;
  intendedUse: string;
};
