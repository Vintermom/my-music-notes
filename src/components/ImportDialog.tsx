import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "@/i18n";
import { Note, IMPORT_MAX_SIZE_BYTES } from "@/domain/types";
import { restoreFromBackup } from "@/storage/localStorage";
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

      // Create new notes
      const createdNotes: Note[] = [];
      for (const noteData of notesToImport) {
        const newNote = createNote(noteData);
        createdNotes.push(newNote);
      }
      
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
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            {t("dialog.cancel")}
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? t("import.importing") : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
