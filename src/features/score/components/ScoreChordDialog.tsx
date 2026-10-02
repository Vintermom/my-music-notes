import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChordTarget } from "./ScoreEditor";
import { scoreT } from "../i18n";

interface Props {
  target: ChordTarget | null;
  onSave: (symbol: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

/** Add, edit or delete one chord symbol. */
export function ScoreChordDialog({ target, onSave, onDelete, onClose }: Props) {
  const [value, setValue] = useState("");
  useEffect(() => setValue(target?.symbol || ""), [target]);

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{scoreT("score.chord")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSave(value); }}>
          <Input
            autoFocus
            value={value}
            maxLength={16}
            onChange={(e) => setValue(e.target.value)}
            placeholder={scoreT("score.chordPlaceholder")}
            aria-label={scoreT("score.chord")}
          />
          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            {target?.id && (
              <Button type="button" variant="outline" className="text-destructive" onClick={onDelete}>{scoreT("score.delete")}</Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>{scoreT("score.cancel")}</Button>
            <Button type="submit">{scoreT("score.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
