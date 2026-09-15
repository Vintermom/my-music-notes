import { Input } from "@/components/ui/input";
import { pcT } from "../i18n";
import { isValidBpm } from "../utils/bpmFormatter";

interface TempoControlProps {
  value: string;
  onChange: (value: string) => void;
}

// Custom BPM entry — part of the Tempo subcategory.
export function TempoControl({ value, onChange }: TempoControlProps) {
  const invalid = value.trim() !== "" && !isValidBpm(value);

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <span className="text-sm font-medium text-foreground">{pcT("pc.tempo.customLabel")}</span>
      <p className="text-xs text-muted-foreground mt-1">{pcT("pc.tempo.customHint")}</p>
      <Input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
        placeholder={pcT("pc.tempo.customPlaceholder")}
        aria-label={pcT("pc.tempo.customLabel")}
        aria-invalid={invalid}
        className="h-8 text-sm mt-2"
      />
      {invalid && <p className="text-xs text-destructive mt-1">{pcT("pc.tempo.customInvalid")}</p>}
    </div>
  );
}
