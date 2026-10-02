import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Play, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ScoreAccidental, ScoreDuration, ScoreEvent } from "../types/score.types";
import { DURATIONS, pitchName } from "../utils/notation";
import { ACCIDENTAL_GLYPH, DurationIcon } from "./NotationGlyphs";
import type { ChordTarget, EntryMode } from "./ScoreEditor";
import { scoreT } from "../i18n";

interface Props {
  mode: EntryMode;
  duration: ScoreDuration;
  accidental: ScoreAccidental | null;
  selected: ScoreEvent | null;
  selectedChord: ChordTarget | null;
  onMode: (m: EntryMode) => void;
  onDuration: (d: ScoreDuration) => void;
  onAccidental: (a: ScoreAccidental | null) => void;
  onPatchSelected: (patch: Partial<ScoreEvent>) => void;
  onMoveSelected: (dir: -1 | 1) => void;
  onPreviewSelected: () => void;
  onDeleteSelected: () => void;
  onCloseSelected: () => void;
  onEditChord: () => void;
  onDeleteChord: () => void;
}

const chip = "h-10 min-w-10 px-2 rounded-md text-sm flex items-center justify-center transition-colors";
const on = "bg-primary text-primary-foreground";
const off = "bg-muted text-foreground hover:bg-muted/70";

/** One toolbar for adding and editing Score events. */
export function ScoreEntryToolbar({
  mode, duration, accidental, selected, selectedChord, onMode, onDuration, onAccidental,
  onPatchSelected, onMoveSelected, onPreviewSelected, onDeleteSelected, onCloseSelected, onEditChord, onDeleteChord,
}: Props) {
  if (selectedChord?.id) {
    return (
      <section aria-label={scoreT("score.toolbar")} className="rounded-lg border border-primary/40 p-2 space-y-2">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-sm font-medium text-primary">{scoreT("score.editingChord").replace("{chord}", selectedChord.symbol)}</span>
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={onCloseSelected} aria-label={scoreT("score.done")}><X className="h-4 w-4" /></Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={onEditChord}>{scoreT("score.editChord")}</Button>
          <Button type="button" variant="outline" className="text-destructive ml-auto" onClick={onDeleteChord}><Trash2 className="h-4 w-4 mr-1.5" />{scoreT("score.delete")}</Button>
        </div>
      </section>
    );
  }
  if (selected) {
    const isNote = selected.kind === "note";
    const label = isNote && typeof selected.pitch === "number"
      ? scoreT("score.editingNote").replace("{note}", pitchName(selected.pitch))
      : scoreT("score.editingRest");
    return (
      <section aria-label={scoreT("score.toolbar")} className="rounded-lg border border-primary/40 p-2 space-y-2">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-sm font-medium text-primary">{label}</span>
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={onCloseSelected} aria-label={scoreT("score.done")}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {isNote && (
            <>
              <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => onPatchSelected({ pitch: (selected.pitch ?? 34) + 1 })} aria-label={scoreT("score.pitchUp")}><ChevronUp className="h-5 w-5" /></Button>
              <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => onPatchSelected({ pitch: (selected.pitch ?? 34) - 1 })} aria-label={scoreT("score.pitchDown")}><ChevronDown className="h-5 w-5" /></Button>
            </>
          )}
          <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => onMoveSelected(-1)} aria-label={scoreT("score.moveLeft")}><ChevronLeft className="h-5 w-5" /></Button>
          <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => onMoveSelected(1)} aria-label={scoreT("score.moveRight")}><ChevronRight className="h-5 w-5" /></Button>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
          {DURATIONS.map((d) => (
            <button key={d} type="button" aria-pressed={selected.duration === d} onClick={() => onPatchSelected({ duration: d })} aria-label={scoreT(`score.dur.${d}`)} title={scoreT(`score.dur.${d}`)} className={cn(chip, selected.duration === d ? on : off)}>
              <DurationIcon duration={d} rest={!isNote} />
            </button>
          ))}
          {isNote && (
            <>
              <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
              {(["natural", "sharp", "flat"] as ScoreAccidental[]).map((a) => (
                <button key={a} type="button" aria-pressed={selected.accidental === a} onClick={() => onPatchSelected({ accidental: selected.accidental === a ? undefined : a })} aria-label={scoreT(`score.acc.${a}`)} className={cn(chip, "text-lg", selected.accidental === a ? on : off)}>
                  {ACCIDENTAL_GLYPH[a]}
                </button>
              ))}
            </>
          )}
          {isNote && (
            <Button type="button" variant="outline" className="h-10" onClick={onPreviewSelected} aria-label={scoreT("score.previewSelected")}>
              <Play className="h-4 w-4 mr-1.5" />{scoreT("score.preview")}
            </Button>
          )}
          <Button type="button" variant="outline" className="h-10 text-destructive ml-auto" onClick={onDeleteSelected} aria-label={scoreT("score.delete")}>
            <Trash2 className="h-4 w-4 mr-1.5" />{scoreT("score.delete")}
          </Button>
        </div>
        {isNote && (
          <Input value={selected.lyric || ""} onChange={(event) => onPatchSelected({ lyric: event.target.value.slice(0, 40) || undefined })} placeholder={scoreT("score.lyric")} aria-label={scoreT("score.lyric")} className="h-10" />
        )}
      </section>
    );
  }

  const modes: EntryMode[] = ["note", "rest", "chord"];
  return (
    <section aria-label={scoreT("score.toolbar")} className="rounded-lg border border-border p-2 space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {modes.map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => onMode(m)} className={cn(chip, "px-3", mode === m ? on : off)}>{scoreT(`score.mode.${m}`)}</button>
        ))}
        {mode !== "chord" && (
          <>
            <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
            {DURATIONS.map((d) => (
              <button key={d} type="button" aria-pressed={duration === d} onClick={() => onDuration(d)} aria-label={scoreT(`score.dur.${d}`)} title={scoreT(`score.dur.${d}`)} className={cn(chip, duration === d ? on : off)}>
                <DurationIcon duration={d} rest={mode === "rest"} />
              </button>
            ))}
          </>
        )}
        {mode === "note" && (
          <>
            <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
            {(["natural", "sharp", "flat"] as ScoreAccidental[]).map((a) => (
              <button key={a} type="button" aria-pressed={accidental === a} onClick={() => onAccidental(accidental === a ? null : a)} aria-label={scoreT(`score.acc.${a}`)} title={scoreT(`score.acc.${a}`)} className={cn(chip, "text-lg", accidental === a ? on : off)}>{ACCIDENTAL_GLYPH[a]}</button>
            ))}
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground px-1">{mode === "chord" ? scoreT("score.chordHint") : scoreT("score.entryHint")}</p>
    </section>
  );
}