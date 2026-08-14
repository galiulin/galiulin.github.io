import { useEffect, useRef, useState } from "react";

export type LangLink = {
  lang: string;
  label: string;
  name: string;
  href: string;
  /** False when the current page has no counterpart in that language. */
  translated: boolean;
};

type Props = {
  current: string;
  currentLabel: string;
  links: LangLink[];
  title: string;
};

/** Remembers the choice so the site root can send the visitor back to it. */
export const LANG_STORAGE_KEY = "preferred-lang";

export default function LanguageSwitcher({ current, currentLabel, links, title }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (lang: string) => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Private mode / storage disabled — navigation still works.
    }
  };

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        aria-label={title}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 font-mono text-xs tracking-wide text-muted uppercase transition-colors hover:text-accent"
      >
        {currentLabel}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1 3.5 5 7.5 9 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-36 overflow-hidden rounded border border-border bg-raised py-1"
        >
          {links.map((link) => (
            <li key={link.lang} role="none">
              <a
                role="menuitem"
                href={link.href}
                onClick={() => choose(link.lang)}
                aria-current={link.lang === current ? "true" : undefined}
                className={`block px-3 py-1.5 text-sm transition-colors hover:bg-surface hover:text-accent ${
                  link.lang === current ? "text-accent" : "text-fg"
                }`}
              >
                {link.name}
                {!link.translated && (
                  <span className="ml-1 font-mono text-[10px] text-muted">↗</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
