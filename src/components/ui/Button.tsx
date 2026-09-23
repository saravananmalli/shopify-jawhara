"use client";

import type { ReactNode, MouseEventHandler } from "react";
import Link from "@/components/ui/Link";

type ButtonVariant = "primary" | "secondary" | "neutral" | "neutral-filled";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-gold-600 text-white hover:bg-gold-700",
  secondary: "border border-gold-600 text-gold-600 hover:bg-cream-100",
  neutral: "border border-[#D6D3D1] text-brown-900 hover:bg-cream-100",
  "neutral-filled": "bg-cream-100 text-brown-900 hover:bg-gold-100",
};

// Deliberately NOT baked in: padding, text size/weight/case, icon size,
// height. Real usage across the site has several genuinely different
// padding/type tiers (a compact uppercase buy-flow style, a px-4 py-3
// reference style, and a few bespoke ones) — a size enum would just be a
// wrong taxonomy. Button owns shape, per-variant color, icon slot/gap and
// disabled state; each call site keeps supplying its own padding/text-size/
// icon-size via `className`/the icon element, same as before this existed.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl transition-colors duration-(--motion-fast) disabled:opacity-50 disabled:cursor-not-allowed";

type CommonProps = {
  variant?: ButtonVariant;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  fullWidth?: boolean;
  /** Tailwind class string order doesn't control cascade order — to override
   * a class Button's own BASE/variant already set (not just add a new one),
   * use Tailwind's `!` suffix (e.g. `rounded-full!`), same convention
   * ProductInfo.tsx already uses to override AddToCartButton. */
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

type ButtonAsButton = CommonProps & {
  href?: undefined;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  target?: undefined;
  rel?: undefined;
};

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
  type?: undefined;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  disabled?: undefined;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const isLinkProps = (props: ButtonProps): props is ButtonAsLink =>
  props.href !== undefined;

/** Shared primary/secondary CTA shell — radius, per-variant color, icon
 * slot and disabled state live here; padding/text size/icon size stay with
 * the caller since those genuinely vary by context. */
export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    icon,
    iconPosition = "start",
    fullWidth = false,
    className = "",
    children,
    "aria-label": ariaLabel,
  } = props;
  const classes = `${BASE} ${VARIANT_CLASSES[variant]} ${fullWidth ? "w-full" : ""} ${className}`;

  const content = (
    <>
      {icon && iconPosition === "start" && icon}
      {children}
      {icon && iconPosition === "end" && icon}
    </>
  );

  if (isLinkProps(props)) {
    const { href, target, rel, onClick } = props;
    const safeRel = target === "_blank" && !rel ? "noopener noreferrer" : rel;
    return (
      <Link href={href} target={target} rel={safeRel} onClick={onClick} aria-label={ariaLabel} className={classes}>
        {content}
      </Link>
    );
  }

  const { type = "button", onClick, disabled } = props;
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={classes}>
      {content}
    </button>
  );
}
