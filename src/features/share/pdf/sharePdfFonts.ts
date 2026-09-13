/**
 * Share-PDF font configuration (Share feature only).
 *
 * Bundled, locally served Unicode fonts (SIL Open Font License, see
 * public/fonts/share/OFL.txt). Nothing is fetched from an external service:
 * the files are part of the deployed app and read from the same origin.
 *
 * - Noto Sans        → Latin (English, Swedish å ä ö Å Ä Ö, …), digits, punctuation
 * - Noto Sans Thai   → Thai (vowels / tone marks are positioned by the PDF
 *                       engine's OpenType shaping, so stacked marks render correctly)
 * - Noto Sans KR     → Hangul (Korean)
 * - Noto Sans JP     → Hiragana, Katakana, Kanji (Japanese)
 *
 * Text is split into runs per script and each run is assigned the matching
 * font family, which gives font fallback for mixed-language lyrics.
 */

export type ShareFontFamily = "ShareLatin" | "ShareThai" | "ShareKR" | "ShareJP";

export interface ShareTextRun {
  text: string;
  font: ShareFontFamily;
}

interface FontFiles {
  normal: string;
  bold: string;
}

const FONT_FILES: Record<ShareFontFamily, FontFiles> = {
  ShareLatin: { normal: "NotoSans-Regular.ttf", bold: "NotoSans-Bold.ttf" },
  ShareThai: { normal: "NotoSansThai-Regular.ttf", bold: "NotoSansThai-Bold.ttf" },
  // Regular weight only for CJK to keep the bundled fonts reasonably small.
  ShareKR: { normal: "NotoSansKR-Regular.ttf", bold: "NotoSansKR-Regular.ttf" },
  ShareJP: { normal: "NotoSansJP-Regular.ttf", bold: "NotoSansJP-Regular.ttf" },
};

export const SHARE_FONT_DIR = "fonts/share/";

/** Absolute same-origin URL for a bundled Share font file. */
export function shareFontUrl(fileName: string): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
  const path = `${base}${SHARE_FONT_DIR}${fileName}`;
  if (typeof window !== "undefined" && window.location) {
    return new URL(path, window.location.origin).href;
  }
  return path;
}

type ScriptClass = "latin" | "thai" | "hangul" | "kana" | "han" | "neutral";

function classifyCodePoint(cp: number): ScriptClass {
  // Thai
  if (cp >= 0x0e00 && cp <= 0x0e7f) return "thai";
  // Hangul (Jamo, compatibility Jamo, syllables, extended Jamo)
  if (
    (cp >= 0x1100 && cp <= 0x11ff) ||
    (cp >= 0x3130 && cp <= 0x318f) ||
    (cp >= 0xa960 && cp <= 0xa97f) ||
    (cp >= 0xac00 && cp <= 0xd7af) ||
    (cp >= 0xd7b0 && cp <= 0xd7ff)
  ) {
    return "hangul";
  }
  // Hiragana, Katakana, Katakana phonetic extensions, half-width Katakana
  if (
    (cp >= 0x3040 && cp <= 0x30ff) ||
    (cp >= 0x31f0 && cp <= 0x31ff) ||
    (cp >= 0xff65 && cp <= 0xff9f)
  ) {
    return "kana";
  }
  // Han ideographs, CJK symbols/punctuation, full-width forms, compatibility
  if (
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x20000 && cp <= 0x2ffff) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0x3000 && cp <= 0x303f) ||
    (cp >= 0xff00 && cp <= 0xff64) ||
    (cp >= 0xffe0 && cp <= 0xffef)
  ) {
    return "han";
  }
  // Letters of other scripts covered by Noto Sans (Latin, Greek, Cyrillic, …)
  if (
    (cp >= 0x41 && cp <= 0x5a) ||
    (cp >= 0x61 && cp <= 0x7a) ||
    (cp >= 0xc0 && cp <= 0x024f) ||
    (cp >= 0x0370 && cp <= 0x052f) ||
    (cp >= 0x1e00 && cp <= 0x1eff)
  ) {
    return "latin";
  }
  // Spaces, digits, punctuation, symbols: inherit the surrounding script.
  return "neutral";
}

