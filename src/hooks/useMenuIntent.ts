import { createContext, useCallback, useState } from "react";

/** True once the user has hovered/focused the enclosing mega-menu item. */
export const MenuIntentContext = createContext(false);

/**
 * Mega-menu panels are `visibility: hidden`, which browsers still treat as
 * on-screen — so every tile photo would download on page load, and every
 * link in every panel would be viewport-prefetched, all competing with the
 * hero. `armed` flips on the first hover/focus of the menu item; panels
 * render their images (and MenuLink enables prefetching) only then.
 */
export function useMenuIntent() {
  const [armed, setArmed] = useState(false);
  const arm = useCallback(() => setArmed(true), []);

  return { armed, intentProps: { onPointerEnter: arm, onFocus: arm } };
}
