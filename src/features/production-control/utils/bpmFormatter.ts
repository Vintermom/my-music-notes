import { BPM_MAX, BPM_MIN } from "../data/tempoOptions";

// Accepts free numeric input and validates a reasonable BPM range.
export function parseBpm(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d{1,3}$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < BPM_MIN || value > BPM_MAX) return null;
  return value;
}

export function isValidBpm(raw: string): boolean {
  return parseBpm(raw) !== null;
}

// Canonical English text inserted into Style, e.g. "72 BPM, steady tempo"
export function formatBpmPrompt(bpm: number): string {
  return `${bpm} BPM, steady tempo`;
}
