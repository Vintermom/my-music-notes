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
  const noteRef = useRef<Note | null | undefined>(undefined);

  useEffect(() => {
    const found = id ? getNoteById(id) : undefined;
    const loaded = found ? { ...found, score: sanitizeScoreData(found.score) } : null;
    noteRef.current = loaded;
    setNote(loaded);
  }, [id]);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (id && pending.current) {
      const saved = updateNote(id, pending.current);
      if (saved) {
        noteRef.current = { ...saved, score: sanitizeScoreData(saved.score) };
        setNote(noteRef.current);
      }
      pending.current = null;
    }
  }, [id]);

  useEffect(() => () => flush(), [flush]);

  const queue = useCallback((updates: Partial<Note>) => {
    pending.current = { ...(pending.current || {}), ...updates };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 500);
  }, [flush]);

  const flushNow = useCallback((): Note | null => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (id && pending.current) {
      const saved = updateNote(id, pending.current);
      pending.current = null;
      if (saved) {
        noteRef.current = { ...saved, score: sanitizeScoreData(saved.score) };
        setNote(noteRef.current);
      }
    }
    return noteRef.current || null;
  }, [id]);

  const setTitle = useCallback((title: string) => {
    setNote((n) => {
      if (!n || n.title === title) return n;
      const updatedAt = Date.now();
      queue({ title });
      noteRef.current = { ...n, title, updatedAt };
      return noteRef.current;
    });
  }, [queue]);

  const setMetadata = useCallback((updates: Partial<Pick<Note, "composer" | "style" | "tags" | "color" | "isPinned">>) => {
    setNote((n) => {
      if (!n) return n;
      const changed = Object.entries(updates).some(([key, value]) => n[key as keyof Note] !== value);
      if (!changed) return n;
      const updatedAt = Date.now();
      queue(updates);
      noteRef.current = { ...n, ...updates, updatedAt };
      return noteRef.current;
    });
  }, [queue]);

  const setScore = useCallback((patch: Partial<ScoreData>) => {
    setNote((n) => {
      if (!n) return n;
      const changed = Object.entries(patch).some(([key, value]) => n.score?.[key as keyof ScoreData] !== value);
      if (!changed) return n;
      const score = sanitizeScoreData({ ...n.score, ...patch });
      queue({ score, noteType: "score" });
      noteRef.current = { ...n, score, updatedAt: Date.now() };
      return noteRef.current;
    });
  }, [queue]);

  return { note, setTitle, setMetadata, setScore, flush, flushNow };
}
