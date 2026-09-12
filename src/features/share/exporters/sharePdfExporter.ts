import { jsPDF } from "jspdf";
import { APP_VERSION } from "@/lib/appVersion";
import type { ShareNote, PreparedFile } from "../shareTypes";
import { safeBaseName, withExtension } from "../utils/fileName";

/**
 * Share-specific PDF builder. Independent from the existing Print / Export PDF
 * implementation (which uses the native print dialog and cannot return a file).
 */

function formatDateISO(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  const offsetMinutes = d.getTimezoneOffset();
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const offsetMins = Math.abs(offsetMinutes % 60);
  const tz = offsetMins > 0
    ? `(UTC${sign}${offsetHours}:${pad(offsetMins)})`
    : `(UTC${sign}${offsetHours})`;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} ${tz}`;
}

export function buildSharePdfBlob(note: ShareNote): Blob {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const marginTop = 56;
  const bottomLimit = doc.internal.pageSize.getHeight() - 56;
  const width = doc.internal.pageSize.getWidth() - marginX * 2;
  let y = marginTop;

  const newPageIfNeeded = (lineHeight: number) => {
    if (y + lineHeight > bottomLimit) {
      doc.addPage();
      y = marginTop;
    }
  };

  const writeBlock = (label: string, value: string, opts?: { mono?: boolean; size?: number }) => {
    if (!value) return;
    const size = opts?.size ?? 11;
    if (label) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      newPageIfNeeded(14);
      doc.text(label, marginX, y);
      y += 14;
    }
    doc.setFont(opts?.mono ? "courier" : "helvetica", "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(value, width) as string[];
    lines.forEach((line) => {
      newPageIfNeeded(size + 4);
      doc.text(line, marginX, y);
      y += size + 4;
    });
    y += 8;
  };

  writeBlock("Title", note.title || "Untitled");
  writeBlock("Composer", note.composer, { size: 11 });
  writeBlock("Lyrics", note.lyrics, { mono: true, size: 10 });
  writeBlock("Style", note.style);
  writeBlock("Extra info", note.extraInfo);
  writeBlock("Tags", note.tags?.join(", ") || "");

  writeBlock("", `Created: ${formatDateISO(note.createdAt)}`, { size: 9 });
  writeBlock("", `Last edited: ${formatDateISO(note.updatedAt)}`, { size: 9 });
  writeBlock("", `Saved: ${formatDateISO(Date.now())}`, { size: 9 });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      `My Music Notes (Web App) · Version ${APP_VERSION} · ${formatDateISO(Date.now())}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 24,
      { align: "center" }
    );
  }

  return doc.output("blob");
}

export function prepareSharePdf(note: ShareNote): PreparedFile {
  const blob = buildSharePdfBlob(note);
  const fileName = withExtension(safeBaseName(note.title), "pdf");
  return {
    blob,
    fileName,
    file: new File([blob], fileName, { type: "application/pdf" }),
  };
}
