import Image from "next/image";
import type { HeritageImageSource } from "@/config/heritage-images";
import { getShopifyImageUrl, isUntrustedRemoteImage, IMAGE_BLUR_DATA_URL } from "@/utils/shopify-image";

/** Fills its (positioned, sized) parent. Falls back to a dark editorial panel
 * with a fine gold frame while no Shopify photo has been assigned. */
export default function HeritageImage({
  image,
  sizes,
  priority = false,
  parallax = true,
  className = "",
}: {
  image: HeritageImageSource;
  sizes: string;
  priority?: boolean;
  /** Slow vertical drift as the photo scrolls past; off for the timeline stage. */
  parallax?: boolean;
  className?: string;
}) {
  const media = !image ? (
    <div aria-hidden className={`absolute inset-0 bg-linear-to-br from-brown-900 via-gold-800 to-gold-800 ${className}`}>
      <div className="absolute inset-3 border border-gold-300/30 sm:inset-5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(179,150,80,0.22),transparent_60%)]" />
    </div>
  ) : (
    <Image
      src={getShopifyImageUrl(image.url, 1920)}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={isUntrustedRemoteImage(image.url)}
      placeholder="blur"
      blurDataURL={IMAGE_BLUR_DATA_URL}
      className={`object-cover ${className}`}
    />
  );

  if (!parallax) return media;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div data-parallax className="her-plx absolute inset-x-0 -inset-y-[7%]">
        {media}
      </div>
    </div>
  );
}
