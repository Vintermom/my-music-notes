import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Note } from "@/domain/types";
import { getAllNotes, getNoteById } from "@/storage/notesRepo";

/** Record notes that have at least one saved take (read-only list). */
export function listRecordNotes(): Note[] {
  return getAllNotes().filter((n) => n.noteType !== "score" && n.hasAudio && (n.takes?.length || 0) > 0);
}

function activeTakeUrl(note: Note | undefined): string | null {
  if (!note?.takes?.length) return null;
  const take = note.takes.find((t) => t.id === note.activeTakeId) || note.takes[note.takes.length - 1];
  return take?.blob || null;
}

/**
 * Plays the linked Record note's recording by reference only.
 * The Record note is read, never written. Stops on unmount.
 */
export function useLinkedRecording(recordId: string | undefined, onStart: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const record = useMemo(() => (recordId ? getNoteById(recordId) : undefined), [recordId]);
  const url = activeTakeUrl(record);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!url) { audioRef.current = null; return; }
    const audio = new Audio(url);
    audio.onended = () => setPlaying(false);
    audio.onpause = () => setPlaying(false);
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; audioRef.current = null; setPlaying(false); };
  }, [url]);

  const play = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    onStart();
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [onStart]);

  return { record, available: !!url, playing, play, pause };
}
