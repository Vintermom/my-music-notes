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

// Font URLs for multilingual support
// Using Noto Sans family for comprehensive Unicode coverage
const FONT_URLS = {
  // Latin + Extended Latin (EN, SV, European languages)
  latin: "https://cdn.jsdelivr.net/npm/@aspect-build/font-noto-sans@1.0.0/Noto_Sans/static/NotoSans-Regular.ttf",
  latinBold: "https://cdn.jsdelivr.net/npm/@aspect-build/font-noto-sans@1.0.0/Noto_Sans/static/NotoSans-Bold.ttf",
  // Thai
  thai: "https://cdn.jsdelivr.net/npm/@aspect-build/font-noto-sans-thai@1.0.0/Noto_Sans_Thai/static/NotoSansThai-Regular.ttf",
  // Arabic (RTL support)
  arabic: "https://cdn.jsdelivr.net/npm/@aspect-build/font-noto-sans-arabic@1.0.0/Noto_Sans_Arabic/static/NotoSansArabic-Regular.ttf",
  // CJK (Chinese, Japanese, Korean) - using SC variant for broad coverage
  cjk: "https://cdn.jsdelivr.net/npm/@aspect-build/font-noto-sans-sc@1.0.0/Noto_Sans_SC/static/NotoSansSC-Regular.ttf",
  // Japanese specific (for better Japanese glyph rendering)
  japanese: "https://cdn.jsdelivr.net/npm/@aspect-build/font-noto-sans-jp@1.0.0/Noto_Sans_JP/static/NotoSansJP-Regular.ttf",
};

// Cache for loaded fonts
const fontCache: Map<string, string> = new Map();

/**
 * Fetch a font and convert to base64
 */
async function fetchFontBase64(url: string): Promise<string> {
  if (fontCache.has(url)) {
    return fontCache.get(url)!;
  }

  try {
    const response = await fetch(url);
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
    
    const base64 = btoa(binary);
    fontCache.set(url, base64);
    return base64;
  } catch (error) {
    console.error(`Failed to load font from ${url}:`, error);
    throw error;
  }
}

/**
 * Detect which scripts are present in the text
 */
function detectScripts(text: string): {
  hasLatin: boolean;
  hasThai: boolean;
  hasArabic: boolean;
  hasCJK: boolean;
  hasJapanese: boolean;
} {
  const result = {
    hasLatin: false,
    hasThai: false,
    hasArabic: false,
    hasCJK: false,
    hasJapanese: false,
  };

  for (const char of text) {
    const code = char.charCodeAt(0);
    
    // Latin (Basic Latin + Extended)
    if ((code >= 0x0020 && code <= 0x007F) || // Basic Latin
        (code >= 0x0080 && code <= 0x00FF) || // Latin-1 Supplement
        (code >= 0x0100 && code <= 0x017F) || // Latin Extended-A
        (code >= 0x0180 && code <= 0x024F)) { // Latin Extended-B
      result.hasLatin = true;
    }
    
    // Thai
    if (code >= 0x0E00 && code <= 0x0E7F) {
      result.hasThai = true;
    }
    
    // Arabic
    if ((code >= 0x0600 && code <= 0x06FF) || // Arabic
        (code >= 0x0750 && code <= 0x077F) || // Arabic Supplement
        (code >= 0x08A0 && code <= 0x08FF) || // Arabic Extended-A
        (code >= 0xFB50 && code <= 0xFDFF) || // Arabic Presentation Forms-A
        (code >= 0xFE70 && code <= 0xFEFF)) { // Arabic Presentation Forms-B
      result.hasArabic = true;
    }
    
    // CJK (Chinese, Japanese Kanji, Korean Hanja)
    if ((code >= 0x4E00 && code <= 0x9FFF) || // CJK Unified Ideographs
        (code >= 0x3400 && code <= 0x4DBF) || // CJK Unified Ideographs Extension A
        (code >= 0x20000 && code <= 0x2A6DF) || // CJK Unified Ideographs Extension B
        (code >= 0xF900 && code <= 0xFAFF) || // CJK Compatibility Ideographs
        (code >= 0x2F00 && code <= 0x2FDF)) { // Kangxi Radicals
      result.hasCJK = true;
    }
    
    // Japanese specific (Hiragana, Katakana)
    if ((code >= 0x3040 && code <= 0x309F) || // Hiragana
        (code >= 0x30A0 && code <= 0x30FF) || // Katakana
        (code >= 0x31F0 && code <= 0x31FF) || // Katakana Phonetic Extensions
        (code >= 0xFF65 && code <= 0xFF9F)) { // Halfwidth Katakana
      result.hasJapanese = true;
    }
    
    // Korean specific (Hangul)
    if ((code >= 0xAC00 && code <= 0xD7AF) || // Hangul Syllables
        (code >= 0x1100 && code <= 0x11FF) || // Hangul Jamo
        (code >= 0x3130 && code <= 0x318F)) { // Hangul Compatibility Jamo
      result.hasCJK = true; // Use CJK font for Korean too
    }
  }

  return result;
}

