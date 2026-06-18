type RevenueSimulationProps = {
  estimatedPlays: number;
  estimatedRemixes: number;
  creatorSharePercent: number;
  avatarSharePercent: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

export function RevenueSimulation({
  estimatedPlays,
  estimatedRemixes,
  creatorSharePercent,
  avatarSharePercent,
}: RevenueSimulationProps) {
  const platformSharePercent = Math.max(0, 100 - creatorSharePercent - avatarSharePercent);

  return (
    <section className="studioPanel revenueSimulationPanel" aria-labelledby="revenue-simulation-title">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">7 天后模拟</p>
          <h3 id="revenue-simulation-title">7 天后模拟</h3>
        </div>
        <span className="studioPill">预计结算</span>
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

      <div className="splitLedger" aria-label="收益拆分">
        <div>
          <span>创作人</span>
          <strong>{creatorSharePercent}%</strong>
        </div>
        <div>
          <span>创作人分身</span>
          <strong>{avatarSharePercent}%</strong>
        </div>
        <div>
          <span>平台</span>
          <strong>{platformSharePercent}%</strong>
        </div>
      </div>
    </section>
  );
}
