export type PromptCategory = "Pop" | "Emotional" | "Dance / EDM" | "Chill / Indie" | "Rock / Metal" | "R&B" | "Hip-Hop / Rap" | "Folk";

export interface PromptPreset {
  id: string;
  name: string;
  category: PromptCategory;
  bpm: number;
  meta: string;
  prompt: string;
}
