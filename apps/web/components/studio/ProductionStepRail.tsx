"use client";

import type { ProductionStepType } from "@musegrid/core";
import { PRODUCTION_STEPS } from "@musegrid/core";
import { getStepStatusLabel } from "../../lib/studio/step-progression";
import { ProgressTrack } from "../ui/ProgressTrack";
import type { StepRecord } from "./studio-types";

const stepLabels: Record<ProductionStepType, string> = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  production: "制作",
};

type ProductionStepRailProps = {
  activeStep: ProductionStepType;
  steps: StepRecord[];
  unlockedSteps: Set<ProductionStepType>;
  onSelectStep: (stepType: ProductionStepType) => void;
};

export function ProductionStepRail({ activeStep, steps, unlockedSteps, onSelectStep }: ProductionStepRailProps) {
  return (
    <section className="productionStepRail compactStepRail" aria-label="歌曲制作步骤">
      <div className="productionStepRailHeader">
        <p className="eyebrow">Workflow</p>
        <h2>进度</h2>
      </div>
      <ProgressTrack
        ariaLabel="制作链路状态"
        steps={PRODUCTION_STEPS.map((stepType) => {
          const step = steps.find((item) => item.stepType === stepType);
          const isActive = activeStep === stepType;
          const isCompleted = step?.status === "completed";
          const isUnlocked = unlockedSteps.has(stepType);
          const stateLabel = getStepStatusLabel(step, isUnlocked);

          return {
            id: stepType,
            label: stepLabels[stepType],
            statusLabel: stateLabel,
            disabled: !isUnlocked,
            onSelect: () => onSelectStep(stepType),
            state: isActive ? "active" : isCompleted ? "complete" : isUnlocked ? "upcoming" : "locked",
          } as const;
        })}
      />
    </section>
  );
}
