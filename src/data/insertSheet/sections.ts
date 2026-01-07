export interface InsertItem {
  id: string;
  label: string;
  insertText: string;
}

export const songSections: InsertItem[] = [
  { id: "intro", label: "Intro", insertText: "[Intro]" },
  { id: "verse", label: "Verse", insertText: "[Verse]" },
  { id: "pre-chorus", label: "Pre-Chorus", insertText: "[Pre-Chorus]" },
  { id: "chorus", label: "Chorus", insertText: "[Chorus]" },
  { id: "bridge", label: "Bridge", insertText: "[Bridge]" },
  { id: "outro", label: "Outro", insertText: "[Outro]" },
  { id: "rap", label: "Rap", insertText: "[Rap]" },
  { id: "instrumental", label: "Instrumental", insertText: "[Instrumental]" },
  { id: "solo", label: "Solo", insertText: "[Solo]" },
];
