type ProgressTrackStep = {
  id: string;
  label: string;
  statusLabel: string;
  state: "active" | "complete" | "upcoming" | "locked";
};

type ProgressTrackProps = {
  steps: ProgressTrackStep[];
  ariaLabel: string;
};

export function ProgressTrack({ ariaLabel, steps }: ProgressTrackProps) {
  return (
    <ol className="mgProgressTrack" aria-label={ariaLabel}>
      {steps.map((step) => (
        <li
          key={step.id}
          className={`mgProgressTrack__item mgProgressTrack__item--${step.state}`}
          aria-current={step.state === "active" ? "step" : undefined}
        >
          <span className="mgProgressTrack__index" aria-hidden="true" />
          <div className="mgProgressTrack__copy">
            <strong>{step.label}</strong>
            <span>{step.statusLabel}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
