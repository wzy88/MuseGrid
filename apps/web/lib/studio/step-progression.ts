import { PRODUCTION_STEPS, getNextProductionStep, type ProductionStepType } from "@musegrid/core";

type StepLike = {
  stepType: ProductionStepType;
  status: string;
};

export function getUnlockedStepSet(steps: StepLike[]) {
  const unlocked = new Set<ProductionStepType>();

  for (const stepType of PRODUCTION_STEPS) {
    const previousStep = PRODUCTION_STEPS[PRODUCTION_STEPS.indexOf(stepType) - 1];
    if (!previousStep) {
      unlocked.add(stepType);
      continue;
    }

    const previousRecord = steps.find((step) => step.stepType === previousStep);
    if (previousRecord?.status === "completed") {
      unlocked.add(stepType);
    }
  }

  return unlocked;
}

export function isStepUnlocked(steps: StepLike[], stepType: ProductionStepType) {
  return getUnlockedStepSet(steps).has(stepType);
}

export function getProgressedActiveStep(steps: StepLike[], fallback: ProductionStepType) {
  const firstIncomplete = PRODUCTION_STEPS.find((stepType) => {
    return steps.find((step) => step.stepType === stepType)?.status !== "completed";
  });

  if (!firstIncomplete) {
    return fallback;
  }

  return isStepUnlocked(steps, firstIncomplete) ? firstIncomplete : fallback;
}

export function getStepStatusLabel(step: StepLike | undefined, unlocked: boolean) {
  if (!step) {
    return "等待";
  }
  if (step.status === "completed") {
    return "已确认";
  }
  if (!unlocked) {
    return "未解锁";
  }
  if (step.status === "ready") {
    return "待确认";
  }
  return "待处理";
}

export function getUnlockedNextStep(steps: StepLike[], currentStep: ProductionStepType) {
  const nextStep = getNextProductionStep(currentStep);
  if (!nextStep) {
    return null;
  }

  return isStepUnlocked(steps, nextStep) ? nextStep : null;
}
