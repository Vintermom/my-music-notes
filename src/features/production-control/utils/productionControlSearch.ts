import type { ProductionPreset } from "../types/productionControl.types";
import { productionControlEn } from "../i18n/productionControl.en";
import { productionControlTh } from "../i18n/productionControl.th";
import { productionControlSv } from "../i18n/productionControl.sv";

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

// Searchable strings for one preset: canonical English prompt plus the label and
// hint in every supported Production Control language (EN/TH/SV), so a Thai or
// Swedish query can find an option whose inserted prompt stays English.
function searchableText(preset: ProductionPreset): string[] {
  const parts: string[] = [preset.prompt];
  for (const dict of [productionControlEn, productionControlTh, productionControlSv]) {
    if (dict[preset.labelKey]) parts.push(dict[preset.labelKey]);
    if (dict[preset.hintKey]) parts.push(dict[preset.hintKey]);
  }
  return parts.map(normalize);
}

// Mirrors the Voice search behavior: empty query matches everything; filtering
// only changes visibility — it never touches the user's current selections.
export function matchesProductionQuery(preset: ProductionPreset, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  return searchableText(preset).some((text) => text.includes(q));
}
