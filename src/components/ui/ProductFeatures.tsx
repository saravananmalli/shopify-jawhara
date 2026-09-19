import { STORE_FEATURES } from "@/config/store-features";

export default function ProductFeatures() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-xl bg-white px-4 py-6 sm:grid-cols-3">
      {STORE_FEATURES.map(({ icon, label }) => (
        <li key={label} className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local brand icons with baked-in colors; matches the FeaturesBar convention. */}
          <img src={icon} alt="" aria-hidden className="h-6 w-6 shrink-0" />
          <span className="font-sans text-sm leading-snug text-brown-900">{label}</span>
        </li>
      ))}
    </ul>
  );
}
