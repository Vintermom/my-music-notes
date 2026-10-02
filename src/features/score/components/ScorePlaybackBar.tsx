import { Play, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { scoreT } from "../i18n";

interface Props {
  playing: boolean;
  tempo: number;
  volume: number;
  onPlay: () => void;
  onStop: () => void;
  onVolume: (v: number) => void;
}

export function ScorePlaybackBar({ playing, tempo, volume, onPlay, onStop, onVolume }: Props) {
  return (
    <section className="rounded-lg border border-border p-2 flex flex-wrap items-center gap-3">
      <Button
        type="button"
        size="sm"
        className="h-10 px-4"
        onClick={playing ? onStop : onPlay}
        aria-label={playing ? scoreT("score.stop") : scoreT("score.play")}
      >
        {playing ? <Square className="h-4 w-4 mr-1.5" /> : <Play className="h-4 w-4 mr-1.5" />}
        {playing ? scoreT("score.stop") : scoreT("score.play")}
      </Button>
      <span className="text-sm text-muted-foreground tabular-nums">{tempo} {scoreT("score.bpm")}</span>
      <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-xs">
        <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
        <Slider
          value={[Math.round(volume * 100)]}
          min={0}
          max={100}
          step={5}
          onValueChange={([v]) => onVolume(v / 100)}
          aria-label={scoreT("score.volume")}
        />
      </div>
    </section>
  );
}
