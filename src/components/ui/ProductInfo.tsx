"use client";

import { useState } from "react";
import { DirhamSymbol } from "dirham/react";
import AddToCartButton from "@/components/ui/AddToCartButton";
import AccordionItem from "@/components/ui/AccordionItem";
import QuantitySelector from "@/components/ui/QuantitySelector";
import WishlistButton from "@/components/ui/WishlistButton";
import { ArrowDownIcon, StarIcon } from "@/components/icons";
import type { ProductDetail, ProductVariant } from "@/types/product";

function matchesSelection(variant: ProductVariant, selection: Record<string, string>) {
  return variant.options.every((option) => selection[option.name] === option.value);
}

type SpecEntry = { icon: string; label: string; value: string };

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
  specEntries,
}: {
  product: ProductDetail;
  specEntries: SpecEntry[];
}) {
  const optionNames = [
    ...new Set(product.variants.flatMap((variant) => variant.options.map((o) => o.name))),
  ];
  const showOptionPicker = product.variants.length > 1;

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
  const discountPercent = compareAtPrice
    ? Math.round((1 - price.amount / compareAtPrice.amount) * 100)
    : null;

  return (
    <div>
      <h1 className="font-sans text-[20px] font-semibold text-brown-900">{product.title}</h1>

      {/* Placeholder rating — no reviews app/data source exists in this
          project yet. Kept per client request; swap for real review data
          once that integration is wired in. */}
      <div className="mt-3 flex items-center gap-2 font-sans text-sm">
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} className="h-5 w-5 text-warning-500" />
          ))}
        </span>
        <span className="text-brown-900/60">(1 customer review)</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 font-sans">
        {discountPercent !== null && discountPercent > 0 && (
          <span className="flex items-center gap-1 text-2xl font-bold text-[#008042]">
            <ArrowDownIcon className="h-5 w-5" />
            {discountPercent}%
          </span>
        )}
        <span className="flex items-center gap-0.5 text-2xl font-bold text-brown-900">
          <DirhamSymbol size="0.8em" />
          {price.amount.toLocaleString()}
        </span>
        {compareAtPrice && (
          <span className="flex items-center gap-0.5 text-lg text-[#7A7369] line-through">
            <DirhamSymbol size="0.65em" />
            {compareAtPrice.amount.toLocaleString()}
          </span>
        )}
      </div>

      {product.designCode && (
        <p className="mt-4 font-sans text-sm text-brown-900/70">
          <span className="font-semibold text-brown-900">Design Code:</span> {product.designCode}
        </p>
      )}

      {product.description && (
        <p className="mt-4 font-sans text-[14px] font-normal leading-relaxed text-brown-900">
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
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-brown-900/60">
                {name}
              </p>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const isSelected = selection[name] === value;
                  const candidateVariant = product.variants.find((variant) =>
                    matchesSelection(variant, { ...selection, [name]: value }),
                  );
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelection((s) => ({ ...s, [name]: value }))}
                      aria-pressed={isSelected}
                      disabled={!candidateVariant}
                      className={`rounded-full border px-4 py-2 font-sans text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        isSelected
                          ? "border-gold-600 bg-gold-600 text-white"
                          : "border-gold-200 text-brown-900/80 hover:bg-cream-100"
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

      {specEntries.length > 0 && (
        <div className="mt-5">
          <AccordionItem title="Specification" defaultOpen>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {specEntries.map((entry) => (
                <div key={entry.label} className="flex items-start gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element --
                      local brand SVGs with baked-in fill colors; matches
                      the existing FeaturesBar convention. */}
                  <img src={entry.icon} alt="" aria-hidden className="h-6 w-6 shrink-0" />
                  <div>
                    <p className="font-sans text-xs font-semibold text-gold-700">{entry.label}</p>
                    <p className="font-sans text-sm text-brown-900">{entry.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionItem>
        </div>
      )}

      <p
        className={`mt-5 font-sans text-sm font-medium ${
          available ? "text-success-500" : "text-error-500"
        }`}
      >
        {available ? "In Stock" : "Out of Stock"}
      </p>

      <div className="mt-4 flex items-center gap-3">
        {available && <QuantitySelector value={quantity} onChange={setQuantity} />}

        {selectedVariant && available ? (
          <AddToCartButton
            variantId={selectedVariant.id}
            quantity={quantity}
            label={`Add to Shopping Bag • AED ${(price.amount * quantity).toLocaleString()}`}
            className="flex-1 h-12 rounded-xl! text-[14px]!"
          />
        ) : (
          <button
            type="button"
            disabled
            className="flex-1 h-12 rounded-xl bg-cream-100 px-4 font-sans text-[14px] font-semibold uppercase tracking-wide text-brown-900/40"
          >
            Out of Stock
          </button>
        )}

        <WishlistButton
          product={product}
          iconClassName="h-5 w-5"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream-100 transition-colors hover:bg-cream-200"
        />
      </div>
    </div>
  );
}
