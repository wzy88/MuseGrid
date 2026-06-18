import type { HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: "aside" | "div" | "section";
  children: ReactNode;
  tone?: "default" | "hero" | "soft";
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Panel({
  as = "section",
  children,
  className,
  tone = "default",
  ...props
}: PanelProps) {
  const Component = as;

  return (
    <Component {...props} className={classNames("mgPanel", `mgPanel--${tone}`, className)}>
      {children}
    </Component>
  );
}