/**
 * Get all text content from a note for script detection
 */
function getAllNoteText(note: Note): string {
  const parts = [
    note.title || "",
    note.composer || "",
    note.lyrics || "",
    note.style || "",
    note.extraInfo || "",
    ...(note.tags || []),
  ];
  return parts.join(" ");
}

/**
 * Load required fonts based on text content
 * Returns the embedded fonts info for jsPDF
 */
async function loadRequiredFonts(
  doc: jsPDF,
  note: Note
): Promise<{ mainFont: string; loaded: boolean }> {
  const text = getAllNoteText(note);
  const scripts = detectScripts(text);
  
  console.log("Detected scripts:", scripts);
  
  try {
    // Always load Latin font (required for labels, numbers, etc.)
    const latinBase64 = await fetchFontBase64(FONT_URLS.latin);
    doc.addFileToVFS("NotoSans-Regular.ttf", latinBase64);
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
    
    // Load bold variant for Latin
    try {
      const latinBoldBase64 = await fetchFontBase64(FONT_URLS.latinBold);
      doc.addFileToVFS("NotoSans-Bold.ttf", latinBoldBase64);
      doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
    } catch {
      // Fall back to normal for bold if loading fails
      doc.addFont("NotoSans-Regular.ttf", "NotoSans", "bold");
    }

    // Load Thai font if Thai text detected
    if (scripts.hasThai) {
      const thaiBase64 = await fetchFontBase64(FONT_URLS.thai);
      doc.addFileToVFS("NotoSansThai-Regular.ttf", thaiBase64);
      doc.addFont("NotoSansThai-Regular.ttf", "NotoSansThai", "normal");
      doc.addFont("NotoSansThai-Regular.ttf", "NotoSansThai", "bold");
    }

    // Load Arabic font if Arabic text detected
    if (scripts.hasArabic) {
      const arabicBase64 = await fetchFontBase64(FONT_URLS.arabic);
      doc.addFileToVFS("NotoSansArabic-Regular.ttf", arabicBase64);
      doc.addFont("NotoSansArabic-Regular.ttf", "NotoSansArabic", "normal");
      doc.addFont("NotoSansArabic-Regular.ttf", "NotoSansArabic", "bold");
    }

    // Load CJK font if CJK text detected
    if (scripts.hasCJK) {
      const cjkBase64 = await fetchFontBase64(FONT_URLS.cjk);
      doc.addFileToVFS("NotoSansSC-Regular.ttf", cjkBase64);
      doc.addFont("NotoSansSC-Regular.ttf", "NotoSansSC", "normal");
      doc.addFont("NotoSansSC-Regular.ttf", "NotoSansSC", "bold");
    }

    // Load Japanese-specific font if Japanese kana detected
    if (scripts.hasJapanese) {
      const jpBase64 = await fetchFontBase64(FONT_URLS.japanese);
      doc.addFileToVFS("NotoSansJP-Regular.ttf", jpBase64);
      doc.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "normal");
      doc.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "bold");
    }

    return { mainFont: "NotoSans", loaded: true };
  } catch (error) {
    console.error("Failed to load fonts:", error);
    return { mainFont: "helvetica", loaded: false };
  }
}

/**
 * Get the appropriate font for a given character
 */
