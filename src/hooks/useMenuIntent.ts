import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type FocusEvent,
  type PointerEvent,
  type SetStateAction,
} from "react";

/** True once the user has hovered/focused the enclosing mega-menu item. */
export const MenuIntentContext = createContext(false);

/** Which top-level menu is open — shared so only one can be at a time. */
type OpenMenuState = {
  openId: string | null;
  setOpenId: Dispatch<SetStateAction<string | null>>;
};
export const NavMenuContext = createContext<OpenMenuState | null>(null);

// Bridges the few px between the nav label and its panel, so moving the mouse
// down into the panel doesn't close it on the way.
const CLOSE_DELAY_MS = 200;

/**
 * Open/close state for one top-level mega-menu.
 *
 * Opening was pure CSS (`group-hover` + `group-focus-within`), so a menu stayed
 * open for as long as it kept focus after a click, and hovering another menu
 * opened a second panel on top of it. Now a single shared `openId` (from
 * NavMenuProvider) decides which panel shows, and the item exposes it as
 * `data-open` for the `group-data-open:` styles.
 *
 * `armed` flips on the first hover/focus: panels are `visibility: hidden`,
 * which browsers still treat as on-screen — so every tile photo would download
 * on page load and every link would be viewport-prefetched, all competing with
 * the hero. Panels render their images (and MenuLink enables prefetching) only
 * once armed.
 */
export function useMenuIntent() {
  const id = useId();
  const [armed, setArmed] = useState(false);
  const localState = useState<string | null>(null);
  const shared = useContext(NavMenuContext);
  const [openId, setOpenId] = shared ? [shared.openId, shared.setOpenId] : localState;
  const open = openId === id;
  const closeTimer = useRef<number | undefined>(undefined);

  const show = () => {
    window.clearTimeout(closeTimer.current);
    setArmed(true);
    setOpenId(id);
  };
  const hideSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => setOpenId((current) => (current === id ? null : current)),
      CLOSE_DELAY_MS,
    );
  };

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpenId]);

  return {
    armed,
    intentProps: {
      // Touch has no hover: a tap focuses the link (which opens it) instead.
      onPointerEnter: (event: PointerEvent) => {
        if (event.pointerType !== "touch") show();
      },
      onPointerLeave: (event: PointerEvent) => {
        if (event.pointerType !== "touch") hideSoon();
      },
      onFocus: show,
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) hideSoon();
      },
      "data-open": open ? "" : undefined,
    },
  };
}
