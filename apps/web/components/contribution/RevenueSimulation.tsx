import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

type RevenueSimulationProps = {
  estimatedRevenueValue: number;
  estimatedPlays: number;
  estimatedRemixes: number;
  creatorSharePercent: number;
  avatarSharePercent: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

export function RevenueSimulation({
  estimatedRevenueValue,
  estimatedPlays,
  estimatedRemixes,
  creatorSharePercent,
  avatarSharePercent,
}: RevenueSimulationProps) {
  const platformSharePercent = Math.max(0, 100 - creatorSharePercent - avatarSharePercent);
  const revenueSplit = [
    { label: "播放收益", percent: creatorSharePercent, tone: "creator" },
    { label: "二创收益", percent: avatarSharePercent, tone: "avatar" },
    { label: "分成池激励", percent: platformSharePercent, tone: "platform" },
  ] as const;

  return (
    <Panel className="studioPanel revenueSimulationPanel" aria-labelledby="revenue-simulation-title">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">7 天后模拟</p>
          <h3 id="revenue-simulation-title">模拟创收（未来 7 天）</h3>
        </div>
        <StatusBadge label="预计结算" tone="success" />
      </div>

      <div className="revenueHeadline">
        <div>
          <small>模拟创收</small>
          <strong>¥{estimatedRevenueValue.toFixed(2)}</strong>
        </div>
        <span>较前 7 日 +42%</span>
      </div>

      <div className="revenueBody">
        <div
          className="revenueDonut"
          aria-hidden="true"
          style={{
            background: `conic-gradient(
              rgba(103, 232, 205, 0.92) 0 ${creatorSharePercent}%,
              rgba(241, 183, 101, 0.92) ${creatorSharePercent}% ${creatorSharePercent + avatarSharePercent}%,
              rgba(237, 246, 244, 0.16) ${creatorSharePercent + avatarSharePercent}% 100%
            )`,
          }}
        >
          <span>{formatNumber(estimatedPlays)}</span>
        </div>

        <div className="revenueBreakdown" aria-label="收益拆分">
          {revenueSplit.map((item) => (
            <div className={`revenueBreakdownRow revenueBreakdownRow--${item.tone}`} key={item.label}>
              <div>
                <span>{item.label}</span>
                <strong>{item.percent}%</strong>
              </div>
              <div className="revenueBreakdownBar">
                <span style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="metricStrip">
        <article className="metricCard">
          <small>预估播放</small>
          <strong>{formatNumber(estimatedPlays)}</strong>
        </article>
        <article className="metricCard">
          <small>预估二创</small>
          <strong>{formatNumber(estimatedRemixes)}</strong>
        </article>
      </div>
    </Panel>
  );
}
