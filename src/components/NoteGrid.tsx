import { Note } from "@/domain/types";
import { NoteCard } from "./NoteCard";
import { t } from "@/i18n";
import { Music } from "lucide-react";

interface NoteGridProps {
  pinnedNotes: Note[];
  otherNotes: Note[];
  onNoteClick: (id: string) => void;
  onPin: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NoteGrid({
  pinnedNotes,
  otherNotes,
  onNoteClick,
  onPin,
  onDuplicate,
  onDelete,
}: NoteGridProps) {
  const hasNotes = pinnedNotes.length > 0 || otherNotes.length > 0;

  if (!hasNotes) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Music className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {t("home.noNotes")}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          {t("home.noNotesDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {t("home.pinnedNotes")}
          </h2>
          <div className="masonry-grid">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => onNoteClick(note.id)}
                onPin={() => onPin(note.id)}
                onDuplicate={() => onDuplicate(note.id)}
                onDelete={() => onDelete(note.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Other Notes Section */}
      {otherNotes.length > 0 && (
        <section>
          {pinnedNotes.length > 0 && (
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {t("home.otherNotes")}
            </h2>
          )}
          <div className="masonry-grid">
            {otherNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => onNoteClick(note.id)}
                onPin={() => onPin(note.id)}
                onDuplicate={() => onDuplicate(note.id)}
                onDelete={() => onDelete(note.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
