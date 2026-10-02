import { useCallback, useEffect, useRef, useState } from "react";
import type { ScoreData } from "../types/score.types";

type EditableScore = Pick<ScoreData, "clef" | "timeSignature" | "keySignature" | "tempo" | "measures" | "chords" | "lyrics">;

const HISTORY_LIMIT = 100;

function snapshot(score: ScoreData): EditableScore {
  return {
    clef: score.clef,
    timeSignature: score.timeSignature,
    keySignature: score.keySignature,
    tempo: score.tempo,
    measures: score.measures.map((measure) => ({
      ...measure,
      events: measure.events.map((event) => ({ ...event })),
    })),
    chords: score.chords.map((chord) => ({ ...chord })),
    lyrics: score.lyrics,
  };
}

/** Score-only history. Playback volume and linked recordings are intentionally outside edit history. */
export function useScoreHistory(
  noteId: string | undefined,
  score: ScoreData | undefined,
  apply: (patch: Partial<ScoreData>) => void,
) {
  const undoStack = useRef<EditableScore[]>([]);
  const redoStack = useRef<EditableScore[]>([]);
  const current = useRef<ScoreData | undefined>(score);
  const [revision, setRevision] = useState(0);

  useEffect(() => { current.current = score; }, [score]);
  useEffect(() => {
    undoStack.current = [];
    redoStack.current = [];
    setRevision((value) => value + 1);
  }, [noteId]);

  const commit = useCallback((patch: Partial<EditableScore>) => {
    const active = current.current;
    if (!active) return;
    undoStack.current = [...undoStack.current.slice(-(HISTORY_LIMIT - 1)), snapshot(active)];
    redoStack.current = [];
    current.current = { ...active, ...patch };
    apply(patch);
    setRevision((value) => value + 1);
  }, [apply]);

  const undo = useCallback(() => {
    const active = current.current;
    const previous = undoStack.current.pop();
    if (!active || !previous) return;
    redoStack.current.push(snapshot(active));
    current.current = { ...active, ...previous };
    apply(previous);
    setRevision((value) => value + 1);
  }, [apply]);

  const redo = useCallback(() => {
    const active = current.current;
    const next = redoStack.current.pop();
    if (!active || !next) return;
    undoStack.current.push(snapshot(active));
    current.current = { ...active, ...next };
    apply(next);
    setRevision((value) => value + 1);
  }, [apply]);

  return {
    commit,
    undo,
    redo,
    canUndo: revision >= 0 && undoStack.current.length > 0,
    canRedo: revision >= 0 && redoStack.current.length > 0,
  };
}