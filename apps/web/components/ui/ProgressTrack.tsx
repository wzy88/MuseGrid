type ProgressTrackStep = {
  id: string;
  label: string;
  statusLabel: string;
  state: "active" | "complete" | "upcoming" | "locked";
  caption?: string;
  disabled?: boolean;
  onSelect?: () => void;
};

type ProgressTrackProps = {
  steps: ProgressTrackStep[];
  ariaLabel: string;
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ProgressTrack({ ariaLabel, steps }: ProgressTrackProps) {
  const isInteractive = steps.some((step) => typeof step.onSelect === "function");

  return (
    <ol className={classNames("mgProgressTrack", isInteractive && "mgProgressTrack--interactive")} aria-label={ariaLabel}>
      {steps.map((step) => (
        <li
          key={step.id}
          className={`mgProgressTrack__item mgProgressTrack__item--${step.state}`}
          aria-current={step.state === "active" ? "step" : undefined}
        >
          {step.onSelect ? (
            <button
              type="button"
              className="mgProgressTrack__button"
              onClick={step.onSelect}
              disabled={step.disabled}
              aria-pressed={step.state === "active"}
            >
              <span className="mgProgressTrack__index" aria-hidden="true" />
              <div className="mgProgressTrack__copy">
                <strong>{step.label}</strong>
                <span>{step.statusLabel}</span>
                {step.caption ? <small>{step.caption}</small> : null}
              </div>
            </button>
          ) : (
            <>
              <span className="mgProgressTrack__index" aria-hidden="true" />
              <div className="mgProgressTrack__copy">
                <strong>{step.label}</strong>
                <span>{step.statusLabel}</span>
                {step.caption ? <small>{step.caption}</small> : null}
              </div>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}
