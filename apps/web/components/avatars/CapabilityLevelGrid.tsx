type CapabilityDirectionCard = {
  key: string;
  label: string;
  level: number | null;
  stateLabel: string;
  summary: string;
  isActive: boolean;
};

type CapabilityLevelGridProps = {
  directions: CapabilityDirectionCard[];
};

export function CapabilityLevelGrid({ directions }: CapabilityLevelGridProps) {
  return (
    <section className="studioPanel capabilityLevelGrid" aria-labelledby="capability-level-grid-title">
      <div className="studioPanelHeader">
        <div>
          <p className="eyebrow">Capability Matrix</p>
          <h3 id="capability-level-grid-title">能力线等级矩阵</h3>
        </div>
      </div>

      <div className="capabilityLevelGridList" role="list">
        {directions.map((direction) => (
          <article
            className={direction.isActive ? "capabilityCard active" : "capabilityCard"}
            key={direction.key}
            role="listitem"
          >
            <div className="capabilityCardHeader">
              <strong>{direction.label}</strong>
              <span>{direction.level ? `Level ${direction.level}` : direction.stateLabel}</span>
            </div>
            <p className="capabilityCardState">
              {direction.label} {direction.stateLabel}
            </p>
            <p>{direction.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
