import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { jsPDF } from "jspdf";
import { Note } from "@/domain/types";
import { t, type TranslationKey } from "@/i18n";

/**
 * Generate a safe filename from note title
 * Format: SongTitle_YYYY-MM-DD.pdf
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
 * Format date for PDF/display - ISO 8601 with timezone
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

// Cache for the loaded font
let cachedFontBase64: string | null = null;

/**
 * Load Noto Sans font with full Unicode support (Thai, Swedish, CJK, etc.)
 * Using Google Fonts CDN for reliable access
 */
async function loadUnicodeFont(): Promise<string> {
  if (cachedFontBase64) {
    return cachedFontBase64;
  }

  try {
    // Noto Sans Regular - excellent Unicode coverage including Thai, CJK, etc.
    const fontUrl = "https://cdn.jsdelivr.net/npm/@aspect-build/font-noto-sans@1.0.0/Noto_Sans/static/NotoSans-Regular.ttf";
    
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    cachedFontBase64 = btoa(binary);
    return cachedFontBase64;
  } catch (error) {
    console.error("Failed to load Unicode font:", error);
    // Return null to fall back to default font
    throw error;
  }
}

/**
 * Generate PDF content programmatically using jsPDF
 * Document-grade PDF with full Unicode support
 * Matches desktop layout exactly
 */
