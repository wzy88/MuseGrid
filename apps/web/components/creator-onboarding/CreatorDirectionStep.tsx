import type { CapabilityDirection } from "@musegrid/core";

const directionOptions: ReadonlyArray<{
  value: CapabilityDirection;
  label: string;
  description: string;
}> = [
  { value: "lyrics", label: "作词", description: "擅长叙事、情绪捕捉和钩子句。" },
  { value: "composition", label: "作曲", description: "擅长旋律动机、主副歌走向和 Hook。" },
  { value: "arrangement", label: "编曲", description: "擅长节奏结构、音色和空间层次。" },
  { value: "production", label: "制作", description: "擅长 Demo 统筹、人声处理和交付质感。" },
] as const;

type CreatorDirectionStepProps = {
  value: CapabilityDirection | "";
  onChange: (value: CapabilityDirection) => void;
};

export function CreatorDirectionStep({ value, onChange }: CreatorDirectionStepProps) {
  return (
    <section className="creatorStepSection" aria-labelledby="creator-direction-title">
      <div className="creatorStepHeader">
        <p className="eyebrow">Step 1</p>
        <h2 id="creator-direction-title">先选定你的创作方向</h2>
        <p>系统会先用这条能力线创建一个 Level 1 创作人分身，后续再靠作品样本和校准反馈持续成长。</p>
      </div>
      <div className="creatorDirectionGrid" role="radiogroup" aria-label="创作方向">
        {directionOptions.map((option) => {
          const checked = value === option.value;

          return (
            <label className={checked ? "creatorChoiceCard active" : "creatorChoiceCard"} key={option.value}>
              <input
                checked={checked}
                name="capabilityDirection"
                onChange={() => onChange(option.value)}
                type="radio"
                value={option.value}
              />
              <span className="creatorChoiceTitle">{option.label}</span>
              <span className="creatorChoiceDescription">{option.description}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
