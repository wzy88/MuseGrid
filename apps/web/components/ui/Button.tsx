"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  href?: never;
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  href: string;
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Button(props: ButtonProps | ButtonLinkProps) {
  if ("href" in props && typeof props.href === "string") {
    const {
      children,
      className,
      disabled,
      href,
      loading = false,
      onClick,
      variant = "primary",
      ...linkProps
    } = props;
    const isDisabled = Boolean(disabled || loading);
    const classes = classNames("mgButton", `mgButton--${variant}`, isDisabled && "mgButton--loading", className);

    return (
      <a
        {...linkProps}
        href={isDisabled ? undefined : href}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={classes}
        onClick={(event) => {
          if (isDisabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        tabIndex={isDisabled ? -1 : linkProps.tabIndex}
      >
        <span className="mgButton__label">{children}</span>
        {loading ? <span className="mgButton__spinner" aria-hidden="true" /> : null}
      </a>
    );
  }

  const {
    children,
    className,
    disabled,
    loading = false,
    type = "button",
    variant = "primary",
    ...buttonProps
  } = props;
  const classes = classNames("mgButton", `mgButton--${variant}`, loading && "mgButton--loading", className);

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      <span className="mgButton__label">{children}</span>
      {loading ? (
        <span className="mgButton__spinner" aria-hidden="true" />
      ) : null}
    </button>
  );
}
