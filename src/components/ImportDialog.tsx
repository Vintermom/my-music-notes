import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "@/i18n";
import { Note, IMPORT_MAX_SIZE_BYTES, STORAGE_SCHEMA_VERSION } from "@/domain/types";
import { safeGet, safeSet, restoreFromBackup } from "@/storage/localStorage";
import { createNote, createNotesBackup } from "@/storage/notesRepo";
import { validateImportedNote } from "@/storage/validation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle } from "lucide-react";

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

export function ImportSection() {
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const remaining = getRemainingImports();
  const limitReached = !canImport();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);

    // Check file extension
    if (!file.name.toLowerCase().endsWith(".json")) {
      setImportError(t("import.invalidFormat"));
      toast.error(t("import.invalidFormat"));
      return;
    }

    // Check file size (3MB limit from types)
    if (file.size > IMPORT_MAX_SIZE_BYTES) {
      setImportError(t("import.fileTooLarge"));
      toast.error(t("import.fileTooLarge"));
      return;
    }

    if (!canImport()) {
      toast.error(t("import.limitReached"));
      return;
    }

    setIsImporting(true);

    // Create backup before import
    const backupCreated = createNotesBackup();

    try {
      const text = await file.text();
      
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

      // Navigate to home to show newly imported notes
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[Import] Failed:", message);
      
      // Rollback to backup if available
      if (backupCreated) {
        restoreFromBackup("notes");
      }
      
      setImportError(t("import.error"));
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
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {t("menu.importJson")}
      </h2>
      <div className="p-4 rounded-lg border border-border bg-card space-y-3">
        {limitReached ? (
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-destructive">{t("import.limitReached")}</p>
              <p className="text-muted-foreground text-xs">{t("import.limitMessage")}</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {remaining} {t("import.remainingToday")}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
              id="settings-import-file"
            />
            <label
              htmlFor="settings-import-file"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isImporting ? t("import.importing") : t("import.selectFile")}
              </span>
            </label>
            <p className="text-xs text-muted-foreground text-center">
              JSON only, max 3MB
            </p>
            {importError && (
              <p className="text-sm text-destructive text-center">{importError}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
