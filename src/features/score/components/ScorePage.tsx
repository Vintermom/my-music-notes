import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, FileDown, FileJson, HelpCircle, Maximize2, MoreVertical, Palette, Pin, Printer, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColorPicker } from "@/components/ColorPicker";
import { TagsInput } from "@/components/TagsInput";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScoreShareButton } from "./ScoreShareButton";
import { t } from "@/i18n";
import { formatDateISO } from "@/lib/dateFormat";
import { usePageMeta } from "@/lib/usePageMeta";
import { deleteNote, downloadNoteJson, duplicateNote } from "@/storage/notesRepo";
import { scoreT } from "../i18n";
import { useScoreNote } from "../hooks/useScoreNote";
import { useScorePlayback } from "../hooks/useScorePlayback";
import { useLinkedRecording } from "../hooks/useLinkedRecording";
import { useScoreHistory } from "../hooks/useScoreHistory";
import { scorePlayer } from "../services/scorePlayer";
import type { ScoreAccidental, ScoreDuration, ScoreEvent } from "../types/score.types";
import {
  alignLyrics, clearMeasure, clearScore, deleteEvent, deleteMeasure, findEvent, moveEvent, newScoreId, patchEvent, placeEvent,
  removeChord, replaceAllLyrics, syncNoteLyric, upsertChord,
} from "../utils/scoreEdit";
import { measureCapacity, usedUnits } from "../utils/notation";
import { ScoreToolbar } from "./ScoreToolbar";
import { ScoreEditor, type ChordTarget, type EntryMode } from "./ScoreEditor";
import { ScoreEntryToolbar } from "./ScoreEntryToolbar";
import { ScoreChordDialog } from "./ScoreChordDialog";
import { ScorePlaybackBar } from "./ScorePlaybackBar";
import { ScoreLyrics } from "./ScoreLyrics";
import { ScoreLyricsImportDialog } from "./ScoreLyricsImportDialog";
import { ScoreLinkedRecording } from "./ScoreLinkedRecording";
import { ScoreHelp } from "./ScoreHelp";
import { ScoreMeasureMenu } from "./ScoreMeasureMenu";
import { InsertSheet } from "@/components/InsertSheet";
import { createDefaultScoreData } from "../utils/scoreData";

const colorClasses = {
  default: "note-bg-default", cream: "note-bg-cream", pink: "note-bg-pink", blue: "note-bg-blue",
  green: "note-bg-green", yellow: "note-bg-yellow", purple: "note-bg-purple", orange: "note-bg-orange",
} as const;

