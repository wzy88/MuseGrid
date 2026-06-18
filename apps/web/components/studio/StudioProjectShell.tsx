"use client";

import { PRODUCTION_STEPS, getNextProductionStep, type ProductionStepType } from "@musegrid/core";
import { useMemo, useState } from "react";
import { AvatarSelector } from "../avatars/AvatarSelector";
import { ContributionChain } from "../contribution/ContributionChain";
import { ProductionStepRail } from "./ProductionStepRail";
import { StepWorkspace } from "./StepWorkspace";
import type { AvatarRecordView, ContributionRecordView, GenerationRecordView, StepRecord } from "./studio-types";

type StudioProjectShellProps = {
  project: {
    id: string;
    title: string;
    initialIdea: string;
    language: string;
    genre: string;
    mood: string;
    intendedUse: string;
  };
  initialSteps: StepRecord[];
  initialContributions: ContributionRecordView[];
  initialGenerations: GenerationRecordView[];
  avatarsByStep: Record<ProductionStepType, AvatarRecordView[]>;
};

type StepFeedback = {
  error: string;
  status: string;
  isGenerating: boolean;
  isConfirming: boolean;
  isSelectingAvatar: boolean;
};

const defaultFeedback: StepFeedback = {
  error: "",
  status: "选择创作人分身后开始生成。",
  isGenerating: false,
  isConfirming: false,
  isSelectingAvatar: false,
};

function cloneFeedback(): StepFeedback {
  return { ...defaultFeedback };
}

function toStepMap(steps: StepRecord[]) {
  return steps.reduce<Record<ProductionStepType, StepRecord>>((accumulator, step) => {
    accumulator[step.stepType] = step;
    return accumulator;
  }, {} as Record<ProductionStepType, StepRecord>);
}

function initialActiveStep(steps: StepRecord[]) {
  return steps.find((step) => step.status !== "completed")?.stepType ?? "production";
}

function feedbackMessage(step: StepRecord) {
  if (step.status === "completed") {
    return "已确认并进入下一步";
  }
  if (step.status === "ready") {
    return "已生成，可继续确认";
  }
  return "选择创作人分身后开始生成。";
}

async function parseJsonResponse<T>(response: Response): Promise<T | { error: string }> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { error: "服务返回了无法识别的响应。" };
  }

  try {
    return (await response.json()) as T;
  } catch {
    return { error: "服务响应无法解析。" };
  }
}

