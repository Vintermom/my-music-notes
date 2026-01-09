import { t } from "@/i18n";
import { Note } from "@/domain/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

export function PrintDialog({ open, onOpenChange, note, onPrint, mode = "print" }: PrintDialogProps) {
  const isPdfMode = mode === "pdf";

  const handlePrint = () => {
    onPrint(true); // Always text-only
    onOpenChange(false);
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
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handlePrint}>
            {isPdfMode ? t("print.saveButton") : t("print.printButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
