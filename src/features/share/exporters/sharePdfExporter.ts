import type { TDocumentDefinitions, Content, ContentText } from "pdfmake/interfaces";
import { APP_VERSION } from "@/lib/appVersion";
import type { ShareNote, PreparedFile } from "../shareTypes";
import { safeBaseName, withExtension } from "../utils/fileName";
import { localExportTimestamp } from "../utils/shareTimestamp";
import {
  buildFontDefinitions,
  collectFontFamilies,
  pickHanFamily,
  segmentTextByFont,
  type ShareFontFamily,
} from "../pdf/sharePdfFonts";

/** Export footer, generated locally at the moment the Share PDF is created. */
export function shareFooterText(date: Date = new Date()): string {
  return `ส่งออกจาก: MyMuNotes (เว็บแอป) \u00b7 เวอร์ชัน ${APP_VERSION} \u00b7 ${localExportTimestamp(date)}`;
}


/**
 * Share-specific PDF builder (Share feature only).
 *
 * Independent from the existing Print / Export PDF implementation, which uses
 * the native print dialog and is left untouched. Reads the song read-only and
 * renders real Unicode text (Thai, Swedish, English, Korean, Japanese, mixed)
 * with locally bundled fonts — nothing leaves the device.
 *
 * Page format: A4 portrait, white background, comfortable margins, natural
 * multi-page flow. Content order: Title, Composer, Lyrics, then Style /
 * Extra Info / Tags only when they have content.
 */

const PAGE_MARGIN_X = 56;
const PAGE_MARGIN_TOP = 60;
const PAGE_MARGIN_BOTTOM = 64;

const SIZE_TITLE = 19;
const SIZE_COMPOSER = 11;
const SIZE_HEADING = 12;
const SIZE_LYRICS = 11.5;
const SIZE_SECONDARY = 10;
const SIZE_FOOTER = 8;

const COLOR_TEXT = "#000000";
const COLOR_SECONDARY = "#3a3a3a";
const COLOR_MUTED = "#6b6b6b";

function runsFor(line: string, hanFamily: ShareFontFamily): ContentText["text"] {
  const runs = segmentTextByFont(line, hanFamily);
  if (runs.length === 0) return " ";
  if (runs.length === 1) return [{ text: runs[0].text, font: runs[0].font }];
  return runs.map((run) => ({ text: run.text, font: run.font }));
}

/** One text node per source line so line breaks and blank lines are preserved exactly. */
function linesToContent(
  value: string,
  hanFamily: ShareFontFamily,
  style: Partial<ContentText>,
  opts?: { boldSectionLabels?: boolean }
): Content[] {
  const lines = value.replace(/\r\n?/g, "\n").split("\n");
  return lines.map((line) => {
    if (line.trim() === "") {
      // Blank line: keep vertical rhythm with an empty line of the same size.
      return { text: " ", font: "ShareLatin", ...style } as ContentText;
    }
    const isSectionLabel = opts?.boldSectionLabels && /^\s*\[[^\]]+\]\s*$/.test(line);
    return {
      text: runsFor(line, hanFamily),
      preserveLeadingSpaces: true,
      ...style,
      ...(isSectionLabel ? { bold: true } : {}),
    } as ContentText;
  });
}

function heading(label: string, hanFamily: ShareFontFamily, top: number): ContentText {
  return {
    text: runsFor(label, hanFamily),
    fontSize: SIZE_HEADING,
    bold: true,
    color: COLOR_TEXT,
    margin: [0, top, 0, 6],
    headlineLevel: 1,
  };
}

