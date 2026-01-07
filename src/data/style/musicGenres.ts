import type { StyleChip } from "./voiceTypes";

export interface GenreGroup {
  id: string;
  label: string;
  genres: StyleChip[];
}

export const musicGenreGroups: GenreGroup[] = [
  {
    id: "pop-electronic",
    label: "Pop & Electronic",
    genres: [
      { id: "pop", label: "Pop" },
      { id: "k-pop", label: "K-Pop" },
      { id: "j-pop", label: "J-Pop" },
      { id: "indie-pop", label: "Indie Pop" },
      { id: "synth-pop", label: "Synth Pop" },
      { id: "edm", label: "EDM" },
      { id: "house", label: "House" },
      { id: "electro", label: "Electro" },
      { id: "chill", label: "Chill" },
      { id: "lo-fi", label: "Lo-fi" },
    ],
  },
  {
    id: "rock",
    label: "Rock",
    genres: [
      { id: "rock", label: "Rock" },
      { id: "alternative-rock", label: "Alternative Rock" },
      { id: "indie-rock", label: "Indie Rock" },
      { id: "soft-rock", label: "Soft Rock" },
      { id: "hard-rock", label: "Hard Rock" },
      { id: "punk", label: "Punk" },
    ],
  },
  {
    id: "hiphop-rnb",
    label: "Hip Hop & R&B",
    genres: [
      { id: "hip-hop", label: "Hip Hop" },
      { id: "rap", label: "Rap" },
      { id: "trap", label: "Trap" },
      { id: "rnb", label: "R&B" },
      { id: "soul", label: "Soul" },
    ],
  },
  {
    id: "jazz-blues",
    label: "Jazz & Blues",
    genres: [
      { id: "jazz", label: "Jazz" },
      { id: "smooth-jazz", label: "Smooth Jazz" },
      { id: "blues", label: "Blues" },
      { id: "swing", label: "Swing" },
    ],
  },
  {
    id: "country-folk",
    label: "Country & Folk",
    genres: [
      { id: "country", label: "Country" },
      { id: "folk", label: "Folk" },
      { id: "acoustic", label: "Acoustic" },
    ],
  },
  {
    id: "other",
    label: "Other",
    genres: [
      { id: "latin", label: "Latin" },
      { id: "reggae", label: "Reggae" },
      { id: "classical", label: "Classical" },
      { id: "ballad", label: "Ballad" },
      { id: "opera", label: "Opera" },
    ],
  },
];
