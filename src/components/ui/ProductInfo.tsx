"use client";

import { useState } from "react";
import AddToCartButton from "@/components/ui/AddToCartButton";
import AccordionItem from "@/components/ui/AccordionItem";
import DeliveryEstimate from "@/components/ui/DeliveryEstimate";
import Price from "@/components/ui/Price";
import QuantitySelector from "@/components/ui/QuantitySelector";
import WishlistButton from "@/components/ui/WishlistButton";
import RatingStars from "@/components/ui/RatingStars";
import { ArrowDownIcon, SparkleIcon } from "@/components/icons";
import { useDictionary, useLocale } from "@/store/locale";
import { formatMoney, getDiscountPercent } from "@/utils/format";
import { formatMessage, pluralize } from "@/utils/i18n";
import type { ProductDetail, ProductVariant } from "@/types/product";
import type { RatingSummary } from "@/types/review";

function matchesSelection(variant: ProductVariant, selection: Record<string, string>) {
  return variant.options.every((option) => selection[option.name] === option.value);
}

/**
 * Everything to the right of the gallery: title, reviews, price, design
 * code, description, real variant options (e.g. size), Specification,
 * stock status, and Add to Bag — one component because price/options/
 * stock/button all share the selected-variant state (commerce-critical:
 * rule #7 in CLAUDE.md — price must track the selected variant, not just
 * the product's min price), even though the reference design interleaves
 * them with static content (design code, description) in between.
 */
