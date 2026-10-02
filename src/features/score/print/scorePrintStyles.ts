// Print-only styles for the Score document (scoped to the print iframe).
// Fonts: Noto Sans family already bundled in /fonts/share (SIL Open Font License 1.1).

export function scorePrintStyles(fontBase: string, footer: string): string {
  const font = (family: string, file: string, weight = 400) =>
    `@font-face{font-family:"${family}";src:url("${fontBase}${file}") format("truetype");font-weight:${weight};font-display:block;}`;
  const safeFooter = footer.replace(/["\\]/g, "");
  return `
${font("ScoreSans", "NotoSans-Regular.ttf")}
${font("ScoreSans", "NotoSans-Bold.ttf", 700)}
${font("ScoreThai", "NotoSansThai-Regular.ttf")}
${font("ScoreThai", "NotoSansThai-Bold.ttf", 700)}
${font("ScoreKR", "NotoSansKR-Regular.ttf")}
${font("ScoreJP", "NotoSansJP-Regular.ttf")}
${font("ScoreMusic", "NotoMusic-Regular.otf")}
@page { size: A4 portrait; margin: 16mm 15mm 18mm 15mm;
  @bottom-center { content: counter(page) " / " counter(pages); font: 9pt "ScoreSans", sans-serif; color: #444; }
  @bottom-right { content: "${safeFooter}"; font: 8pt "ScoreSans", sans-serif; color: #666; }
}
* { box-sizing: border-box; }
html, body { margin: 0; background: #fff; color: #000; }
body { font-family: "ScoreSans", "ScoreThai", "ScoreKR", "ScoreJP", "Noto Sans Arabic", "Segoe UI", Tahoma, sans-serif; }
svg text { font-family: "ScoreSans", "ScoreThai", "ScoreKR", "ScoreJP", "Noto Sans Arabic", "Segoe UI", sans-serif; fill: #000; }
svg text.clef { font-family: "ScoreMusic", "Noto Music", "Segoe UI Symbol", "Apple Symbols", "Bravura", serif; }
svg { color: #000; }
.score-head { text-align: center; margin-bottom: 6mm; break-after: avoid; }
.score-head h1 { font-size: 20pt; margin: 0 0 2mm; font-weight: 700; }
.score-composer { font-size: 11pt; margin: 0 0 1.5mm; }
.score-meta { font-size: 9.5pt; margin: 0; color: #333; }
.score-system { display: block; width: 100%; height: auto; margin: 0 0 3.5mm; break-inside: avoid; page-break-inside: avoid; overflow: visible; }
`;
}
