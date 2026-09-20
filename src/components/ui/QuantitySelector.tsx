"use client";

import { useDictionary } from "@/store/locale";

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  const { product: t } = useDictionary();

  return (
    <div className="inline-flex h-12 items-center rounded-xl bg-cream-100">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={t.decreaseQuantity}
        className="flex h-full w-8 items-center min-[360px]:w-10 justify-center text-lg leading-none text-brown-900/70 transition-colors hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-30"
      >
        &minus;
      </button>
      <span
        aria-live="polite"
        className="w-5 text-center font-sans min-[360px]:w-6 text-sm font-semibold text-brown-900"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={t.increaseQuantity}
        className="flex h-full w-8 items-center min-[360px]:w-10 justify-center text-lg leading-none text-brown-900/70 transition-colors hover:text-gold-700"
      >
        +
      </button>
    </div>
  );
}
