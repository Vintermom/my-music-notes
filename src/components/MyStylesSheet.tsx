import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { t } from "@/i18n";
import {
  getSavedStyles,
  addSavedStyle,
  renameSavedStyle,
  deleteSavedStyle,
  type SavedStyle,
} from "@/storage/myStylesRepo";

interface MyStylesSheetProps {
  open: boolean;
  onClose: () => void;
  /** Current Style text of the note being edited (used for "Save current Style"). */
  currentStyle: string;
  /** Insert a saved style prompt into the current Style field (caller merges safely). */
  onInsert: (prompt: string) => void;
}

export function MyStylesSheet({ open, onClose, currentStyle, onInsert }: MyStylesSheetProps) {
  const [styles, setStyles] = useState<SavedStyle[]>([]);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const hasCurrentStyle = currentStyle.trim().length > 0;

  // Load saved styles each time the sheet opens (shared across all notes)
  useEffect(() => {
    if (open) {
      setStyles(getSavedStyles());
      setSaving(false);
      setNewName("");
      setRenamingId(null);
      setRenameValue("");
    }
  }, [open]);

  const refresh = () => setStyles(getSavedStyles());

  const handleStartSave = () => {
    if (!hasCurrentStyle) {
      toast.info(t("myStyles.emptyStyle"));
      return;
    }
    setSaving(true);
    setNewName("");
  };

  const handleConfirmSave = () => {
    if (!newName.trim()) {
      toast.error(t("myStyles.nameRequired"));
      return;
    }
    const saved = addSavedStyle(newName, currentStyle);
    if (saved) {
      toast.success(t("myStyles.saved"));
      setSaving(false);
      setNewName("");
      refresh();
    }
  };

  const handleStartRename = (style: SavedStyle) => {
    setRenamingId(style.id);
    setRenameValue(style.name);
  };

  const handleConfirmRename = () => {
    if (!renamingId) return;
    if (!renameValue.trim()) {
      toast.error(t("myStyles.nameRequired"));
      return;
    }
    if (renameSavedStyle(renamingId, renameValue)) {
      toast.success(t("myStyles.renamed"));
    }
    setRenamingId(null);
    setRenameValue("");
    refresh();
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    if (deleteSavedStyle(deleteId)) {
      toast.success(t("myStyles.deleted"));
    }
    setDeleteId(null);
    refresh();
  };

  const handleInsert = (prompt: string) => {
    onInsert(prompt);
    onClose();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl px-4 pb-4">
          <SheetHeader className="pb-2">
            <SheetTitle>{t("myStyles.title")}</SheetTitle>
          </SheetHeader>

          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{t("myStyles.intro")}</p>

          {/* Save current Style (explicit action only — never auto-saved) */}
          {saving ? (
            <div className="flex items-center gap-2 mb-3">
              <Input
                autoFocus
                placeholder={t("myStyles.namePlaceholder")}
                value={newName}
                maxLength={60}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleConfirmSave(); if (e.key === "Escape") setSaving(false); }}
                className="h-8 text-sm"
              />
              <Button size="sm" className="h-8 text-xs" onClick={handleConfirmSave}>{t("myStyles.save")}</Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSaving(false)}>{t("dialog.cancel")}</Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs mb-3 w-full sm:w-auto"
              onClick={handleStartSave}
              disabled={!hasCurrentStyle}
            >
              <Plus className="h-3 w-3 mr-1" />
              {t("myStyles.saveCurrent")}
            </Button>
          )}

          <ScrollArea className="flex-1 h-[calc(75vh-170px)]">
            <div className="space-y-2 pr-2">
              {styles.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">{t("myStyles.empty")}</p>
              )}
              {styles.map((style) => {
                const isRenaming = renamingId === style.id;
                return (
                  <div key={style.id} className="w-full rounded-lg border border-border bg-background overflow-hidden p-3">
                    {isRenaming ? (
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          autoFocus
                          value={renameValue}
                          maxLength={60}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleConfirmRename(); if (e.key === "Escape") setRenamingId(null); }}
                          className="h-8 text-sm"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleConfirmRename} aria-label={t("myStyles.save")}><Check className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRenamingId(null)} aria-label={t("dialog.cancel")}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground truncate">{style.name}</span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStartRename(style)} aria-label={t("myStyles.rename")} title={t("myStyles.rename")}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(style.id)} aria-label={t("myStyles.delete")} title={t("myStyles.delete")}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-wrap break-words">{style.prompt}</p>
                    <div className="flex justify-end mt-2">
                      <Button size="sm" className="h-7 text-xs" onClick={() => handleInsert(style.prompt)}>{t("voice.insert")}</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        title={t("myStyles.deleteTitle")}
        description={t("myStyles.deleteMessage")}
        confirmLabel={t("dialog.confirm")}
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </>
  );
}
