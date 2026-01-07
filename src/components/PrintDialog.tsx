import { useState } from "react";
import { t } from "@/i18n";
import { Note } from "@/domain/types";
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

export function PrintDialog({ open, onOpenChange, note, onPrint }: PrintDialogProps) {
  const [printMode, setPrintMode] = useState<"text" | "layout">("text");

  const handlePrint = () => {
    onPrint(printMode === "text");
    onOpenChange(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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

          {/* Preview of date footer */}
          <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
            <p>{t("print.created")}: {formatDate(note.createdAt)}</p>
            <p>{t("print.updated")}: {formatDate(note.updatedAt)}</p>
            <p>{t("print.printed")}: {formatDate(Date.now())}</p>
          </div>
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
