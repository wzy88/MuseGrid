import { PRODUCTION_STEPS } from "@musegrid/core";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

type SevenDayMetricsProps = {
  latestGenerationState: string;
  confirmedSteps: number;
  contributionCount: number;
};

export function SevenDayMetrics({
  latestGenerationState,
  confirmedSteps,
  contributionCount,
}: SevenDayMetricsProps) {
  return (
    <Panel className="studioPanel sevenDayMetricsPanel" aria-labelledby="seven-day-metrics-title">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">Result Snapshot</p>
          <h3 id="seven-day-metrics-title">结果快照</h3>
        </div>
        <StatusBadge label="近 7 天" />
      </div>

      <div className="metricGrid">
        <article className="metricCard">
          <small>最新生成状态</small>
          <strong>{latestGenerationState}</strong>
        </article>
        <article className="metricCard">
          <small>已确认步骤</small>
          <strong>{confirmedSteps}/{PRODUCTION_STEPS.length}</strong>
        </article>
        <article className="metricCard">
          <small>贡献记录</small>
          <strong>{contributionCount} 条</strong>
        </article>
      </div>
    </Panel>
  );
}
