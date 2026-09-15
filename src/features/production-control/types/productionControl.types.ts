// Production Control types — data-driven presets inserted into the Style field.

// Existing categories. New categories can be added here later (Instruments, Stereo,
// Dynamics, Arrangement, Ending, ...) without touching the Production Control UI.
export type ProductionCategoryId =
  | "mixSeparation"
  | "percussionArtifacts"
  | "frequencyBalance"
  | "vocalPlacement"
  | "tempo";

// Category shortcut/filter row value: "all" shows every category.
export type ProductionCategoryFilter = "all" | ProductionCategoryId;

export interface ProductionCategory {
  id: ProductionCategoryId;
  labelKey: string;
  // Optional dedicated UI (e.g. Tempo renders the BPM control in addition to its presets)
  kind?: "presets" | "tempo";
}

export interface ProductionPreset {
  id: string;
  category: ProductionCategoryId;
  labelKey: string;
  hintKey: string;
  prompt: string; // canonical English text inserted into Style — never translated
}

// Localized strings for one language: flat key -> text
export type ProductionControlStrings = Record<string, string>;
