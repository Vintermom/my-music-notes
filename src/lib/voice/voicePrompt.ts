import type { EnvironmentOption, QuickVoiceControl, VoiceOption } from "@/types/voiceOption";

// Build the plain-text prompt fragment from the current selection (English output).
// Quick Voice Controls come first, then individual Voice options, then Environment.
export function buildVoicePrompt(
  selected: VoiceOption[],
  environment: EnvironmentOption | null,
  quick: QuickVoiceControl[] = [],
  extra = ""
): string {
  const raw = [...quick.map((q) => q.prompt), ...selected.map((o) => o.prompt)];
  if (environment) raw.push(environment.prompt);
  if (extra) raw.push(extra);

  // Split combined prompts on commas, trim, and drop duplicates.
  const seen = new Set<string>();
  const segments: string[] = [];
  for (const entry of raw) {
    for (const part of entry.split(",")) {
      const seg = part.trim();
      if (!seg) continue;
      const key = seg.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      segments.push(seg);
    }
  }
  return segments.join(", ");
}

// Merge the Voice prompt into the existing Style text WITHOUT replacing anything the user wrote.
// - Existing text is preserved verbatim.
// - New segments are appended, comma-separated.
// - Segments already present (case-insensitive) are skipped to avoid duplicates.
export function mergeIntoStyle(existing: string, insert: string): string {
  const base = existing ?? "";
  const existingSegments = base.split(/[,\n]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const newSegments = insert
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && !existingSegments.includes(s.toLowerCase()));
  if (newSegments.length === 0) return base;

  const addition = newSegments.join(", ");
  if (base.trim() === "") return addition;

  const trimmedEnd = base.replace(/\s+$/, "");
  if (/[,\n]$/.test(trimmedEnd)) return `${trimmedEnd} ${addition}`;
  return `${trimmedEnd}, ${addition}`;
}
