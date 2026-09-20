"use client";

import Image from "next/image";
import Link from "@/components/ui/Link";
import { ChevronRightIcon } from "@/components/icons";
import CarouselPagination from "@/components/ui/CarouselPagination";
import { useScrollCarousel } from "@/hooks/useScrollCarousel";
import { useDictionary } from "@/store/locale";
import { getShopifyImageUrl, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";
import type { CategoryTile } from "@/types/content";

// 2x the fixed tile width (320px / 288px, precise since `sizes` is in px, not vw).
const CATEGORY_IMAGE_WIDTH = 640;

/** Aligns the strip's start edge with the heading above it (inside
 * page-container) while letting the tiles bleed off the far edge of the
 * viewport — the same "peek" pattern used by the reference design. Sized
 * so spacer + the row's gap-4 (1rem) together equal the container's own
 * left inset (centering margin + fluid gutter). */
const SPACER_WIDTH =
  "calc(max(0px, (100vw - var(--container-max-width)) / 2) + var(--page-gutter) - 1rem)";

/** These collections are named "Gold Rings", "Diamond Rings", "Pearl
 * Rings"... per material line, but the tile caption should read the plain
 * category name ("Rings") — the material is already implied by which strip
 * this is. */
const MATERIAL_PREFIX = /^(gold|diamond|pearl)\s+/i;
function toCategoryLabel(title: string) {
  return title.replace(MATERIAL_PREFIX, "");
}

export default function CategoryStrip({
  categories,
}: {
  categories: CategoryTile[];
}) {
  const t = useDictionary();
  const { scrollRef, pageCount, activePage, scrollByPage, handleScroll } =
    useScrollCarousel(categories.length);

  return (
    <section className="bg-white py-6 sm:py-10">
      <div className="flex page-container items-end justify-between">
        <div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[2.75px] text-gold-800">
            {t.home.categories.eyebrow}
          </p>
          <h2 className="mt-1 font-sans text-2xl font-normal text-gold-600 sm:text-[28px]">{t.home.categories.title}</h2>
        </div>
        <Link
          href="/collections"
          className="hidden items-center gap-1 text-sm font-medium text-gold-700 sm:flex"
        >
          {t.common.viewAll} <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="mx-(--page-gutter) mt-6 rounded-xl border border-dashed border-gold-200 bg-cream-100 px-4 py-6 text-center text-sm text-brown-900/60">
          {t.home.categories.empty}
        </p>
      ) : (
        <>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="mt-1 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-0 pe-(--page-gutter) sm:mt-6 sm:pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* A real flex child, not container padding — padding-inline-start
                on a scrollable flex container gets treated as already-scrolled
                overflow in some browsers, so its initial scrollLeft lands past
                it instead of showing it. */}
            <div style={{ width: SPACER_WIDTH }} className="shrink-0 snap-start" aria-hidden />
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/collections/${cat.handle}`}
                className="w-[min(11rem,52vw)] shrink-0 snap-start sm:w-80"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-cream-100">
                  {cat.imageUrl && (
                    <Image
                      src={getShopifyImageUrl(cat.imageUrl, CATEGORY_IMAGE_WIDTH)}
                      alt={cat.imageAlt}
                      fill
                      sizes="(min-width: 640px) 320px, 52vw"
                      placeholder="blur"
                      blurDataURL={IMAGE_BLUR_DATA_URL}
                      className="object-cover"
                    />
                  )}
                </div>
                <p className="mt-3 text-center text-base font-medium">
                  {toCategoryLabel(cat.title)}
                </p>
              </Link>
            ))}
          </div>

          <CarouselPagination
            pageCount={pageCount}
            activePage={activePage}
            onPrev={() => scrollByPage(-1)}
            onNext={() => scrollByPage(1)}
            label={t.common.categories}
            className="page-container mt-2 sm:mt-4"
          />
        </>
      )}
    </section>
  );
}
