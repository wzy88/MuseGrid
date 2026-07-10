import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

type SevenDayMetricItem = {
  label: string;
  value: string;
  deltaLabel: string;
  trend: number[];
};

type SevenDayMetricsProps = {
  updatedAtLabel: string;
  metrics: SevenDayMetricItem[];
};

function buildSparklinePath(values: number[]) {
  if (values.length === 0) {
    return "";
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 28 - ((value - min) / range) * 24;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function SevenDayMetrics({ updatedAtLabel, metrics }: SevenDayMetricsProps) {
  return (
    <Panel className="studioPanel sevenDayMetricsPanel" aria-labelledby="seven-day-metrics-title">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">7 天动向</p>
          <h3 id="seven-day-metrics-title">7 天模拟数据</h3>
        </div>
        <StatusBadge label="近 7 天" />
      </div>

      <p className="metricUpdateLabel">数据更新于 {updatedAtLabel}</p>

      <div className="sevenDayMetricList">
        {metrics.map((metric) => (
          <article className="sevenDayMetricCard" key={metric.label}>
            <div className="sevenDayMetricText">
              <small>{metric.label}</small>
              <strong>{metric.value}</strong>
              <span>{metric.deltaLabel}</span>
            </div>
            <svg className="sevenDayMetricSparkline" viewBox="0 0 100 32" aria-hidden="true">
              <path d={buildSparklinePath(metric.trend)} pathLength="100" />
            </svg>
          </article>
        ))}
      </div>
    </Panel>
  );
}
