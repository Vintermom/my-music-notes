import { useState } from "react";
import { Copy, Eraser, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { scoreT } from "../i18n";

interface Props {
  measure: number | null;
  onClose: () => void;
  onClear: (measure: number) => void;
  onDelete: (measure: number) => void;
  onDuplicate: (measure: number, withLyrics: boolean) => void;
}

export function ScoreMeasureMenu({ measure, onClose, onClear, onDelete, onDuplicate }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const measureNumber = (measure ?? 0) + 1;

  return (
    <>
      <Dialog open={measure !== null && !confirmDelete} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>{scoreT("score.measureMenu").replace("{number}", String(measureNumber))}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Button type="button" variant="outline" className="justify-start" onClick={() => { if (measure !== null) onDuplicate(measure, false); onClose(); }}>
              <Copy className="h-4 w-4" /> {scoreT("score.duplicateMeasure")}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="justify-start text-muted-foreground" onClick={() => { if (measure !== null) onDuplicate(measure, true); onClose(); }}>
              <Copy className="h-4 w-4" /> {scoreT("score.duplicateMeasureLyrics")}
            </Button>
            <Button type="button" variant="outline" className="justify-start" onClick={() => { if (measure !== null) onClear(measure); onClose(); }}>
              <Eraser className="h-4 w-4" /> {scoreT("score.clearMeasure")}
            </Button>
            <Button type="button" variant="outline" className="justify-start text-destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" /> {scoreT("score.deleteMeasure")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={measure !== null && confirmDelete}
        onOpenChange={(open) => { if (!open) { setConfirmDelete(false); onClose(); } }}
        title={scoreT("score.deleteMeasure")}
        description={scoreT("score.deleteMeasureConfirm").replace("{number}", String(measureNumber))}
        confirmLabel={scoreT("score.delete")}
        variant="destructive"
        onConfirm={() => { if (measure !== null) onDelete(measure); setConfirmDelete(false); onClose(); }}
      />
    </>
  );
}