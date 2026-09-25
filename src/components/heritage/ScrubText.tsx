import type { CSSProperties } from "react";

/** Words light up one by one as the block scrolls through the viewport
 * (progress is written to `--p` by HeritageEffects). Fully lit with no JS. */
export default function ScrubText({
  text,
  as: Component = "p",
  className = "",
}: {
  text: string;
  as?: "p" | "h2";
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <Component className={className} data-scrub style={{ "--n": words.length } as CSSProperties}>
      {words.map((word, i) => (
        <span key={i}>
          <span className="her-scrub-word" style={{ "--i": i } as CSSProperties}>
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Component>
  );
}
