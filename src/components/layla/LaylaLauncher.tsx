"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import LaylaAvatar from "@/components/layla/LaylaAvatar";
import { useLazyDialog } from "@/hooks/useLazyDialog";
import { useDictionary } from "@/store/locale";

// The whole chat (panel, hook, cards) stays out of the initial bundle until
// the shopper first opens it.
const LaylaPanel = dynamic(() => import("@/components/layla/LaylaPanel"), { ssr: false });

/**
 * Bottom-end pill with a brown→gold→cream gradient border that glows on hover.
 * Hovering or focusing it (pointer devices only) reveals a short intro card.
 * On phones it collapses to the round mark so it covers as little as possible.
 */
export default function LaylaLauncher() {
  const { layla: t } = useDictionary();
  const [open, setOpen] = useState(false);
  const { mounted, visible } = useLazyDialog(open);

  return (
    <>
      {/* Bottom-end; on phones it clears the tab bar (~4.25rem). */}
      <div
        className={`group fixed end-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 transition-[transform,opacity] duration-300 ease-luxury md:bottom-6 md:end-6 ${
          open ? "pointer-events-none translate-y-2 opacity-0" : ""
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-full end-0 mb-3 hidden w-[19rem] translate-y-1 rounded-2xl border border-gold-100 bg-cream-50 p-3.5 opacity-0 shadow-[0_12px_36px_color-mix(in_srgb,var(--color-brown-900)_16%,transparent)] transition-[opacity,transform] duration-300 ease-luxury group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)]:block"
        >
          <div className="flex items-start gap-3">
            <LaylaAvatar size="sm" tone="gold" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold tracking-wide text-gold-600 rtl:tracking-normal">{t.tooltipTitle}</p>
              <p className="mt-1 text-[13px] leading-normal tracking-wide text-brown-900 rtl:tracking-normal">{t.tooltipBody}</p>
            </div>
          </div>
          <span className="absolute -bottom-1.5 end-9 h-3 w-3 rotate-45 border-b border-r border-gold-100 bg-cream-50" />
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.open}
          aria-haspopup="dialog"
          className="layla-launcher block h-14 rounded-full bg-[linear-gradient(120deg,var(--color-brown-800),var(--color-gold-300)_50%,var(--color-gold-100))] p-[2.5px] shadow-[0_8px_28px_color-mix(in_srgb,var(--color-brown-900)_18%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-600"
        >
          <span className="flex h-full items-center gap-1 rounded-full bg-white ps-3.5 pe-3.5 sm:pe-5">
            <LaylaAvatar size="md" tone="bare" />
            <span className="hidden text-sm font-semibold text-brown-900 sm:block">{t.launcher}</span>
          </span>
        </button>
      </div>
      {mounted && <LaylaPanel visible={visible} onClose={() => setOpen(false)} />}
    </>
  );
}
