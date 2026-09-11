import type { VoiceCategoryFilter } from "@/types/voiceOption";

// Functional (non-genre) Voice categories. Order defines chip order in the Voice modal.
// Environment lives in its own control (EnvironmentSheet), not in Voice.
export const voiceCategories: VoiceCategoryFilter[] = [
  "All",
  "Tone / Body",
  "Power / Presence",
  "Texture",
  "Technique",
  "Expression / Delivery",
  "Attack / Articulation",
  "Extreme Voice",
  "Production / Mix",
];
