import { useMemo } from "react";
import { Link2, Link2Off, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scoreT } from "../i18n";
import { listRecordNotes } from "../hooks/useLinkedRecording";
import type { Note } from "@/domain/types";

interface Props {
  linkedId?: string;
  record: Note | undefined;
  available: boolean;
  playing: boolean;
  onLink: (id: string) => void;
  onUnlink: () => void;
  onPlay: () => void;
  onPause: () => void;
}

const selectClass = "h-10 w-full sm:w-auto sm:min-w-[220px] rounded-md bg-muted px-2 text-sm text-foreground border-none focus:outline-none focus:ring-1 focus:ring-ring";

/** Small control to reference an existing Record note and listen to it. */
export function ScoreLinkedRecording({ linkedId, record, available, playing, onLink, onUnlink, onPlay, onPause }: Props) {
  const options = useMemo(() => listRecordNotes(), []);

  return (
    <section className="rounded-lg border border-border p-2 flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground px-1">
        <Link2 className="h-4 w-4" aria-hidden="true" />
        {scoreT("score.linked")}
      </span>
      {linkedId ? (
        <>
          <span className="text-sm font-medium text-foreground truncate max-w-[50vw]">
            {record ? record.title || scoreT("score.linkedUntitled") : scoreT("score.linkedMissing")}
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              type="button" size="sm" variant="outline" className="h-10"
              disabled={!available}
              onClick={playing ? onPause : onPlay}
              aria-label={playing ? scoreT("score.linkedPause") : scoreT("score.linkedPlay")}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-10" onClick={onUnlink} aria-label={scoreT("score.unlink")}>
              <Link2Off className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : options.length ? (
        <select
          className={selectClass}
          value=""
          onChange={(e) => e.target.value && onLink(e.target.value)}
          aria-label={scoreT("score.linkChoose")}
        >
          <option value="">{scoreT("score.linkChoose")}</option>
          {options.map((n) => (
            <option key={n.id} value={n.id}>{n.title || scoreT("score.linkedUntitled")}</option>
          ))}
        </select>
      ) : (
        <span className="text-xs text-muted-foreground">{scoreT("score.linkNone")}</span>
      )}
    </section>
  );
}
