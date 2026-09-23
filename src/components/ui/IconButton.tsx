"use client";

import type { MouseEventHandler, ReactNode } from "react";
import Link from "@/components/ui/Link";

type HoverTone = "cream" | "white" | "none";

const HOVER_CLASSES: Record<HoverTone, string> = {
  cream: "hover:bg-cream-100",
  white: "hover:bg-white/20",
  none: "",
};

// Only the 44px hit-target shape and the two variants that genuinely recur
// (rounded, hover tone) are baked in — margin offsets, shrink-0 and ambient
// text color are one-offs per call site and stay in `className`, same
// philosophy as Button.tsx.
const BASE = "flex h-11 w-11 items-center justify-center";

type CommonProps = {
  icon: ReactNode;
  "aria-label": string;
  rounded?: boolean;
  hoverTone?: HoverTone;
  className?: string;
  disabled?: boolean;
};

type IconButtonAsButton = CommonProps & {
  href?: undefined;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

type IconButtonAsLink = CommonProps & {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  disabled?: undefined;
};

export type IconButtonProps = IconButtonAsButton | IconButtonAsLink;

/** Shared 44px circular/square icon-button shell — used by every close/open
 * icon trigger across drawers, modals and the header. */
export default function IconButton(props: IconButtonProps) {
  const {
    icon,
    "aria-label": ariaLabel,
    rounded = true,
    hoverTone = "cream",
    className = "",
  } = props;
  const classes = `${BASE} ${rounded ? "rounded-full" : ""} ${HOVER_CLASSES[hoverTone]} ${className}`;

  if (props.href !== undefined) {
    const { href, onClick } = props;
    return (
      <Link href={href} onClick={onClick} aria-label={ariaLabel} className={classes}>
        {icon}
      </Link>
    );
  }

  const { onClick, disabled = false } = props;
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={classes}>
      {icon}
    </button>
  );
}
