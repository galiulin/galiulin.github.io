import sharp from "sharp";
import { SITE } from "../consts";

/** Open Graph card — 1200×630, rendered from an SVG built in the site's own colours. */
const WIDTH = 1200;
const HEIGHT = 630;
const TITLE_SIZE = 58;
const LINE_HEIGHT = 76;
const MAX_CHARS = 30;
const MAX_LINES = 3;

const XML_ESCAPES: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "'": "&apos;",
  '"': "&quot;",
};

const escapeXml = (value: string): string => value.replace(/[<>&'"]/g, (c) => XML_ESCAPES[c]);

/** Greedy word wrap to at most `maxLines` lines of roughly `maxChars`; overflow gets an ellipsis. */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = candidate;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);

  const shown = lines.join(" ").split(/\s+/).filter(Boolean).length;
  if (shown < words.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:]$/, "")}…`;
  }
  return lines;
}

export interface OgCard {
  title: string;
  /** Small line above/below the title, e.g. `blog/pointer-chasing.md`. */
  eyebrow?: string;
  tags?: string[];
}

export async function renderOgImage({ title, eyebrow, tags = [] }: OgCard): Promise<Buffer> {
  const lines = wrap(title, MAX_CHARS, MAX_LINES);
  const startY = 330 - (lines.length - 1) * (LINE_HEIGHT / 2);
  const titleSpans = lines
    .map((line, i) => `<text x="92" y="${startY + i * LINE_HEIGHT}" class="title">${escapeXml(line)}</text>`)
    .join("\n  ");

  const tagText = tags.slice(0, 3).map(escapeXml).join("  ·  ");
  const metaParts: string[] = [];
  if (eyebrow) metaParts.push(`<tspan class="meta-file">${escapeXml(eyebrow)}</tspan>`);
  if (tagText) metaParts.push(`<tspan dx="${eyebrow ? 44 : 0}">${tagText}</tspan>`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <style>
    .title { fill: #f2efe6; font-family: sans-serif; font-weight: 700; font-size: ${TITLE_SIZE}px; }
    .wordmark { fill: #4fd6a8; font-family: monospace; font-weight: 700; font-size: 34px; }
    .meta { fill: #8a8580; font-family: monospace; font-size: 25px; }
    .meta-file { fill: #2f8f70; }
  </style>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0a0a0a"/>
  <rect x="40" y="40" width="${WIDTH - 80}" height="${HEIGHT - 80}" fill="none" stroke="#262626" stroke-width="2" rx="10"/>
  <rect x="40" y="40" width="6" height="${HEIGHT - 80}" fill="#2f8f70"/>
  <text x="92" y="132" class="wordmark">${escapeXml(SITE.title)}_</text>
  ${titleSpans}
  ${metaParts.length ? `<text x="92" y="548" class="meta">${metaParts.join("")}</text>` : ""}
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
