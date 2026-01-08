import { useState } from "react";
import { t } from "@/i18n";
import { Note, NoteColor } from "@/domain/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note;
  onPrint: (textOnly: boolean) => void;
}

const colorClasses: Record<NoteColor, string> = {
  default: "bg-card", cream: "bg-amber-50", pink: "bg-pink-50",
  blue: "bg-blue-50", green: "bg-green-50", yellow: "bg-yellow-50",
  purple: "bg-purple-50", orange: "bg-orange-50",
};

export function PrintDialog({ open, onOpenChange, note, onPrint }: PrintDialogProps) {
  const [printMode, setPrintMode] = useState<"text" | "layout">("text");

  const handlePrint = () => {
    onPrint(printMode === "text");
    onOpenChange(false);
  };

  const formatDate = (timestamp: number) => {
    // ISO 8601 format: YYYY-MM-DD HH:mm (no timezone in UI)
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${mins}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("print.title")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <RadioGroup 
            value={printMode} 
            onValueChange={(v) => setPrintMode(v as "text" | "layout")}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="text" id="text-only" />
              <Label htmlFor="text-only" className="font-normal cursor-pointer">
                {t("print.textOnly")}
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="layout" id="app-layout" />
              <Label htmlFor="app-layout" className="font-normal cursor-pointer">
                {t("print.appLayout")}
              </Label>
            </div>
          </RadioGroup>

          {/* Preview based on mode */}
          {printMode === "text" ? (
            <div className="border rounded-lg p-4 bg-muted/30 space-y-4 text-sm max-h-[300px] overflow-y-auto">
              <div className="space-y-1">
                {note.title && <p className="text-lg font-semibold">{note.title}</p>}
                {note.composer && <p className="text-muted-foreground">{note.composer}</p>}
              </div>
              
              {(note.title || note.composer) && <hr className="border-border" />}
              
              {note.lyrics && (
                <div className="whitespace-pre-wrap font-mono text-xs">{note.lyrics}</div>
              )}
              
              {note.style && (
                <div>
                  <span className="font-medium">Style: </span>
                  <span className="text-muted-foreground">{note.style}</span>
                </div>
              )}
              
              {note.extraInfo && (
                <div>
                  <span className="font-medium">Extra: </span>
                  <span className="text-muted-foreground">{note.extraInfo}</span>
                </div>
              )}
              
              {note.tags.length > 0 && (
                <div>
                  <span className="font-medium">Tags: </span>
                  <span className="text-muted-foreground">{note.tags.join(", ")}</span>
                </div>
              )}
              
              <hr className="border-border" />
              
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>{t("print.created")}: {formatDate(note.createdAt)}</p>
                <p>{t("print.updated")}: {formatDate(note.updatedAt)}</p>
                <p>{t("print.printed")}: {formatDate(Date.now())}</p>
              </div>
            </div>
          ) : (
            <div className={`border rounded-xl p-4 space-y-4 max-h-[300px] overflow-y-auto ${colorClasses[note.color]}`}>
              <div className="space-y-2">
                {note.title && <h2 className="text-xl font-semibold">{note.title}</h2>}
                {note.composer && <p className="text-muted-foreground">{note.composer}</p>}
              </div>
              
              {note.lyrics && (
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("editor.lyrics")}</p>
                  <div className="whitespace-pre-wrap text-sm">{note.lyrics}</div>
                </div>
              )}
              
              {note.style && (
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("editor.style")}</p>
                  <p className="text-sm">{note.style}</p>
                </div>
              )}
              
              {note.extraInfo && (
                <div className="p-2 bg-background/30 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("editor.extraInfo")}</p>
                  <p className="text-xs">{note.extraInfo}</p>
                </div>
              )}
              
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-secondary rounded-full text-xs">{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="pt-2 border-t text-xs text-muted-foreground space-y-0.5">
                <p>{t("print.created")}: {formatDate(note.createdAt)}</p>
                <p>{t("print.updated")}: {formatDate(note.updatedAt)}</p>
                <p>{t("print.printed")}: {formatDate(Date.now())}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handlePrint}>
            {t("print.printButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
