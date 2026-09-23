"use client";

import type { ReactNode } from "react";

/** Shared fixed-position scrim + fade wrapper behind a dialog panel — the
 * "inert while hidden, opacity-fade when toggled" skeleton common to every
 * modal/drawer/bottom-sheet that stays mounted and animates open/closed.
 * (FiltersDrawer is the one exception: it mounts/unmounts instead of fading,
 * so it doesn't use this.) Each caller supplies its own panel (ref,
 * role="dialog", sizing, background and open/closed transition) as
 * `children` — only the wrapper and scrim are shared here. */
export default function DialogOverlay({
  visible,
  onClose,
  scrimClassName = "bg-black/40",
  className = "",
  children,
}: {
  visible: boolean;
  onClose: () => void;
  scrimClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      inert={!visible}
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-luxury ${className} ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className={`absolute inset-0 ${scrimClassName}`} onClick={onClose} />
      {children}
    </div>
  );
}
