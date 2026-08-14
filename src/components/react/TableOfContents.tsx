import { useEffect, useState } from "react";

export type Heading = { depth: number; slug: string; text: string };

type Props = {
  headings: Heading[];
  title: string;
};

/** Distance from the top (below the sticky header) where a heading counts as "current". */
const ACTIVE_OFFSET = 110;

export default function TableOfContents({ headings, title }: Props) {
  const [active, setActive] = useState(headings[0]?.slug ?? "");

  useEffect(() => {
    const targets = headings
      .map((heading) => document.getElementById(heading.slug))
      .filter((element): element is HTMLElement => element !== null);
    if (targets.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const passed = targets.filter((element) => element.getBoundingClientRect().top <= ACTIVE_OFFSET);
      const current = passed.at(-1) ?? targets[0]!;
      setActive(current.id);
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  return (
    <nav aria-label={title} className="text-sm">
      <p className="mb-3 font-mono text-[10px] tracking-widest text-muted uppercase">{title}</p>
      <ul className="space-y-1.5 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.slug} style={{ paddingLeft: `${(heading.depth - 2) * 0.75 + 0.75}rem` }}>
            <a
              href={`#${heading.slug}`}
              aria-current={heading.slug === active ? "location" : undefined}
              className={`-ml-px block border-l-2 py-0.5 pl-2 leading-snug transition-colors ${
                heading.slug === active
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
