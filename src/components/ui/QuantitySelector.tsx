"use client";

import { useDictionary } from "@/store/locale";

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  disabled = false,
  decreaseLabel,
  increaseLabel,
  className = "",
  buttonClassName = "",
  valueClassName = "",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  /** External busy/pending flag (e.g. an in-flight cart mutation) — disables
   * BOTH buttons regardless of `min`. The cart line uses this instead of a
   * min-based disable; this component stays unaware of *why* it's pending. */
  disabled?: boolean;
  /** Override the default dictionary aria-labels — e.g. the cart line
   * interpolates the product title into them via formatMessage. */
  decreaseLabel?: string;
  increaseLabel?: string;
  /** Appended to the wrapper's base classes. Use `!` to override a
   * conflicting base utility (e.g. `h-7!`), same convention as Button.tsx. */
  className?: string;
  /** Appended to BOTH buttons' base classes. */
  buttonClassName?: string;
  /** Appended to the value span's base classes. */
  valueClassName?: string;
}) {
  const { product: t } = useDictionary();
  const decrementDisabled = value <= min || disabled;

  return (
    <div className={`inline-flex h-12 items-center rounded-xl bg-cream-100 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={decrementDisabled}
        aria-label={decreaseLabel ?? t.decreaseQuantity}
        className={`flex h-full w-8 items-center min-[360px]:w-10 justify-center text-lg leading-none text-brown-900/70 transition-colors hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-30 ${buttonClassName}`}
      >
        &minus;
      </button>
      <span
        aria-live="polite"
        className={`w-5 text-center font-sans min-[360px]:w-6 text-sm font-semibold text-brown-900 ${valueClassName}`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        aria-label={increaseLabel ?? t.increaseQuantity}
        className={`flex h-full w-8 items-center min-[360px]:w-10 justify-center text-lg leading-none text-brown-900/70 transition-colors hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-30 ${buttonClassName}`}
      >
        +
      </button>
    </div>
  );
}