/**
 * Decides which family should render Han ideographs for this document.
 * Kanji-with-kana or Han-only → Japanese font; Hanja next to Hangul → Korean font.
 */
export function pickHanFamily(texts: string[]): ShareFontFamily {
  let hasKana = false;
  let hasHangul = false;
  for (const text of texts) {
    for (const ch of text) {
      const cls = classifyCodePoint(ch.codePointAt(0) ?? 0);
      if (cls === "kana") hasKana = true;
      else if (cls === "hangul") hasHangul = true;
    }
  }
  if (!hasKana && hasHangul) return "ShareKR";
  return "ShareJP";
}

function familyFor(cls: ScriptClass, hanFamily: ShareFontFamily): ShareFontFamily {
  switch (cls) {
    case "thai":
      return "ShareThai";
    case "hangul":
      return "ShareKR";
    case "kana":
      return "ShareJP";
    case "han":
      return hanFamily;
    default:
      return "ShareLatin";
  }
}

/**
 * Splits a single line of text into font runs. Neutral characters (spaces,
 * digits, punctuation) attach to the preceding script, or the following one
 * at the start of a line, so words are not broken into extra runs.
 */
export function segmentTextByFont(text: string, hanFamily: ShareFontFamily): ShareTextRun[] {
  if (!text) return [];
  const chars = Array.from(text);
  const classes = chars.map((ch) => classifyCodePoint(ch.codePointAt(0) ?? 0));

  // Resolve neutral characters.
  const resolved: ShareFontFamily[] = new Array(chars.length);
  let prev: ShareFontFamily | null = null;
  for (let i = 0; i < chars.length; i += 1) {
    if (classes[i] !== "neutral") {
      prev = familyFor(classes[i], hanFamily);
      resolved[i] = prev;
    } else if (prev) {
      resolved[i] = prev;
    } else {
      // Look ahead for the first strong script.
      let next: ShareFontFamily = "ShareLatin";
      for (let j = i + 1; j < chars.length; j += 1) {
        if (classes[j] !== "neutral") {
          next = familyFor(classes[j], hanFamily);
          break;
        }
      }
      resolved[i] = next;
    }
  }

  const runs: ShareTextRun[] = [];
  for (let i = 0; i < chars.length; i += 1) {
    const last = runs[runs.length - 1];
    if (last && last.font === resolved[i]) {
      last.text += chars[i];
    } else {
      runs.push({ text: chars[i], font: resolved[i] });
    }
  }
  return runs;
}

/** Collects every font family needed to render the given texts. */
export function collectFontFamilies(texts: string[]): Set<ShareFontFamily> {
  const hanFamily = pickHanFamily(texts);
  const families = new Set<ShareFontFamily>(["ShareLatin"]);
  for (const text of texts) {
    for (const line of text.split(/\r?\n/)) {
      for (const run of segmentTextByFont(line, hanFamily)) families.add(run.font);
    }
  }
  return families;
}

export interface SharePdfFontDefinition {
  normal: string;
  bold: string;
  italics: string;
  bolditalics: string;
}

/**
 * Builds the font definition map for the PDF engine, containing only the
 * families actually needed so that unused (large) fonts are never downloaded.
 */
export function buildFontDefinitions(
  families: Set<ShareFontFamily>
): Record<string, SharePdfFontDefinition> {
  const defs: Record<string, SharePdfFontDefinition> = {};
  families.forEach((family) => {
    const files = FONT_FILES[family];
    const normal = shareFontUrl(files.normal);
    const bold = shareFontUrl(files.bold);
    defs[family] = { normal, bold, italics: normal, bolditalics: bold };
  });
  return defs;
}
