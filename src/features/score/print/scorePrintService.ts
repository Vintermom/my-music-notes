import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Note } from "@/domain/types";
import { APP_VERSION } from "@/lib/appVersion";
import { getCurrentLang } from "@/i18n";
import { ScorePrintView } from "./ScorePrintView";
import { scorePrintStyles } from "./scorePrintStyles";
import { scoreT } from "../i18n";
import { sanitizeScoreData } from "../utils/scoreData";

const FRAME_ID = "score-print-frame";

/**
 * Score-only print: HTML/SVG in a hidden iframe → browser print dialog (Print or Save as PDF).
 * Independent from the app's existing Print / Export / Share code.
 */
export async function printScore(note: Note): Promise<void> {
  const score = sanitizeScoreData(note.score);
  const body = renderToStaticMarkup(
    createElement(ScorePrintView, {
      title: note.title || scoreT("score.untitled"),
      composer: note.composer || "",
      score,
      labels: {
        composer: scoreT("score.print.composer"),
        key: scoreT("score.key"),
        time: scoreT("score.time"),
        tempo: scoreT("score.print.tempo"),
      },
    })
  );
  const fontBase = new URL("fonts/share/", document.baseURI).href;
  const footer = `Created with MyMuNotes · ${APP_VERSION}`;
  const lang = getCurrentLang();
  const titleText = (note.title || "Score").replace(/[<>&"]/g, "");
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${titleText}</title><style>${scorePrintStyles(fontBase, footer)}</style></head><body>${body}</body></html>`;

  document.getElementById(FRAME_ID)?.remove();
  const frame = document.createElement("iframe");
  frame.id = FRAME_ID;
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) { frame.remove(); return; }
  doc.open();
  doc.write(html);
  doc.close();

  // Wait for the print fonts so multilingual lyrics never fall back mid-print.
  try {
    const fonts = doc.fonts;
    if (fonts) {
      void doc.body.offsetHeight; // trigger layout so only the fonts actually used start loading
      await fonts.ready;
    }
  } catch { /* print anyway */ }

  win.focus();
  win.print();
  setTimeout(() => frame.remove(), 60_000);
}
