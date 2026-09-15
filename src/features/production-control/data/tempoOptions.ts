import type { ProductionPreset } from "../types/productionControl.types";
import { tempoPrompts } from "../prompts/tempoPrompts";

// Tempo stays a subcategory of Production Control.
export const tempoPresets: ProductionPreset[] = [
  {
    id: "tempoSlow",
    category: "tempo",
    labelKey: "pc.option.tempoSlow.label",
    hintKey: "pc.option.tempoSlow.hint",
    prompt: tempoPrompts.slow,
  },
  {
    id: "tempoMedium",
    category: "tempo",
    labelKey: "pc.option.tempoMedium.label",
    hintKey: "pc.option.tempoMedium.hint",
    prompt: tempoPrompts.medium,
  },
  {
    id: "tempoFast",
    category: "tempo",
    labelKey: "pc.option.tempoFast.label",
    hintKey: "pc.option.tempoFast.hint",
    prompt: tempoPrompts.fast,
  },
  {
    id: "tempoVeryFast",
    category: "tempo",
    labelKey: "pc.option.tempoVeryFast.label",
    hintKey: "pc.option.tempoVeryFast.hint",
    prompt: tempoPrompts.veryFast,
  },
  {
    id: "stableTempo",
    category: "tempo",
    labelKey: "pc.option.stableTempo.label",
    hintKey: "pc.option.stableTempo.hint",
    prompt: tempoPrompts.stableTempo,
  },
];

export const BPM_MIN = 30;
export const BPM_MAX = 300;
