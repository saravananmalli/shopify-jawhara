import type { ReactNode } from "react";

/** Shared "dashed box" shell for an empty/error state (empty cart, empty
 * wishlist, no matching products). Only the box chrome is common — each
 * caller's heading, icon and CTA differ enough that they stay as children
 * rather than fixed slots; margin/padding vary per caller via `className`. */
export default function EmptyStateBox({
  role,
  className = "",
  children,
}: {
  role?: "alert";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role={role} className={`rounded-2xl border border-dashed border-gold-100 bg-white px-4 text-center ${className}`}>
      {children}
    </div>
  );
}
