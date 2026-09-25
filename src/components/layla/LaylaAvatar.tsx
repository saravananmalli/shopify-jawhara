import Image from "next/image";

/** Layla's mark — the bot glyph in /public/bot.svg — on a white or gold disc, or
 * bare. `online` adds the availability dot (decorative: she is always on). */
export default function LaylaAvatar({
  size = "md",
  tone = "white",
  online = false,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  tone?: "white" | "gold" | "bare";
  online?: boolean;
  className?: string;
}) {
  const glyph = { sm: 20, md: 26, lg: 34 }[size];
  // Bare has no disc, so its box is just the glyph — otherwise the empty disc space becomes a gap.
  const box = tone === "bare" ? "" : { sm: "h-10 w-10", md: "h-12 w-12", lg: "h-16 w-16" }[size];
  const disc = {
    white: "border border-gold-300 bg-white shadow-sm",
    gold: "bg-[linear-gradient(135deg,var(--color-gold-400),var(--color-gold-500))] shadow-sm",
    bare: "",
  }[tone];
  return (
    <span aria-hidden className={`relative flex shrink-0 items-center justify-center rounded-full ${box} ${disc} ${className}`}>
      <Image
        src="/bot.svg"
        alt=""
        width={glyph}
        height={glyph}
        unoptimized
        // The file carries its own brand gold; on the gold disc it is turned white.
        className={tone === "gold" ? "brightness-0 invert" : ""}
      />
      {online && (
        <span className="absolute -bottom-0.5 -end-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-success-500" />
      )}
    </span>
  );
}
