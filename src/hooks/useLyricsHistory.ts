import { useState, useCallback, useRef, useEffect } from "react";

const MAX_HISTORY = 50;

export function useLyricsHistory(initialValue: string = "") {
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoing = useRef(false);

  const currentValue = history[historyIndex] ?? initialValue;

  const pushToHistory = useCallback((value: string) => {
    if (isUndoing.current) {
      isUndoing.current = false;
      return;
    }

    setHistory((prev) => {
      // Remove any forward history when new change comes
      const newHistory = prev.slice(0, historyIndex + 1);
      
      // Don't add duplicate
      if (newHistory[newHistory.length - 1] === value) {
        return prev;
      }

      newHistory.push(value);

      // Keep only last MAX_HISTORY entries
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }

      return newHistory;
    });

    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const undo = useCallback((): string | null => {
    if (historyIndex <= 0) return null;

    isUndoing.current = true;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    return history[newIndex] ?? null;
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;

  const reset = useCallback((value: string) => {
    setHistory([value]);
    setHistoryIndex(0);
  }, []);

  return {
    currentValue,
    pushToHistory,
    undo,
    canUndo,
    reset,
  };
}
