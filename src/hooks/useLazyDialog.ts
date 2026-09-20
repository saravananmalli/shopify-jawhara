import { useEffect, useState } from "react";

/**
 * For dialogs loaded with next/dynamic: mount only after the first open
 * (keeping the code out of the initial bundle), then stay mounted so the
 * close transition and any typed state survive. `visible` trails `open` by a
 * frame so the very first open still plays its enter transition instead of
 * mounting already-open.
 */
export function useLazyDialog(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (!mounted) return;
    const frame = requestAnimationFrame(() => setVisible(open));
    return () => cancelAnimationFrame(frame);
  }, [mounted, open]);

  return { mounted, visible };
}
