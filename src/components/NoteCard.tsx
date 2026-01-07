import { Note, NoteColor } from "@/domain/types";
import { t } from "@/i18n";
import { Pin, Copy, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onPin: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const colorClasses: Record<NoteColor, string> = {
  default: "note-bg-default",
  cream: "note-bg-cream",
  pink: "note-bg-pink",
  blue: "note-bg-blue",
  green: "note-bg-green",
  yellow: "note-bg-yellow",
  purple: "note-bg-purple",
  orange: "note-bg-orange",
};

export function NoteCard({ note, onClick, onPin, onDuplicate, onDelete }: NoteCardProps) {
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={onClick}
      className={`masonry-item note-card cursor-pointer group ${colorClasses[note.color]}`}
    >
      <div className="p-4">
        {/* Title */}
        {note.title && (
          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
            {note.title}
          </h3>
        )}

        {/* Composer */}
        {note.composer && (
          <p className="text-sm text-muted-foreground mb-2">
            {note.composer}
          </p>
        )}

        {/* Lyrics preview */}
        {note.lyrics && (
          <p className="text-sm text-foreground/80 mb-3 line-clamp-4 whitespace-pre-wrap">
            {note.lyrics}
          </p>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions - visible on hover */}
        <div
          className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleMenuClick}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-background/50"
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
          >
            <Pin
              className={`h-4 w-4 ${note.isPinned ? "fill-primary text-primary" : ""}`}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-background/50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                {t("card.duplicate")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("card.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Pin indicator */}
        {note.isPinned && (
          <div className="absolute top-2 right-2">
            <Pin className="h-3.5 w-3.5 fill-primary text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
