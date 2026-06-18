import type { ProductionStepType } from "@musegrid/core";
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
  selectedAvatar: AvatarRecordView | null;
  currentStep: ProductionStepType;
};

export function ContributionChain({
  contributions,
  avatarsById,
  selectedAvatar,
  currentStep,
}: ContributionChainProps) {
  return (
    <aside className="studioSidebarStack">
      <section className="studioPanel contributionFocus" aria-labelledby="selected-avatar-title">
        <div className="studioPanelHeader">
          <div>
            <p className="eyebrow">当前接入</p>
            <h3 id="selected-avatar-title">选中的创作人分身</h3>
          </div>
          <span className="studioPill">{stepLabels[currentStep]}</span>
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
      </section>

      <section className="studioPanel contributionChain" aria-labelledby="contribution-chain-title" aria-label="Contribution Chain">
        <div className="studioPanelHeader">
          <div>
            <p className="eyebrow">Contribution Chain</p>
            <h3 id="contribution-chain-title">贡献链路</h3>
          </div>
          <span className="studioPill">{contributions.length}/4</span>
        </div>
        <div className="contributionChainList">
          {contributions.length === 0 ? (
            <p className="emptyStateText">确认每一步后，会在这里记录分身贡献、等级与结果摘要。</p>
          ) : (
            contributions.map((contribution) => {
              const avatar = avatarsById[contribution.avatarId];
              return (
                <article key={contribution.id} className="contributionItem">
                  <div className="contributionNode" aria-hidden="true" />
                  <div className="contributionBody">
                    <div className="contributionHeader">
                      <strong>{stepLabels[contribution.stepType]}</strong>
                      <span>{avatar?.avatarName ?? "创作人分身"}</span>
                    </div>
                    <p>{contribution.outputSummary}</p>
                    <small>Level {contribution.avatarLevelAtTime} · 贡献权重 {contribution.contributionWeight}%</small>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </aside>
  );
}
