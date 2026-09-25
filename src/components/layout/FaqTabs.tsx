"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDownIcon } from "@/components/icons";
import type { FaqGroup } from "@/content/static-pages";

/** "**Label:** text" → bold label, plain rest. */
function Answer({ text }: { text: string }) {
  return (
    <p>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="font-semibold text-brown-900">{part}</strong> : part,
      )}
    </p>
  );
}

/** One category at a time, chosen from a tab strip. Every panel stays in the
 * HTML (inactive ones are just `hidden`), so all answers are crawlable. */
export default function FaqTabs({ groups }: { groups: FaqGroup[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    setActive(index);
    tabRefs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = groups.length - 1;
    // Arrow keys follow reading direction, so they are swapped in RTL by the
    // browser's own layout — we only need next/previous here.
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const prev = rtl ? "ArrowRight" : "ArrowLeft";
    if (event.key === next) select(index === last ? 0 : index + 1);
    else if (event.key === prev) select(index === 0 ? last : index - 1);
    else if (event.key === "Home") select(0);
    else if (event.key === "End") select(last);
    else return;
    event.preventDefault();
  };

  return (
    <div className="mt-8">
      <div role="tablist" aria-orientation="horizontal" className="-mx-1 flex gap-x-1 overflow-x-auto border-b border-gold-100 px-1 pb-px [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {groups.map((group, i) => {
          const selected = i === active;
          return (
            <button
              key={group.heading}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${baseId}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(event) => onKeyDown(event, i)}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-3 font-sans text-xs font-semibold uppercase tracking-widest transition-colors duration-(--motion-fast) ${
                selected ? "border-gold-600 text-gold-600" : "border-transparent text-brown-900/60 hover:text-gold-600"
              }`}
            >
              {group.heading}
            </button>
          );
        })}
      </div>

      {groups.map((group, i) => (
        <div
          key={group.heading}
          id={`${baseId}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== active}
          className="pt-2"
        >
          {group.items.map((item) => (
            <details key={item.q} className="group border-b border-gold-100">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-start font-sans text-base font-medium text-brown-900 marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-gold-600 transition-transform duration-(--motion-normal) ease-luxury group-open:rotate-180" />
              </summary>
              <div className="max-w-4xl space-y-3 pb-6 pe-8 font-sans text-sm leading-relaxed text-brown-900/75">
                {item.a.map((paragraph) => (
                  <Answer key={paragraph} text={paragraph} />
                ))}
              </div>
            </details>
          ))}
        </div>
      ))}
    </div>
  );
}
