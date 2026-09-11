import type { EnvironmentOption } from "@/types/voiceOption";
import { instrumentGroups } from "@/data/style";
import type { StyleChip } from "@/data/style";

// Outdoor Café — separate, independently maintainable Environment module.
// Intentionally avoids the words "live", "stage", "venue" and "performance".
export const OUTDOOR_CAFE_ID = "outdoor-cafe";

export const outdoorCafeEnvironment: EnvironmentOption = {
  id: OUTDOOR_CAFE_ID,
  label: "Outdoor Café",
  prompt:
    "intimate outdoor café ambience, quiet open-air acoustics, restrained arrangement, controlled dynamics, subtle natural reflections, no crowd or concert-scale ambience",
  hint: {
    en: "A small, quiet outdoor café setting with controlled dynamics and a restrained arrangement, without a concert-like atmosphere.",
    th: "บรรยากาศร้านกาแฟกลางแจ้งขนาดเล็ก เงียบและเป็นกันเอง ใช้การเรียบเรียงและไดนามิกที่ควบคุม ไม่ให้มีฟีลแบบคอนเสิร์ต",
    sv: "En liten och lugn utomhuscafémiljö med kontrollerad dynamik och återhållsamt arrangemang, utan konsertkänsla.",
  },
  searchKeywords: {
    en: ["cafe", "café", "coffee", "outdoor cafe", "acoustic set"],
    th: ["ร้านกาแฟ", "คาเฟ่", "กลางแจ้ง"],
    sv: ["café", "kafé", "utomhuscafé", "kaffe"],
  },
};

// Suggested instrument IDs — reuse existing Style instrument IDs where they exist.
export const outdoorCafeInstrumentIds = [
  "acoustic-guitar",
  "keyboard",
  "electric-piano",
  "ukulele",
  "cajon",
  "hand-percussion",
  "shaker",
];

// Only the few instruments that do not exist in the Style instrument data.
const extraInstruments: StyleChip[] = [
  { id: "hand-percussion", label: "Hand Percussion" },
  { id: "shaker", label: "Shaker" },
];

const allStyleInstruments: StyleChip[] = instrumentGroups.flatMap((g) => g.instruments);

export const outdoorCafeInstruments: StyleChip[] = outdoorCafeInstrumentIds
  .map(
    (id) =>
      allStyleInstruments.find((i) => i.id === id) ?? extraInstruments.find((i) => i.id === id)
  )
  .filter((i): i is StyleChip => !!i);

function promptName(label: string): string {
  return label.toLowerCase();
}

// Build the accompaniment restriction for the selected suggested instruments.
// Returns "" when nothing is selected (only the base environment prompt is used).
export function buildOutdoorCafeAccompaniment(selectedIds: string[]): string {
  const names = outdoorCafeInstruments
    .filter((i) => selectedIds.includes(i.id))
    .map((i) => promptName(i.label));
  if (names.length === 0) return "";
  if (names.length === 1) {
    return `${names[0].replace(/\s+/g, "-")}-only accompaniment, no additional instrumentation`;
  }
  const list =
    names.length === 2
      ? `${names[0]} and ${names[1]}`
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `${list} as the only accompaniment, no additional instrumentation`;
}

// Localized header for the optional instrument subsection.
const suggestedInstrumentsLabels: Record<string, string> = {
  en: "Suggested Outdoor Instruments",
  th: "เครื่องดนตรีที่แนะนำสำหรับกลางแจ้ง",
  sv: "Föreslagna utomhusinstrument",
};

export function getOutdoorCafeInstrumentsLabel(lang: string): string {
  return suggestedInstrumentsLabels[lang] || suggestedInstrumentsLabels.en;
}
