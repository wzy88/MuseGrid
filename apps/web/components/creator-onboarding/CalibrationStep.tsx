type CalibrationValue = {
  creativeApproach: string;
  correctionMethod: string;
  boundaries: string;
};

type CalibrationStepProps = {
  value: CalibrationValue;
  onChange: (field: keyof CalibrationValue, nextValue: string) => void;
};

export function CalibrationStep({ value, onChange }: CalibrationStepProps) {
  return (
    <section className="creatorStepSection" aria-labelledby="creator-calibration-title">
      <div className="creatorStepHeader">
        <p className="eyebrow">Step 3</p>
        <h2 id="creator-calibration-title">告诉系统你如何校准分身</h2>
        <p>这些回答会决定 Level 1 分身初始的判断边界，也会成为后续审核和成长任务的起点。</p>
      </div>

      <div className="creatorFormStack">
        <label>
          <span>你最擅长的创作切入方式</span>
          <textarea
            name="creativeApproach"
            onChange={(event) => onChange("creativeApproach", event.target.value)}
            placeholder="例如：先找叙事视角、先写副歌钩子、先定节奏密度。"
            rows={4}
            value={value.creativeApproach}
          />
        </label>
        <label>
          <span>你会如何校正分身输出</span>
          <textarea
            name="correctionMethod"
            onChange={(event) => onChange("correctionMethod", event.target.value)}
            placeholder="举例说明你会如何指出问题、如何给出替代方案。"
            rows={4}
            value={value.correctionMethod}
          />
        </label>
        <label>
          <span>你希望分身避免什么</span>
          <textarea
            name="boundaries"
            onChange={(event) => onChange("boundaries", event.target.value)}
            placeholder="例如：不要模仿具体歌手、不要写空泛句、不要偏离题材。"
            rows={4}
            value={value.boundaries}
          />
        </label>
      </div>
    </section>
  );
}