export default function ProductInfo({
  product,
  rating,
  onVariantChange,
}: {
  product: ProductDetail;
  /** Fired when the shopper picks an option, with the variant it resolves to. */
  onVariantChange?: (variant: ProductVariant) => void;
  /** Real Judge.me rating from Shopify; null/undefined hides the row. */
  rating?: RatingSummary | null;
}) {
  const locale = useLocale();
  const { common, product: t } = useDictionary();
  // Shopify gives a product with no real options a placeholder "Title: Default
  // Title" option — that isn't something to show.
  const optionNames = [
    ...new Set(
      product.variants.flatMap((variant) =>
        variant.options
          .filter((o) => !(o.name === "Title" && o.value === "Default Title"))
          .map((o) => o.name),
      ),
    ),
  ];
  const showOptionPicker = optionNames.length > 0;

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const option of product.defaultVariant?.options ?? []) {
      initial[option.name] = option.value;
    }
    return initial;
  });
  const [quantity, setQuantity] = useState(1);

  const selectedVariant =
    product.variants.find((variant) => matchesSelection(variant, selection)) ??
    product.defaultVariant;

  const price = selectedVariant?.price ?? product.price;
  const compareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const available = selectedVariant?.available ?? product.available;
  const discountPercent = getDiscountPercent(price, compareAtPrice);

  return (
    <div>
      <h1 dir="auto" className="font-sans text-[20px] font-semibold text-brown-900">
        {product.title}
      </h1>

      {rating && (
        <div className="mt-3 flex items-center gap-2 font-sans">
          <RatingStars rating={rating.average} size="md" />
          <a
            href="#customer-reviews"
            className="text-xs text-brown-900 underline underline-offset-2 transition-colors hover:text-gold-600"
          >
            ({pluralize(locale, rating.count, t.customerReviews)})
          </a>
          <span className="sr-only">
            {formatMessage(common.ratedOutOf5, { rating: rating.average })}
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 font-sans">
        {discountPercent !== null && (
          <span className="flex items-center gap-1 text-2xl font-bold text-[#008042]">
            <ArrowDownIcon className="h-5 w-5" />
            {discountPercent}%
          </span>
        )}
        <Price
          amount={price.amount}
          currencyCode={price.currencyCode}
          size="0.8em"
          className="flex items-center gap-0.5 text-2xl font-bold text-brown-900 rtl:flex-row-reverse"
        />
        {compareAtPrice && (
          <Price
            amount={compareAtPrice.amount}
            currencyCode={compareAtPrice.currencyCode}
            size="0.65em"
            className="flex items-center gap-0.5 text-lg text-[#7A7369] line-through rtl:flex-row-reverse"
          />
        )}
      </div>

      {product.designCode && (
        <p className="mt-4 font-sans text-sm text-brown-900/70">
          <span className="font-semibold text-brown-900">{t.designCode}</span> {product.designCode}
        </p>
      )}

      {product.description && (
        <p dir="auto" className="mt-4 font-sans text-[14px] font-normal leading-relaxed text-brown-900">
          {product.description}
        </p>
      )}

      {showOptionPicker &&
        optionNames.map((name) => {
          const values = [
            ...new Set(
              product.variants.flatMap((variant) =>
                variant.options.filter((o) => o.name === name).map((o) => o.value),
              ),
            ),
          ];
          return (
            <div key={name} className="mt-5">
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-gold-600">
                {name}
              </p>
              <div className="flex flex-wrap gap-2">
                {/* A single value (e.g. a ring sold in one size) is information,
                    not a choice — shown as a plain chip, not a button. */}
                {values.length === 1 && (
                  <span className="inline-flex h-8 items-center rounded-xl border border-gold-600 bg-gold-600 px-[14px] font-sans text-[14px] font-normal uppercase tracking-wide text-white">
                    {values[0]}
                  </span>
                )}
                {values.length > 1 && values.map((value) => {
                  const isSelected = selection[name] === value;
                  const candidateVariant = product.variants.find((variant) =>
                    matchesSelection(variant, { ...selection, [name]: value }),
                  );
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setSelection({ ...selection, [name]: value });
                        if (candidateVariant) onVariantChange?.(candidateVariant);
                      }}
                      aria-pressed={isSelected}
                      disabled={!candidateVariant}
                      className={`h-8 rounded-xl border px-[14px] font-sans text-[14px] font-normal uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        isSelected
                          ? "border-gold-600 bg-gold-600 text-white hover:bg-gold-700"
                          : "border-gold-200 bg-transparent text-gold-600 hover:bg-cream-100"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

      {product.specifications.length > 0 && (
        <div className="mt-5 rounded-xl bg-white px-4">
          <AccordionItem
            title={t.specification}
            icon={<SparkleIcon className="h-4 w-4 shrink-0 text-gold-600" />}
            defaultOpen
            divider={false}
          >
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {product.specifications.map((entry) => (
                <div key={entry.key} className="flex items-start gap-2">
                  {entry.icon && (
                    // eslint-disable-next-line @next/next/no-img-element -- local brand icons with baked-in colors; matches the FeaturesBar convention.
                    <img src={entry.icon} alt="" aria-hidden className="h-6 w-6 shrink-0" />
                  )}
                  <div>
                    <p className="font-sans text-xs font-semibold text-gold-700">
                      {(t.specs as Record<string, string>)[entry.key] ?? entry.label}
                    </p>
                    <p className="font-sans text-sm text-brown-900">{entry.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionItem>
        </div>
      )}

      <DeliveryEstimate available={available} />

      {/* On phones this row is the page's fixed purchase bar (quantity, add to
          bag, wishlist) and replaces the tab bar; from md it is a normal row. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-black/[0.08] bg-white px-(--page-gutter) pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:static md:z-auto md:mt-4 md:gap-3 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        {available && <QuantitySelector value={quantity} onChange={setQuantity} />}

        {selectedVariant && available ? (
          <AddToCartButton
            variantId={selectedVariant.id}
            quantity={quantity}
            label={formatMessage(t.addToBagWithTotal, {
              total: formatMoney(price.amount * quantity, price.currencyCode, locale),
            })}
            className="h-12 min-w-0 flex-1 px-2! text-center text-[14px]! leading-tight! max-[359px]:[&>svg]:hidden"
          />
        ) : (
          <button
            type="button"
            disabled
            className="h-12 min-w-0 flex-1 rounded-xl bg-cream-100 px-4 font-sans text-[14px] font-semibold uppercase tracking-wide text-brown-900/40"
          >
            {t.outOfStock}
          </button>
        )}

        <WishlistButton
          product={product}
          iconClassName="h-5 w-5"
          className="flex h-12 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-100 transition-colors hover:bg-cream-200 min-[360px]:w-12"
        />
      </div>
    </div>
  );
}
