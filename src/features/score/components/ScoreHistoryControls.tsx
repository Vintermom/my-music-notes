import { useEffect } from "react";
import { Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scoreT } from "../i18n";

interface Props {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (
    target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT"
  );
}

export function ScoreHistoryControls({ canUndo, canRedo, onUndo, onRedo }: Props) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      if (event.shiftKey) onRedo(); else onUndo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRedo, onUndo]);

  return (
    <div className="flex items-center gap-1" aria-label={scoreT("score.history")}>
      <Button type="button" variant="outline" size="icon" disabled={!canUndo} onClick={onUndo} aria-label={scoreT("score.undo")} title={scoreT("score.undo")}>
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="outline" size="icon" disabled={!canRedo} onClick={onRedo} aria-label={scoreT("score.redo")} title={scoreT("score.redo")}>
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}