export async function generateNotePdf(note: Note): Promise<{ filename: string; base64: string }> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  
  // Typography settings
  const titleSize = 16;
  const labelSize = 10;
  const bodySize = 11;
  const lyricsSize = 10;
  const metaSize = 9;
  const lineHeight = 5;
  const sectionGap = 6;

  // Load and embed Unicode font
  let fontName = "helvetica";
  let monoFontName = "courier";
  
  try {
    const fontBase64 = await loadUnicodeFont();
    doc.addFileToVFS("NotoSans-Regular.ttf", fontBase64);
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "bold"); // Use same for bold (jsPDF limitation)
    fontName = "NotoSans";
    monoFontName = "NotoSans"; // Use Noto for mono too to ensure Unicode works
  } catch {
    console.warn("Using fallback fonts - Unicode characters may not render correctly");
  }

  // Set text color to pure black
  doc.setTextColor(0, 0, 0);

  // Helper: Check if we need a new page
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Helper: Draw thin separator line
  const drawSeparator = () => {
    checkPageBreak(sectionGap * 2);
    y += sectionGap / 2;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += sectionGap;
  };

  // Helper: Add a labeled section (label on one line, value on next)
  const addSection = (labelKey: TranslationKey, value: string, fontSize: number, isTitle: boolean = false) => {
    if (!value || value.trim() === "") return;

    const label = t(labelKey);
    
    // Label (bold)
    doc.setFontSize(labelSize);
    doc.setFont(fontName, "bold");
    checkPageBreak(lineHeight * 2);
    doc.text(label, margin, y);
    y += lineHeight + 1;

    // Value (regular)
    doc.setFontSize(isTitle ? titleSize : fontSize);
    doc.setFont(fontName, "normal");
    
    const lines = doc.splitTextToSize(value, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    });
    
    y += sectionGap / 2;
  };

  // Helper: Add inline label-value pair
  const addInlineField = (labelKey: TranslationKey, value: string, fontSize: number = metaSize) => {
    if (!value || value.trim() === "") return;

    const label = t(labelKey);
    
    doc.setFontSize(fontSize);
    doc.setFont(fontName, "bold");
    const labelText = label + ": ";
    const labelWidth = doc.getTextWidth(labelText);
    
    checkPageBreak(lineHeight);
    doc.text(labelText, margin, y);
    
    doc.setFont(fontName, "normal");
    const valueLines = doc.splitTextToSize(value, contentWidth - labelWidth);
    
    if (valueLines.length === 1) {
      doc.text(valueLines[0], margin + labelWidth, y);
      y += lineHeight + 2;
    } else {
      // Multi-line: value continues on same line then wraps
      doc.text(valueLines[0], margin + labelWidth, y);
      y += lineHeight;
      for (let i = 1; i < valueLines.length; i++) {
        checkPageBreak(lineHeight);
        doc.text(valueLines[i], margin, y);
        y += lineHeight;
      }
      y += 2;
    }
  };

  // === DOCUMENT STRUCTURE ===

  // 1. Song Title
  if (note.title) {
    addSection("print.labelTitle", note.title, titleSize, true);
  }

  // 2. Composer
  if (note.composer) {
    addSection("print.labelComposer", note.composer, bodySize);
  }

  // 3. Thin separator (only if we have title or composer)
  if (note.title || note.composer) {
    drawSeparator();
  }

  // 4. Lyrics - preserve line breaks exactly, keep raw markers
  if (note.lyrics) {
    const label = t("print.labelLyrics");
    
    // Label
    doc.setFontSize(labelSize);
    doc.setFont(fontName, "bold");
    checkPageBreak(lineHeight * 2);
    doc.text(label, margin, y);
    y += lineHeight + 2;

    // Lyrics content - monospace-like with Unicode support
    doc.setFontSize(lyricsSize);
    doc.setFont(monoFontName, "normal");
    
    const lyricsLines = note.lyrics.split("\n");
    lyricsLines.forEach((line) => {
      if (line.trim() === "") {
        // Empty line - add half spacing
        y += lineHeight * 0.6;
      } else {
        // Wrap long lines
        const wrappedLines = doc.splitTextToSize(line, contentWidth);
        wrappedLines.forEach((wrappedLine: string) => {
          checkPageBreak(lineHeight);
          doc.text(wrappedLine, margin, y);
          y += lineHeight;
        });
      }
    });
    
    y += sectionGap;
  }

  // 5. Thin separator (before metadata)
  if (note.lyrics && (note.style || note.extraInfo || note.tags.length > 0)) {
    drawSeparator();
  }

  // 6. Style / Extra / Tags
  if (note.style) {
    addInlineField("print.labelStyle", note.style, metaSize);
  }

  if (note.extraInfo) {
    addInlineField("print.labelExtra", note.extraInfo, metaSize);
  }

  if (note.tags.length > 0) {
    addInlineField("print.labelTags", note.tags.join(", "), metaSize);
  }

  // 7. Footer separator
  y += sectionGap / 2;
  drawSeparator();

  // 8. Metadata timestamps at bottom
  const timestampSize = 8;
  doc.setFontSize(timestampSize);
  
  // Created
  doc.setFont(fontName, "bold");
  const createdLabel = t("print.created") + ": ";
  checkPageBreak(lineHeight);
  doc.text(createdLabel, margin, y);
  doc.setFont(fontName, "normal");
  doc.text(formatDateISO(note.createdAt), margin + doc.getTextWidth(createdLabel), y);
  y += lineHeight;

  // Updated
  doc.setFont(fontName, "bold");
  const updatedLabel = t("print.updated") + ": ";
  checkPageBreak(lineHeight);
  doc.text(updatedLabel, margin, y);
  doc.setFont(fontName, "normal");
  doc.text(formatDateISO(note.updatedAt), margin + doc.getTextWidth(updatedLabel), y);
  y += lineHeight;

  // Saved
  doc.setFont(fontName, "bold");
  const savedLabel = t("print.saved") + ": ";
  checkPageBreak(lineHeight);
  doc.text(savedLabel, margin, y);
  doc.setFont(fontName, "normal");
  doc.text(formatDateISO(Date.now()), margin + doc.getTextWidth(savedLabel), y);

  // Generate output
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

    // Share the file - this opens the native share sheet
    // User can then save to Files, send via email, etc.
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
 * Export note as PDF on mobile
 * Generates document-grade PDF, saves to cache, opens share sheet
 * No print dialog - direct PDF generation
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
