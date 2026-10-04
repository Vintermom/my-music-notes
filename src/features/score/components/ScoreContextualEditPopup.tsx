import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Play, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScoreAccidental, ScoreEvent } from "../types/score.types";
import { DURATIONS, pitchName } from "../utils/notation";
import { scoreT } from "../i18n";
import { ACCIDENTAL_GLYPH, DurationIcon } from "./NotationGlyphs";
import type { ChordTarget, ScoreEditAnchor } from "./ScoreEditor";

interface Props {
  anchor: ScoreEditAnchor | null;
  selected: ScoreEvent | null;
  selectedChord: ChordTarget | null;
  onPatchSelected: (patch: Partial<ScoreEvent>) => void;
  onMoveSelected: (direction: -1 | 1) => void;
  onPreviewSelected: () => void;
  onDeleteSelected: () => void;
  onToggleTie: () => void;
  onEditChord: () => void;
  onDeleteChord: () => void;
  onClose: () => void;
}

const chip = "h-10 min-w-10 px-2 rounded-md text-sm flex items-center justify-center transition-colors";
const on = "bg-primary text-primary-foreground";
const off = "bg-muted text-foreground hover:bg-muted/70";

/** Shared note, rest, and chord editor positioned beside the selected staff item. */
export function ScoreContextualEditPopup({
  anchor, selected, selectedChord, onPatchSelected, onMoveSelected, onPreviewSelected,
  onDeleteSelected, onToggleTie, onEditChord, onDeleteChord, onClose,
}: Props) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 8, top: 8, ready: false });
  const open = !!anchor && (!!selected || !!selectedChord?.id);

  useLayoutEffect(() => {
    const popup = popupRef.current;
    if (!open || !anchor || !popup) return;
    const margin = 8;
    const gap = 12;
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const left = Math.max(margin, Math.min(window.innerWidth - popupWidth - margin, anchor.left + anchor.width / 2 - popupWidth / 2));
    const fitsAbove = anchor.top - popupHeight - gap >= margin;
    const preferredTop = fitsAbove ? anchor.top - popupHeight - gap : anchor.bottom + gap;
    const top = Math.max(margin, Math.min(window.innerHeight - popupHeight - margin, preferredTop));
    setPosition({ left, top, ready: true });
  }, [anchor, open, selected, selectedChord]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || popupRef.current?.contains(target)) return;
      if (target.closest("[data-score-inline-lyric]")) return;
      const eventElement = target.closest("[data-score-event]");
      if (selected && eventElement?.getAttribute("data-score-event") === selected.id) return;
      const chordElement = target.closest("[data-score-chord]");
      if (selectedChord?.id && chordElement?.getAttribute("data-score-chord") === selectedChord.id) return;
      onClose();
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [onClose, open, selected, selectedChord]);

  if (!open || typeof document === "undefined") return null;
  const isNote = selected?.kind === "note";
  const label = selected
    ? isNote && typeof selected.pitch === "number"
      ? scoreT("score.editingNote").replace("{note}", pitchName(selected.pitch))
      : scoreT("score.editingRest")
    : scoreT("score.editingChord").replace("{chord}", selectedChord?.symbol || "");

  return createPortal(
    <div
      ref={popupRef}
      role="dialog"
      aria-label={label}
      data-score-edit-popup
      className="fixed z-50 w-[min(34rem,calc(100vw-1rem))] max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-lg border border-primary/40 bg-background p-2 shadow-lg"
      style={{ left: position.left, top: position.top, visibility: position.ready ? "visible" : "hidden" }}
    >
      <div className="mb-2 flex min-h-9 items-center justify-between gap-2 px-1">
        <span className="text-sm font-medium text-primary">{label}</span>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onClose} aria-label={scoreT("score.done")}><X className="h-4 w-4" /></Button>
      </div>
      {selectedChord?.id ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={onEditChord}>{scoreT("score.editChord")}</Button>
          <Button type="button" variant="outline" className="ml-auto text-destructive" onClick={onDeleteChord}><Trash2 className="mr-1.5 h-4 w-4" />{scoreT("score.delete")}</Button>
        </div>
      ) : selected ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {isNote && <>
            <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => onPatchSelected({ pitch: (selected.pitch ?? 34) + 1 })} aria-label={scoreT("score.pitchUp")}><ChevronUp className="h-5 w-5" /></Button>
            <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => onPatchSelected({ pitch: (selected.pitch ?? 34) - 1 })} aria-label={scoreT("score.pitchDown")}><ChevronDown className="h-5 w-5" /></Button>
          </>}
          <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => onMoveSelected(-1)} aria-label={scoreT("score.moveLeft")}><ChevronLeft className="h-5 w-5" /></Button>
          <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => onMoveSelected(1)} aria-label={scoreT("score.moveRight")}><ChevronRight className="h-5 w-5" /></Button>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
          {DURATIONS.map((value) => <button key={value} type="button" aria-pressed={selected.duration === value} onClick={() => onPatchSelected({ duration: value })} aria-label={scoreT(`score.dur.${value}`)} title={scoreT(`score.dur.${value}`)} className={cn(chip, selected.duration === value ? on : off)}><DurationIcon duration={value} rest={!isNote} /></button>)}
          <button type="button" aria-pressed={!!selected.dotted} onClick={() => onPatchSelected({ dotted: !selected.dotted })} aria-label={scoreT("score.dotted")} title={scoreT("score.dotted")} className={cn(chip, "text-xl font-bold", selected.dotted ? on : off)}>•</button>
          {isNote && <>
            <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
            {(["natural", "sharp", "flat"] as ScoreAccidental[]).map((value) => <button key={value} type="button" aria-pressed={selected.accidental === value} onClick={() => onPatchSelected({ accidental: selected.accidental === value ? undefined : value })} aria-label={scoreT(`score.acc.${value}`)} className={cn(chip, "text-lg", selected.accidental === value ? on : off)}>{ACCIDENTAL_GLYPH[value]}</button>)}
            <Button type="button" variant={selected.tie ? "default" : "outline"} className="h-10" aria-pressed={!!selected.tie} onClick={onToggleTie} title={scoreT("score.tieHint")}>{selected.tie ? scoreT("score.removeTie") : scoreT("score.tie")}</Button>
            <Button type="button" variant="outline" className="h-10" onClick={onPreviewSelected} aria-label={scoreT("score.previewSelected")}><Play className="mr-1.5 h-4 w-4" />{scoreT("score.preview")}</Button>
          </>}
          <Button type="button" variant="outline" className="ml-auto h-10 text-destructive" onClick={onDeleteSelected} aria-label={scoreT("score.delete")}><Trash2 className="mr-1.5 h-4 w-4" />{scoreT("score.delete")}</Button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}