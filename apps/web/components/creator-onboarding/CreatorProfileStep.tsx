type CreatorProfileValue = {
  displayName: string;
  tagline: string;
  styleTags: string;
  experience: string;
  caseDescription: string;
};

type CreatorProfileStepProps = {
  value: CreatorProfileValue;
  onChange: (field: keyof CreatorProfileValue, nextValue: string) => void;
};

export function CreatorProfileStep({ value, onChange }: CreatorProfileStepProps) {
  return (
    <section className="creatorStepSection" aria-labelledby="creator-profile-title">
      <div className="creatorStepHeader">
        <p className="eyebrow">Step 2</p>
        <h2 id="creator-profile-title">补齐创作人档案</h2>
        <p>这部分会成为分身的初始设定。后续你仍然需要持续补充作品样本、修正输出和回答校准问题。</p>
      </div>

      <div className="creatorFormGrid">
        <label>
          <span>创作人名称</span>
          <input
            name="displayName"
            onChange={(event) => onChange("displayName", event.target.value)}
            placeholder="夜航作词人"
            value={value.displayName}
          />
        </label>
        <label>
          <span>一句话介绍</span>
          <input
            name="tagline"
            onChange={(event) => onChange("tagline", event.target.value)}
            placeholder="擅长都市夜色、克制情绪和旋律化叙事。"
            value={value.tagline}
          />
        </label>
      </div>

      <div className="creatorFormStack">
        <label>
          <span>擅长风格</span>
          <input
            name="styleTags"
            onChange={(event) => onChange("styleTags", event.target.value)}
            placeholder="R&B, City Pop, 中文流行"
            value={value.styleTags}
          />
        </label>
        <label>
          <span>代表经验</span>
          <textarea
            name="experience"
            onChange={(event) => onChange("experience", event.target.value)}
            placeholder="你服务过的项目、熟悉的题材或长期积累的方法论。"
            rows={4}
            value={value.experience}
          />
        </label>
        <label>
          <span>案例描述</span>
          <textarea
            name="caseDescription"
            onChange={(event) => onChange("caseDescription", event.target.value)}
            placeholder="写一个最能代表你判断力的案例，帮助系统理解你的标准。"
            rows={5}
            value={value.caseDescription}
          />
        </label>
      </div>
    </section>
  );
}
