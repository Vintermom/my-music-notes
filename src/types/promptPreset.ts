export type PromptCategory = "Viral" | "Popular";

export interface PromptPreset {
  id: string;
  name: string;
  category: PromptCategory;
  bpm: number;
  meta: string;
  prompt: string;
}
