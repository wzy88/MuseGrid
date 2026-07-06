import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

type AvatarEvolutionCoreProps = {
  avatarName: string;
  directionLabel: string;
  level: number;
  statusLabel: string;
  simulatedCallCount: number;
  maintenanceScore: number;
};

export function AvatarEvolutionCore({
  avatarName,
  directionLabel,
  level,
  statusLabel,
  simulatedCallCount,
  maintenanceScore,
}: AvatarEvolutionCoreProps) {
  return (
    <Panel className="studioPanel avatarEvolutionCore" aria-labelledby="avatar-evolution-core-title">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">Primary Avatar</p>
          <h3 id="avatar-evolution-core-title">当前主分身</h3>
        </div>
        <StatusBadge label={directionLabel} tone="accent" />
      </div>

      <div className="avatarCoreDial" aria-label="创作人分身当前等级">
        <div className="avatarCoreDialOuter">
          <div className="avatarCoreDialInner">
            <span>Level</span>
            <strong>{level}</strong>
          </div>
        </div>
      </div>

      <div className="avatarCoreIdentity">
        <strong>{avatarName}</strong>
        <p>当前处于 {statusLabel} 阶段，后续升级取决于真实调用和持续维护记录。</p>
      </div>

      <dl className="avatarCoreStats">
        <div>
          <dt>模拟调用</dt>
          <dd>{simulatedCallCount}</dd>
        </div>
        <div>
          <dt>维护完成度</dt>
          <dd>{maintenanceScore}%</dd>
        </div>
        <div>
          <dt>当前能力线</dt>
          <dd>{directionLabel}</dd>
        </div>
      </dl>
    </Panel>
  );
}
