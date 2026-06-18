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
          <p className="eyebrow">Avatar Evolution Core</p>
          <h3 id="avatar-evolution-core-title">创作人分身演化核心</h3>
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
        <p>
          当前处于 {statusLabel} 阶段。创作人分身从 Level 1 起步，后续升级取决于真实协作调用数据，以及创作人本人持续补样本、答问卷和纠偏输出。
        </p>
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
