import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Content } from "pdfmake/interfaces";
import type { Note } from "@/domain/types";
import type { ScoreClef } from "../types/score.types";
import { APP_VERSION } from "@/lib/appVersion";
import type { PreparedFile } from "@/features/share/shareTypes";
import { safeBaseName, withExtension } from "@/features/share/utils/fileName";
import {
  buildFontDefinitions, collectFontFamilies, pickHanFamily, segmentTextByFont, type ShareFontFamily,
} from "@/features/share/pdf/sharePdfFonts";
import { scoreT } from "../i18n";
import { sanitizeScoreData } from "../utils/scoreData";
import { ScoreSystemSvg } from "./ScorePrintView";
import { LAYOUT_FONT, LAYOUT_WIDTH, layoutScore, textWidth, type LaidSystem, type ScoreLayout } from "./scoreLayout";

/**
 * Score Share PDF built from the same Score layout as Print / Save as PDF.
 * Staff, notes and rests stay vector; lyrics, chords and headings are real text
 * with the bundled Unicode fonts. Only the clef/accidental glyph layer is drawn
 * as a high-resolution transparent overlay because PDF fonts lack music symbols.
 */
const MARGIN_X = 42.5; // ≈ 15 mm
const MARGIN_TOP = 45; // ≈ 16 mm
const MARGIN_BOTTOM = 51; // ≈ 18 mm
const CONTENT_W = 595.28 - 2 * MARGIN_X;
const S = CONTENT_W / LAYOUT_WIDTH;
const GLYPH_SCALE = 4;

function runs(text: string, han: ShareFontFamily) {
  const r = segmentTextByFont(text, han);
  return r.length ? r.map((x) => ({ text: x.text, font: x.font })) : " ";
}

async function glyphLayer(system: LaidSystem, layout: ScoreLayout, clef: ScoreClef): Promise<string | null> {
  try {
    const svg = renderToStaticMarkup(createElement(ScoreSystemSvg, { system, layout, clef, layer: "glyphs" }))
      .replace('width="100%"', `width="${LAYOUT_WIDTH * GLYPH_SCALE}" height="${system.height * GLYPH_SCALE}"`)
      .replace("<svg ", '<svg style="font-family:\'Noto Music\',\'Segoe UI Symbol\',\'Apple Symbols\',\'Bravura\',serif" ');
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = LAYOUT_WIDTH * GLYPH_SCALE;
    canvas.height = Math.ceil(system.height * GLYPH_SCALE);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function centered(text: string, cx: number, baseline: number, size: number, han: ShareFontFamily, bold = false): Content {
  const w = textWidth(text, size, bold) * S + 20;
  return {
    relativePosition: { x: cx * S - w / 2, y: baseline * S - size * S * 0.95 },
    columns: [{ width: w, text: runs(text, han), alignment: "center", fontSize: size * S, bold }],
  } as Content;
}

function left(text: string, x: number, baseline: number, size: number, han: ShareFontFamily, bold = false): Content {
  return {
    relativePosition: { x: x * S, y: baseline * S - size * S * 0.95 },
    columns: [{ width: "auto", text: runs(text, han), fontSize: size * S, bold }],
  } as Content;
}

export async function buildScorePdfBlob(note: Note): Promise<Blob> {
  const score = sanitizeScoreData(note.score);
  const layout = layoutScore(score);
  const title = note.title || scoreT("score.untitled");
  const composer = note.composer || "";
  const allText = [title, composer, score.lyrics, ...score.chords.map((c) => c.symbol),
    ...score.measures.flatMap((m) => m.events.map((e) => e.lyric || ""))];
  const han = pickHanFamily(allText);

  const content: Content[] = [
    { text: runs(title, han), fontSize: 20, bold: true, alignment: "center", margin: [0, 0, 0, 5] },
  ];
  if (composer) content.push({ text: runs(`${scoreT("score.print.composer")}: ${composer}`, han), fontSize: 11, alignment: "center", margin: [0, 0, 0, 4] });
  content.push({
    text: runs(`${scoreT("score.key")}: ${score.keySignature} · ${scoreT("score.time")}: ${score.timeSignature} · ${scoreT("score.print.tempo")}: ${score.tempo} BPM`, han),
    fontSize: 9.5, color: "#333333", alignment: "center", margin: [0, 0, 0, 16],
  });

  for (const system of layout.systems) {
    const overlays: Content[] = [];
    for (const m of system.measures) {
      overlays.push(left(String(m.index + 1), m.x + 3, system.numberY, 9, han));
      for (const c of m.chords) overlays.push(left(c.symbol, c.x, system.chordY, LAYOUT_FONT.chord, han, true));
      for (const le of m.events) if (le.event.kind === "note" && le.event.lyric) overlays.push(centered(le.event.lyric, le.x, system.lyricY, LAYOUT_FONT.lyric, han));
    }
    if (system.showTime) {
      overlays.push(centered(layout.timeTop, system.header - 16, system.staffTop + 18, 20, han, true));
      overlays.push(centered(layout.timeBottom, system.header - 16, system.staffTop + 38, 20, han, true));
    }
    const glyph = await glyphLayer(system, layout, score.clef);
    if (glyph) overlays.push({ image: glyph, width: CONTENT_W, relativePosition: { x: 0, y: 0 } } as Content);
    const shapes = renderToStaticMarkup(createElement(ScoreSystemSvg, { system, layout, clef: score.clef, layer: "shapes" }))
      .replace(/currentColor/g, "#000000");
    // Positioned overlays first (they take no space), then the in-flow staff. Never split a system.
    content.push({ stack: [...overlays, { svg: shapes, width: CONTENT_W }], unbreakable: true, margin: [0, 0, 0, 9] } as Content);
  }

  const footer = `Created with MyMuNotes · ${APP_VERSION}`;
  const families = collectFontFamilies([...allText, footer, "0123456789 · BPM"]);
  const pdfMakeMod = await import("pdfmake/build/pdfmake");
  const pdfMake = (pdfMakeMod as unknown as { default?: typeof pdfMakeMod }).default ?? pdfMakeMod;

  return new Promise<Blob>((resolve, reject) => {
    try {
      pdfMake.createPdf({
        pageSize: "A4", pageOrientation: "portrait",
        pageMargins: [MARGIN_X, MARGIN_TOP, MARGIN_X, MARGIN_BOTTOM],
        info: { title, author: composer || undefined, creator: "MyMuNotes", producer: "MyMuNotes" },
        defaultStyle: { font: "ShareLatin", fontSize: 11, color: "#000000" },
        footer: (page, pages) => ({
          columns: [
            { text: `${page} / ${pages}`, alignment: "center", fontSize: 9, color: "#444444", width: "*" },
            { text: footer, alignment: "right", fontSize: 8, color: "#666666", width: "auto" },
          ],
          margin: [MARGIN_X, 20, MARGIN_X, 0],
        }),
        content,
      }, undefined, buildFontDefinitions(families), {}).getBlob((blob: Blob) => {
        if (blob && blob.size > 0) resolve(blob); else reject(new Error("Empty PDF"));
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function prepareScorePdf(note: Note): Promise<PreparedFile> {
  const blob = await buildScorePdfBlob(note);
  const fileName = withExtension(safeBaseName(note.title), "pdf");
  return { blob, fileName, file: new File([blob], fileName, { type: "application/pdf" }) };
}
