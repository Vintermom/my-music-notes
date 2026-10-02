import { useCallback, useEffect, useRef, useState } from "react";
import type { Note } from "@/domain/types";
import { getNoteById, updateNote } from "@/storage/notesRepo";
import type { ScoreData } from "../types/score.types";
import { sanitizeScoreData } from "../utils/scoreData";

/** Loads one Score note and saves edits (debounced) through the existing notes storage. */
export function useScoreNote(id: string | undefined) {
  const [note, setNote] = useState<Note | null | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Partial<Note> | null>(null);

  useEffect(() => {
    const found = id ? getNoteById(id) : undefined;
    setNote(found ? { ...found, score: sanitizeScoreData(found.score) } : null);
  }, [id]);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (id && pending.current) {
      updateNote(id, pending.current);
      pending.current = null;
    }
  }, [id]);

  useEffect(() => () => flush(), [flush]);

  const queue = useCallback((updates: Partial<Note>) => {
    pending.current = { ...(pending.current || {}), ...updates };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 500);
  }, [flush]);

  const setTitle = useCallback((title: string) => {
    setNote((n) => (n ? { ...n, title } : n));
    queue({ title });
  }, [queue]);

  const setScore = useCallback((patch: Partial<ScoreData>) => {
    setNote((n) => {
      if (!n) return n;
      const score = sanitizeScoreData({ ...n.score, ...patch });
      queue({ score, noteType: "score" });
      return { ...n, score };
    });
  }, [queue]);

  return { note, setTitle, setScore, flush };
}
