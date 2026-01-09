import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { jsPDF } from "jspdf";
import { Note } from "@/domain/types";
import { t } from "@/i18n";

/**
 * Generate a safe filename from note title
 */
function generateSafeFilename(title: string, extension: string): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  
  if (title && title.trim().length > 0) {
    const safeName = title
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[\/\\?%*:|"<>]/g, "")
      .slice(0, 50);
    
    if (safeName.length > 0) {
      return `${safeName}_${dateStr}.${extension}`;
    }
  }
  
  return `MyMusicNotes_${dateStr}.${extension}`;
}

/**
 * Format date for PDF/display
 */
function formatDateISO(ts: number): string {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  
  const offsetMinutes = d.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const offsetMins = Math.abs(offsetMinutes % 60);
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const tzString = offsetMins > 0 
    ? `(UTC${sign}${offsetHours}:${String(offsetMins).padStart(2, "0")})`
    : `(UTC${sign}${offsetHours})`;
  
  return `${year}-${month}-${day} ${hours}:${mins} ${tzString}`;
}

/**
 * Generate PDF content programmatically using jsPDF
 * Same content as desktop print output
 */
export async function generateNotePdf(note: Note): Promise<{ filename: string; base64: string }> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  const lineHeight = 6;
  const sectionGap = 4;

  // Helper to add text with word wrap
  const addText = (text: string, fontSize: number, isBold: boolean = false, isLabel: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    
    const lines = doc.splitTextToSize(text, contentWidth);
    
    // Check if we need a new page
    if (y + lines.length * lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + (isLabel ? 1 : sectionGap);
  };

  const addLabelValue = (label: string, value: string) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", margin, y);
    
    const labelWidth = doc.getTextWidth(label + ": ");
    doc.setFont("helvetica", "normal");
    
    const valueLines = doc.splitTextToSize(value, contentWidth - labelWidth);
    if (valueLines.length === 1) {
      doc.text(valueLines[0], margin + labelWidth, y);
      y += lineHeight + 1;
    } else {
      y += lineHeight;
      const fullLines = doc.splitTextToSize(value, contentWidth);
      fullLines.forEach((line: string) => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
      y += 1;
    }
  };

  // Title
  if (note.title) {
    addText(t("print.labelTitle"), 9, true, true);
    addText(note.title, 14, false);
    y += sectionGap;
  }

  // Composer
  if (note.composer) {
    addText(t("print.labelComposer"), 9, true, true);
    addText(note.composer, 11, false);
    y += sectionGap;
  }

  // Divider
  if (note.title || note.composer) {
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += sectionGap * 2;
  }

  // Lyrics
  if (note.lyrics) {
    addText(t("print.labelLyrics"), 9, true, true);
    
    // Handle lyrics line by line to preserve formatting
    const lyricsLines = note.lyrics.split("\n");
    doc.setFontSize(10);
    doc.setFont("courier", "normal");
    
    lyricsLines.forEach((line) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      
      if (line.trim() === "") {
        y += lineHeight * 0.5;
      } else {
        const wrappedLines = doc.splitTextToSize(line, contentWidth);
        wrappedLines.forEach((wrappedLine: string) => {
          if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(wrappedLine, margin, y);
          y += lineHeight;
        });
      }
    });
    
    y += sectionGap;
  }

  // Divider before metadata
  if (note.lyrics && (note.style || note.extraInfo || note.tags.length > 0)) {
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += sectionGap * 2;
  }

  // Style
  if (note.style) {
    addLabelValue(t("print.labelStyle"), note.style);
  }

  // Extra Info
  if (note.extraInfo) {
    addLabelValue(t("print.labelExtra"), note.extraInfo);
  }

  // Tags
  if (note.tags.length > 0) {
    addLabelValue(t("print.labelTags"), note.tags.join(", "));
  }

  // Footer divider
  y += sectionGap;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += sectionGap * 2;

  // Timestamps
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(t("print.created") + ":", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatDateISO(note.createdAt), margin + doc.getTextWidth(t("print.created") + ": "), y);
  y += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text(t("print.updated") + ":", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatDateISO(note.updatedAt), margin + doc.getTextWidth(t("print.updated") + ": "), y);
  y += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text(t("print.saved") + ":", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatDateISO(Date.now()), margin + doc.getTextWidth(t("print.saved") + ": "), y);

  // Generate base64
  const filename = generateSafeFilename(note.title, "pdf");
  const base64 = doc.output("datauristring").split(",")[1];

  return { filename, base64 };
}

/**
 * Save file to device and open share sheet (Android/iOS)
 */
export async function saveAndShareFile(
  filename: string,
  content: string,
  mimeType: string,
  isBase64: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    // Write file to cache directory
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Cache,
      encoding: isBase64 ? undefined : Encoding.UTF8,
    });

    // Share the file
    await Share.share({
      title: filename,
      url: result.uri,
      dialogTitle: `Share ${filename}`,
    });

    return { success: true };
  } catch (error) {
    console.error("Mobile export error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Export failed" 
    };
  }
}

/**
 * Export note as PDF on mobile (generates PDF, saves to cache, opens share sheet)
 */
export async function exportNotePdfMobile(note: Note): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    const { filename, base64 } = await generateNotePdf(note);
    
    const result = await saveAndShareFile(filename, base64, "application/pdf", true);
    
    if (result.success) {
      return { success: true, filename };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("PDF export error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "PDF generation failed" 
    };
  }
}

/**
 * Export note as JSON on mobile (saves to cache, opens share sheet)
 */
export async function exportNoteJsonMobile(note: Note): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `MyMusicNotes-Export-${dateStr}.json`;
    
    const jsonContent = JSON.stringify({
      storageVersion: 1,
      exportedAt: new Date().toISOString(),
      note,
    }, null, 2);
    
    const result = await saveAndShareFile(filename, jsonContent, "application/json", false);
    
    if (result.success) {
      return { success: true, filename };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("JSON export error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "JSON export failed" 
    };
  }
}
