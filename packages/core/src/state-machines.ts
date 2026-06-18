import { PRODUCTION_STEPS, type ProductionStepStatus, type ProductionStepType } from "./domain";

export function getNextProductionStep(step: ProductionStepType): ProductionStepType | null {
  const index = PRODUCTION_STEPS.indexOf(step);
  return PRODUCTION_STEPS[index + 1] ?? null;
}

export function canGenerateStep(status: ProductionStepStatus): boolean {
  return status === "draft" || status === "failed";
}
