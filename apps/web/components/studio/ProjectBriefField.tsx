"use client";

type ProjectBriefFieldProps = {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
};

export function ProjectBriefField({
  label,
  name,
  value,
  options,
  onChange,
  required = true,
}: ProjectBriefFieldProps) {
  const inputId = `project-brief-${name}`;

  return (
    <div className="projectBriefField">
      <label htmlFor={inputId}>{label}</label>
      <div className="briefPresetList">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? "briefPreset active" : "briefPreset"}
            onClick={() => onChange(option)}
            aria-pressed={value === option}
          >
            {option}
          </button>
        ))}
      </div>
      <input
        id={inputId}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`自定义${label}`}
        required={required}
      />
    </div>
  );
}
