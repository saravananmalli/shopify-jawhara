import type { ReactNode } from "react";

/** Section frame + heading shared by every product carousel on the site. */
export default function ProductShelf({
  eyebrow = "Haute Vitrine",
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-y border-[#E3D5BC]/60">
      <div className="mx-auto max-w-8xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-700">
              {eyebrow}
            </p>
            <h2 className="mt-1 font-sans text-3xl font-normal">{title}</h2>
            {subtitle && (
              <p className="mt-1 font-sans text-sm text-brown-900/60">{subtitle}</p>
            )}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </section>
  );
}
