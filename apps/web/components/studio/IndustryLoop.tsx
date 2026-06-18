const loopNodes = ["灵感", "分身", "Demo", "发布", "二创", "收益", "分身成长"];

export function IndustryLoop() {
  return (
    <section className="industryLoop" aria-labelledby="industry-loop-title">
      <div className="panelHeader">
        <p className="eyebrow">Industry Loop</p>
        <h2 id="industry-loop-title">创作会在系统里持续回流</h2>
      </div>
      <ol className="loopTrack" aria-label="MuseGrid 创作循环">
        {loopNodes.map((node, index) => (
          <li key={node}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {node}
          </li>
        ))}
      </ol>
      <a className="creatorEntry" href="/become-creator">
        成为创作人
      </a>
    </section>
  );
}
