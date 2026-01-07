import type { StyleChip } from "./voiceTypes";

export interface InstrumentGroup {
  id: string;
  label: string;
  instruments: StyleChip[];
}

export const instrumentGroups: InstrumentGroup[] = [
  {
    id: "string",
    label: "String",
    instruments: [
      { id: "guitar", label: "Guitar" },
      { id: "acoustic-guitar", label: "Acoustic Guitar" },
      { id: "electric-guitar", label: "Electric Guitar" },
      { id: "bass-guitar", label: "Bass Guitar" },
      { id: "violin", label: "Violin" },
      { id: "cello", label: "Cello" },
      { id: "ukulele", label: "Ukulele" },
      { id: "harp", label: "Harp" },
    ],
  },
  {
    id: "keyboard",
    label: "Keyboard",
    instruments: [
      { id: "piano", label: "Piano" },
      { id: "electric-piano", label: "Electric Piano" },
      { id: "organ", label: "Organ" },
      { id: "synth", label: "Synth" },
      { id: "keyboard", label: "Keyboard" },
    ],
  },
  {
    id: "woodwind",
    label: "Woodwind",
    instruments: [
      { id: "flute", label: "Flute" },
      { id: "saxophone", label: "Saxophone" },
      { id: "clarinet", label: "Clarinet" },
      { id: "trumpet", label: "Trumpet" },
      { id: "trombone", label: "Trombone" },
      { id: "harmonica", label: "Harmonica" },
      { id: "oboe", label: "Oboe" },
      { id: "recorder", label: "Recorder" },
    ],
  },
  {
    id: "percussion",
    label: "Percussion",
    instruments: [
      { id: "drums", label: "Drums" },
      { id: "drum-kit", label: "Drum Kit" },
      { id: "snare-drum", label: "Snare Drum" },
      { id: "bass-drum", label: "Bass Drum" },
      { id: "bongos", label: "Bongos" },
      { id: "congas", label: "Congas" },
      { id: "cajon", label: "Cajón" },
      { id: "tambourine", label: "Tambourine" },
      { id: "cymbals", label: "Cymbals" },
      { id: "xylophone", label: "Xylophone" },
    ],
  },
  {
    id: "electronic",
    label: "Electronic",
    instruments: [
      { id: "synthesizer", label: "Synthesizer" },
      { id: "electric-drums", label: "Electric Drums" },
      { id: "drum-machine", label: "Drum Machine" },
    ],
  },
  {
    id: "other",
    label: "Other",
    instruments: [
      { id: "accordion", label: "Accordion" },
      { id: "banjo", label: "Banjo" },
      { id: "mandolin", label: "Mandolin" },
      { id: "steel-guitar", label: "Steel Guitar" },
      { id: "bagpipes", label: "Bagpipes" },
      { id: "didgeridoo", label: "Didgeridoo" },
    ],
  },
];
