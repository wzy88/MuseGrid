import type { ProductionStepType } from "@musegrid/core";
import { NodeGraph } from "../ui/NodeGraph";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";
import type { AvatarRecordView, ContributionRecordView } from "../studio/studio-types";

const stepLabels: Record<ProductionStepType, string> = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  production: "制作",
};

type ContributionChainProps = {
  contributions: ContributionRecordView[];
  avatarsById: Record<string, AvatarRecordView>;
  selectedAvatar?: AvatarRecordView | null;
  currentStep?: ProductionStepType;
  hideSelectedAvatar?: boolean;
  progressLabel?: string;
};

export function ContributionChain({
  contributions,
  avatarsById,
  selectedAvatar = null,
  currentStep = "production",
  hideSelectedAvatar = false,
  progressLabel,
}: ContributionChainProps) {
  return (
    <aside className="studioSidebarStack">
      {hideSelectedAvatar ? null : (
        <Panel className="studioPanel contributionFocus" aria-labelledby="selected-avatar-title">
          <div className="studioPanelHeader">
            <div>
              <p className="eyebrow">当前接入</p>
              <h3 id="selected-avatar-title">选中的创作人分身</h3>
            </div>
            <StatusBadge label={stepLabels[currentStep]} tone="accent" />
          </div>
          {selectedAvatar ? (
            <div className="selectedAvatarSummary">
              <strong>{selectedAvatar.avatarName}</strong>
              <p>{selectedAvatar.intro}</p>
              <div className="avatarTags">
                {selectedAvatar.styleTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          ) : (
            <p className="emptyStateText">先为当前步骤选择一个创作人分身，右侧贡献链路会随确认逐步点亮。</p>
          )}
        </Panel>
      )}

      <Panel className="studioPanel contributionChain" aria-labelledby="contribution-chain-title" aria-label="Contribution Chain">
        <div className="studioPanelHeader">
          <div>
            <p className="eyebrow">Contribution Chain</p>
            <h3 id="contribution-chain-title">贡献链路</h3>
          </div>
          <StatusBadge label={progressLabel ?? `${contributions.length}/4`} tone="accent" />
        </div>
        {contributions.length === 0 ? (
          <p className="emptyStateText">确认每一步后，会在这里记录分身贡献、等级与结果摘要。</p>
        ) : (
          <NodeGraph
            ariaLabel="Contribution Chain"
            items={contributions.map((contribution) => {
              const avatar = avatarsById[contribution.avatarId];
              return {
                id: contribution.id,
                title: stepLabels[contribution.stepType],
                meta: avatar?.avatarName ?? "创作人分身",
                detail: `${contribution.outputSummary}\nLevel ${contribution.avatarLevelAtTime} · 贡献权重 ${contribution.contributionWeight}%`,
              };
            })}
          />
        )}
      </Panel>
    </aside>
  );
}
