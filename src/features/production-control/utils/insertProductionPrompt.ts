import type { ProductionPreset } from "../types/productionControl.types";

// Build one plain-text, comma-separated fragment from the current selection.
// Canonical prompts stay English. Duplicate segments are dropped so repeated
// selection can never insert the same preset text twice.
export function buildProductionPrompt(presets: ProductionPreset[], customBpmPrompt = ""): string {
  const raw = [...presets.map((p) => p.prompt)];
  if (customBpmPrompt) raw.push(customBpmPrompt);

  const seen = new Set<string>();
  const segments: string[] = [];
  for (const entry of raw) {
    for (const part of entry.split(",")) {
      const seg = part.trim().replace(/\.$/, "").trim();
      if (!seg) continue;
      const key = seg.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      segments.push(seg);
    }
  }
  return segments.join(", ");
}
