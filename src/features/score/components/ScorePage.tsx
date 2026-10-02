import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, HelpCircle, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageMeta } from "@/lib/usePageMeta";
import { scoreT } from "../i18n";
import { useScoreNote } from "../hooks/useScoreNote";
import { useScorePlayback } from "../hooks/useScorePlayback";
import type { ScoreAccidental, ScoreDuration, ScoreEvent } from "../types/score.types";
import {
  alignLyrics, deleteEvent, findEvent, moveEvent, newScoreId, patchEvent, placeEvent, removeChord, upsertChord,
} from "../utils/scoreEdit";
import { ScoreToolbar } from "./ScoreToolbar";
import { ScoreEditor, type ChordTarget, type EntryMode } from "./ScoreEditor";
import { ScoreEntryToolbar } from "./ScoreEntryToolbar";
import { ScoreSelectionPanel } from "./ScoreSelectionPanel";
import { ScoreChordDialog } from "./ScoreChordDialog";
import { ScorePlaybackBar } from "./ScorePlaybackBar";
import { ScoreLyrics } from "./ScoreLyrics";
import { ScoreLinkedRecording } from "./ScoreLinkedRecording";
import { ScoreHelp } from "./ScoreHelp";
import { useLinkedRecording } from "../hooks/useLinkedRecording";

export default function ScorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { note, setTitle, setScore, flush } = useScoreNote(id);
  const playback = useScorePlayback(note?.score, id);
  const stopScorePlayback = playback.stop;
  const linked = useLinkedRecording(note?.score?.linkedRecordId, stopScorePlayback);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mode, setMode] = useState<EntryMode>("note");
  const [duration, setDuration] = useState<ScoreDuration>("q");
  const [accidental, setAccidental] = useState<ScoreAccidental | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chordTarget, setChordTarget] = useState<ChordTarget | null>(null);
  usePageMeta(`${note?.title || scoreT("score.untitled")} — MyMuNotes`, scoreT("score.workspaceEmpty"));

  useEffect(() => { setSelectedId(null); setChordTarget(null); }, [id]);

  const goBack = () => { playback.stop(); linked.pause(); flush(); navigate("/app"); };

  if (note === undefined) return null;
  if (note === null || !note.score) {
    return (
      <div className="min-h-screen bg-background p-6 text-center">
        <p className="text-muted-foreground mb-4">{scoreT("score.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/app")}>{scoreT("score.back")}</Button>
      </div>
    );
  }

  const score = note.score;
  const selected = findEvent(score, selectedId)?.ev || null;

  const handlePlace = (measure: number, index: number, pitch: number) => {
    const ev: ScoreEvent = mode === "rest"
      ? { id: newScoreId("ev"), kind: "rest", duration }
      : { id: newScoreId("ev"), kind: "note", duration, pitch, ...(accidental ? { accidental } : {}) };
    const measures = placeEvent(score, measure, index, ev);
    if (!measures) { toast.error(scoreT("score.measureFull")); return; }
    setScore({ measures });
  };

  const handlePatch = (patch: Partial<ScoreEvent>) => {
    if (!selectedId) return;
    const measures = patchEvent(score, selectedId, patch);
    if (!measures) { toast.error(scoreT("score.measureFull")); return; }
    setScore({ measures });
  };

  const handlePrint = async () => {
    playback.stop();
    linked.pause();
    flush();
    const { printScore } = await import("../print/scorePrintService");
    await printScore(note);
  };

  const handlePlay = () => {
    linked.pause();
    if (!playback.play()) toast(scoreT("score.nothingToPlay"));
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} aria-label={scoreT("score.back")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            value={note.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={scoreT("score.titlePlaceholder")}
            aria-label={scoreT("score.titlePlaceholder")}
            className="text-lg font-semibold border-none bg-transparent shadow-none focus-visible:ring-0 px-1"
          />
          <Button
            variant="ghost" size="icon" onClick={() => setHelpOpen((o) => !o)}
            aria-label={scoreT("score.help")} aria-expanded={helpOpen} title={scoreT("score.help")}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePrint} aria-label={scoreT("score.printPdf")} title={scoreT("score.printPdf")}>
            <Printer className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className={`container max-w-4xl mx-auto px-4 py-4 space-y-3 ${selected ? "pb-56" : "pb-24"}`}>
        {helpOpen && <ScoreHelp />}
        <ScoreToolbar score={score} onChange={setScore} />
        <ScorePlaybackBar
          playing={playback.playing}
          tempo={score.tempo}
          volume={score.volume}
          onPlay={handlePlay}
          onStop={playback.stop}
          onVolume={(volume) => setScore({ volume })}
        />
        <ScoreLinkedRecording
          linkedId={score.linkedRecordId}
          record={linked.record}
          available={linked.available}
          playing={linked.playing}
          onLink={(linkedRecordId) => setScore({ linkedRecordId })}
          onUnlink={() => { linked.pause(); setScore({ linkedRecordId: undefined }); }}
          onPlay={linked.play}
          onPause={linked.pause}
        />
        <ScoreEntryToolbar
          mode={mode}
          duration={duration}
          accidental={accidental}
          onMode={(m) => { setMode(m); setSelectedId(null); }}
          onDuration={setDuration}
          onAccidental={setAccidental}
        />
        <ScoreEditor
          score={score}
          mode={mode}
          selectedId={selectedId}
          playingId={playback.currentId}
          onPlace={handlePlace}
          onSelect={setSelectedId}
          onChordTarget={setChordTarget}
        />
        <ScoreLyrics
          value={score.lyrics}
          onChange={(lyrics) => setScore({ lyrics })}
          onAlign={() => setScore({ measures: alignLyrics(score) })}
        />
      </main>

      {selected && (
        <ScoreSelectionPanel
          event={selected}
          onPatch={handlePatch}
          onMove={(dir) => setScore({ measures: moveEvent(score, selected.id, dir) })}
          onDelete={() => { setScore({ measures: deleteEvent(score, selected.id) }); setSelectedId(null); }}
          onClose={() => setSelectedId(null)}
        />
      )}

      <ScoreChordDialog
        target={chordTarget}
        onClose={() => setChordTarget(null)}
        onSave={(symbol) => { if (chordTarget) setScore({ chords: upsertChord(score, chordTarget, symbol) }); setChordTarget(null); }}
        onDelete={() => { if (chordTarget?.id) setScore({ chords: removeChord(score, chordTarget.id) }); setChordTarget(null); }}
      />
    </div>
  );
}
