import type { EnvironmentOption, VoiceOption } from "@/types/voiceOption";

// Build the plain-text prompt fragment from the current selection (English output).
export function buildVoicePrompt(selected: VoiceOption[], environment: EnvironmentOption | null): string {
  const parts = selected.map((o) => o.prompt.trim()).filter(Boolean);
  if (environment) parts.push(environment.prompt.trim());
  return parts.join(", ");
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