function getFontForChar(char: string): string {
  const code = char.charCodeAt(0);
  
  // Thai
  if (code >= 0x0E00 && code <= 0x0E7F) {
    return "NotoSansThai";
  }
  
  // Arabic
  if ((code >= 0x0600 && code <= 0x06FF) ||
      (code >= 0x0750 && code <= 0x077F) ||
      (code >= 0x08A0 && code <= 0x08FF) ||
      (code >= 0xFB50 && code <= 0xFDFF) ||
      (code >= 0xFE70 && code <= 0xFEFF)) {
    return "NotoSansArabic";
  }
  
  // Japanese kana
  if ((code >= 0x3040 && code <= 0x309F) ||
      (code >= 0x30A0 && code <= 0x30FF) ||
      (code >= 0x31F0 && code <= 0x31FF) ||
      (code >= 0xFF65 && code <= 0xFF9F)) {
    return "NotoSansJP";
  }
  
  // CJK (Chinese, Japanese Kanji, Korean)
  if ((code >= 0x4E00 && code <= 0x9FFF) ||
      (code >= 0x3400 && code <= 0x4DBF) ||
      (code >= 0xAC00 && code <= 0xD7AF) ||
      (code >= 0x1100 && code <= 0x11FF) ||
      (code >= 0x3130 && code <= 0x318F) ||
      (code >= 0xF900 && code <= 0xFAFF)) {
    return "NotoSansSC";
  }
  
  // Default to Latin
  return "NotoSans";
}

/**
 * Segment text into runs of characters that use the same font
 */
function segmentTextByFont(text: string): Array<{ text: string; font: string }> {
  if (!text) return [];
  
  const segments: Array<{ text: string; font: string }> = [];
  let currentFont = "";
  let currentText = "";
  
  for (const char of text) {
    const font = getFontForChar(char);
    
    if (font !== currentFont) {
      if (currentText) {
        segments.push({ text: currentText, font: currentFont });
      }
      currentFont = font;
      currentText = char;
    } else {
      currentText += char;
    }
  }
  
  if (currentText) {
    segments.push({ text: currentText, font: currentFont });
  }
  
  return segments;
}

/**
 * Check if text contains Arabic (RTL) characters
 */
function containsArabic(text: string): boolean {
  for (const char of text) {
    const code = char.charCodeAt(0);
    if ((code >= 0x0600 && code <= 0x06FF) ||
        (code >= 0x0750 && code <= 0x077F) ||
        (code >= 0x08A0 && code <= 0x08FF) ||
        (code >= 0xFB50 && code <= 0xFDFF) ||
        (code >= 0xFE70 && code <= 0xFEFF)) {
      return true;
    }
  }
  return false;
}

/**
 * Render multi-font text on a single line
 * Handles mixed scripts (Latin + Thai + Arabic + CJK) in one line
 */
function renderMultiFontText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: {
    fontSize: number;
    fontStyle: "normal" | "bold";
    maxWidth?: number;
    fallbackFont: string;
  }
): number {
  const segments = segmentTextByFont(text);
  let currentX = x;
  
  // Check if text is RTL (Arabic)
  const isRTL = containsArabic(text);
  
  if (isRTL) {
    // For RTL text, render from right to left
    // jsPDF doesn't have native RTL support, so we render right-aligned
    doc.setFontSize(options.fontSize);
    
    // Calculate total width
    let totalWidth = 0;
    for (const segment of segments) {
      try {
        doc.setFont(segment.font || options.fallbackFont, options.fontStyle);
      } catch {
        doc.setFont(options.fallbackFont, options.fontStyle);
      }
      totalWidth += doc.getTextWidth(segment.text);
    }
    
    // Start from the right
    currentX = x + (options.maxWidth || 170);
    
    // Render in reverse order for RTL
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      try {
        doc.setFont(segment.font || options.fallbackFont, options.fontStyle);
      } catch {
        doc.setFont(options.fallbackFont, options.fontStyle);
      }
      
      const segmentWidth = doc.getTextWidth(segment.text);
      currentX -= segmentWidth;
      doc.text(segment.text, currentX, y);
    }
    
    return totalWidth;
  }
  
  // LTR rendering (default)
  doc.setFontSize(options.fontSize);
  
  for (const segment of segments) {
    try {
      doc.setFont(segment.font || options.fallbackFont, options.fontStyle);
    } catch {
      doc.setFont(options.fallbackFont, options.fontStyle);
    }
    
    doc.text(segment.text, currentX, y);
    currentX += doc.getTextWidth(segment.text);
  }
  
  return currentX - x;
}

