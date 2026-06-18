import type { ProductionStepType } from "@musegrid/core";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";
import type { StepRecord } from "./studio-types";

const stepLabels: Record<ProductionStepType, string> = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  production: "制作",
};

const stepDescriptions: Record<ProductionStepType, string> = {
  lyrics: "先确定歌词主题、Hook 与完整段落草案，再把语言情绪锁进项目链路。",
  composition: "根据上一环节的叙事骨架生成旋律结构、段落动线与记忆点。",
  arrangement: "把旋律转成可执行的编曲方案，控制空间、能量和配器密度。",
  production: "整理最终制作提示词与声音方向，生成可播放 Demo。",
};

type StepWorkspaceProps = {
  step: StepRecord;
  projectTitle: string;
  selectedAvatarName: string | null;
  statusMessage: string;
  error: string;
  isGenerating: boolean;
  isConfirming: boolean;
  isLocked: boolean;
  onGenerate: () => void;
  onConfirm: () => void;
  playableAudioUrl?: string | null;
  playableProvider?: string | null;
  isGeneratingDemo?: boolean;
};

function actionLabels(stepType: ProductionStepType) {
  switch (stepType) {
    case "lyrics":
      return {
        generate: "生成歌词草案",
        confirm: "确认作词成果",
      };
    case "composition":
      return {
        generate: "生成旋律结构",
        confirm: "确认作曲成果",
      };
    case "arrangement":
      return {
        generate: "生成编曲方案",
        confirm: "确认编曲成果",
      };
    case "production":
      return {
        generate: "生成可播放 Demo",
        confirm: "确认制作成果",
      };
  }
}

function outputEntries(outputPayload: unknown) {
  if (!outputPayload || typeof outputPayload !== "object" || Array.isArray(outputPayload)) {
    return [];
  }

  return Object.entries(outputPayload as Record<string, unknown>);
}

function renderOutputValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(" / ");
  }
  return typeof value === "string" ? value : JSON.stringify(value);
}

function stepStatusTone(status: StepRecord["status"]): "accent" | "success" | "warning" | "muted" {
  if (status === "completed") {
    return "success";
  }
  if (status === "ready") {
    return "accent";
  }
  if (status === "generating") {
    return "warning";
  }
  return "muted";
}

export function StepWorkspace({
  step,
  projectTitle,
  selectedAvatarName,
  statusMessage,
  error,
  isGenerating,
  isConfirming,
  isLocked,
  onGenerate,
  onConfirm,
  playableAudioUrl,
  playableProvider,
  isGeneratingDemo,
}: StepWorkspaceProps) {
  const labels = actionLabels(step.stepType);
  const canConfirm = !isLocked && step.status === "ready";
  const canGenerate = !isLocked && !isGenerating && !isConfirming && !isGeneratingDemo;
  const entries = outputEntries(step.outputPayload);

  return (
    <section className="stepWorkspace" aria-labelledby="step-workspace-title">
      <div className="stepWorkspaceHero">
        <div>
          <p className="eyebrow">Studio Workspace</p>
          <h2 id="step-workspace-title">{stepLabels[step.stepType]}</h2>
          <p className="workspaceLead">{stepDescriptions[step.stepType]}</p>
        </div>
        <div className="workspaceContext">
          <span>{projectTitle}</span>
          <span>{selectedAvatarName ?? "待选择创作人分身"}</span>
        </div>
      </div>

      <Panel className="studioPanel workspaceActionPanel">
        <div className="studioPanelHeader">
          <div>
            <p className="eyebrow">当前动作</p>
            <h3>一步一个主动作</h3>
          </div>
          <StatusBadge label={step.status} tone={stepStatusTone(step.status)} />
        </div>
        <p className="workspaceStatus">{statusMessage}</p>
        {error ? <p className="inlineError">{error}</p> : null}
        <div className="workspaceActions">
          <Button type="button" className="primaryWorkspaceButton" onClick={onGenerate} disabled={!canGenerate} loading={isGenerating || isGeneratingDemo}>
            {isGenerating || isGeneratingDemo ? "正在生成…" : labels.generate}
          </Button>
          <Button
            type="button"
            className="secondaryWorkspaceButton"
            variant="secondary"
            onClick={onConfirm}
            disabled={!canConfirm || isGenerating || isConfirming}
            loading={isConfirming}
          >
            {isConfirming ? "正在确认…" : labels.confirm}
          </Button>
        </div>
      </Panel>

      <Panel className="studioPanel workspaceOutputPanel">
        <div className="studioPanelHeader">
          <div>
            <p className="eyebrow">Step Output</p>
            <h3>当前步骤结果</h3>
          </div>
          <StatusBadge label={entries.length > 0 ? "已生成" : "待生成"} tone={entries.length > 0 ? "success" : "muted"} />
        </div>
        {entries.length === 0 ? (
          <p className="emptyStateText">选择分身后即可触发当前步骤生成，结果会在这里展开。</p>
        ) : (
          <dl className="workspaceOutputGrid">
            {entries.map(([key, value]) => (
              <div key={key} className="workspaceOutputItem">
                <dt>{key}</dt>
                <dd>{renderOutputValue(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </Panel>

      {step.stepType === "production" && playableAudioUrl ? (
        <Panel className="studioPanel demoPlayerPanel" aria-labelledby="demo-player-title">
          <div className="studioPanelHeader">
            <div>
              <p className="eyebrow">Demo Player</p>
              <h3 id="demo-player-title">Demo Player</h3>
            </div>
            <StatusBadge label={playableProvider ?? "demo"} tone="accent" />
          </div>
          <audio aria-label="可播放 Demo" controls className="demoAudioPlayer" src={playableAudioUrl} />
        </Panel>
      ) : null}
    </section>
  );
}
