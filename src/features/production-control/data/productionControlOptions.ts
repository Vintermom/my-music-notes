import type { ProductionCategory, ProductionPreset } from "../types/productionControl.types";
import { mixSeparationPrompts } from "../prompts/mixSeparationPrompts";
import { percussionArtifactPrompts } from "../prompts/percussionArtifactPrompts";
import { frequencyPrompts } from "../prompts/frequencyPrompts";
import { vocalPlacementPrompts } from "../prompts/vocalPlacementPrompts";
import { tempoPresets } from "./tempoOptions";

// Category order = render order. Add future categories here (Instruments, Stereo, ...).
export const productionCategories: ProductionCategory[] = [
  { id: "mixSeparation", labelKey: "pc.category.mixSeparation", kind: "presets" },
  { id: "percussionArtifacts", labelKey: "pc.category.percussionArtifacts", kind: "presets" },
  { id: "frequencyBalance", labelKey: "pc.category.frequencyBalance", kind: "presets" },
  { id: "vocalPlacement", labelKey: "pc.category.vocalPlacement", kind: "presets" },
  { id: "tempo", labelKey: "pc.category.tempo", kind: "tempo" },
];

const mixSeparationPresets: ProductionPreset[] = [
  {
    id: "clearInstrumentSeparation",
    category: "mixSeparation",
    labelKey: "pc.option.clearInstrumentSeparation.label",
    hintKey: "pc.option.clearInstrumentSeparation.hint",
    prompt: mixSeparationPrompts.clearInstrumentSeparation,
  },
  {
    id: "controlledArrangementDensity",
    category: "mixSeparation",
    labelKey: "pc.option.controlledArrangementDensity.label",
    hintKey: "pc.option.controlledArrangementDensity.hint",
    prompt: mixSeparationPrompts.controlledArrangementDensity,
  },
  {
    id: "stableMixThroughout",
    category: "mixSeparation",
    labelKey: "pc.option.stableMixThroughout.label",
    hintKey: "pc.option.stableMixThroughout.hint",
    prompt: mixSeparationPrompts.stableMixThroughout,
  },
  {
    id: "stableDynamics",
    category: "mixSeparation",
    labelKey: "pc.option.stableDynamics.label",
    hintKey: "pc.option.stableDynamics.hint",
    prompt: mixSeparationPrompts.stableDynamics,
  },
  {
    id: "cleanAudioQuality",
    category: "mixSeparation",
    labelKey: "pc.option.cleanAudioQuality.label",
    hintKey: "pc.option.cleanAudioQuality.hint",
    prompt: mixSeparationPrompts.cleanAudioQuality,
  },
];

const percussionPresets: ProductionPreset[] = [
  {
    id: "controlledCymbals",
    category: "percussionArtifacts",
    labelKey: "pc.option.controlledCymbals.label",
    hintKey: "pc.option.controlledCymbals.hint",
    prompt: percussionArtifactPrompts.controlledCymbals,
  },
  {
    id: "removeTicksMetallicArtifacts",
    category: "percussionArtifacts",
    labelKey: "pc.option.removeTicksMetallicArtifacts.label",
    hintKey: "pc.option.removeTicksMetallicArtifacts.hint",
    prompt: percussionArtifactPrompts.removeTicksMetallicArtifacts,
  },
  {
    id: "naturalTransients",
    category: "percussionArtifacts",
    labelKey: "pc.option.naturalTransients.label",
    hintKey: "pc.option.naturalTransients.hint",
    prompt: percussionArtifactPrompts.naturalTransients,
  },
];

const frequencyPresets: ProductionPreset[] = [
  {
    id: "balancedFrequencyResponse",
    category: "frequencyBalance",
    labelKey: "pc.option.balancedFrequencyResponse.label",
    hintKey: "pc.option.balancedFrequencyResponse.hint",
    prompt: frequencyPrompts.balancedFrequencyResponse,
  },
  {
    id: "reduceLowMidMud",
    category: "frequencyBalance",
    labelKey: "pc.option.reduceLowMidMud.label",
    hintKey: "pc.option.reduceLowMidMud.hint",
    prompt: frequencyPrompts.reduceLowMidMud,
  },
  {
    id: "smoothHarshHighs",
    category: "frequencyBalance",
    labelKey: "pc.option.smoothHarshHighs.label",
    hintKey: "pc.option.smoothHarshHighs.hint",
    prompt: frequencyPrompts.smoothHarshHighs,
  },
  {
    id: "lowEndSeparation",
    category: "frequencyBalance",
    labelKey: "pc.option.lowEndSeparation.label",
    hintKey: "pc.option.lowEndSeparation.hint",
    prompt: frequencyPrompts.lowEndSeparation,
  },
];

const vocalPlacementPresets: ProductionPreset[] = [
  {
    id: "vocalForwardSpace",
    category: "vocalPlacement",
    labelKey: "pc.option.vocalForwardSpace.label",
    hintKey: "pc.option.vocalForwardSpace.hint",
    prompt: vocalPlacementPrompts.vocalForwardSpace,
  },
  {
    id: "centeredLeadVocal",
    category: "vocalPlacement",
    labelKey: "pc.option.centeredLeadVocal.label",
    hintKey: "pc.option.centeredLeadVocal.hint",
    prompt: vocalPlacementPrompts.centeredLeadVocal,
  },
];

// Single flat, data-driven list — the UI renders from this, never from hardcoded chips.
export const productionPresets: ProductionPreset[] = [
  ...mixSeparationPresets,
  ...percussionPresets,
  ...frequencyPresets,
  ...vocalPlacementPresets,
  ...tempoPresets,
];

export function getPresetsByCategory(categoryId: string): ProductionPreset[] {
  return productionPresets.filter((p) => p.category === categoryId);
}