/**
 * Generate PDF content programmatically using jsPDF
 * Document-grade PDF with full Unicode support including RTL
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

  // Load and embed required fonts based on content
  const { mainFont, loaded } = await loadRequiredFonts(doc, note);
  const fallbackFont = loaded ? mainFont : "helvetica";

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

  // Helper: Wrap text with multi-font support
  const wrapMultiFontText = (text: string, fontSize: number): string[] => {
    doc.setFontSize(fontSize);
    doc.setFont(fallbackFont, "normal");
    
    // Use jsPDF's built-in text wrapping, then we'll render with multi-font
    const lines = doc.splitTextToSize(text, contentWidth);
    return lines;
  };

  // Helper: Add a labeled section (label on one line, value on next)
  const addSection = (labelKey: TranslationKey, value: string, fontSize: number, isTitle: boolean = false) => {
    if (!value || value.trim() === "") return;

    const label = t(labelKey);
    
    // Label (bold)
    doc.setFontSize(labelSize);
    doc.setFont(fallbackFont, "bold");
    checkPageBreak(lineHeight * 2);
    doc.text(label, margin, y);
    y += lineHeight + 1;

    // Value (with multi-font support)
    const effectiveFontSize = isTitle ? titleSize : fontSize;
    const lines = wrapMultiFontText(value, effectiveFontSize);
    
    lines.forEach((line: string) => {
      checkPageBreak(lineHeight);
      renderMultiFontText(doc, line, margin, y, {
        fontSize: effectiveFontSize,
        fontStyle: isTitle ? "bold" : "normal",
        maxWidth: contentWidth,
        fallbackFont,
      });
      y += lineHeight;
    });
    
    y += sectionGap / 2;
  };

  // Helper: Add inline label-value pair
  const addInlineField = (labelKey: TranslationKey, value: string, fontSize: number = metaSize) => {
    if (!value || value.trim() === "") return;

    const label = t(labelKey);
    
    doc.setFontSize(fontSize);
    doc.setFont(fallbackFont, "bold");
    const labelText = label + ": ";
    const labelWidth = doc.getTextWidth(labelText);
    
    checkPageBreak(lineHeight);
    doc.text(labelText, margin, y);
    
    doc.setFont(fallbackFont, "normal");
    const valueLines = doc.splitTextToSize(value, contentWidth - labelWidth);
    
    if (valueLines.length === 1) {
      renderMultiFontText(doc, valueLines[0], margin + labelWidth, y, {
        fontSize,
        fontStyle: "normal",
        maxWidth: contentWidth - labelWidth,
        fallbackFont,
      });
      y += lineHeight + 2;
    } else {
      // Multi-line: value continues on same line then wraps
      renderMultiFontText(doc, valueLines[0], margin + labelWidth, y, {
        fontSize,
        fontStyle: "normal",
        maxWidth: contentWidth - labelWidth,
        fallbackFont,
      });
      y += lineHeight;
      for (let i = 1; i < valueLines.length; i++) {
        checkPageBreak(lineHeight);
        renderMultiFontText(doc, valueLines[i], margin, y, {
          fontSize,
          fontStyle: "normal",
          maxWidth: contentWidth,
          fallbackFont,
        });
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
    doc.setFont(fallbackFont, "bold");
    checkPageBreak(lineHeight * 2);
    doc.text(label, margin, y);
    y += lineHeight + 2;

    // Lyrics content with multi-font support
    const lyricsLines = note.lyrics.split("\n");
    lyricsLines.forEach((line) => {
      if (line.trim() === "") {
        // Empty line - add half spacing
        y += lineHeight * 0.6;
      } else {
        // Wrap long lines
        const wrappedLines = wrapMultiFontText(line, lyricsSize);
        wrappedLines.forEach((wrappedLine: string) => {
          checkPageBreak(lineHeight);
          renderMultiFontText(doc, wrappedLine, margin, y, {
            fontSize: lyricsSize,
            fontStyle: "normal",
            maxWidth: contentWidth,
            fallbackFont,
          });
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
  doc.setFont(fallbackFont, "bold");
  const createdLabel = t("print.created") + ": ";
  checkPageBreak(lineHeight);
  doc.text(createdLabel, margin, y);
  doc.setFont(fallbackFont, "normal");
  doc.text(formatDateISO(note.createdAt), margin + doc.getTextWidth(createdLabel), y);
  y += lineHeight;

  // Updated
  doc.setFont(fallbackFont, "bold");
  const updatedLabel = t("print.updated") + ": ";
  checkPageBreak(lineHeight);
  doc.text(updatedLabel, margin, y);
  doc.setFont(fallbackFont, "normal");
  doc.text(formatDateISO(note.updatedAt), margin + doc.getTextWidth(updatedLabel), y);
  y += lineHeight;

  // Saved
  doc.setFont(fallbackFont, "bold");
  const savedLabel = t("print.saved") + ": ";
  checkPageBreak(lineHeight);
  doc.text(savedLabel, margin, y);
  doc.setFont(fallbackFont, "normal");
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
