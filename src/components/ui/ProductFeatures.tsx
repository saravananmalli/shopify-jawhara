import { STORE_FEATURE_ICONS } from "@/config/store-features";
import { getDictionary } from "@/dictionaries";
import { getLocale } from "@/utils/get-locale";

export default async function ProductFeatures() {
  const { features } = await getDictionary(await getLocale());

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-xl bg-white px-4 py-6 sm:grid-cols-3">
      {STORE_FEATURE_ICONS.map((icon, index) => (
        <li key={icon} className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local brand icons with baked-in colors; matches the FeaturesBar convention. */}
          <img src={icon} alt="" aria-hidden className="h-6 w-6 shrink-0" />
          <span className="font-sans text-sm leading-snug text-brown-900">{features[index]}</span>
        </li>
      ))}
    </ul>
  );
}
