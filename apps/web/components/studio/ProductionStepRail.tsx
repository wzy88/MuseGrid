"use client";

import type { ProductionStepType } from "@musegrid/core";
import { PRODUCTION_STEPS } from "@musegrid/core";
import type { StepRecord } from "./studio-types";

const stepLabels: Record<ProductionStepType, string> = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  production: "制作",
};

const stepCaptions: Record<ProductionStepType, string> = {
  lyrics: "写出叙事与副歌记忆点",
  composition: "搭建旋律与段落结构",
  arrangement: "完成配器与能量编排",
  production: "生成可播放 Demo",
};

type ProductionStepRailProps = {
  activeStep: ProductionStepType;
  steps: StepRecord[];
  onSelectStep: (stepType: ProductionStepType) => void;
};

function stepStatus(step: StepRecord | undefined, index: number, activeIndex: number) {
  if (!step) {
    return "等待";
  }
  if (step.status === "completed") {
    return "已确认";
  }
  if (step.status === "ready") {
    return "待确认";
  }
  if (index === activeIndex) {
    return "进行中";
  }
  return index < activeIndex ? "已解锁" : "未开始";
}

export function ProductionStepRail({ activeStep, steps, onSelectStep }: ProductionStepRailProps) {
  const activeIndex = PRODUCTION_STEPS.indexOf(activeStep);

  return (
    <section className="productionStepRail" aria-label="歌曲制作步骤">
      <div className="productionStepRailHeader">
        <p className="eyebrow">Workflow</p>
        <h2>四步创作链路</h2>
      </div>
      <div className="productionStepRailList">
        {PRODUCTION_STEPS.map((stepType, index) => {
          const step = steps.find((item) => item.stepType === stepType);
          const isActive = activeStep === stepType;
          const isCompleted = step?.status === "completed";

          return (
            <button
              key={stepType}
              type="button"
              className={isActive ? "productionStepItem active" : "productionStepItem"}
              onClick={() => onSelectStep(stepType)}
              aria-pressed={isActive}
            >
              <span className="productionStepIndex">{index + 1}</span>
              <span className="productionStepBody">
                <span className="productionStepTopline">
                  <span className="productionStepName">{stepLabels[stepType]}</span>
                  <span className={isCompleted ? "productionStepState done" : "productionStepState"}>
                    {stepStatus(step, index, activeIndex)}
                  </span>
                </span>
                <span className="productionStepCaption">{stepCaptions[stepType]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
