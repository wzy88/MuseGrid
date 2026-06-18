"use client";

import { PRODUCTION_STEPS, type ProductionStepType } from "@musegrid/core";
import { useMemo, useState } from "react";
import {
  getProgressedActiveStep,
  getStepStatusLabel,
  getUnlockedNextStep,
  getUnlockedStepSet,
  isStepUnlocked,
} from "../../lib/studio/step-progression";
import { AvatarSelector } from "../avatars/AvatarSelector";
import { ContributionChain } from "../contribution/ContributionChain";
import { ProductionStepRail } from "./ProductionStepRail";
import { StepWorkspace } from "./StepWorkspace";
import type { AvatarRecordView, ContributionRecordView, GenerationRecordView, StepRecord } from "./studio-types";

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

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
  isGeneratingDemo: boolean;
};

const defaultFeedback: StepFeedback = {
  error: "",
  status: "选择创作人分身后开始生成。",
  isGenerating: false,
  isConfirming: false,
  isSelectingAvatar: false,
  isGeneratingDemo: false,
};

function cloneFeedback(): StepFeedback {
  return { ...defaultFeedback };
}

const stepLabels: Record<ProductionStepType, string> = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  production: "制作",
};

function toStepMap(steps: StepRecord[]) {
  return steps.reduce<Record<ProductionStepType, StepRecord>>((accumulator, step) => {
    accumulator[step.stepType] = step;
    return accumulator;
  }, {} as Record<ProductionStepType, StepRecord>);
}

function initialActiveStep(steps: StepRecord[]) {
  return getProgressedActiveStep(steps, "production");
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

async function parseJsonResponse<T>(response: Response): Promise<ApiSuccess<T> | ApiFailure | { error: string }> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { error: "服务返回了无法识别的响应。" };
  }

  try {
    return (await response.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    return { error: "服务响应无法解析。" };
  }
}

