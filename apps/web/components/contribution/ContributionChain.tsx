import type { ProductionStepType } from "@musegrid/core";
import { PRODUCTION_STEPS } from "@musegrid/core";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";
import type { AvatarRecordView, ContributionRecordView } from "../studio/studio-types";

const stepLabels: Record<ProductionStepType, string> = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  voice: "选声",
  production: "制作",
};

function formatContributionTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(date);
}

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
              <div>
                <strong>{selectedAvatar.avatarName}</strong>
                <span>Lv.{selectedAvatar.level} · {selectedAvatar.simulatedCallCount} 次调用</span>
              </div>
              <p>{selectedAvatar.intro}</p>
              <div className="avatarTags">
                {selectedAvatar.styleTags.slice(0, 3).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          ) : (
            <p className="emptyStateText">先为当前步骤选择一个创作人分身，右侧贡献链路会随确认逐步点亮。</p>
          )}
        </Panel>
      )}

      <Panel className="studioPanel contributionChain compactContributionChain" aria-labelledby="contribution-chain-title" aria-label="Contribution Chain">
        <div className="studioPanelHeader">
          <div>
            <p className="eyebrow">Contribution Chain</p>
            <h3 id="contribution-chain-title">贡献链路</h3>
          </div>
          <StatusBadge label={progressLabel ?? `${contributions.length}/${PRODUCTION_STEPS.length}`} tone="accent" />
        </div>
        {contributions.length === 0 ? (
          <p className="emptyStateText">确认每一步后，会在这里记录分身贡献、等级与结果摘要。</p>
        ) : (
          <ol className="compactContributionList" aria-label="Contribution Chain">
            {contributions.map((contribution) => {
              const avatar = avatarsById[contribution.avatarId];
              const isSelfAuthored = contribution.avatarId === "self";
              const contributorName = isSelfAuthored ? "本人创作" : avatar?.avatarName ?? "创作人分身";
              const avatarBadge = contributorName.slice(0, 1);
              return (
                <li key={contribution.id} className="compactContributionItem">
                  <span className="compactContributionDot" aria-hidden="true" />
                  <span className="compactContributionAvatar" aria-hidden="true">
                    {avatarBadge}
                  </span>
                  <div>
                    <strong>{stepLabels[contribution.stepType]}</strong>
                    <span>{contributorName}</span>
                    <small>{`Lv.${contribution.avatarLevelAtTime} / ${contribution.contributionWeight}%`}</small>
                    <time dateTime={contribution.createdAt}>{formatContributionTime(contribution.createdAt)}</time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </aside>
  );
}
