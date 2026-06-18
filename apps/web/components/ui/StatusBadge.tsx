import type { HTMLAttributes } from "react";

type StatusBadgeTone = "accent" | "success" | "warning" | "danger" | "muted";

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  label: string;
  tone?: StatusBadgeTone;
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function StatusBadge({ className, label, tone = "accent", ...props }: StatusBadgeProps) {
  return (
    <span {...props} className={classNames("mgStatusBadge", `mgStatusBadge--${tone}`, className)}>
      <span className="mgStatusBadge__dot" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