function getApiErrorMessage(
  payload: ApiSuccess<unknown> | ApiFailure | { error: string },
  fallback: string,
) {
  if ("ok" in payload && payload.ok === false) {
    return payload.error.message;
  }
  if ("error" in payload) {
    return payload.error;
  }
  return fallback;
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
  const [generations, setGenerations] = useState<GenerationRecordView[]>(initialGenerations);
  const [feedbackByStep, setFeedbackByStep] = useState<Record<ProductionStepType, StepFeedback>>({
    lyrics: cloneFeedback(),
    composition: cloneFeedback(),
    arrangement: cloneFeedback(),
    production: cloneFeedback(),
  });
  const orderedSteps = PRODUCTION_STEPS.map((stepType) => stepsByType[stepType]).filter(Boolean);
  const currentStep = stepsByType[activeStep];
  const currentFeedback = feedbackByStep[activeStep];
  const currentAvatars = avatarsByStep[activeStep] ?? [];
  const unlockedSteps = useMemo(() => getUnlockedStepSet(orderedSteps), [orderedSteps]);
  const activeStepUnlocked = unlockedSteps.has(activeStep);

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

  function selectStep(stepType: ProductionStepType) {
    if (!isStepUnlocked(orderedSteps, stepType)) {
      return;
    }
    setActiveStep(stepType);
  }

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
      isGeneratingDemo: false,
    });
  }

  async function handleGenerateDemo() {
    if (activeStep !== "production" || currentStep.status !== "completed") {
      handleGenerate();
      return;
    }

    updateFeedback(activeStep, {
      error: "",
      isGeneratingDemo: true,
      status: "正在生成可播放 Demo…",
    });

    try {
      const response = await fetch(`/api/v1/projects/${project.id}/generate-demo`, {
        method: "POST",
      });
      const payload = await parseJsonResponse<{
        generation?: GenerationRecordView;
        audioAsset?: { storageUrl: string; duration?: number | null };
      }>(response);

      if (!response.ok || !("ok" in payload) || !payload.ok || !payload.data.generation || !payload.data.audioAsset) {
        updateFeedback(activeStep, {
          error: getApiErrorMessage(payload, "Demo 生成失败，请稍后重试。"),
          isGeneratingDemo: false,
          status: "Demo 生成失败，可立即重试。",
        });
        return;
      }

      const nextGeneration: GenerationRecordView = {
        ...payload.data.generation,
        audioUrl: payload.data.audioAsset.storageUrl,
        duration: payload.data.audioAsset.duration ?? null,
      };
      setGenerations((current) => [...current, nextGeneration]);
      updateFeedback(activeStep, {
        error: "",
        isGeneratingDemo: false,
        status: "Demo 已生成，可立即播放。",
      });
    } catch {
      updateFeedback(activeStep, {
        error: "Demo 生成失败，请检查网络后重试。",
        isGeneratingDemo: false,
        status: "Demo 生成失败，可立即重试。",
      });
    }
  }

  const latestPlayableGeneration = [...generations]
    .reverse()
    .find((generation) => generation.audioUrl && generation.status === "completed");

  async function handleSelectAvatar(avatarId: string) {
    if (!activeStepUnlocked) {
      updateFeedback(activeStep, {
        error: "请先确认前一步，再选择当前步骤的创作人分身。",
        status: "当前步骤尚未解锁。",
      });
      return;
    }

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
      const payload = await parseJsonResponse<{ step?: StepRecord }>(response);

      if (!response.ok || !("ok" in payload) || !payload.ok || !payload.data.step) {
        updateFeedback(activeStep, {
          error: getApiErrorMessage(payload, "分身连接失败，请重试。"),
          isSelectingAvatar: false,
          status: "选择创作人分身后开始生成。",
        });
        return;
      }

      updateStep(payload.data.step);
    } catch {
      updateFeedback(activeStep, {
        error: "分身连接失败，请检查网络后重试。",
        isSelectingAvatar: false,
        status: "选择创作人分身后开始生成。",
      });
    }
  }

  async function handleGenerate() {
    if (!activeStepUnlocked) {
      updateFeedback(activeStep, {
        error: "请先完成并确认前一步，再生成当前步骤内容。",
        status: "当前步骤尚未解锁。",
      });
      return;
    }

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
      const payload = await parseJsonResponse<{ step?: StepRecord }>(response);

      if (!response.ok || !("ok" in payload) || !payload.ok || !payload.data.step) {
        updateFeedback(activeStep, {
          error: getApiErrorMessage(payload, "生成失败，请稍后重试。"),
          isGenerating: false,
          status: "生成失败，可立即重试。",
        });
        return;
      }

      updateStep(payload.data.step);
    } catch {
      updateFeedback(activeStep, {
        error: "生成失败，请检查网络后重试。",
        isGenerating: false,
        status: "生成失败，可立即重试。",
      });
    }
  }

  async function handleConfirm() {
    if (!activeStepUnlocked) {
      updateFeedback(activeStep, {
        error: "请先完成前一步，再确认当前步骤内容。",
        status: "当前步骤尚未解锁。",
      });
      return;
    }

    updateFeedback(activeStep, {
      error: "",
      isConfirming: true,
      status: "正在确认当前步骤成果…",
    });

    try {
      const response = await fetch(`/api/v1/projects/${project.id}/steps/${activeStep}/confirm`, {
        method: "POST",
      });
      const payload = await parseJsonResponse<{
        step?: StepRecord;
        contribution?: ContributionRecordView;
      }>(response);

      if (!response.ok || !("ok" in payload) || !payload.ok || !payload.data.step) {
        updateFeedback(activeStep, {
          error: getApiErrorMessage(payload, "确认失败，请稍后重试。"),
          isConfirming: false,
          status: "确认失败，可立即重试。",
        });
        return;
      }

      updateStep(payload.data.step);
      if (payload.data.contribution) {
        setContributions((current) => {
          const contribution = payload.data.contribution as ContributionRecordView;
          const withoutDuplicate = current.filter((item) => item.id !== contribution.id);
          return [...withoutDuplicate, contribution].sort((a, b) => {
            return PRODUCTION_STEPS.indexOf(a.stepType) - PRODUCTION_STEPS.indexOf(b.stepType);
          });
        });
      }

      const nextStep = getUnlockedNextStep(
        PRODUCTION_STEPS.map((stepType) =>
          stepType === activeStep ? payload.data.step ?? stepsByType[stepType] : stepsByType[stepType],
        ),
        activeStep,
      );
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
        <ProductionStepRail
          activeStep={activeStep}
          steps={orderedSteps}
          unlockedSteps={unlockedSteps}
          onSelectStep={selectStep}
        />

        <div className="studioWorkspaceCenter">
          <div className="studioMobileProgress" role="group" aria-label="当前步骤">
            {PRODUCTION_STEPS.map((stepType) => {
              const step = stepsByType[stepType];
              const unlocked = unlockedSteps.has(stepType);
              const statusLabel = getStepStatusLabel(step, unlocked);
              const isActive = stepType === activeStep;
              const displayStatus = isActive && unlocked && step.status !== "completed" ? "当前" : statusLabel;

              return (
              <button
                key={stepType}
                type="button"
                className={isActive ? "studioMobileStep active" : "studioMobileStep"}
                onClick={() => selectStep(stepType)}
                disabled={!unlocked}
              >
                <span className="studioMobileStepName">{stepLabels[stepType]}</span>
                <span className="studioMobileStepState">{displayStatus}</span>
              </button>
              );
            })}
          </div>

          <StepWorkspace
            step={currentStep}
            projectTitle={project.title}
            selectedAvatarName={selectedAvatar?.avatarName ?? null}
            statusMessage={currentFeedback.status}
            error={currentFeedback.error}
            isGenerating={currentFeedback.isGenerating}
            isConfirming={currentFeedback.isConfirming}
            isLocked={!activeStepUnlocked}
            onGenerate={activeStep === "production" ? handleGenerateDemo : handleGenerate}
            onConfirm={handleConfirm}
            playableAudioUrl={activeStep === "production" ? latestPlayableGeneration?.audioUrl ?? null : null}
            playableProvider={activeStep === "production" ? latestPlayableGeneration?.provider ?? null : null}
            isGeneratingDemo={currentFeedback.isGeneratingDemo}
          />

          <AvatarSelector
            avatars={currentAvatars}
            currentStep={activeStep}
            selectedAvatarId={currentStep.selectedAvatarId}
            onSelectAvatar={handleSelectAvatar}
            isSaving={currentFeedback.isSelectingAvatar}
            isLocked={!activeStepUnlocked}
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
          <span>{generations.length} 个任务</span>
        </div>
      </section>
    </main>
  );
}
