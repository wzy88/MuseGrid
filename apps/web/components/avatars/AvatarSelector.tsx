"use client";

import type { ProductionStepType } from "@musegrid/core";
import type { AvatarRecordView } from "../studio/studio-types";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

const stepLabels: Record<ProductionStepType, string> = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  voice: "选声",
  production: "制作",
};

const portraitToneClasses: Record<ProductionStepType, string> = {
  lyrics: "toneLyrics",
  composition: "toneComposition",
  arrangement: "toneArrangement",
  voice: "toneVoice",
  production: "toneProduction",
};

type AvatarSelectorProps = {
  avatars: AvatarRecordView[];
  currentStep: ProductionStepType;
  selectedAvatarId: string | null;
  onSelectAvatar: (avatarId: string) => void;
  isSaving: boolean;
  isLocked: boolean;
  error: string;
  compact?: boolean;
};

function buildRecommendedReason(avatar: AvatarRecordView, currentStep: ProductionStepType) {
  return `适配${stepLabels[currentStep]}阶段，Level ${avatar.level}，已被召唤 ${avatar.simulatedCallCount} 次。`;
}

function portraitInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase();
}

export function AvatarSelector({
  avatars,
  currentStep,
  selectedAvatarId,
  onSelectAvatar,
  isSaving,
  isLocked,
  error,
  compact = false,
}: AvatarSelectorProps) {
  const content = (
    <>
      <div className={compact ? "avatarSelectorList compact" : "avatarSelectorList"} role="radiogroup" aria-label="创作人分身选择器">
        {avatars.map((avatar) => {
          const checked = selectedAvatarId === avatar.id;
          return (
            <label key={avatar.id} className={checked ? "avatarCard selected" : "avatarCard"}>
              <input
                type="radio"
                name={`avatar-${currentStep}`}
                value={avatar.id}
                checked={checked}
                onChange={() => onSelectAvatar(avatar.id)}
                disabled={isSaving || isLocked}
              />
              <span
                aria-hidden={true}
                className={`avatarPortrait ${portraitToneClasses[currentStep]}`}
              >
                {portraitInitial(avatar.avatarName)}
              </span>
              <div className="avatarCardHeader">
                <div>
                  <strong>{avatar.avatarName}</strong>
                  {compact ? null : <p>{avatar.intro}</p>}
                </div>
                <span className="avatarLevel">Lv.{avatar.level}</span>
              </div>
              <div className="avatarMetaRow">
                <span>{stepLabels[currentStep]}</span>
                <span>{avatar.simulatedCallCount} 次模拟调用</span>
              </div>
              {compact && !checked ? null : (
                <>
                  {compact ? <p className="avatarIntro">{avatar.intro}</p> : null}
                  <div className="avatarTags">
                    {avatar.styleTags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  {compact ? null : <p className="avatarReason">{buildRecommendedReason(avatar, currentStep)}</p>}
                </>
              )}
            </label>
          );
        })}
      </div>
      {error ? <p className="inlineError">{error}</p> : null}
      {isLocked ? <p className="inlineHint">请先确认前一步，当前步骤才会解锁。</p> : null}
      {isSaving ? <p className="inlineHint">正在连接分身到当前步骤…</p> : null}
    </>
  );

  if (compact) {
    return content;
  }

  return (
    <Panel className="studioPanel avatarSelector" aria-labelledby="avatar-selector-title">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">创作人分身</p>
          <h3 id="avatar-selector-title">当前步骤匹配分身</h3>
        </div>
        <StatusBadge label={stepLabels[currentStep]} />
      </div>
      {content}
    </Panel>
  );
}
