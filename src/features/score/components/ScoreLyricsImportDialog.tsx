import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllNotes } from "@/storage/notesRepo";
import { scoreT } from "../i18n";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (lyrics: string) => void;
}

/** Copies lyrics from an existing Text/Lyrics note; the source note is never linked or changed. */
export function ScoreLyricsImportDialog({ open, onOpenChange, onImport }: Props) {
  const [query, setQuery] = useState("");
  const notes = useMemo(() => getAllNotes().filter((note) => note.noteType !== "score" && note.lyrics.trim()), [open]);
  const visible = notes.filter((note) => `${note.title} ${note.composer} ${note.lyrics}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{scoreT("score.importLyrics")}</DialogTitle></DialogHeader>
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={scoreT("score.searchLyricsNotes")} aria-label={scoreT("score.searchLyricsNotes")} />
        <div className="max-h-[50vh] space-y-1 overflow-y-auto">
          {visible.map((note) => (
            <Button key={note.id} type="button" variant="ghost" className="h-auto w-full justify-start px-2 py-2 text-left" onClick={() => { onImport(note.lyrics); onOpenChange(false); }}>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{note.title || scoreT("score.untitledLyrics")}</span>
                <span className="block truncate text-xs text-muted-foreground">{note.composer || note.lyrics.split("\n").find(Boolean) || ""}</span>
              </span>
            </Button>
          ))}
          {!visible.length && <p className="py-8 text-center text-sm text-muted-foreground">{scoreT("score.noLyricsNotes")}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}