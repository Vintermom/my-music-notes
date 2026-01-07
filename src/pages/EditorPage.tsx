import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Note, NoteColor } from "@/domain/types";
import { t } from "@/i18n";
import { getNoteById, updateNote, deleteNote, duplicateNote, downloadNoteJson } from "@/storage/notesRepo";
import { useLyricsHistory } from "@/hooks/useLyricsHistory";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pin,
  Palette,
  MoreVertical,
  Undo2,
  Copy,
  Trash2,
  Plus,
  Printer,
  FileJson,
  ClipboardCopy,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColorPicker } from "@/components/ColorPicker";
import { TagsInput } from "@/components/TagsInput";
import { InsertSheet } from "@/components/InsertSheet";
import { StylePicker } from "@/components/StylePicker";
import { TimelineSheet } from "@/components/TimelineSheet";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const colorClasses: Record<NoteColor, string> = {
  default: "note-bg-default",
  cream: "note-bg-cream",
  pink: "note-bg-pink",
  blue: "note-bg-blue",
  green: "note-bg-green",
  yellow: "note-bg-yellow",
  purple: "note-bg-purple",
  orange: "note-bg-orange",
};

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lyricsRef = useRef<HTMLTextAreaElement>(null);

  const [note, setNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [insertSheetOpen, setInsertSheetOpen] = useState(false);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const {
    pushToHistory,
    undo,
    canUndo,
    reset: resetHistory,
  } = useLyricsHistory(note?.lyrics || "");

  // Load note
  useEffect(() => {
    if (id) {
      const loadedNote = getNoteById(id);
      if (loadedNote) {
        setNote(loadedNote);
        resetHistory(loadedNote.lyrics);
      } else {
        navigate("/");
      }
    }
  }, [id, navigate, resetHistory]);

  // Autosave
  const debouncedSave = useDebounce((noteToSave: Note) => {
    setIsSaving(true);
    updateNote(noteToSave.id, noteToSave);
    setIsSaving(false);
  }, 1000);

  const updateField = useCallback(
    <K extends keyof Note>(field: K, value: Note[K]) => {
      if (!note) return;
      const updated = { ...note, [field]: value };
      setNote(updated);
      debouncedSave(updated);

      if (field === "lyrics") {
        pushToHistory(value as string);
      }
    },
    [note, debouncedSave, pushToHistory]
  );

  const handleSave = () => {
    if (!note) return;
    setIsSaving(true);
    updateNote(note.id, note);
    setIsSaving(false);
    toast.success(t("toast.noteSaved"));
  };

  const handleUndo = () => {
    const previousValue = undo();
    if (previousValue !== null) {
      setNote((prev) => (prev ? { ...prev, lyrics: previousValue } : null));
      toast.success(t("toast.undoApplied"));
    } else {
      toast.info(t("toast.noUndoHistory"));
    }
  };

  const handleCopyLyrics = () => {
    if (note?.lyrics) {
      navigator.clipboard.writeText(note.lyrics);
      toast.success(t("toast.lyricsCopied"));
    }
  };

  const handleClearLyrics = () => {
    setClearDialogOpen(true);
  };

  const confirmClearLyrics = () => {
    updateField("lyrics", "");
    toast.success(t("toast.lyricsCleared"));
    setClearDialogOpen(false);
  };

  const handleInsert = (text: string) => {
    if (!lyricsRef.current || !note) return;

    const textarea = lyricsRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentLyrics = note.lyrics || "";

    const newLyrics =
      currentLyrics.slice(0, start) + text + currentLyrics.slice(end);

    updateField("lyrics", newLyrics);
    toast.success(t("toast.insertedAt"));

    // Set cursor position after insert
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleToggleStyleChip = (chipLabel: string) => {
    if (!note) return;
    const currentStyle = note.style || "";
    const chips = currentStyle
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let newChips: string[];
    if (chips.includes(chipLabel)) {
      newChips = chips.filter((c) => c !== chipLabel);
    } else {
      newChips = [...chips, chipLabel];
    }

    updateField("style", newChips.join(", "));
  };

  const getSelectedStyleChips = (): string[] => {
    if (!note?.style) return [];
    return note.style
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (note) {
      downloadNoteJson(note);
      toast.success(t("toast.jsonExported"));
    }
  };

  const handleCopyAll = () => {
    if (!note) return;
    const content = [
      note.title && `Title: ${note.title}`,
      note.composer && `Composer: ${note.composer}`,
      note.lyrics && `\nLyrics:\n${note.lyrics}`,
      note.style && `\nStyle: ${note.style}`,
      note.extraInfo && `\nExtra Info: ${note.extraInfo}`,
      note.tags.length > 0 && `\nTags: ${note.tags.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(content);
    toast.success(t("toast.allCopied"));
  };

  const handleDuplicate = () => {
    if (note) {
      const dup = duplicateNote(note.id);
      if (dup) {
        toast.success(t("toast.noteDuplicated"));
        navigate(`/edit/${dup.id}`);
      }
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (note) {
      deleteNote(note.id);
      toast.success(t("toast.noteDeleted"));
      navigate("/");
    }
  };

  const handleTogglePin = () => {
    if (!note) return;
    updateField("isPinned", !note.isPinned);
    toast.success(note.isPinned ? t("toast.noteUnpinned") : t("toast.notePinned"));
  };

  if (!note) return null;

  return (
    <div className={`min-h-screen ${colorClasses[note.color]}`}>
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-inherit border-b border-border/50 no-print">
        <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTogglePin}
              className={note.isPinned ? "text-primary" : ""}
            >
              <Pin className={`h-5 w-5 ${note.isPinned ? "fill-current" : ""}`} />
            </Button>

            <ColorPicker
              value={note.color}
              onChange={(color) => updateField("color", color)}
            >
              <Button variant="ghost" size="icon">
                <Palette className="h-5 w-5" />
              </Button>
            </ColorPicker>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  {t("menu.print")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  {t("menu.exportPdf")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJson}>
                  <FileJson className="h-4 w-4 mr-2" />
                  {t("menu.exportJson")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyAll}>
                  <ClipboardCopy className="h-4 w-4 mr-2" />
                  {t("menu.copyAll")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t("menu.duplicate")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimelineOpen(true)}>
                  <Clock className="h-4 w-4 mr-2" />
                  {t("menu.timeline")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("menu.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Title */}
        <Input
          placeholder={t("editor.title")}
          value={note.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="text-xl font-semibold border-none bg-transparent focus-visible:ring-0 px-0 placeholder:text-muted-foreground/60"
        />

        {/* Composer */}
        <Input
          placeholder={t("editor.composer")}
          value={note.composer}
          onChange={(e) => updateField("composer", e.target.value)}
          className="border-none bg-transparent focus-visible:ring-0 px-0 text-muted-foreground placeholder:text-muted-foreground/60"
        />

        {/* Lyrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {t("editor.lyrics")}
            </label>
            <div className="flex items-center gap-1 no-print">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className="h-8 px-2"
              >
                <Undo2 className="h-4 w-4 mr-1" />
                {t("editor.undo")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLyrics}
                className="h-8 px-2"
              >
                <Copy className="h-4 w-4 mr-1" />
                {t("editor.copy")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLyrics}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t("editor.clear")}
              </Button>
            </div>
          </div>
          <Textarea
            ref={lyricsRef}
            placeholder={t("editor.lyrics")}
            value={note.lyrics}
            onChange={(e) => updateField("lyrics", e.target.value)}
            className="min-h-[200px] resize-y bg-background/50 border-border"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInsertSheetOpen(true)}
            className="no-print"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("editor.insertSheet")}
          </Button>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {t("editor.style")}
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStylePickerOpen(true)}
              className="h-8 px-2 no-print"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("stylePicker.title")}
            </Button>
          </div>
          {getSelectedStyleChips().length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {getSelectedStyleChips().map((chip, i) => (
                <span
                  key={i}
                  className="chip chip-selected cursor-pointer"
                  onClick={() => handleToggleStyleChip(chip)}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
          <Textarea
            placeholder={t("editor.style")}
            value={note.style}
            onChange={(e) => updateField("style", e.target.value)}
            className="min-h-[80px] resize-y bg-background/50 border-border"
          />
        </div>

        {/* Extra Info */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t("editor.extraInfo")}
          </label>
          <Textarea
            placeholder={t("editor.extraInfo")}
            value={note.extraInfo}
            onChange={(e) => updateField("extraInfo", e.target.value)}
            className="min-h-[80px] resize-y bg-background/50 border-border"
          />
        </div>

        {/* Tags */}
        <TagsInput
          value={note.tags}
          onChange={(tags) => updateField("tags", tags)}
        />
      </main>

      {/* Save Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 no-print">
        <Button onClick={handleSave} disabled={isSaving} className="px-8">
          {isSaving ? t("editor.saving") : t("editor.save")}
        </Button>
      </div>

      {/* Sheets and Dialogs */}
      <InsertSheet
        open={insertSheetOpen}
        onOpenChange={setInsertSheetOpen}
        onInsert={handleInsert}
      />
      <StylePicker
        open={stylePickerOpen}
        onOpenChange={setStylePickerOpen}
        selectedChips={getSelectedStyleChips()}
        onToggleChip={handleToggleStyleChip}
      />
      <TimelineSheet
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        createdAt={note.createdAt}
        timeline={note.timeline}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("dialog.deleteTitle")}
        description={t("dialog.deleteMessage")}
        confirmLabel={t("dialog.confirm")}
        onConfirm={confirmDelete}
        variant="destructive"
      />
      <ConfirmDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title={t("dialog.clearTitle")}
        description={t("dialog.clearMessage")}
        confirmLabel={t("dialog.clearConfirm")}
        onConfirm={confirmClearLyrics}
        variant="destructive"
      />
    </div>
  );
}
