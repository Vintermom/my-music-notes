import { useCallback, useEffect, useRef, useState } from "react";
import type { ScoreData } from "../types/score.types";
import { scorePlayer } from "../services/scorePlayer";

/** Playback state for one Score page. Stops on unmount and when another note opens. */
export function useScorePlayback(score: ScoreData | undefined, noteId: string | undefined) {
  const [playing, setPlaying] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const playingRef = useRef(false);
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const stop = useCallback(() => {
    scorePlayer.stop();
    playingRef.current = false;
    setPlaying(false);
    setCurrentId(null);
  }, []);

  const play = useCallback((): boolean => {
    const s = scoreRef.current;
    if (!s) return false;
    const ok = scorePlayer.play(s, {
      onPosition: setCurrentId,
      onEnd: () => { playingRef.current = false; setPlaying(false); setCurrentId(null); },
    });
    playingRef.current = ok;
    setPlaying(ok);
    return ok;
  }, []);

  useEffect(() => () => { scorePlayer.stop(); playingRef.current = false; }, [noteId]);

  useEffect(() => {
    if (score) scorePlayer.setVolume(score.volume);
  }, [score?.volume]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tempo changes restart playback so the new BPM is heard right away.
  useEffect(() => {
    if (playingRef.current) play();
  }, [score?.tempo]); // eslint-disable-line react-hooks/exhaustive-deps

  return { playing, currentId, play, stop };
}
