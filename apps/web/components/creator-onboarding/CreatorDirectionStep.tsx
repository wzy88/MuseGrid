import type { CapabilityDirection } from "@musegrid/core";
import type { KeyboardEvent } from "react";

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
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, optionValue: CapabilityDirection) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onChange(optionValue);
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const currentIndex = directionOptions.findIndex((option) => option.value === optionValue);
      const offset = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + offset + directionOptions.length) % directionOptions.length;
      onChange(directionOptions[nextIndex].value);
    }
  }

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
            <button
              aria-checked={checked}
              className={checked ? "creatorChoiceCard active" : "creatorChoiceCard"}
              key={option.value}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, option.value)}
              role="radio"
              type="button"
              value={option.value}
            >
              <span className="creatorChoiceTitle">{option.label}</span>
              <span className="creatorChoiceDescription">{option.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
