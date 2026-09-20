"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/icons";

const TYPEAHEAD_RESET_MS = 600;

/**
 * Single-choice dropdown that replaces the browser's native <select> popup so
 * the open list matches the site. Follows the ARIA "select-only combobox"
 * pattern: focus stays on the trigger, the highlighted option is exposed via
 * aria-activedescendant, and it works entirely from the keyboard
 * (arrows, Home/End, Enter/Space, Escape, type-to-jump).
 */
export default function SelectDropdown({
  label,
  value,
  options,
  onChange,
  optionLabel = (option) => option,
  className = "",
}: {
  /** Accessible name — there is no visible label. */
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  /** Text shown for an option value, when the value itself isn't display text. */
  optionLabel?: (option: string) => string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });
  const listId = useId();

  const selectedIndex = Math.max(0, options.indexOf(value));
  const optionId = (index: number) => `${listId}-${index}`;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  // Keep the highlighted option visible when arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[id="${optionId(activeIndex)}"]`)
      ?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is derived from listId
  }, [open, activeIndex]);

  useEffect(() => () => window.clearTimeout(typeahead.current.timer), []);

  function openList() {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function commit(index: number) {
    const next = options[index];
    if (next !== undefined && next !== value) onChange(next);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function handleTypeahead(key: string) {
    const state = typeahead.current;
    window.clearTimeout(state.timer);
    state.text += key.toLowerCase();
    state.timer = window.setTimeout(() => {
      state.text = "";
    }, TYPEAHEAD_RESET_MS);

    // Typing the same letter repeatedly cycles through options starting with it.
    const cycling = state.text.split("").every((char) => char === state.text[0]);
    const needle = cycling ? state.text[0] : state.text;
    const from = open ? activeIndex + (cycling ? 1 : 0) : selectedIndex + (cycling ? 1 : 0);
    const ordered = [...options.keys()].map((i) => (i + from) % options.length);
    const match = ordered.find((i) => optionLabel(options[i]).toLowerCase().startsWith(needle));
    if (match === undefined) return;

    if (!open) setOpen(true);
    setActiveIndex(match);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          openList();
          return;
        }
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((index) => Math.min(options.length - 1, Math.max(0, index + step)));
        return;
      }
      case "Home":
      case "End":
        event.preventDefault();
        if (!open) openList();
        setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) commit(activeIndex);
        else openList();
        return;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        return;
      case "Tab":
        setOpen(false);
        return;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          handleTypeahead(event.key);
        }
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white ps-4 pe-3.5 text-start text-sm text-brown-900 transition-colors duration-300 ease-luxury hover:border-gold-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 ${
          open ? "border-gold-600 ring-2 ring-gold-600/15" : "border-gold-100"
        }`}
      >
        <span className="truncate">{optionLabel(value)}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-brown-900/60 transition-transform duration-300 ease-luxury ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          // Keeps focus on the trigger while the pointer interacts with the list.
          onMouseDown={(event) => event.preventDefault()}
          className="absolute start-0 top-full z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-gold-100 bg-white p-1.5 shadow-lg sm:w-max sm:min-w-full sm:max-w-80"
        >
          {options.map((option, index) => {
            const selected = option === value;
            return (
              <li
                key={option}
                id={optionId(index)}
                role="option"
                aria-selected={selected}
                onClick={() => commit(index)}
                onMouseMove={() => index !== activeIndex && setActiveIndex(index)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                  index === activeIndex ? "bg-cream-100" : ""
                } ${selected ? "font-semibold text-gold-700" : "text-brown-900"}`}
              >
                <span>{optionLabel(option)}</span>
                {selected && <CheckIcon className="h-4 w-4 shrink-0 text-gold-600" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