export function StudioProjectShell({
  project,
  initialSteps,
  initialContributions,
  initialGenerations,
  avatarsByStep,
}: StudioProjectShellProps) {
  const [stepsByType, setStepsByType] = useState<Record<ProductionStepType, StepRecord>>(toStepMap(initialSteps));
  const [activeStep, setActiveStep] = useState<ProductionStepType>(initialActiveStep(initialSteps));
  const [contributions, setContributions] = useState<ContributionRecordView[]>(initialContributions);
  const [feedbackByStep, setFeedbackByStep] = useState<Record<ProductionStepType, StepFeedback>>({
    lyrics: cloneFeedback(),
    composition: cloneFeedback(),
    arrangement: cloneFeedback(),
    production: cloneFeedback(),
  });
  const [generationCount] = useState(initialGenerations.length);

  const orderedSteps = PRODUCTION_STEPS.map((stepType) => stepsByType[stepType]).filter(Boolean);
  const currentStep = stepsByType[activeStep];
  const currentFeedback = feedbackByStep[activeStep];
  const currentAvatars = avatarsByStep[activeStep] ?? [];

  const avatarsById = useMemo(
    () =>
      Object.values(avatarsByStep)
        .flat()
        .reduce<Record<string, AvatarRecordView>>((accumulator, avatar) => {
          accumulator[avatar.id] = avatar;
          return accumulator;
        }, {}),
    [avatarsByStep],
  );

  const selectedAvatar =
    (currentStep.selectedAvatarId ? avatarsById[currentStep.selectedAvatarId] : null) ?? null;

  function updateFeedback(stepType: ProductionStepType, patch: Partial<StepFeedback>) {
    setFeedbackByStep((current) => ({
      ...current,
      [stepType]: {
        ...current[stepType],
        ...patch,
      },
    }));
  }

  function updateStep(step: StepRecord) {
    setStepsByType((current) => ({
      ...current,
      [step.stepType]: step,
    }));
    updateFeedback(step.stepType, {
      error: "",
      status: feedbackMessage(step),
      isGenerating: false,
      isConfirming: false,
      isSelectingAvatar: false,
    });
  }

  async function handleSelectAvatar(avatarId: string) {
    updateFeedback(activeStep, {
      error: "",
      isSelectingAvatar: true,
      status: "正在连接创作人分身…",
    });

    try {
      const response = await fetch(`/api/v1/projects/${project.id}/steps/${activeStep}/avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedAvatarId: avatarId }),
      });
      const payload = (await parseJsonResponse<{ step?: StepRecord; error?: string }>(response)) as {
        step?: StepRecord;
        error?: string;
      };

      if (!response.ok || !payload.step) {
        updateFeedback(activeStep, {
          error: payload.error ?? "分身连接失败，请重试。",
          isSelectingAvatar: false,
          status: "选择创作人分身后开始生成。",
        });
        return;
      }

      updateStep(payload.step);
    } catch {
      updateFeedback(activeStep, {
        error: "分身连接失败，请检查网络后重试。",
        isSelectingAvatar: false,
        status: "选择创作人分身后开始生成。",
      });
    }
  }

  async function handleGenerate() {
    if (!currentStep.selectedAvatarId) {
      updateFeedback(activeStep, {
        error: "请先选择创作人分身。",
        status: "选择创作人分身后开始生成。",
      });
      return;
    }

    updateFeedback(activeStep, {
      error: "",
      isGenerating: true,
      status: "正在生成当前步骤内容…",
    });

    try {
      const response = await fetch(`/api/v1/projects/${project.id}/steps/${activeStep}/generate`, {
        method: "POST",
      });
      const payload = (await parseJsonResponse<{ step?: StepRecord; error?: string }>(response)) as {
        step?: StepRecord;
        error?: string;
      };

      if (!response.ok || !payload.step) {
        updateFeedback(activeStep, {
          error: payload.error ?? "生成失败，请稍后重试。",
          isGenerating: false,
          status: "生成失败，可立即重试。",
        });
        return;
      }

      updateStep(payload.step);
    } catch {
      updateFeedback(activeStep, {
        error: "生成失败，请检查网络后重试。",
        isGenerating: false,
        status: "生成失败，可立即重试。",
      });
    }
  }

  async function handleConfirm() {
    updateFeedback(activeStep, {
      error: "",
      isConfirming: true,
      status: "正在确认当前步骤成果…",
    });

    try {
      const response = await fetch(`/api/v1/projects/${project.id}/steps/${activeStep}/confirm`, {
        method: "POST",
      });
      const payload = (await parseJsonResponse<{
        step?: StepRecord;
        contribution?: ContributionRecordView;
        error?: string;
      }>(response)) as {
        step?: StepRecord;
        contribution?: ContributionRecordView;
        error?: string;
      };

      if (!response.ok || !payload.step) {
        updateFeedback(activeStep, {
          error: payload.error ?? "确认失败，请稍后重试。",
          isConfirming: false,
          status: "确认失败，可立即重试。",
        });
        return;
      }

      updateStep(payload.step);
      if (payload.contribution) {
        setContributions((current) => {
          const contribution = payload.contribution as ContributionRecordView;
          const withoutDuplicate = current.filter((item) => item.id !== contribution.id);
          return [...withoutDuplicate, contribution].sort((a, b) => {
            return PRODUCTION_STEPS.indexOf(a.stepType) - PRODUCTION_STEPS.indexOf(b.stepType);
          });
        });
      }

      const nextStep = getNextProductionStep(activeStep);
      if (nextStep) {
        setActiveStep(nextStep);
      }
    } catch {
      updateFeedback(activeStep, {
        error: "确认失败，请检查网络后重试。",
        isConfirming: false,
        status: "确认失败，可立即重试。",
      });
    }
  }

  return (
    <main className="studioProjectPage">
      <section className="studioProjectIntro">
        <div>
          <p className="eyebrow">Project</p>
          <h2>{project.title}</h2>
          <p>{project.initialIdea}</p>
        </div>
        <div className="studioIntroMeta">
          <span>{project.language}</span>
          <span>{project.genre}</span>
          <span>{project.mood}</span>
          <span>{project.intendedUse}</span>
        </div>
      </section>

      <section className="studioWorkspaceLayout">
        <ProductionStepRail activeStep={activeStep} steps={orderedSteps} onSelectStep={setActiveStep} />

        <div className="studioWorkspaceCenter">
          <div className="studioMobileProgress" aria-label="当前步骤">
            {PRODUCTION_STEPS.map((stepType) => (
              <button
                key={stepType}
                type="button"
                className={stepType === activeStep ? "studioMobileStep active" : "studioMobileStep"}
                onClick={() => setActiveStep(stepType)}
              >
                {stepsByType[stepType].status === "completed" ? "已确认" : stepType === activeStep ? "当前" : "待处理"}
              </button>
            ))}
          </div>

          <StepWorkspace
            step={currentStep}
            projectTitle={project.title}
            selectedAvatarName={selectedAvatar?.avatarName ?? null}
            statusMessage={currentFeedback.status}
            error={currentFeedback.error}
            isGenerating={currentFeedback.isGenerating}
            isConfirming={currentFeedback.isConfirming}
            onGenerate={handleGenerate}
            onConfirm={handleConfirm}
          />

          <AvatarSelector
            avatars={currentAvatars}
            currentStep={activeStep}
            selectedAvatarId={currentStep.selectedAvatarId}
            onSelectAvatar={handleSelectAvatar}
            isSaving={currentFeedback.isSelectingAvatar}
            error={currentFeedback.isSelectingAvatar ? "" : currentFeedback.error.includes("分身") ? currentFeedback.error : ""}
          />
        </div>

        <ContributionChain
          contributions={contributions}
          avatarsById={avatarsById}
          selectedAvatar={selectedAvatar}
          currentStep={activeStep}
        />
      </section>

      <section className="studioStatusBar" aria-label="生成状态栏">
        <div>
          <strong>当前步骤</strong>
          <span>{currentFeedback.status}</span>
        </div>
        <div>
          <strong>贡献链路</strong>
          <span>{contributions.length}/4 已确认</span>
        </div>
        <div>
          <strong>生成记录</strong>
          <span>{generationCount} 个任务</span>
        </div>
      </section>
    </main>
  );
}
