import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "@/i18n";
import { Note, IMPORT_MAX_SIZE_BYTES } from "@/domain/types";
import { safeGet, safeSet, restoreFromBackup } from "@/storage/localStorage";
import { createNote, createNotesBackup } from "@/storage/notesRepo";
import { validateImportedNote } from "@/storage/validation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, AlertCircle, FileText, X } from "lucide-react";

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

function incrementImportCount(count: number = 1): void {
  const tracking = getImportTracking();
  tracking.count += count;
  safeSet(IMPORT_KEY, tracking);
}

function getRemainingImports(): number {
  const tracking = getImportTracking();
  return Math.max(0, FREE_DAILY_LIMIT - tracking.count);
}

function canImport(): boolean {
  return getRemainingImports() > 0;
}

// Exported JSON structure types
interface SingleNoteExport {
  version?: number;
  storageVersion?: number;
  exportedAt?: string;
  note: unknown;
}

interface BundleExport {
  version?: number;
  storageVersion?: number;
  exportedAt?: string;
  notes: unknown[];
}

type ExportedData = SingleNoteExport | BundleExport | unknown;

function isBundle(data: unknown): data is BundleExport {
  return (
    data !== null &&
    typeof data === "object" &&
    "notes" in data &&
    Array.isArray((data as BundleExport).notes)
  );
}

function isSingleNoteExport(data: unknown): data is SingleNoteExport {
  return (
    data !== null &&
    typeof data === "object" &&
    "note" in data &&
    (data as SingleNoteExport).note !== undefined
  );
}

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const remaining = getRemainingImports();
  const limitReached = !canImport();

  const resetState = () => {
    setImportError(null);
    setSelectedFile(null);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImportError(null);
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Check file extension
    if (!file.name.toLowerCase().endsWith(".json")) {
      setImportError(t("import.invalidFormat"));
      setSelectedFile(null);
      return;
    }

    // Check file size (3MB limit from types)
    if (file.size > IMPORT_MAX_SIZE_BYTES) {
      setImportError(t("import.fileTooLarge"));
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    if (!canImport()) {
      setImportError(t("import.limitReached"));
      return;
    }

    setIsImporting(true);
    setImportError(null);

    // Create backup before import
    const backupCreated = createNotesBackup();

    try {
      const text = await selectedFile.text();
      
      // Parse JSON safely
      let data: ExportedData;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON format");
      }

      // Extract notes to import
      const notesToImport: Partial<Note>[] = [];

      if (isBundle(data)) {
        // Bundle format: { storageVersion, exportedAt, notes: [...] }
        for (const noteData of data.notes) {
          const validated = validateImportedNote(noteData);
          if (validated) {
            notesToImport.push(validated);
          }
        }
      } else if (isSingleNoteExport(data)) {
        // Single note wrapped: { version/storageVersion, exportedAt, note: {...} }
        const validated = validateImportedNote(data.note);
        if (validated) {
          notesToImport.push(validated);
        }
      } else {
        // Direct note object (legacy format)
        const validated = validateImportedNote(data);
        if (validated) {
          notesToImport.push(validated);
        }
      }

      if (notesToImport.length === 0) {
        throw new Error("No valid notes found in file");
      }

      // Check import limit
      const actualImportCount = Math.min(notesToImport.length, getRemainingImports());
      if (actualImportCount < notesToImport.length) {
        toast.info(`Only importing ${actualImportCount} of ${notesToImport.length} notes (daily limit)`);
      }

      // Create new notes
      const createdNotes: Note[] = [];
      for (let i = 0; i < actualImportCount; i++) {
        const newNote = createNote(notesToImport[i]);
        createdNotes.push(newNote);
      }

      incrementImportCount(createdNotes.length);
      
      if (createdNotes.length === 1) {
        toast.success(t("import.success"));
      } else {
        toast.success(`${createdNotes.length} notes imported successfully`);
      }

      // Close dialog and navigate to home
      handleClose();
      navigate("/");
    } catch (error) {
      if (import.meta.env.DEV) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[Import] Failed:", message);
      }
      
      // Rollback to backup if available
      if (backupCreated) {
        restoreFromBackup("notes");
      }
      
      setImportError(t("import.error"));
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("import.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Remaining imports */}
          <p className="text-sm text-muted-foreground">
            {remaining} {t("import.remainingToday")}
          </p>

          {limitReached ? (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">{t("import.limitReached")}</p>
                <p className="text-xs text-muted-foreground">{t("import.limitMessage")}</p>
              </div>
            </div>
          ) : (
            <>
              {/* File picker area */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                id="import-file-input"
              />
              <label
                htmlFor="import-file-input"
                className="flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {selectedFile ? (
                  <>
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t("import.selectFile")}
                    </span>
                  </>
                )}
              </label>

              {/* Helper text */}
              <p className="text-xs text-muted-foreground text-center">
                JSON only, max 3MB
              </p>

              {/* Error message */}
              {importError && (
                <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            {t("dialog.cancel")}
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!selectedFile || isImporting || limitReached}
          >
            {isImporting ? t("import.importing") : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
