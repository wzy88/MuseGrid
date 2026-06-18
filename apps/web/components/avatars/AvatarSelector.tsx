"use client";

import type { ProductionStepType } from "@musegrid/core";
import type { AvatarRecordView } from "../studio/studio-types";

const stepLabels: Record<ProductionStepType, string> = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  production: "制作",
};

type AvatarSelectorProps = {
  avatars: AvatarRecordView[];
  currentStep: ProductionStepType;
  selectedAvatarId: string | null;
  onSelectAvatar: (avatarId: string) => void;
  isSaving: boolean;
  error: string;
};

function buildRecommendedReason(avatar: AvatarRecordView, currentStep: ProductionStepType) {
  return `适配${stepLabels[currentStep]}阶段，Level ${avatar.level}，已被召唤 ${avatar.simulatedCallCount} 次。`;
}

export function AvatarSelector({
  avatars,
  currentStep,
  selectedAvatarId,
  onSelectAvatar,
  isSaving,
  error,
}: AvatarSelectorProps) {
  return (
    <section className="studioPanel avatarSelector" aria-labelledby="avatar-selector-title">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">创作人分身</p>
          <h3 id="avatar-selector-title">当前步骤匹配分身</h3>
        </div>
        <span className="studioPill">{stepLabels[currentStep]}</span>
      </div>
      <div className="avatarSelectorList" role="radiogroup" aria-label="创作人分身选择器">
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
                disabled={isSaving}
              />
              <div className="avatarCardHeader">
                <div>
                  <strong>{avatar.avatarName}</strong>
                  <p>{avatar.intro}</p>
                </div>
                <span className="avatarLevel">Lv.{avatar.level}</span>
              </div>
              <div className="avatarMetaRow">
                <span>{stepLabels[currentStep]}</span>
                <span>{avatar.simulatedCallCount} 次模拟调用</span>
              </div>
              <div className="avatarTags">
                {avatar.styleTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p className="avatarReason">{buildRecommendedReason(avatar, currentStep)}</p>
            </label>
          );
        })}
      </div>
      {error ? <p className="inlineError">{error}</p> : null}
      {isSaving ? <p className="inlineHint">正在连接分身到当前步骤…</p> : null}
    </section>
  );
}
