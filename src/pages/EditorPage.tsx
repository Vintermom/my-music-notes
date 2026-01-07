import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Note, NoteColor } from "@/domain/types";
import { t } from "@/i18n";
import { getNoteById, updateNote, deleteNote, duplicateNote, downloadNoteJson } from "@/storage/notesRepo";
import { useLyricsHistory } from "@/hooks/useLyricsHistory";
import { useStyleHistory } from "@/hooks/useStyleHistory";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import {
  ArrowLeft, Pin, Palette, MoreVertical, Undo2, Plus, Printer, FileJson,
  ClipboardCopy, Clock, Copy, Trash2, ChevronDown, ChevronUp, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColorPicker } from "@/components/ColorPicker";
import { TagsInput } from "@/components/TagsInput";
import { InsertSheet } from "@/components/InsertSheet";
import { StylePicker } from "@/components/StylePicker";
import { TimelineSheet } from "@/components/TimelineSheet";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PrintDialog } from "@/components/PrintDialog";
import { ImportDialog } from "@/components/ImportDialog";

const colorClasses: Record<NoteColor, string> = {
  default: "note-bg-default", cream: "note-bg-cream", pink: "note-bg-pink",
  blue: "note-bg-blue", green: "note-bg-green", yellow: "note-bg-yellow",
  purple: "note-bg-purple", orange: "note-bg-orange",
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
  const [clearStyleDialogOpen, setClearStyleDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [lyricsExpanded, setLyricsExpanded] = useState(true);
  const [styleExpanded, setStyleExpanded] = useState(true);

  const { pushToHistory: pushLyricsHistory, undo: undoLyrics, canUndo: canUndoLyrics, reset: resetLyricsHistory } = useLyricsHistory(note?.lyrics || "");
  const { pushToHistory: pushStyleHistory, undo: undoStyle, canUndo: canUndoStyle, reset: resetStyleHistory } = useStyleHistory(note?.style || "");

  useEffect(() => {
    if (id) {
      const loadedNote = getNoteById(id);
      if (loadedNote) {
        setNote(loadedNote);
        resetLyricsHistory(loadedNote.lyrics);
        resetStyleHistory(loadedNote.style);
      } else {
        navigate("/");
      }
    }
  }, [id, navigate, resetLyricsHistory, resetStyleHistory]);

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
      if (field === "lyrics") pushLyricsHistory(value as string);
      if (field === "style") pushStyleHistory(value as string);
    },
    [note, debouncedSave, pushLyricsHistory, pushStyleHistory]
  );

  const handleSave = () => {
    if (!note) return;
    setIsSaving(true);
    updateNote(note.id, note);
    setIsSaving(false);
    toast.success(t("toast.noteSaved"));
  };

  const handleUndoLyrics = () => {
    const prev = undoLyrics();
    if (prev !== null) {
      setNote((n) => (n ? { ...n, lyrics: prev } : null));
      toast.success(t("toast.undoApplied"));
    } else {
      toast.info(t("toast.noUndoHistory"));
    }
  };

  const handleUndoStyle = () => {
    const prev = undoStyle();
    if (prev !== null) {
      setNote((n) => (n ? { ...n, style: prev } : null));
      toast.success(t("toast.undoApplied"));
    } else {
      toast.info(t("toast.noUndoHistory"));
    }
  };

  const handleCopyLyrics = () => { if (note?.lyrics) { navigator.clipboard.writeText(note.lyrics); toast.success(t("toast.lyricsCopied")); } };
  const handleCopyStyle = () => { if (note?.style) { navigator.clipboard.writeText(note.style); toast.success(t("toast.styleCopied")); } };
  const confirmClearLyrics = () => { updateField("lyrics", ""); toast.success(t("toast.lyricsCleared")); setClearDialogOpen(false); };
  const confirmClearStyle = () => { updateField("style", ""); toast.success(t("toast.styleCleared")); setClearStyleDialogOpen(false); };

  const handleInsert = (text: string) => {
    if (!lyricsRef.current || !note) return;
    const textarea = lyricsRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newLyrics = (note.lyrics || "").slice(0, start) + text + (note.lyrics || "").slice(end);
    updateField("lyrics", newLyrics);
    toast.success(t("toast.insertedAt"));
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + text.length, start + text.length); }, 0);
  };

  const handleToggleStyleChip = (chipLabel: string) => {
    if (!note) return;
    const chips = (note.style || "").split(",").map((s) => s.trim()).filter(Boolean);
    const newChips = chips.includes(chipLabel) ? chips.filter((c) => c !== chipLabel) : [...chips, chipLabel];
    updateField("style", newChips.join(", "));
  };

  const getSelectedStyleChips = (): string[] => note?.style ? note.style.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const handlePrint = (textOnly: boolean) => {
    if (!note) return;
    if (textOnly) {
      const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
      const content = [
        note.title && `${note.title}`, note.composer && `${note.composer}`, "",
        note.lyrics, "", note.style && `Style: ${note.style}`, note.extraInfo && `Extra: ${note.extraInfo}`,
        note.tags.length > 0 && `Tags: ${note.tags.join(", ")}`, "", "---",
        `${t("print.created")}: ${formatDate(note.createdAt)}`,
        `${t("print.updated")}: ${formatDate(note.updatedAt)}`,
        `${t("print.printed")}: ${formatDate(Date.now())}`,
      ].filter((l) => l !== false).join("\n");
      const w = window.open("", "_blank");
      if (w) { w.document.write(`<pre style="font-family:system-ui;white-space:pre-wrap;padding:2rem;">${content}</pre>`); w.document.close(); w.print(); }
    } else {
      window.print();
    }
  };

  const handleExportJson = () => { if (note) { downloadNoteJson(note); toast.success(t("toast.jsonExported")); } };
  const handleCopyAll = () => {
    if (!note) return;
    const content = [note.title && `Title: ${note.title}`, note.composer && `Composer: ${note.composer}`, note.lyrics && `\nLyrics:\n${note.lyrics}`, note.style && `\nStyle: ${note.style}`, note.extraInfo && `\nExtra Info: ${note.extraInfo}`, note.tags.length > 0 && `\nTags: ${note.tags.join(", ")}`].filter(Boolean).join("\n");
    navigator.clipboard.writeText(content);
    toast.success(t("toast.allCopied"));
  };
  const handleDuplicate = () => { if (note) { const dup = duplicateNote(note.id); if (dup) { toast.success(t("toast.noteDuplicated")); navigate(`/edit/${dup.id}`); } } };
  const confirmDelete = () => { if (note) { deleteNote(note.id); toast.success(t("toast.noteDeleted")); navigate("/"); } };
  const handleTogglePin = () => { if (!note) return; updateField("isPinned", !note.isPinned); toast.success(note.isPinned ? t("toast.noteUnpinned") : t("toast.notePinned")); };

  if (!note) return null;

  return (
    <div className={`min-h-screen ${colorClasses[note.color]}`}>
      <header className="sticky top-0 z-10 bg-inherit border-b border-border/50 no-print">
        <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleTogglePin} className={note.isPinned ? "text-primary" : ""}>
              <Pin className={`h-5 w-5 ${note.isPinned ? "fill-current" : ""}`} />
            </Button>
            <ColorPicker value={note.color} onChange={(color) => updateField("color", color)}>
              <Button variant="ghost" size="icon"><Palette className="h-5 w-5" /></Button>
            </ColorPicker>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPrintDialogOpen(true)}><Printer className="h-4 w-4 mr-2" />{t("menu.print")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPrintDialogOpen(true)}><Printer className="h-4 w-4 mr-2" />{t("menu.exportPdf")}</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJson}><FileJson className="h-4 w-4 mr-2" />{t("menu.exportJson")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportDialogOpen(true)}><Upload className="h-4 w-4 mr-2" />{t("menu.importJson")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyAll}><ClipboardCopy className="h-4 w-4 mr-2" />{t("menu.copyAll")}</DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLyrics}><Copy className="h-4 w-4 mr-2" />{t("editor.copyLyrics")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setClearDialogOpen(true)}><Trash2 className="h-4 w-4 mr-2" />{t("editor.clearLyrics")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDuplicate}><Copy className="h-4 w-4 mr-2" />{t("menu.duplicate")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimelineOpen(true)}><Clock className="h-4 w-4 mr-2" />{t("menu.timeline")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" />{t("menu.delete")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
        <Input placeholder={t("editor.title")} value={note.title} onChange={(e) => updateField("title", e.target.value)} className="text-xl font-semibold border-none bg-transparent focus-visible:ring-0 px-0" />
        <Input placeholder={t("editor.composer")} value={note.composer} onChange={(e) => updateField("composer", e.target.value)} className="border-none bg-transparent focus-visible:ring-0 px-0 text-muted-foreground" />

        {/* Lyrics Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t("editor.lyrics")}</label>
              <Button variant="ghost" size="sm" onClick={() => setInsertSheetOpen(true)} className="h-7 px-2 text-xs no-print"><Plus className="h-3 w-3 mr-1" />{t("editor.insertSheet")}</Button>
            </div>
            <div className="flex items-center gap-1 no-print">
              <Button variant="ghost" size="sm" onClick={handleUndoLyrics} disabled={!canUndoLyrics} className="h-7 px-2"><Undo2 className="h-3 w-3 mr-1" />{t("editor.undo")}</Button>
              <Button variant="ghost" size="icon" onClick={() => setLyricsExpanded(!lyricsExpanded)} className="h-7 w-7">{lyricsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
            </div>
          </div>
          <Textarea ref={lyricsRef} placeholder={t("editor.lyrics")} value={note.lyrics} onChange={(e) => updateField("lyrics", e.target.value)} className={`bg-background/50 border-border resize-none transition-all ${lyricsExpanded ? "min-h-[200px]" : "min-h-[60px] max-h-[60px]"}`} />
        </div>

        {/* Style Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t("editor.style")}</label>
              <Button variant="ghost" size="sm" onClick={() => setStylePickerOpen(true)} className="h-7 px-2 text-xs no-print"><Plus className="h-3 w-3 mr-1" />{t("stylePicker.title")}</Button>
            </div>
            <div className="flex items-center gap-1 no-print">
              <Button variant="ghost" size="sm" onClick={handleUndoStyle} disabled={!canUndoStyle} className="h-7 px-2"><Undo2 className="h-3 w-3 mr-1" />{t("editor.undo")}</Button>
              <Button variant="ghost" size="icon" onClick={() => setStyleExpanded(!styleExpanded)} className="h-7 w-7">{styleExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
            </div>
          </div>
          {getSelectedStyleChips().length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {getSelectedStyleChips().map((chip, i) => (<span key={i} className="chip chip-selected cursor-pointer" onClick={() => handleToggleStyleChip(chip)}>{chip}</span>))}
            </div>
          )}
          <Textarea placeholder={t("editor.style")} value={note.style} onChange={(e) => updateField("style", e.target.value)} className={`bg-background/50 border-border resize-none transition-all ${styleExpanded ? "min-h-[80px]" : "min-h-[40px] max-h-[40px]"}`} />
        </div>

        {/* Extra Info - reduced height, secondary */}
        <div className="space-y-2 opacity-80">
          <label className="text-xs font-medium text-muted-foreground">{t("editor.extraInfo")}</label>
          <Textarea placeholder={t("editor.extraInfo")} value={note.extraInfo} onChange={(e) => updateField("extraInfo", e.target.value)} className="min-h-[50px] max-h-[50px] resize-none bg-background/30 border-border text-sm" />
        </div>

        <TagsInput value={note.tags} onChange={(tags) => updateField("tags", tags)} />
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 no-print">
        <Button onClick={handleSave} disabled={isSaving} className="px-8">{isSaving ? t("editor.saving") : t("editor.save")}</Button>
      </div>

      <InsertSheet open={insertSheetOpen} onOpenChange={setInsertSheetOpen} onInsert={handleInsert} />
      <StylePicker open={stylePickerOpen} onOpenChange={setStylePickerOpen} selectedChips={getSelectedStyleChips()} onToggleChip={handleToggleStyleChip} />
      <TimelineSheet open={timelineOpen} onOpenChange={setTimelineOpen} createdAt={note.createdAt} timeline={note.timeline} />
      <PrintDialog open={printDialogOpen} onOpenChange={setPrintDialogOpen} note={note} onPrint={handlePrint} />
      <ImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} onImportSuccess={(n) => navigate(`/edit/${n.id}`)} />
      <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title={t("dialog.deleteTitle")} description={t("dialog.deleteMessage")} confirmLabel={t("dialog.confirm")} onConfirm={confirmDelete} variant="destructive" />
      <ConfirmDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen} title={t("dialog.clearTitle")} description={t("dialog.clearMessage")} confirmLabel={t("dialog.clearConfirm")} onConfirm={confirmClearLyrics} variant="destructive" />
      <ConfirmDialog open={clearStyleDialogOpen} onOpenChange={setClearStyleDialogOpen} title={t("dialog.clearStyleTitle")} description={t("dialog.clearStyleMessage")} confirmLabel={t("dialog.clearConfirm")} onConfirm={confirmClearStyle} variant="destructive" />
    </div>
  );
}
