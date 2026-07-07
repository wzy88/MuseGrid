"use client";

import { PRODUCTION_STEPS, type ProductionStepType } from "@musegrid/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getProgressedActiveStep,
  getStepStatusLabel,
  getUnlockedNextStep,
  getUnlockedStepSet,
  isStepUnlocked,
} from "../../lib/studio/step-progression";
import { ProductionStepRail } from "./ProductionStepRail";
import { StepWorkspace, type CreationMode } from "./StepWorkspace";
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
  initialFlow?: "professional" | "quick";
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
  initialFlow = "professional",
}: StudioProjectShellProps) {
  const router = useRouter();
  const quickStartedRef = useRef(false);
  const [stepsByType, setStepsByType] = useState<Record<ProductionStepType, StepRecord>>(toStepMap(initialSteps));
  const [activeStep, setActiveStep] = useState<ProductionStepType>(initialActiveStep(initialSteps));
  const [contributions, setContributions] = useState<ContributionRecordView[]>(initialContributions);
  const [generations, setGenerations] = useState<GenerationRecordView[]>(initialGenerations);
  const [quickGenerationStatus, setQuickGenerationStatus] = useState({
    error: "",
    isRunning: initialFlow === "quick",
    status: initialFlow === "quick" ? "正在启动极速生成…" : "",
  });
  const [creationModeByStep, setCreationModeByStep] = useState<Record<ProductionStepType, CreationMode | "">>({
    lyrics: "",
    composition: "",
    arrangement: "",
    production: "",
  });
  const [selfDraftByStep, setSelfDraftByStep] = useState<Record<ProductionStepType, string>>({
    lyrics: "",
    composition: "",
    arrangement: "",
    production: "",
  });
  const [generatedDraftByStep, setGeneratedDraftByStep] = useState<Record<ProductionStepType, string>>({
    lyrics: "",
    composition: "",
    arrangement: "",
    production: "",
  });
  const [revisionNoteByStep, setRevisionNoteByStep] = useState<Record<ProductionStepType, string>>({
    lyrics: "",
    composition: "",
    arrangement: "",
    production: "",
  });
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
  const currentCreationMode = creationModeByStep[activeStep];
  const currentSelfDraft = selfDraftByStep[activeStep];
  const currentGeneratedDraft = generatedDraftByStep[activeStep];
  const currentRevisionNote = revisionNoteByStep[activeStep];
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

  function selectCreationMode(mode: CreationMode) {
    setCreationModeByStep((current) => ({
      ...current,
      [activeStep]: mode,
    }));
    updateFeedback(activeStep, {
      error: "",
      status: mode === "self" ? "填写你的版本，确认后进入下一步。" : "选择一个创作人分身后开始召唤。",
    });
  }

  function updateSelfDraft(value: string) {
    setSelfDraftByStep((current) => ({
      ...current,
      [activeStep]: value,
    }));
  }

  function updateGeneratedDraft(value: string) {
    setGeneratedDraftByStep((current) => ({
      ...current,
      [activeStep]: value,
    }));
  }

  function updateRevisionNote(value: string) {
    setRevisionNoteByStep((current) => ({
      ...current,
      [activeStep]: value,
    }));
  }

  async function requestDemoGeneration(stepType: ProductionStepType) {
    updateFeedback(stepType, {
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
      updateFeedback(stepType, {
        error: "",
        isGeneratingDemo: false,
        status: "Demo 已生成，可立即播放。",
      });
    } catch {
      updateFeedback(stepType, {
        error: "Demo 生成失败，请检查网络后重试。",
        isGeneratingDemo: false,
        status: "Demo 生成失败，可立即重试。",
      });
    }
  }

  async function handleGenerateDemo() {
    if (activeStep !== "production" || currentStep.status !== "completed") {
      handleGenerate();
      return;
    }

    await requestDemoGeneration(activeStep);
  }

  const latestPlayableGeneration = [...generations]
    .reverse()
    .find((generation) => generation.audioUrl && generation.status === "completed");

  useEffect(() => {
    if (initialFlow !== "quick" || quickStartedRef.current) {
      return;
    }

    quickStartedRef.current = true;
    if (latestPlayableGeneration) {
      router.replace(`/works/${project.id}`);
      return;
    }

    async function runQuickGeneration() {
      setQuickGenerationStatus({
        error: "",
        isRunning: true,
        status: "正在自动完成作词、作曲、编曲和制作…",
      });

      try {
        const response = await fetch(`/api/v1/projects/${project.id}/quick-generate`, {
          method: "POST",
        });
        const payload = await parseJsonResponse<{
          workUrl?: string;
          generation?: GenerationRecordView;
          audioAsset?: { storageUrl: string; duration?: number | null };
        }>(response);

        if (!response.ok || !("ok" in payload) || !payload.ok || !payload.data.workUrl) {
          setQuickGenerationStatus({
            error: getApiErrorMessage(payload, "极速生成失败，请进入专业模式继续制作。"),
            isRunning: false,
            status: "极速生成未完成。",
          });
          return;
        }

        setQuickGenerationStatus({
          error: "",
          isRunning: false,
          status: "歌曲已生成，正在进入结果页…",
        });
        router.replace(payload.data.workUrl);
      } catch {
        setQuickGenerationStatus({
          error: "极速生成失败，请检查网络后重试。",
          isRunning: false,
          status: "极速生成未完成。",
        });
      }
    }

    void runQuickGeneration();
  }, [initialFlow, latestPlayableGeneration, project.id, router]);

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
      setGeneratedDraftByStep((current) => ({
        ...current,
        [activeStep]: "",
      }));
    } catch {
      updateFeedback(activeStep, {
        error: "生成失败，请检查网络后重试。",
        isGenerating: false,
        status: "生成失败，可立即重试。",
      });
    }
  }

  async function handleRevise() {
    if (!activeStepUnlocked) {
      updateFeedback(activeStep, {
        error: "请先完成并确认前一步，再修改当前步骤内容。",
        status: "当前步骤尚未解锁。",
      });
      return;
    }

    const revisionNote = revisionNoteByStep[activeStep].trim();
    const currentDraft = generatedDraftByStep[activeStep].trim();
    if (!revisionNote && !currentDraft) {
      updateFeedback(activeStep, {
        error: "请先写下修改意见，或直接编辑当前草案。",
        status: "编辑草案或写下修改意见后，可以让分身继续修改。",
      });
      return;
    }

    updateFeedback(activeStep, {
      error: "",
      isGenerating: true,
      status: "正在根据修改意见生成新版本…",
    });

    try {
      const response = await fetch(`/api/v1/projects/${project.id}/steps/${activeStep}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "revise",
          revisionNote: revisionNote || "按用户直接编辑后的当前草案继续优化。",
          text: currentDraft,
        }),
      });
      const payload = await parseJsonResponse<{ step?: StepRecord }>(response);

      if (!response.ok || !("ok" in payload) || !payload.ok || !payload.data.step) {
        updateFeedback(activeStep, {
          error: getApiErrorMessage(payload, "修改失败，请稍后重试。"),
          isGenerating: false,
          status: "修改失败，可调整意见后重试。",
        });
        return;
      }

      updateStep(payload.data.step);
      setGeneratedDraftByStep((current) => ({
        ...current,
        [activeStep]: "",
      }));
      setRevisionNoteByStep((current) => ({
        ...current,
        [activeStep]: "",
      }));
      updateFeedback(activeStep, {
        error: "",
        isGenerating: false,
        status: "已根据修改意见生成新版本，可继续修改或确认。",
      });
    } catch {
      updateFeedback(activeStep, {
        error: "修改失败，请检查网络后重试。",
        isGenerating: false,
        status: "修改失败，可调整意见后重试。",
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
      status: activeStep === "production" ? "正在确认并生成 Demo…" : "正在确认当前步骤成果…",
    });

    try {
      const editedGeneratedText = generatedDraftByStep[activeStep].trim();
      if (currentCreationMode === "self" || editedGeneratedText) {
        const textToSave = currentCreationMode === "self" ? selfDraftByStep[activeStep].trim() : editedGeneratedText;
        if (!textToSave) {
          updateFeedback(activeStep, {
            error: "请先填写当前步骤内容。",
            isConfirming: false,
            status: currentCreationMode === "self" ? "填写你的版本，确认后进入下一步。" : "编辑结果后即可确认。",
          });
          return;
        }
        const saveResponse = await fetch(`/api/v1/projects/${project.id}/steps/${activeStep}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: currentCreationMode === "self" ? "self" : "edit", text: textToSave }),
        });
        const savePayload = await parseJsonResponse<{ step?: StepRecord }>(saveResponse);
        if (!saveResponse.ok || !("ok" in savePayload) || !savePayload.ok || !savePayload.data.step) {
          updateFeedback(activeStep, {
            error: getApiErrorMessage(savePayload, "保存失败，请稍后重试。"),
            isConfirming: false,
            status: "保存失败，可立即重试。",
          });
          return;
        }
        updateStep(savePayload.data.step);
      }

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
      setGeneratedDraftByStep((current) => ({
        ...current,
        [activeStep]: "",
      }));
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
      } else if (activeStep === "production" && payload.data.step?.status === "completed") {
        await requestDemoGeneration("production");
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

      {initialFlow === "quick" ? (
        <section className={quickGenerationStatus.error ? "quickProductionPanel failed" : "quickProductionPanel"} role="status" aria-label="极速生成状态">
          <div>
            <p className="eyebrow">Quick Mode</p>
            <h3>{quickGenerationStatus.error ? "极速生成需要处理" : "极速生成中"}</h3>
            <p>{quickGenerationStatus.error || quickGenerationStatus.status}</p>
          </div>
          <div className="quickProductionSteps" aria-hidden="true">
            <span>作词</span>
            <span>作曲</span>
            <span>编曲</span>
            <span>制作</span>
          </div>
          {quickGenerationStatus.error ? (
            <button type="button" className="quickProductionLink" onClick={() => router.replace(`/studio/projects/${project.id}`)}>
              进入专业模式继续
            </button>
          ) : null}
        </section>
      ) : null}

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
            creationMode={currentCreationMode}
            selfDraft={currentSelfDraft}
            generatedDraft={currentGeneratedDraft}
            revisionNote={currentRevisionNote}
            avatars={currentAvatars}
            selectedAvatarId={currentStep.selectedAvatarId}
            isSelectingAvatar={currentFeedback.isSelectingAvatar}
            avatarError={currentFeedback.isSelectingAvatar ? "" : currentFeedback.error.includes("分身") ? currentFeedback.error : ""}
            onModeChange={selectCreationMode}
            onSelfDraftChange={updateSelfDraft}
            onGeneratedDraftChange={updateGeneratedDraft}
            onRevisionNoteChange={updateRevisionNote}
            onSelectAvatar={handleSelectAvatar}
            onGenerate={activeStep === "production" ? handleGenerateDemo : handleGenerate}
            onRevise={handleRevise}
            onConfirm={handleConfirm}
            playableAudioUrl={activeStep === "production" ? latestPlayableGeneration?.audioUrl ?? null : null}
            playableProvider={activeStep === "production" ? latestPlayableGeneration?.provider ?? null : null}
            isGeneratingDemo={currentFeedback.isGeneratingDemo}
          />

          <div className="studioContributionStatus" role="status" aria-label="创作记录状态">
            <span>贡献记录 {contributions.length}/4</span>
            <p>确认每一步后会记录创作来源；完整贡献链路会在作品详情里展示。</p>
          </div>
        </div>
      </section>
    </main>
  );
}
