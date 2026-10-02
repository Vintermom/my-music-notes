export interface ChordPresetGroup {
  id: "major" | "minor" | "seventh";
  labelKey: string;
  chords: string[];
}

/** Common shortcuts only; the chord dialog always keeps free-form entry available. */
export const CHORD_PRESET_GROUPS: ChordPresetGroup[] = [
  { id: "major", labelKey: "score.chordGroup.major", chords: ["C", "D", "E", "F", "G", "A", "B"] },
  { id: "minor", labelKey: "score.chordGroup.minor", chords: ["Am", "Bm", "Cm", "Dm", "Em", "Fm", "Gm"] },
  { id: "seventh", labelKey: "score.chordGroup.seventh", chords: ["C7", "G7", "D7", "Cmaj7", "Fmaj7", "Am7", "Dm7", "Em7"] },
];