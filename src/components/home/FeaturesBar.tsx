import { STORE_FEATURES } from "@/config/store-features";

export default function FeaturesBar() {
  return (
    <section className="bg-[#FAF8F5]">
      <div className="mx-auto max-w-8xl px-4 py-8">
        {/* Wraps instead of scrolling below lg — dividers only apply at lg
            where the row is guaranteed to fit on one line, since Tailwind's
            divide-x isn't wrap-aware and would add stray borders otherwise. */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 lg:flex-nowrap lg:justify-between lg:gap-x-0 lg:divide-x lg:divide-[#E8E2D7]">
          {STORE_FEATURES.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 lg:px-6 lg:first:pl-0 lg:last:pr-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element --
                  local brand SVGs with baked-in fill colors; next/image
                  blocks SVG optimization without extra config and offers
                  no benefit for a fixed 32px static icon. */}
              <img src={icon} alt="" aria-hidden className="h-8 w-8 shrink-0" />
              <p className="max-w-[150px] font-sans text-sm leading-snug text-brown-900">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
