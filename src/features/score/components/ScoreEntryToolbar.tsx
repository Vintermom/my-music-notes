import { Redo2, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScoreAccidental, ScoreDuration } from "../types/score.types";
import { DURATIONS } from "../utils/notation";
import { ACCIDENTAL_GLYPH, DurationIcon } from "./NotationGlyphs";
import type { EntryMode } from "./ScoreEditor";
import { scoreT } from "../i18n";

interface Props {
  mode: EntryMode;
  duration: ScoreDuration;
  accidental: ScoreAccidental | null;
  onMode: (m: EntryMode) => void;
  onDuration: (d: ScoreDuration) => void;
  onAccidental: (a: ScoreAccidental | null) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearScore: () => void;
  dotted: boolean;
  onDotted: (dotted: boolean) => void;
}

const chip = "h-10 min-w-10 px-2 rounded-md text-sm flex items-center justify-center transition-colors";
const on = "bg-primary text-primary-foreground";
const off = "bg-muted text-foreground hover:bg-muted/70";

/** Score toolbar for adding new events and shared history actions. */
export function ScoreEntryToolbar({
  mode, duration, accidental, onMode, onDuration, onAccidental,
  canUndo, canRedo, onUndo, onRedo, onClearScore, dotted, onDotted,
}: Props) {
  const dotChip = (active: boolean, onClick: () => void) => (
    <button type="button" aria-pressed={active} onClick={onClick} aria-label={scoreT("score.dotted")} title={scoreT("score.dotted")} className={cn(chip, "text-xl font-bold", active ? on : off)}>•</button>
  );
  const sharedActions = (
    <div className="flex items-center gap-1">
      <Button type="button" variant="ghost" size="icon" className="h-9 w-9" disabled={!canUndo} onClick={onUndo} aria-label={scoreT("score.undo")} title={scoreT("score.undo")}><Undo2 className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" className="h-9 w-9" disabled={!canRedo} onClick={onRedo} aria-label={scoreT("score.redo")} title={scoreT("score.redo")}><Redo2 className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={onClearScore} aria-label={scoreT("score.clearScore")} title={scoreT("score.clearScore")}><Trash2 className="h-4 w-4" /></Button>
    </div>
  );
  const modes: EntryMode[] = ["note", "rest", "chord"];
  return (
    <section aria-label={scoreT("score.toolbar")} className="rounded-lg border border-border p-2 space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {sharedActions}
        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
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
            {dotChip(dotted, () => onDotted(!dotted))}
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