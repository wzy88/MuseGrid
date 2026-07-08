import type { ProductionStepType } from "@musegrid/core";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";
import type { AvatarRecordView, StepRecord } from "./studio-types";

export type CreationMode = "self" | "avatar";

const stepLabels: Record<ProductionStepType, string> = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  voice: "选声",
  production: "制作",
};

const selfPrompts: Record<ProductionStepType, string> = {
  lyrics: "直接写歌词草案、Hook 或完整段落。",
  composition: "写下旋律走向、段落结构、速度和 Hook 记忆点。",
  arrangement: "写下配器、节奏、能量推进和音色想法。",
  voice: "写下主唱声线、演唱质感、咬字方式和情绪表达。",
  production: "写下最终制作方向、人声质感、混音重点和 Demo 目标。",
};

const avatarPrompts: Record<ProductionStepType, string> = {
  lyrics: "选择作词分身，生成歌词草案后再人工编辑。",
  composition: "选择作曲分身，生成旋律结构后再人工校正。",
  arrangement: "选择编曲分身，生成编曲方案后再人工取舍。",
  voice: "选择声音分身，确定主唱声线后再进入最终制作。",
  production: "选择制作分身，整理可生成 Demo 的最终提示词。",
};

const summonMissionCopy: Record<ProductionStepType, string> = {
  lyrics: "召唤作词分身，把灵感整理成歌词草案、Hook 和段落。",
  composition: "召唤作曲分身，把歌词推进成旋律结构和段落动线。",
  arrangement: "召唤编曲分身，把旋律翻译成配器、节奏和能量变化。",
  voice: "召唤声音分身，为歌曲选择主唱声线、演唱方式和情绪质感。",
  production: "召唤制作分身，把前面成果整理成可生成 Demo 的制作方案。",
};

const textAreaLabels: Record<ProductionStepType, string> = {
  lyrics: "歌词内容",
  composition: "作曲说明",
  arrangement: "编曲说明",
  voice: "声音说明",
  production: "制作说明",
};

const summonButtonLabels: Record<ProductionStepType, string> = {
  lyrics: "召唤他作词",
  composition: "召唤他作曲",
  arrangement: "召唤他编曲",
  voice: "召唤他选声",
  production: "召唤他制作",
};

const creatorRoleLabels: Record<ProductionStepType, string> = {
  lyrics: "作词创作人",
  composition: "作曲创作人",
  arrangement: "编曲创作人",
  voice: "声音分身",
  production: "制作创作人",
};

const modeTitles: Record<CreationMode, string> = {
  self: "自己完成这一环",
  avatar: "召唤创作人分身",
};

const guideCopy: Record<CreationMode | "", string> = {
  "": "先选择方式，页面会只展开你当前需要处理的内容。",
  self: "写好你的版本后确认，系统会把这一环记为本人创作。",
  avatar: "召唤分身协作，编辑草案后确认进入下一环。",
};

const nextActionCopy: Record<CreationMode | "", string> = {
  "": "先在上方选择“自己写”或“召唤分身”。",
  self: "写好内容后，确认进入下一环。",
  avatar: "先召唤生成草案，满意后确认进入下一环。",
};

const selectedModeLabels: Record<CreationMode, string> = {
  self: "自己写",
  avatar: "分身协作",
};

const selectedModeDescriptions: Record<CreationMode, string> = {
  self: "下方已切换到手写输入区，确认后将记为本人创作。",
  avatar: "下方已切换到分身召唤区，先选择创作人再生成草案。",
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
  creationMode: CreationMode | "";
  selfDraft: string;
  generatedDraft: string;
  revisionNote: string;
  avatars: AvatarRecordView[];
  selectedAvatarId: string | null;
  isSelectingAvatar: boolean;
  avatarError: string;
  onModeChange: (mode: CreationMode) => void;
  onSelfDraftChange: (value: string) => void;
  onGeneratedDraftChange: (value: string) => void;
  onRevisionNoteChange: (value: string) => void;
  onSelectAvatar: (avatarId: string) => void;
  onGenerate: () => void;
  onRevise: () => void;
  onConfirm: () => void;
  playableAudioUrl?: string | null;
  playableProvider?: string | null;
  isGeneratingDemo?: boolean;
};

function actionLabels(stepType: ProductionStepType) {
  switch (stepType) {
    case "lyrics":
      return {
        generate: "召唤作词",
        confirm: "确认作词成果，进入作曲",
      };
    case "composition":
      return {
        generate: "召唤作曲",
        confirm: "确认作曲成果，进入编曲",
      };
    case "arrangement":
      return {
        generate: "召唤编曲",
        confirm: "确认编曲成果，进入选声",
      };
    case "voice":
      return {
        generate: "召唤选声",
        confirm: "确认声音方向，进入制作",
      };
    case "production":
      return {
        generate: "召唤制作",
        confirm: "确认制作成果，生成 Demo",
      };
  }
}

