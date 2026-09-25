import type { CSSProperties } from "react";

type Tag = "h1" | "h2" | "h3" | "p";

/** Words rise out of a mask one after another. Split by word, never by
 * letter, so Arabic keeps its joined letterforms; the text stays real text
 * for screen readers and search. `hero` plays on load instead of on scroll. */
export default function SplitText({
  text,
  as: Component = "h2",
  className = "",
  hero = false,
  delay = 0,
}: {
  text: string;
  as?: Tag;
  className?: string;
  hero?: boolean;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <Component
      className={`${className} ${hero ? "her-hero-words" : ""}`}
      data-reveal={hero ? undefined : "words"}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {words.map((word, i) => (
        <span key={i}>
          <span className="her-word">
            <span style={{ "--i": i } as CSSProperties}>{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Component>
  );
}
