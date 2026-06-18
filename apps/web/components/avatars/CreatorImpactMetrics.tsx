type GrowthStep = {
  label: string;
  detail: string;
  active: boolean;
};

type CreatorImpactMetricsProps = {
  growthSteps: GrowthStep[];
  simulatedIncome: string;
  simulatedCalls: number;
  maintenanceCompletion: number;
};

export function CreatorImpactMetrics({
  growthSteps,
  simulatedIncome,
  simulatedCalls,
  maintenanceCompletion,
}: CreatorImpactMetricsProps) {
  return (
    <section className="studioPanel creatorImpactMetrics" aria-labelledby="creator-impact-metrics-title">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">Growth And Impact</p>
          <h3 id="creator-impact-metrics-title">成长轨迹与影响指标</h3>
        </div>
        <span className="studioPill">模拟沙盘</span>
      </div>

      <div className="growthTimeline" role="list" aria-label="成长时间线">
        {growthSteps.map((step) => (
          <article className={step.active ? "timelineStep active" : "timelineStep"} key={step.label} role="listitem">
            <strong>{step.label}</strong>
            <p>{step.detail}</p>
          </article>
        ))}
      </div>

      <div className="creatorImpactMetricGrid">
        <article className="metricCard">
          <small>预估收入（模拟）</small>
          <strong>{simulatedIncome}</strong>
        </article>
        <article className="metricCard">
          <small>累计调用（模拟）</small>
          <strong>{simulatedCalls}</strong>
        </article>
        <article className="metricCard">
          <small>维护完成度</small>
          <strong>{maintenanceCompletion}%</strong>
        </article>
      </div>
    </section>
  );
}
