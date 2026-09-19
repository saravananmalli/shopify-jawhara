import { SparkleIcon } from "@/components/icons";

/**
 * Stand-in for lifestyle photography the Figma export doesn't include as an asset.
 * Swap for a real <Image> once the shoot/CDN assets are supplied.
 */
export default function PlaceholderImage({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-gold-100 via-cream-200 to-gold-300/60 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_60%)]" />
      <div className="relative flex flex-col items-center gap-2 text-gold-700">
        <SparkleIcon className="h-6 w-6" />
        {label && (
          <span className="text-xs font-medium tracking-wide uppercase">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
