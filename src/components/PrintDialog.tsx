import { useState } from "react";
import { jsPDF } from "jspdf";
import { t } from "@/i18n";
import { APP_VERSION } from "@/lib/appVersion";
import { Note } from "@/domain/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note;
  onPrint: (textOnly: boolean) => void;
  mode?: "print" | "pdf";
}

// ISO 8601 format: YYYY-MM-DD HH:mm (UTC±X)
function formatDateISO(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  
  // Get timezone offset in hours
  const offsetMinutes = d.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const offsetMins = Math.abs(offsetMinutes % 60);
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const tzString = offsetMins > 0 
    ? `(UTC${sign}${offsetHours}:${String(offsetMins).padStart(2, "0")})`
    : `(UTC${sign}${offsetHours})`;
  
  return `${year}-${month}-${day} ${hours}:${mins} ${tzString}`;
}

// Sanitize filename: remove invalid characters, replace spaces with underscores
function sanitizeFilename(name: string): string {
  if (!name || !name.trim()) return "note";
  return name
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "") // Remove invalid filename characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .substring(0, 100); // Limit length
}

// Get date in YYYY-MM-DD format
function getDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PrintDialog({ open, onOpenChange, note, onPrint, mode = "print" }: PrintDialogProps) {
  const isPdfMode = mode === "pdf";
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    onPrint(true); // Always text-only
    onOpenChange(false);
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      const footerY = pageHeight - 15;
      let yPos = margin;
      
      // Helper to add footer on each page
      const addPageFooter = () => {
        const footerText = `${t("print.exportedFrom")}: ${t("app.name")} (${t("print.appType")}) · ${t("print.version")} ${APP_VERSION} · ${formatDateISO(Date.now())}`;
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text(footerText, pageWidth / 2, footerY, { align: "center" });
      };
      
      // Helper to check and add new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > footerY - 10) {
          addPageFooter();
          pdf.addPage();
          yPos = margin;
        }
      };
      
      // Helper to add labeled section
      const addLabeledSection = (label: string, value: string, isBold = true) => {
        if (!value) return;
        
        pdf.setFontSize(9);
        pdf.setTextColor(0);
        pdf.setFont("helvetica", "bold");
        pdf.text(label, margin, yPos);
        yPos += 5;
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        const lines = pdf.splitTextToSize(value, contentWidth);
        
        for (const line of lines) {
          checkPageBreak(6);
          pdf.text(line, margin, yPos);
          yPos += 5;
        }
        yPos += 3;
      };
      
      // Song Title
      if (note.title) {
        addLabeledSection(t("print.labelTitle"), note.title);
      }
      
      // Composer
      if (note.composer) {
        addLabeledSection(t("print.labelComposer"), note.composer);
      }
      
      // Divider after title/composer
      if (note.title || note.composer) {
        checkPageBreak(8);
        pdf.setDrawColor(200);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
      }
      
      // Lyrics
      if (note.lyrics) {
        pdf.setFontSize(9);
        pdf.setTextColor(0);
        pdf.setFont("helvetica", "bold");
        pdf.text(t("print.labelLyrics"), margin, yPos);
        yPos += 6;
        
        pdf.setFont("courier", "normal");
        pdf.setFontSize(10);
        
        const lyricsLines = note.lyrics.split("\n");
        for (const lyricLine of lyricsLines) {
          const wrappedLines = pdf.splitTextToSize(lyricLine || " ", contentWidth);
          for (const line of wrappedLines) {
            checkPageBreak(5);
            pdf.text(line, margin, yPos);
            yPos += 4.5;
          }
        }
        yPos += 5;
      }
      
      // Style
      if (note.style) {
        checkPageBreak(15);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(`${t("print.labelStyle")}: `, margin, yPos);
        const styleLabel = pdf.getTextWidth(`${t("print.labelStyle")}: `);
        pdf.setFont("helvetica", "normal");
        pdf.text(note.style, margin + styleLabel, yPos);
        yPos += 6;
      }
      
      // Extra Info
      if (note.extraInfo) {
        checkPageBreak(15);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(`${t("print.labelExtra")}: `, margin, yPos);
        const extraLabel = pdf.getTextWidth(`${t("print.labelExtra")}: `);
        pdf.setFont("helvetica", "normal");
        const extraLines = pdf.splitTextToSize(note.extraInfo, contentWidth - extraLabel);
        pdf.text(extraLines[0], margin + extraLabel, yPos);
        for (let i = 1; i < extraLines.length; i++) {
          yPos += 5;
          checkPageBreak(5);
          pdf.text(extraLines[i], margin, yPos);
        }
        yPos += 6;
      }
      
      // Tags
      if (note.tags.length > 0) {
        checkPageBreak(15);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(`${t("print.labelTags")}: `, margin, yPos);
        const tagsLabel = pdf.getTextWidth(`${t("print.labelTags")}: `);
        pdf.setFont("helvetica", "normal");
        pdf.text(note.tags.join(", "), margin + tagsLabel, yPos);
        yPos += 6;
      }
      
      // Footer divider
      checkPageBreak(25);
      pdf.setDrawColor(200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;
      
      // Timestamps
      pdf.setFontSize(9);
      pdf.setTextColor(80);
      
      pdf.setFont("helvetica", "bold");
      pdf.text(`${t("print.created")}: `, margin, yPos);
      const createdLabel = pdf.getTextWidth(`${t("print.created")}: `);
      pdf.setFont("helvetica", "normal");
      pdf.text(formatDateISO(note.createdAt), margin + createdLabel, yPos);
      yPos += 5;
      
      pdf.setFont("helvetica", "bold");
      pdf.text(`${t("print.updated")}: `, margin, yPos);
      const updatedLabel = pdf.getTextWidth(`${t("print.updated")}: `);
      pdf.setFont("helvetica", "normal");
      pdf.text(formatDateISO(note.updatedAt), margin + updatedLabel, yPos);
      yPos += 5;
      
      pdf.setFont("helvetica", "bold");
      pdf.text(`${t("print.saved")}: `, margin, yPos);
      const savedLabel = pdf.getTextWidth(`${t("print.saved")}: `);
      pdf.setFont("helvetica", "normal");
      pdf.text(formatDateISO(Date.now()), margin + savedLabel, yPos);
      
      // Add footer to last page
      addPageFooter();
      
      // Generate filename and save
      const sanitizedTitle = sanitizeFilename(note.title);
      const dateStr = getDateString();
      const filename = `${sanitizedTitle} - My Music Notes - ${dateStr}.pdf`;
      
      pdf.save(filename);
      
      // Close modal after successful download
      onOpenChange(false);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isPdfMode ? t("print.pdfTitle") : t("print.title")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Text-only preview */}
          <div className="border rounded-lg p-4 bg-white space-y-4 text-sm max-h-[300px] overflow-y-auto text-black">
            {/* Song Title */}
            {note.title && (
              <div>
                <p className="text-xs font-bold text-black">{t("print.labelTitle")}</p>
                <p className="text-base font-normal text-black">{note.title}</p>
              </div>
            )}
            
            {/* Composer */}
            {note.composer && (
              <div>
                <p className="text-xs font-bold text-black">{t("print.labelComposer")}</p>
                <p className="font-normal text-black">{note.composer}</p>
              </div>
            )}
            
            {(note.title || note.composer) && <hr className="border-gray-300" />}
            
            {/* Lyrics */}
            {note.lyrics && (
              <div>
                <p className="text-xs font-bold text-black mb-1">{t("print.labelLyrics")}</p>
                <div className="whitespace-pre-wrap font-mono text-xs font-normal text-black">{note.lyrics}</div>
              </div>
            )}
            
            {/* Style / Extra / Tags */}
            {note.style && (
              <div>
                <span className="text-xs font-bold text-black">{t("print.labelStyle")}: </span>
                <span className="font-normal text-black">{note.style}</span>
              </div>
            )}
            
            {note.extraInfo && (
              <div>
                <span className="text-xs font-bold text-black">{t("print.labelExtra")}: </span>
                <span className="font-normal text-black">{note.extraInfo}</span>
              </div>
            )}
            
            {note.tags.length > 0 && (
              <div>
                <span className="text-xs font-bold text-black">{t("print.labelTags")}: </span>
                <span className="font-normal text-black">{note.tags.join(", ")}</span>
              </div>
            )}
            
            <hr className="border-gray-300" />
            
            {/* Footer timestamps - labels bold, values regular */}
            <div className="text-xs text-gray-600 space-y-0.5">
              <p><span className="font-bold text-black">{t("print.created")}:</span> <span className="font-normal">{formatDateISO(note.createdAt)}</span></p>
              <p><span className="font-bold text-black">{t("print.updated")}:</span> <span className="font-normal">{formatDateISO(note.updatedAt)}</span></p>
              <p><span className="font-bold text-black">{isPdfMode ? t("print.saved") : t("print.printed")}:</span> <span className="font-normal">{formatDateISO(Date.now())}</span></p>
            </div>
            
            {/* Page footer preview - shown on every page */}
            <div className="border-t border-gray-200 pt-2 mt-2 text-center text-xs text-gray-600">
              {t("print.exportedFrom")}: {t("app.name")} ({t("print.appType")}) · {t("print.version")} {APP_VERSION} · {formatDateISO(Date.now())}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialog.cancel")}
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleDownloadPdf}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-1" />
            {t("print.downloadPdfBeta")}
          </Button>
          <Button onClick={handlePrint}>
            {isPdfMode ? t("print.saveButton") : t("print.printButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