export default function ScorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { note, setTitle, setMetadata, setScore, flush, flushNow } = useScoreNote(id);
  const playback = useScorePlayback(note?.score, id);
  const linked = useLinkedRecording(note?.score?.linkedRecordId, playback.stop);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mode, setMode] = useState<EntryMode>("note");
  const [duration, setDuration] = useState<ScoreDuration>("q");
  const [accidental, setAccidental] = useState<ScoreAccidental | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedChord, setSelectedChord] = useState<ChordTarget | null>(null);
  const [chordTarget, setChordTarget] = useState<ChordTarget | null>(null);
  const [measureMenu, setMeasureMenu] = useState<number | null>(null);
  const [confirmReplaceLyrics, setConfirmReplaceLyrics] = useState(false);
  const [confirmClearScore, setConfirmClearScore] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lyricsImportOpen, setLyricsImportOpen] = useState(false);
  const [insertSheetOpen, setInsertSheetOpen] = useState(false);
  const [lyricsFullscreen, setLyricsFullscreen] = useState(false);
  const [scoreFullscreen, setScoreFullscreen] = useState(false);
  const lyricsRef = useRef<HTMLTextAreaElement>(null);
  const history = useScoreHistory(id, note?.score, setScore);
  const { undo, redo } = history;
  usePageMeta(`${note?.title || scoreT("score.untitled")} — MyMuNotes`, scoreT("score.workspaceEmpty"));

  useEffect(() => { setSelectedId(null); setSelectedChord(null); setChordTarget(null); }, [id]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const typing = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (typing || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [redo, undo]);

  const goBack = () => { playback.stop(); linked.pause(); flush(); navigate("/app"); };

  if (note === undefined) return null;
  if (note === null || !note.score) {
    return <div className="min-h-screen bg-background p-6 text-center"><p className="text-muted-foreground mb-4">{scoreT("score.notFound")}</p><Button variant="outline" onClick={() => navigate("/app")}>{scoreT("score.back")}</Button></div>;
  }

  const score = note.score;
  const selected = findEvent(score, selectedId)?.ev || null;

  const handlePlace = (measure: number, index: number, pitch: number) => {
    const event: ScoreEvent = mode === "rest"
      ? { id: newScoreId("ev"), kind: "rest", duration }
      : { id: newScoreId("ev"), kind: "note", duration, pitch, ...(accidental ? { accidental } : {}) };
    const measures = placeEvent(score, measure, index, event);
    if (!measures) { toast.error(scoreT("score.measureFull")); return; }
    history.commit({ measures });
  };

  const handlePatch = (patch: Partial<ScoreEvent>) => {
    if (!selectedId) return;
    if (Object.prototype.hasOwnProperty.call(patch, "lyric")) {
      const lyricPatch = syncNoteLyric(score, selectedId, String(patch.lyric || ""));
      if (lyricPatch) history.commit(lyricPatch);
      return;
    }
    const measures = patchEvent(score, selectedId, patch);
    if (!measures) { toast.error(scoreT("score.measureFull")); return; }
    history.commit({ measures });
  };

  const handlePrint = async () => {
    playback.stop(); linked.pause();
    const saved = flushNow();
    const { printScore } = await import("../print/scorePrintService");
    await printScore(saved || note);
  };

  const handleDuplicate = () => {
    flushNow();
    const duplicate = duplicateNote(note.id);
    if (!duplicate) return;
    toast.success(t("toast.noteDuplicated"));
    navigate(`/score/${duplicate.id}`);
  };

  const handleDelete = () => {
    playback.stop(); linked.pause();
    if (deleteNote(note.id)) toast.success(t("toast.noteDeleted"));
    navigate("/app");
  };

  const handleChordTarget = (target: ChordTarget) => {
    setSelectedId(null);
    if (target.id) setSelectedChord(target);
    else setChordTarget(target);
  };

  const handleScoreChange = (patch: Parameters<typeof history.commit>[0]) => {
    if (patch.timeSignature && score.measures.some((measure) => usedUnits(measure) > measureCapacity(patch.timeSignature || score.timeSignature))) {
      toast.error(scoreT("score.timeTooSmall")); return;
    }
    history.commit(patch);
  };

  const toolbar = (
    <ScoreEntryToolbar
      mode={mode} duration={duration} accidental={accidental} selected={selected} selectedChord={selectedChord}
      onMode={(next) => { setMode(next); setSelectedId(null); setSelectedChord(null); }}
      onDuration={setDuration} onAccidental={setAccidental} onPatchSelected={handlePatch}
      onMoveSelected={(direction) => selected && history.commit({ measures: moveEvent(score, selected.id, direction) })}
      onPreviewSelected={() => { if (selected) scorePlayer.previewNote(score, selected.id); }}
      onDeleteSelected={() => { if (!selected) return; history.commit({ measures: deleteEvent(score, selected.id) }); setSelectedId(null); }}
      onCloseSelected={() => { setSelectedId(null); setSelectedChord(null); }}
      onEditChord={() => { if (selectedChord) setChordTarget(selectedChord); }}
      onDeleteChord={() => { if (!selectedChord?.id) return; history.commit({ chords: removeChord(score, selectedChord.id) }); setSelectedChord(null); }}
      canUndo={history.canUndo} canRedo={history.canRedo} onUndo={history.undo} onRedo={history.redo}
      onClearScore={() => setConfirmClearScore(true)}
    />
  );

  const workspace = (
    <>
      <div className="flex justify-end">{!scoreFullscreen && <Button type="button" variant="ghost" size="icon" onClick={() => setScoreFullscreen(true)} aria-label={scoreT("score.fullscreenStaff")}><Maximize2 className="h-4 w-4" /></Button>}</div>
      <ScoreToolbar score={score} onChange={handleScoreChange} />
      <ScorePlaybackBar playing={playback.playing} tempo={score.tempo} volume={score.volume} onPlay={() => { linked.pause(); if (!playback.play()) toast(scoreT("score.nothingToPlay")); }} onStop={playback.stop} onVolume={(volume) => setScore({ volume })} />
      {toolbar}
      <ScoreEditor score={score} mode={mode} selectedId={selectedId} hasSelection={!!selected || !!selectedChord} playingId={playback.currentId} onPlace={handlePlace} onSelect={(eventId) => { setSelectedChord(null); setSelectedId(eventId); }} onChordTarget={handleChordTarget} onMeasureMenu={setMeasureMenu} />
    </>
  );

  const lyrics = (
    <ScoreLyrics
      value={score.lyrics} onChange={(value) => history.commit({ lyrics: value })}
      onImport={() => setLyricsImportOpen(true)} onFullscreen={() => setLyricsFullscreen(true)} fullscreen={lyricsFullscreen}
      onInsert={() => setInsertSheetOpen(true)}
      textareaRef={lyricsRef}
      onAlign={() => history.commit({ measures: alignLyrics(score) })}
      onReplaceAll={() => {
        const assigned = score.measures.some((measure) => measure.events.some((event) => event.kind === "note" && event.lyric));
        if (assigned) setConfirmReplaceLyrics(true); else history.commit({ measures: replaceAllLyrics(score) });
      }}
    />
  );

  return (
    <div className={`min-h-screen overflow-x-hidden ${colorClasses[note.color]}`}>
      <header className="sticky top-0 z-10 bg-inherit border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goBack} aria-label={scoreT("score.back")}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setMetadata({ isPinned: !note.isPinned })} aria-label={note.isPinned ? "Unpin note" : "Pin note"} className={note.isPinned ? "text-primary" : ""}><Pin className={`h-5 w-5 ${note.isPinned ? "fill-current" : ""}`} /></Button>
            <ColorPicker value={note.color} onChange={(color) => setMetadata({ color })}><Button variant="ghost" size="icon" aria-label="Change note color"><Palette className="h-5 w-5" /></Button></ColorPicker>
            <ScoreShareButton note={note} beforeShare={flushNow} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="More actions"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />{t("menu.print")}</DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}><FileDown className="h-4 w-4 mr-2" />{t("menu.exportPdf")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { const saved = flushNow(); if (saved) downloadNoteJson(saved); toast.success(t("toast.jsonExported")); }}><FileJson className="h-4 w-4 mr-2" />{t("menu.exportJson")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDuplicate}><Copy className="h-4 w-4 mr-2" />{t("menu.duplicate")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setConfirmClearAll(true)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" />{scoreT("score.clearAll")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" />{t("menu.delete")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-4 space-y-3 pb-24">
        <Input value={note.title} onChange={(event) => setTitle(event.target.value)} placeholder={t("editor.title")} aria-label={t("editor.title")} className="text-lg font-semibold h-9 px-2 input-desktop border-transparent bg-transparent" />
        <Input value={note.composer} onChange={(event) => setMetadata({ composer: event.target.value })} placeholder={t("editor.composer")} aria-label={t("editor.composer")} className="text-sm h-8 px-2 text-muted-foreground input-desktop border-transparent bg-transparent" />
        {helpOpen && <ScoreHelp />}
        <div className="flex justify-end"><Button variant="ghost" size="icon" onClick={() => setHelpOpen((open) => !open)} aria-label={scoreT("score.help")}><HelpCircle className="h-5 w-5" /></Button></div>
        {workspace}
        <ScoreLinkedRecording linkedId={score.linkedRecordId} record={linked.record} available={linked.available} playing={linked.playing} onLink={(linkedRecordId) => setScore({ linkedRecordId })} onUnlink={() => { linked.pause(); setScore({ linkedRecordId: undefined }); }} onPlay={linked.play} onPause={linked.pause} />
        {lyrics}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("editor.style")}</label>
          <Textarea value={note.style} maxLength={2000} onChange={(event) => setMetadata({ style: event.target.value })} placeholder={t("editor.style")} className="min-h-[70px] resize-none text-sm textarea-desktop" />
        </div>
        <TagsInput value={note.tags} onChange={(tags) => setMetadata({ tags })} />
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border/50">
          <p>{t("timestamp.lastEdited")}: {formatDateISO(note.updatedAt)}</p>
          <p>{t("timestamp.created")}: {formatDateISO(note.createdAt)}</p>
        </div>
      </main>

      {scoreFullscreen && (
        <div className={`fixed inset-0 z-40 overflow-y-auto ${colorClasses[note.color]}`} style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-border/50 bg-inherit px-4"><span className="text-sm font-medium">{note.title || scoreT("score.untitled")}</span><Button variant="ghost" size="sm" onClick={() => setScoreFullscreen(false)}><X className="h-4 w-4 mr-1.5" />{scoreT("score.exitFullscreen")}</Button></div>
          <div className="container max-w-6xl mx-auto p-4 space-y-3">{workspace}</div>
        </div>
      )}
      {lyricsFullscreen && (
        <div className={`fixed inset-0 z-40 flex flex-col ${colorClasses[note.color]}`} style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-4"><span className="text-sm font-medium">{scoreT("score.lyrics")}</span><Button variant="ghost" size="sm" onClick={() => setLyricsFullscreen(false)}><X className="h-4 w-4 mr-1.5" />{scoreT("score.exitFullscreen")}</Button></div>
          <div className="flex-1 min-h-0 p-3">{lyrics}</div>
        </div>
      )}

      <ScoreChordDialog target={chordTarget} onClose={() => setChordTarget(null)} onSave={(symbol) => { if (chordTarget) history.commit({ chords: upsertChord(score, chordTarget, symbol) }); setChordTarget(null); setSelectedChord(null); }} onDelete={() => { if (chordTarget?.id) history.commit({ chords: removeChord(score, chordTarget.id) }); setChordTarget(null); setSelectedChord(null); }} />
      <ScoreMeasureMenu measure={measureMenu} onClose={() => setMeasureMenu(null)} onClear={(measure) => history.commit(clearMeasure(score, measure))} onDelete={(measure) => { history.commit(deleteMeasure(score, measure)); setSelectedId(null); }} />
      <ScoreLyricsImportDialog open={lyricsImportOpen} onOpenChange={setLyricsImportOpen} onImport={(imported) => history.commit({ lyrics: imported })} />
      <InsertSheet open={insertSheetOpen} onOpenChange={setInsertSheetOpen} onInsert={(text) => {
        const cursor = lyricsRef.current?.selectionStart ?? score.lyrics.length;
        const before = score.lyrics.slice(0, cursor);
        const after = score.lyrics.slice(cursor);
        const prefix = before && !before.endsWith("\n") ? "\n" : "";
        const suffix = after && !after.startsWith("\n") ? "\n" : "";
        history.commit({ lyrics: `${before}${prefix}${text}${suffix}${after}` });
      }} />
      <ConfirmDialog open={confirmReplaceLyrics} onOpenChange={setConfirmReplaceLyrics} title={scoreT("score.replaceAllLyricsTitle")} description={scoreT("score.replaceAllLyricsConfirm")} confirmLabel={scoreT("score.replaceAllLyrics")} onConfirm={() => { history.commit({ measures: replaceAllLyrics(score) }); setConfirmReplaceLyrics(false); }} />
      <ConfirmDialog open={confirmClearScore} onOpenChange={setConfirmClearScore} title={scoreT("score.clearScoreTitle")} description={scoreT("score.clearScoreConfirm")} confirmLabel={scoreT("score.clearScore")} variant="destructive" onConfirm={() => { history.commit(clearScore()); setSelectedId(null); setSelectedChord(null); setConfirmClearScore(false); }} />
      <ConfirmDialog open={confirmClearAll} onOpenChange={setConfirmClearAll} title={scoreT("score.clearAllTitle")} description={scoreT("score.clearAllConfirm")} confirmLabel={scoreT("score.clearAll")} variant="destructive" onConfirm={() => { setScore(createDefaultScoreData()); setTitle(""); setMetadata({ composer: "", style: "", tags: [] }); setSelectedId(null); setSelectedChord(null); setConfirmClearAll(false); }} />
      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title={scoreT("score.deleteTitle")} description={scoreT("score.deleteConfirm")} confirmLabel={t("menu.delete")} variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}
