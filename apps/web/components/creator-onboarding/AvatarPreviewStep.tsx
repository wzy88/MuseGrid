type AvatarPreviewValue = {
  displayName: string;
  tagline: string;
  styleTags: string;
  caseDescription: string;
  directionLabel: string;
};

type AvatarPreviewStepProps = {
  value: AvatarPreviewValue;
};

function toStyleTagList(styleTags: string) {
  return styleTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function AvatarPreviewStep({ value }: AvatarPreviewStepProps) {
  const parsedTags = toStyleTagList(value.styleTags);

  return (
    <section className="creatorStepSection" aria-labelledby="creator-preview-title">
      <div className="creatorStepHeader">
        <p className="eyebrow">Step 4</p>
        <h2 id="creator-preview-title">预览你的 Level 1 创作人分身</h2>
        <p>
          每位创作人都会从 Level 1 开始。创建成功后，你还需要持续补充作品样本、回答校准问题、纠正分身输出，分身才会稳定成长。
        </p>
      </div>

      <div className="creatorPreviewCard">
        <div className="creatorPreviewMeta">
          <span className="creatorPreviewLevel">Level 1 创作人分身</span>
          <h3>{value.displayName || "待命名创作人分身"}</h3>
          <p>{value.tagline || "系统会先根据你的档案生成一个可持续校准的初始分身。"}</p>
        </div>

        <dl className="creatorPreviewFacts">
          <div>
            <dt>方向</dt>
            <dd>{value.directionLabel}</dd>
          </div>
          <div>
            <dt>擅长标签</dt>
            <dd>{parsedTags.length > 0 ? parsedTags.join(" / ") : "待你继续补充"}</dd>
          </div>
          <div>
            <dt>起始案例</dt>
            <dd>{value.caseDescription || "暂未填写案例描述"}</dd>
          </div>
        </dl>

        <div className="creatorPreviewGrowth">
          <h4>成长任务</h4>
          <ul>
            <li>继续补充作品样本，让分身学会你的取舍标准。</li>
            <li>持续回答校准问题，明确风格边界与禁区。</li>
            <li>在真实协作里纠正分身输出，帮助它迭代判断。</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
