import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "@/i18n";
import { usePageMeta } from "@/lib/usePageMeta";
import { useNotes } from "@/hooks/useNotes";
import { toast } from "sonner";
import { Plus, Settings, LayoutGrid, List } from "lucide-react";
import { NoteGrid } from "@/components/NoteGrid";
import { SearchBar } from "@/components/SearchBar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { safeGet, safeSet } from "@/storage/localStorage";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function HomePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  usePageMeta(
    "My Music Notes — Your Songwriting Notebook",
    "Your private songwriting notebook. Capture lyrics, ideas, and voice memos — stored locally on your device."
  );
  const {
    pinnedNotes,
    otherNotes,
    settings,
    searchQuery,
    setSearchQuery,
    createNote,
    deleteNote,
    duplicateNote,
    pinNote,
    setSort,
    refreshNotes,
  } = useNotes();

  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [audioStorageNoticeOpen, setAudioStorageNoticeOpen] = useState(false);
  const [hideAudioStorageNotice, setHideAudioStorageNotice] = useState(false);
  const [mobileGridCols, setMobileGridCols] = useState<1 | 2>(() => 
    safeGet<1 | 2>("mobileGridCols", 1)
  );

  // Toggle mobile grid columns
  const toggleMobileGrid = () => {
    const newValue = mobileGridCols === 1 ? 2 : 1;
    setMobileGridCols(newValue);
    safeSet("mobileGridCols", newValue);
  };

  // Theme is now applied globally in App.tsx - no local override needed

  const handleCreateNote = () => {
    const note = createNote();
    navigate(`/edit/${note.id}`);
  };

  const handleCreateRecordNote = () => {
    const note = createNote({ hasAudio: true });
    setCreateSheetOpen(false);
    navigate(`/edit/${note.id}?record=1`);
  };

  const handleRecordSelect = () => {
    if (safeGet("hideAudioStorageNotice", false)) {
      handleCreateRecordNote();
      return;
    }
    setHideAudioStorageNotice(false);
    setAudioStorageNoticeOpen(true);
  };

  const continueCreateRecordNote = () => {
    if (hideAudioStorageNotice) {
      safeSet("hideAudioStorageNotice", true);
    }
    setAudioStorageNoticeOpen(false);
    handleCreateRecordNote();
  };

  const handleNoteClick = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handlePin = (id: string) => {
    const result = pinNote(id);
    if (!result.success) {
      if (result.error === "pinLimit") {
        toast.error(t("toast.pinLimit"));
      }
    } else if (result.note) {
      toast.success(
        result.note.isPinned ? t("toast.notePinned") : t("toast.noteUnpinned")
      );
    }
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicateNote(id);
    if (dup) {
      toast.success(t("toast.noteDuplicated"));
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteNoteId(id);
  };

  const confirmDelete = () => {
    if (deleteNoteId) {
      deleteNote(deleteNoteId);
      toast.success(t("toast.noteDeleted"));
      setDeleteNoteId(null);
    }
  };

  // Filter notes based on search
  const filteredPinned = searchQuery
    ? pinnedNotes.filter((note) => {
        const searchable = [note.title, note.composer, note.lyrics, ...note.tags]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(searchQuery.toLowerCase());
      })
    : pinnedNotes;

  const filteredOther = searchQuery
    ? otherNotes.filter((note) => {
        const searchable = [note.title, note.composer, note.lyrics, ...note.tags]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(searchQuery.toLowerCase());
      })
    : otherNotes;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">
              {t("app.name")}
              <span className="sr-only"> — Songwriting & Lyrics Notebook</span>
            </h1>
            <div className="flex items-center gap-1">
              {/* Mobile grid toggle - only on mobile */}
              {isMobile && (
                <button
                  onClick={toggleMobileGrid}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Toggle grid layout"
                >
                  {mobileGridCols === 1 ? (
                    <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <List className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              )}
              <button
                onClick={() => navigate("/settings")}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Open settings"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            sortOption={settings.defaultSort}
            onSortChange={setSort}
          />
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6 pb-24">
        {searchQuery && filteredPinned.length === 0 && filteredOther.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("home.noSearchResults")}</p>
          </div>
        ) : (
          <NoteGrid
            pinnedNotes={filteredPinned}
            otherNotes={filteredOther}
            onNoteClick={handleNoteClick}
            onPin={handlePin}
            onDuplicate={handleDuplicate}
            onDelete={handleDeleteClick}
            mobileGridCols={isMobile ? mobileGridCols : undefined}
          />
        )}
      </main>

      {/* FAB */}
      <button onClick={() => setCreateSheetOpen(true)} className="fab" aria-label="Create new note">
        <Plus className="h-6 w-6" />
      </button>

      <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
        <SheetContent side="bottom" className="bottom-sheet">
          <SheetHeader>
            <SheetTitle>Create note</SheetTitle>
          </SheetHeader>
          <div className="grid gap-3 pt-4">
            <Button onClick={handleCreateNote} variant="outline" className="justify-start">
              Text
            </Button>
            <Button onClick={handleRecordSelect} variant="outline" className="justify-start">
              Record
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={audioStorageNoticeOpen} onOpenChange={setAudioStorageNoticeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("audio.storageNoticeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("audio.storageNoticeMessage")}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Checkbox
              id="hide-audio-storage-notice"
              checked={hideAudioStorageNotice}
              onCheckedChange={(checked) => setHideAudioStorageNotice(checked === true)}
            />
            <Label htmlFor="hide-audio-storage-notice" className="text-sm font-normal">
              {t("audio.storageNoticeDontShowAgain")}
            </Label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("audio.storageNoticeCancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={continueCreateRecordNote}>
              {t("audio.storageNoticeContinue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteNoteId}
        onOpenChange={(open) => !open && setDeleteNoteId(null)}
        title={t("dialog.deleteTitle")}
        description={t("dialog.deleteMessage")}
        confirmLabel={t("dialog.confirm")}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
