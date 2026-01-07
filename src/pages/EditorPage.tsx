import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Note, NoteColor, STYLE_CHAR_LIMIT_FREE } from "@/domain/types";
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
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
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

  // Auto-save status reset after 2 seconds
  useEffect(() => {
    if (autoSaveStatus === "saved") {
      const timer = setTimeout(() => setAutoSaveStatus("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [autoSaveStatus]);

  const debouncedSave = useDebounce((noteToSave: Note) => {
    setAutoSaveStatus("saving");
    updateNote(noteToSave.id, noteToSave);
    setAutoSaveStatus("saved");
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
    const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    
    if (textOnly) {
      // Text-only mode with clear vertical spacing and dividers
      const lines: string[] = [];
      
      if (note.title) lines.push(`<h1 style="font-size:1.5rem;font-weight:600;margin:0;">${note.title}</h1>`);
      if (note.composer) lines.push(`<p style="color:#666;margin:0.25rem 0 0 0;">${note.composer}</p>`);
      
      if (note.title || note.composer) lines.push(`<hr style="border:none;border-top:1px solid #ddd;margin:1rem 0;" />`);
      
      if (note.lyrics) lines.push(`<pre style="font-family:monospace;white-space:pre-wrap;margin:0;line-height:1.6;">${note.lyrics}</pre>`);
      
      if (note.style) {
        if (note.lyrics) lines.push(`<div style="margin-top:1rem;"></div>`);
        lines.push(`<p style="margin:0;"><strong>Style:</strong> ${note.style}</p>`);
      }
      
      if (note.extraInfo) lines.push(`<p style="margin:0.5rem 0 0 0;"><strong>Extra:</strong> ${note.extraInfo}</p>`);
      
      if (note.tags.length > 0) lines.push(`<p style="margin:0.5rem 0 0 0;"><strong>Tags:</strong> ${note.tags.join(", ")}</p>`);
      
      lines.push(`<hr style="border:none;border-top:1px solid #ddd;margin:1.5rem 0 1rem 0;" />`);
      lines.push(`<div style="font-size:0.75rem;color:#888;line-height:1.4;">`);
      lines.push(`<p style="margin:0;">${t("print.created")}: ${formatDate(note.createdAt)}</p>`);
      lines.push(`<p style="margin:0;">${t("print.updated")}: ${formatDate(note.updatedAt)}</p>`);
      lines.push(`<p style="margin:0;">${t("print.printed")}: ${formatDate(Date.now())}</p>`);
      lines.push(`</div>`);
      
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(`<html><head><title>${note.title || "Note"}</title></head><body style="font-family:system-ui;padding:2rem;max-width:800px;margin:0 auto;">${lines.join("")}</body></html>`);
        w.document.close();
        w.print();
      }
    } else {
      // App layout mode - render read-only editor style
      const noteColorMap: Record<NoteColor, string> = {
        default: "#fafaf9", cream: "#fef9e7", pink: "#fdf2f4", blue: "#eff6ff",
        green: "#f0fdf4", yellow: "#fefce8", purple: "#faf5ff", orange: "#fff7ed",
      };
      
      const lines: string[] = [];
      lines.push(`<div style="background:${noteColorMap[note.color]};border-radius:1rem;padding:1.5rem;max-width:600px;margin:0 auto;">`);
      
      if (note.title) lines.push(`<h1 style="font-size:1.25rem;font-weight:600;margin:0 0 0.5rem 0;">${note.title}</h1>`);
      if (note.composer) lines.push(`<p style="color:#666;margin:0 0 1rem 0;">${note.composer}</p>`);
      
      if (note.lyrics) {
        lines.push(`<div style="background:rgba(255,255,255,0.5);border-radius:0.5rem;padding:0.75rem;margin-bottom:1rem;">`);
        lines.push(`<p style="font-size:0.75rem;color:#888;margin:0 0 0.25rem 0;">${t("editor.lyrics")}</p>`);
        lines.push(`<pre style="font-family:inherit;white-space:pre-wrap;margin:0;font-size:0.875rem;">${note.lyrics}</pre>`);
        lines.push(`</div>`);
      }
      
      if (note.style) {
        lines.push(`<div style="background:rgba(255,255,255,0.5);border-radius:0.5rem;padding:0.75rem;margin-bottom:1rem;">`);
        lines.push(`<p style="font-size:0.75rem;color:#888;margin:0 0 0.25rem 0;">${t("editor.style")}</p>`);
        lines.push(`<p style="margin:0;font-size:0.875rem;">${note.style}</p>`);
        lines.push(`</div>`);
      }
      
      if (note.extraInfo) {
        lines.push(`<div style="background:rgba(255,255,255,0.3);border-radius:0.5rem;padding:0.5rem;margin-bottom:1rem;">`);
        lines.push(`<p style="font-size:0.7rem;color:#888;margin:0 0 0.25rem 0;">${t("editor.extraInfo")}</p>`);
        lines.push(`<p style="margin:0;font-size:0.75rem;">${note.extraInfo}</p>`);
        lines.push(`</div>`);
      }
      
      if (note.tags.length > 0) {
        lines.push(`<div style="display:flex;flex-wrap:wrap;gap:0.25rem;margin-bottom:1rem;">`);
        note.tags.forEach(tag => {
          lines.push(`<span style="background:#e5e5e5;padding:0.25rem 0.5rem;border-radius:9999px;font-size:0.75rem;">${tag}</span>`);
        });
        lines.push(`</div>`);
      }
      
      lines.push(`<div style="border-top:1px solid #ddd;padding-top:0.75rem;font-size:0.7rem;color:#888;line-height:1.4;">`);
      lines.push(`<p style="margin:0;">${t("print.created")}: ${formatDate(note.createdAt)}</p>`);
      lines.push(`<p style="margin:0;">${t("print.updated")}: ${formatDate(note.updatedAt)}</p>`);
      lines.push(`<p style="margin:0;">${t("print.printed")}: ${formatDate(Date.now())}</p>`);
      lines.push(`</div>`);
      lines.push(`</div>`);
      
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(`<html><head><title>${note.title || "Note"}</title></head><body style="font-family:system-ui;padding:2rem;background:#f5f5f5;">${lines.join("")}</body></html>`);
        w.document.close();
        w.print();
      }
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

  const styleCharCount = note?.style?.length || 0;
  const styleCharLimit = STYLE_CHAR_LIMIT_FREE;

  if (!note) return null;

  return (
    <div className={`min-h-screen ${colorClasses[note.color]}`}>
      <header className="sticky top-0 z-10 bg-inherit border-b border-border/50 no-print">
        <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-5 w-5" /></Button>
            {/* Auto-save indicator */}
            {autoSaveStatus !== "idle" && (
              <span className="text-xs text-muted-foreground">
                {autoSaveStatus === "saving" ? t("editor.autoSaving") : t("editor.autoSaved")}
              </span>
            )}
          </div>
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
              <span className="text-xs text-muted-foreground mr-2">{styleCharCount} / {styleCharLimit}</span>
              <Button variant="ghost" size="sm" onClick={handleUndoStyle} disabled={!canUndoStyle} className="h-7 px-2"><Undo2 className="h-3 w-3 mr-1" />{t("editor.undo")}</Button>
              <Button variant="ghost" size="icon" onClick={() => setStyleExpanded(!styleExpanded)} className="h-7 w-7">{styleExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
            </div>
          </div>
          <Textarea 
            placeholder={t("editor.style")} 
            value={note.style} 
            onChange={(e) => {
              if (e.target.value.length <= styleCharLimit) {
                updateField("style", e.target.value);
              }
            }} 
            className={`bg-background/50 border-border resize-none transition-all ${styleExpanded ? "min-h-[80px]" : "min-h-[40px] max-h-[40px]"}`} 
          />
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
