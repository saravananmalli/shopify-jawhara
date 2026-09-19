export default function QuantitySelector({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <div className="inline-flex h-12 items-center rounded-xl bg-cream-100">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-full w-10 items-center justify-center text-lg leading-none text-brown-900/70 transition-colors hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-30"
      >
        &minus;
      </button>
      <span
        aria-live="polite"
        className="w-6 text-center font-sans text-sm font-semibold text-brown-900"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
        className="flex h-full w-10 items-center justify-center text-lg leading-none text-brown-900/70 transition-colors hover:text-gold-700"
      >
        +
      </button>
    </div>
  );
}
