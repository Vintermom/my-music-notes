import { useState, useRef } from "react";
import { t } from "@/i18n";
import { Note } from "@/domain/types";
import { safeGet, safeSet } from "@/storage/localStorage";
import { createNote } from "@/storage/notesRepo";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle } from "lucide-react";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (note: Note) => void;
}

const IMPORT_KEY = "import_tracking";
const FREE_DAILY_LIMIT = 2;

interface ImportTracking {
  date: string;
  count: number;
}

function getImportTracking(): ImportTracking {
  const today = new Date().toDateString();
  const tracking = safeGet<ImportTracking>(IMPORT_KEY, { date: today, count: 0 });
  
  // Reset if different day
  if (tracking.date !== today) {
    return { date: today, count: 0 };
  }
  
  return tracking;
}

function incrementImportCount(): void {
  const tracking = getImportTracking();
  tracking.count += 1;
  safeSet(IMPORT_KEY, tracking);
}

function getRemainingImports(): number {
  const tracking = getImportTracking();
  return Math.max(0, FREE_DAILY_LIMIT - tracking.count);
}

function canImport(): boolean {
  return getRemainingImports() > 0;
}

export function ImportDialog({ open, onOpenChange, onImportSuccess }: ImportDialogProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const remaining = getRemainingImports();
  const limitReached = !canImport();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!canImport()) {
      toast.error(t("import.limitReached"));
      return;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate required fields
      if (typeof data !== "object" || !data) {
        throw new Error("Invalid JSON structure");
      }

      // Create new note from imported data (always creates new)
      const newNote = createNote({
        title: data.title || "",
        composer: data.composer || "",
        lyrics: data.lyrics || "",
        style: data.style || "",
        extraInfo: data.extraInfo || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        color: data.color || "default",
        isPinned: false, // Always unpinned on import
      });

      incrementImportCount();
      toast.success(t("import.success"));
      onImportSuccess(newNote);
      onOpenChange(false);
    } catch (error) {
      toast.error(t("import.error"));
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("import.title")}</DialogTitle>
          {!limitReached && (
            <DialogDescription>
              {remaining} {t("import.remainingToday")}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          {limitReached ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div className="space-y-2">
                <p className="font-medium text-destructive">{t("import.limitReached")}</p>
                <p className="text-sm text-muted-foreground">{t("import.limitMessage")}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {isImporting ? t("import.importing") : t("import.selectFile")}
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialog.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