function outputEntries(outputPayload: unknown) {
  if (!outputPayload || typeof outputPayload !== "object" || Array.isArray(outputPayload)) {
    return [];
  }

  return Object.entries(outputPayload as Record<string, unknown>).filter(([key]) => key !== "sourceType" && key !== "label");
}

function renderOutputValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(" / ");
  }
  return typeof value === "string" ? value : JSON.stringify(value);
}

function extractOutputText(outputPayload: unknown) {
  const entries = outputEntries(outputPayload);
  const preferred = entries.find(([key]) => key === "fullLyricDraft" || key === "text" || key === "finalPrompt" || key === "draft");
  const value = preferred?.[1] ?? entries[0]?.[1] ?? "";
  return renderOutputValue(value);
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

function portraitInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase();
}

function fitReason(avatar: AvatarRecordView, stepType: ProductionStepType) {
  const style = avatar.styleTags.slice(0, 2).join(" / ");
  const styleText = style ? `，偏${style}` : "";
  return `适合当前${stepLabels[stepType]}任务${styleText}`;
}

function orderedAvatars(avatars: AvatarRecordView[], selectedAvatarId: string | null) {
  const sorted = [...avatars].sort((left, right) => {
    if (left.id === selectedAvatarId) {
      return -1;
    }
    if (right.id === selectedAvatarId) {
      return 1;
    }
    return right.level - left.level || right.simulatedCallCount - left.simulatedCallCount;
  });

  return sorted.slice(0, 4);
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
  creationMode,
  selfDraft,
  generatedDraft,
  revisionNote,
  avatars,
  selectedAvatarId,
  isSelectingAvatar,
  avatarError,
  onModeChange,
  onSelfDraftChange,
  onGeneratedDraftChange,
  onRevisionNoteChange,
  onSelectAvatar,
  onGenerate,
  onRevise,
  onConfirm,
  playableAudioUrl,
  playableProvider,
  isGeneratingDemo,
}: StepWorkspaceProps) {
  const labels = actionLabels(step.stepType);
  const entries = outputEntries(step.outputPayload);
  const outputText = generatedDraft || extractOutputText(step.outputPayload);
  const hasResult = entries.length > 0 || outputText.trim().length > 0;
  const hasDirectDraftEdit = generatedDraft.trim().length > 0;
  const canGenerate = !isLocked && creationMode === "avatar" && Boolean(selectedAvatarId) && !isGenerating && !isConfirming && !isGeneratingDemo;
  const canConfirmSelf = creationMode === "self" && selfDraft.trim().length > 0;
  const canConfirmAvatar = creationMode === "avatar" && hasResult;
  const canConfirm = !isLocked && (canConfirmSelf || canConfirmAvatar) && !isGenerating && !isConfirming && !isGeneratingDemo;
  const canRevise = !isLocked && creationMode === "avatar" && hasResult && (revisionNote.trim().length > 0 || hasDirectDraftEdit) && !isGenerating && !isConfirming && !isGeneratingDemo;
  const taskStatus = error ? error : statusMessage;
  const activeStageLabel = creationMode === "avatar" && hasResult ? "分身已交付" : creationMode === "avatar" ? "召唤分身" : creationMode === "self" ? "填写内容" : "待选择";
  const confirmDisabledReason = creationMode === "avatar" && !hasResult ? "生成草案后可进入下一步" : creationMode === "self" && !selfDraft.trim() ? "填写内容后可进入下一步" : nextActionCopy[creationMode];
  const visibleAvatars = orderedAvatars(avatars, selectedAvatarId);
  const selectedAvatar = avatars.find((avatar) => avatar.id === selectedAvatarId) ?? null;

  return (
    <section className="stepWorkspace" aria-labelledby="step-workspace-title">
      <div className="stepWorkspaceHero">
        <div>
          <p className="eyebrow">当前创作环节</p>
          <h2 id="step-workspace-title">{stepLabels[step.stepType]}</h2>
          <p className="workspaceLead">{creationMode ? modeTitles[creationMode] : "先选择创作方式，再继续。"}</p>
        </div>
        <div className="workspaceContext">
          <span>{projectTitle}</span>
          <span>{selectedAvatarName ?? "尚未召唤分身"}</span>
        </div>
      </div>

      <Panel className="studioPanel workspaceTaskPanel">
        <div className="workspaceTaskHeader">
          <div>
            <p className="eyebrow">主线任务</p>
            <h3>{activeStageLabel}</h3>
            <p>{guideCopy[creationMode]}</p>
          </div>
          <StatusBadge label={taskStatus} tone={error ? "danger" : stepStatusTone(step.status)} />
        </div>
        <div className="choiceModePrompt">
          <p className="eyebrow">创作方式</p>
          <h3>这一步你想怎么完成？</h3>
          <p>选一个方式后，页面只展开对应的操作内容。</p>
        </div>
        <div className="creationModeSegmented" role="radiogroup" aria-label={`${stepLabels[step.stepType]}创作方式`}>
          <button
            type="button"
            role="radio"
            aria-checked={creationMode === "self"}
            className={creationMode === "self" ? "modeSegmentButton active" : "modeSegmentButton"}
            onClick={() => onModeChange("self")}
            disabled={isLocked}
          >
            <span className="modeSegmentKicker">不召唤</span>
            {creationMode === "self" ? <span className="modeSelectedBadge">已选择</span> : null}
            <strong>自己写</strong>
            <span>{selfPrompts[step.stepType]}</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={creationMode === "avatar"}
            className={creationMode === "avatar" ? "modeSegmentButton active" : "modeSegmentButton"}
            onClick={() => onModeChange("avatar")}
            disabled={isLocked}
          >
            <span className="modeSegmentKicker">推荐路径</span>
            {creationMode === "avatar" ? <span className="modeSelectedBadge">已选择</span> : null}
            <strong>召唤创作人分身</strong>
            <span>{avatarPrompts[step.stepType]}</span>
          </button>
        </div>
        {creationMode ? (
          <div className="creationModeStatus" role="status" aria-live="polite">
            <strong>当前模式：{selectedModeLabels[creationMode]}</strong>
            <span>{selectedModeDescriptions[creationMode]}</span>
          </div>
        ) : null}

        {creationMode === "self" ? (
          <div className="workspaceStage">
            <div className="workspaceStageHeader">
              <p className="eyebrow">当前输入</p>
              <h3>填写你的版本</h3>
            </div>
            <label className="workspaceEditorLabel" htmlFor={`self-editor-${step.id}`}>
              {textAreaLabels[step.stepType]}
            </label>
            <textarea
              id={`self-editor-${step.id}`}
              className="workspaceEditor"
              value={selfDraft}
              onChange={(event) => onSelfDraftChange(event.target.value)}
              placeholder={selfPrompts[step.stepType]}
              rows={10}
            />
          </div>
        ) : null}

        {creationMode === "avatar" ? (
          <div className="summonStation">
            <div className="summonStationHeader">
              <div>
                <p className="eyebrow">召唤创作人分身</p>
                <h3>选择一个适合当前环节的创作人</h3>
                <p>{summonMissionCopy[step.stepType]}</p>
              </div>
              <a className="summonCreatorLink" href="/become-creator">
                创建我的创作人分身，等待别人召唤
              </a>
            </div>
            <div className="summonStationBody">
              <div className="summonAvatarPane">
                <div className="summonPaneTitle">
                  <div>
                    <span>最近召唤</span>
                    <strong>推荐创作人</strong>
                  </div>
                  <a href="/avatar-dashboard">查看更多创作人</a>
                </div>
                <div className="summonCreatorGrid" role="radiogroup" aria-label="创作人分身选择器">
                  {visibleAvatars.length > 0 ? visibleAvatars.map((avatar) => {
                    const checked = selectedAvatarId === avatar.id;
                    return (
                      <label key={avatar.id} className={checked ? "summonCreatorCard selected" : "summonCreatorCard"}>
                        <input
                          type="radio"
                          name={`summon-avatar-${step.stepType}`}
                          value={avatar.id}
                          checked={checked}
                          onChange={() => onSelectAvatar(avatar.id)}
                          disabled={isSelectingAvatar || isLocked}
                        />
                        <span className="summonCreatorPortrait" aria-hidden="true">
                          {portraitInitial(avatar.avatarName)}
                        </span>
                        <span className="summonCreatorCopy">
                          <strong>{avatar.avatarName}</strong>
                          <small>{creatorRoleLabels[step.stepType]} · Lv.{avatar.level}</small>
                          <em>{fitReason(avatar, step.stepType)}</em>
                        </span>
                        <span className="summonCreatorTags" aria-hidden="true">
                          {avatar.styleTags.slice(0, 2).map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </span>
                      </label>
                    );
                  }) : <p className="emptyStateText">当前环节还没有可召唤的创作人分身。</p>}
                </div>
                {avatarError ? <p className="inlineError">{avatarError}</p> : null}
                {isLocked ? <p className="inlineHint">请先确认前一步，当前步骤才会解锁。</p> : null}
                {isSelectingAvatar ? <p className="inlineHint">正在连接创作人分身…</p> : null}
              </div>
              <div className="summonActionPane">
                <div className="summonActionHalo" aria-hidden="true">
                  <span className="summonSignal" />
                </div>
                <span className="summonStepKicker">{selectedAvatar ? "已选创作人分身" : "等待选择"}</span>
                <strong>{selectedAvatarName ?? "先选一个创作人分身"}</strong>
                <p>{selectedAvatar ? `${selectedAvatar.avatarName} 会基于项目设定交付一版可编辑草案。` : "选择左侧卡片后，就可以召唤分身协作当前环节。"}</p>
                <Button type="button" className="primaryWorkspaceButton summonButton" onClick={onGenerate} disabled={!canGenerate} loading={isGenerating || isGeneratingDemo}>
                  {isGenerating || isGeneratingDemo ? "正在召唤…" : summonButtonLabels[step.stepType]}
                </Button>
                {hasResult ? (
                  <button type="button" className="summonAgainButton" onClick={onGenerate} disabled={!canGenerate || isGenerating || isGeneratingDemo}>
                    继续召唤其他分身
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {creationMode === "avatar" && hasResult ? (
          <div className="workspaceStage workspaceResultStage avatarDeliveryStage">
            <div className="workspaceStageHeader">
              <div>
                <p className="eyebrow">修订工作区</p>
                <h3>{selectedAvatarName ? `${selectedAvatarName} 交付了一版草案` : "分身交付了一版草案"}</h3>
              </div>
              <span className="deliveryHint">可直接编辑</span>
            </div>
            <label className="workspaceEditorLabel" htmlFor={`generated-editor-${step.id}`}>
              草案内容
            </label>
            <textarea
              id={`generated-editor-${step.id}`}
              className="workspaceEditor"
              value={outputText}
              onChange={(event) => onGeneratedDraftChange(event.target.value)}
              rows={10}
            />
            <div className="revisionWorkbench">
              <div className="revisionCopy">
                <p className="eyebrow">修改意见</p>
                <strong>不满意就继续提要求</strong>
                <span>让当前创作人分身按你的意见再改一版，也可以直接编辑上方草案。</span>
              </div>
              <label className="workspaceEditorLabel" htmlFor={`revision-note-${step.id}`}>
                修改意见
              </label>
              <textarea
                id={`revision-note-${step.id}`}
                className="revisionNoteEditor"
                value={revisionNote}
                onChange={(event) => onRevisionNoteChange(event.target.value)}
                placeholder="例如：副歌再口语一点，保留夜航感，但减少生硬的意象。"
                rows={4}
              />
              <div className="revisionActions">
                <Button
                  type="button"
                  className={canRevise ? "secondaryWorkspaceButton readyRevisionButton" : "secondaryWorkspaceButton"}
                  data-state={canRevise ? "ready" : "idle"}
                  onClick={onRevise}
                  disabled={!canRevise}
                  loading={isGenerating}
                >
                  {isGenerating ? "正在修改…" : "让分身继续修改"}
                </Button>
                <button
                  type="button"
                  className="disabledCompareAvatarButton"
                  disabled
                  title="对比分身将在后续版本开放"
                >
                  选择对比分身
                </button>
                <span>满意后再确认进入下一步。</span>
              </div>
            </div>
            <details className="workspaceRawOutput">
              <summary>查看结构化结果</summary>
              <dl className="workspaceOutputGrid">
                {entries.map(([key, value]) => (
                  <div key={key} className="workspaceOutputItem">
                    <dt>{key}</dt>
                    <dd>{renderOutputValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </div>
        ) : null}

        {error ? <p className="inlineError">{error}</p> : null}
        <div className={canConfirm ? "workspaceActionDock" : "workspaceActionDock disabled"}>
          <div>
            <p className="eyebrow">下一步操作</p>
            <strong>{canConfirm ? labels.confirm : confirmDisabledReason}</strong>
          </div>
          <Button
            type="button"
            className="primaryWorkspaceButton"
            onClick={onConfirm}
            disabled={!canConfirm}
            loading={isConfirming || isGeneratingDemo}
          >
            {isConfirming || isGeneratingDemo ? "正在处理…" : labels.confirm}
          </Button>
        </div>
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
