import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ScoreAccidental, ScoreEvent } from "../types/score.types";
import { DURATIONS, pitchName } from "../utils/notation";
import { ACCIDENTAL_GLYPH, DurationIcon } from "./NotationGlyphs";
import { scoreT } from "../i18n";

interface Props {
  event: ScoreEvent;
  onPatch: (patch: Partial<ScoreEvent>) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onClose: () => void;
}

const btn = "h-10 min-w-10 px-2 rounded-md bg-muted text-foreground flex items-center justify-center hover:bg-muted/70";
const active = "bg-primary text-primary-foreground hover:bg-primary";

/** Tap-friendly controls for the selected note or rest (fixed at the bottom). */
export function ScoreSelectionPanel({ event, onPatch, onMove, onDelete, onClose }: Props) {
  const isNote = event.kind === "note";
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
      <div className="container max-w-4xl mx-auto px-4 py-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {scoreT(isNote ? "score.selected.note" : "score.selected.rest")}
            {isNote && typeof event.pitch === "number" ? ` · ${pitchName(event.pitch)}` : ""}
          </span>
          <button type="button" className={btn} onClick={onClose} aria-label={scoreT("score.done")}><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {isNote && (
            <>
              <button type="button" className={btn} onClick={() => onPatch({ pitch: (event.pitch ?? 34) + 1 })} aria-label={scoreT("score.pitchUp")}><ChevronUp className="h-5 w-5" /></button>
              <button type="button" className={btn} onClick={() => onPatch({ pitch: (event.pitch ?? 34) - 1 })} aria-label={scoreT("score.pitchDown")}><ChevronDown className="h-5 w-5" /></button>
            </>
          )}
          <button type="button" className={btn} onClick={() => onMove(-1)} aria-label={scoreT("score.moveLeft")}><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" className={btn} onClick={() => onMove(1)} aria-label={scoreT("score.moveRight")}><ChevronRight className="h-5 w-5" /></button>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
          {DURATIONS.map((d) => (
            <button
              key={d} type="button" aria-pressed={event.duration === d}
              aria-label={scoreT(`score.dur.${d}`)} title={scoreT(`score.dur.${d}`)}
              className={cn(btn, event.duration === d && active)}
              onClick={() => onPatch({ duration: d })}
            >
              <DurationIcon duration={d} rest={!isNote} />
            </button>
          ))}
          {isNote && (
            <>
              <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
              {(["natural", "sharp", "flat"] as ScoreAccidental[]).map((a) => (
                <button
                  key={a} type="button" aria-pressed={event.accidental === a}
                  aria-label={scoreT(`score.acc.${a}`)}
                  className={cn(btn, "text-lg", event.accidental === a && active)}
                  onClick={() => onPatch({ accidental: event.accidental === a ? undefined : a })}
                >
                  {ACCIDENTAL_GLYPH[a]}
                </button>
              ))}
            </>
          )}
          <button type="button" className={cn(btn, "text-destructive ml-auto")} onClick={onDelete} aria-label={scoreT("score.delete")}>
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
        {isNote && (
          <Input
            value={event.lyric || ""}
            onChange={(e) => onPatch({ lyric: e.target.value.slice(0, 40) || undefined })}
            placeholder={scoreT("score.lyric")}
            aria-label={scoreT("score.lyric")}
            className="h-10"
          />
        )}
      </div>
    </div>
  );
}