function buildDocumentDefinition(note: ShareNote): TDocumentDefinitions {
  const title = (note.title || "").trim() || "Untitled Song";
  const composer = (note.composer || "").trim();
  const lyrics = note.lyrics || "";
  const style = (note.style || "").trim();
  const extraInfo = (note.extraInfo || "").trim();
  const tags = (note.tags || []).map((tag) => tag.trim()).filter(Boolean).join(", ");

  const hanFamily = pickHanFamily([title, composer, lyrics, style, extraInfo, tags]);
  const content: Content[] = [];

  // 1. Song Title
  content.push({
    text: runsFor(title, hanFamily),
    fontSize: SIZE_TITLE,
    bold: true,
    color: COLOR_TEXT,
    margin: [0, 0, 0, composer ? 4 : 14],
  });

  // 2. Composer
  if (composer) {
    content.push({
      text: runsFor(composer, hanFamily),
      fontSize: SIZE_COMPOSER,
      color: COLOR_SECONDARY,
      margin: [0, 0, 0, 14],
    });
  }

  // 3. Lyrics (primary content)
  content.push(heading("Lyrics", hanFamily, 4));
  if (lyrics.trim()) {
    content.push(
      ...linesToContent(
        lyrics,
        hanFamily,
        { fontSize: SIZE_LYRICS, lineHeight: 1.4, color: COLOR_TEXT },
        { boldSectionLabels: true }
      )
    );
  } else {
    content.push({ text: "—", fontSize: SIZE_LYRICS, color: COLOR_MUTED, font: "ShareLatin" });
  }

  // 4–6. Secondary sections, only when they have content
  const secondaryStyle: Partial<ContentText> = {
    fontSize: SIZE_SECONDARY,
    lineHeight: 1.35,
    color: COLOR_SECONDARY,
  };
  if (style) {
    content.push(heading("Style", hanFamily, 18));
    content.push(...linesToContent(style, hanFamily, secondaryStyle));
  }
  if (extraInfo) {
    content.push(heading("Extra Info", hanFamily, 18));
    content.push(...linesToContent(extraInfo, hanFamily, secondaryStyle));
  }
  if (tags) {
    content.push(heading("Tags", hanFamily, 18));
    content.push(...linesToContent(tags, hanFamily, secondaryStyle));
  }

  const footerLabel = shareFooterText();

  return {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [PAGE_MARGIN_X, PAGE_MARGIN_TOP, PAGE_MARGIN_X, PAGE_MARGIN_BOTTOM],
    info: { title, author: composer || undefined, creator: "MyMuNotes", producer: "MyMuNotes" },
    defaultStyle: { font: "ShareLatin", fontSize: SIZE_LYRICS, color: COLOR_TEXT },
    // Keep a section heading together with the first line that follows it.
    pageBreakBefore: (currentNode, followingNodesOnPage) =>
      currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0,
    footer: (currentPage, pageCount) => ({
      columns: [
        {
          text: runsFor(footerLabel, hanFamily),
          fontSize: SIZE_FOOTER,
          color: COLOR_MUTED,
          width: "*",
        },
        {
          text: `${currentPage} / ${pageCount}`,
          fontSize: SIZE_FOOTER,
          color: COLOR_MUTED,
          font: "ShareLatin",
          alignment: "right",
          width: "auto",
        },
      ],
      columnGap: 10,
      margin: [PAGE_MARGIN_X, 26, PAGE_MARGIN_X, 0],
    }),
    content,
  };
}


type PdfMakeModule = typeof import("pdfmake/build/pdfmake");

let pdfMakePromise: Promise<PdfMakeModule> | null = null;

/** Lazily loads the PDF engine so it is only downloaded when Share is used. */
function loadPdfMake(): Promise<PdfMakeModule> {
  if (!pdfMakePromise) {
    pdfMakePromise = import("pdfmake/build/pdfmake").then((mod) => {
      const resolved = (mod as unknown as { default?: PdfMakeModule }).default ?? (mod as PdfMakeModule);
      return resolved;
    });
    pdfMakePromise.catch(() => {
      pdfMakePromise = null;
    });
  }
  return pdfMakePromise;
}

export async function buildSharePdfBlob(note: ShareNote): Promise<Blob> {
  const pdfMake = await loadPdfMake();
  const definition = buildDocumentDefinition(note);
  const families = collectFontFamilies([
    note.title || "",
    note.composer || "",
    note.lyrics || "",
    note.style || "",
    note.extraInfo || "",
    (note.tags || []).join(", "),
  ]);
  const fonts = buildFontDefinitions(families);

  return new Promise<Blob>((resolve, reject) => {
    try {
      pdfMake.createPdf(definition, undefined, fonts, {}).getBlob((blob: Blob) => {
        if (blob && blob.size > 0) resolve(blob);
        else reject(new Error("Empty PDF"));
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function prepareSharePdf(note: ShareNote): Promise<PreparedFile> {
  const blob = await buildSharePdfBlob(note);
  const fileName = withExtension(safeBaseName(note.title), "pdf");
  return {
    blob,
    fileName,
    file: new File([blob], fileName, { type: "application/pdf" }),
  };
}
