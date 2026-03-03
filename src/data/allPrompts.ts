import { PromptPreset } from "@/types/promptPreset";

export const allPrompts: PromptPreset[] = [
  // POP (6)
  { id: "pop-1", name: "Modern Pop Radio", category: "Pop", bpm: 100, meta: "Female • Pop • 100 BPM", prompt: "Female vocal, modern pop, 100 BPM, bright confident mood, synth lead + punchy drums, glossy radio mix, medium energy." },
  { id: "pop-2", name: "Catchy Hook Pop", category: "Pop", bpm: 108, meta: "Male • Pop • 108 BPM", prompt: "Male vocal, catchy pop, 108 BPM, playful upbeat mood, hook-driven synth + clap beat, clean bright mix, medium energy." },
  { id: "pop-3", name: "Soft Pop Warm", category: "Pop", bpm: 95, meta: "Female • Pop • 95 BPM", prompt: "Female vocal, soft pop, 95 BPM, warm hopeful mood, light piano + subtle drums, polished smooth mix, medium energy." },
  { id: "pop-4", name: "Teen Pop Energy", category: "Pop", bpm: 110, meta: "Male • Pop • 110 BPM", prompt: "Male vocal, teen pop, 110 BPM, energetic youthful mood, synth bass + crisp drums, glossy pop mix, medium-high energy." },
  { id: "pop-5", name: "Bittersweet Pop", category: "Pop", bpm: 115, meta: "Female • Pop • 115 BPM", prompt: "Female vocal, bittersweet pop, 115 BPM, emotional uplifting mood, bright synth + steady kick, clean radio mix, medium energy." },
  { id: "pop-6", name: "Pop Anthem", category: "Pop", bpm: 118, meta: "Male • Pop • 118 BPM", prompt: "Male vocal, pop anthem, 118 BPM, empowering bold mood, layered synth + big chorus drums, wide modern mix, high energy." },

  // EMOTIONAL (6)
  { id: "emotional-1", name: "Emotional Ballad", category: "Emotional", bpm: 72, meta: "Female • Ballad • 72 BPM", prompt: "Female vocal, pop ballad, 72 BPM, tender heartbreaking mood, piano + soft strings, wide emotional mix, low energy." },
  { id: "emotional-2", name: "Sad Piano Minimal", category: "Emotional", bpm: 70, meta: "Male • Ballad • 70 BPM", prompt: "Male vocal, minimal piano ballad, 70 BPM, lonely reflective mood, piano + subtle pad, intimate warm mix, low energy." },
  { id: "emotional-3", name: "Cinematic Sorrow", category: "Emotional", bpm: 68, meta: "Female • Ballad • 68 BPM", prompt: "Female vocal, cinematic ballad, 68 BPM, dramatic sorrowful mood, piano + orchestral strings, expansive mix, low energy." },
  { id: "emotional-4", name: "Heartfelt Nostalgia", category: "Emotional", bpm: 85, meta: "Male • Pop • 85 BPM", prompt: "Male vocal, emotional pop, 85 BPM, heartfelt nostalgic mood, piano + light drums, clean warm mix, medium energy." },
  { id: "emotional-5", name: "Vulnerable Soft", category: "Emotional", bpm: 78, meta: "Female • Pop • 78 BPM", prompt: "Female vocal, vulnerable soft pop, 78 BPM, fragile introspective mood, acoustic piano + ambient pad, airy mix, low energy." },
  { id: "emotional-6", name: "Orchestral Build", category: "Emotional", bpm: 90, meta: "Male • Cinematic • 90 BPM", prompt: "Male vocal, orchestral emotional build, 90 BPM, hopeful rising mood, piano + cinematic strings, wide epic mix, medium energy." },

  // DANCE / EDM (6)
  { id: "dance-1", name: "Festival EDM", category: "Dance / EDM", bpm: 124, meta: "Female • EDM • 124 BPM", prompt: "Female vocal, pop EDM, 124 BPM, euphoric energetic mood, synth lead + big drop, polished club mix, high energy." },
  { id: "dance-2", name: "Progressive House Pop", category: "Dance / EDM", bpm: 126, meta: "Male • House • 126 BPM", prompt: "Male vocal, progressive house pop, 126 BPM, uplifting festival mood, piano riff + synth build, glossy dance mix, high energy." },
  { id: "dance-3", name: "Tropical Dance Pop", category: "Dance / EDM", bpm: 110, meta: "Female • Pop • 110 BPM", prompt: "Female vocal, tropical dance pop, 110 BPM, sunny carefree mood, pluck synth + light percussion, bright clean mix, medium energy." },
  { id: "dance-4", name: "Deep House Chill", category: "Dance / EDM", bpm: 122, meta: "Female • House • 122 BPM", prompt: "Female vocal, deep house pop, 122 BPM, smooth cool mood, deep bass + soft pads, clean club mix, medium energy." },
  { id: "dance-5", name: "Future Bass Pop", category: "Dance / EDM", bpm: 140, meta: "Male • EDM • 140 BPM", prompt: "Male vocal, future bass pop, 140 BPM, emotional energetic mood, synth chords + punchy drop, modern dynamic mix, high energy." },
  { id: "dance-6", name: "Soft Drop Dance", category: "Dance / EDM", bpm: 120, meta: "Female • EDM • 120 BPM", prompt: "Female vocal, soft drop dance pop, 120 BPM, dreamy uplifting mood, airy synth + rhythmic kick, polished wide mix, medium energy." },

  // CHILL / INDIE (5)
  { id: "chill-1", name: "Dreamy Indie Pop", category: "Chill / Indie", bpm: 98, meta: "Female • Indie • 98 BPM", prompt: "Female vocal, dreamy indie pop, 98 BPM, nostalgic soft mood, guitar + airy pad, spacious clean mix, medium energy." },
  { id: "chill-2", name: "Late Night Chill", category: "Chill / Indie", bpm: 92, meta: "Male • Chill • 92 BPM", prompt: "Male vocal, chill pop, 92 BPM, late night relaxed mood, mellow synth + soft drums, warm reverb mix, low energy." },
  { id: "chill-3", name: "Aesthetic Cafe Pop", category: "Chill / Indie", bpm: 100, meta: "Female • Chill • 100 BPM", prompt: "Female vocal, aesthetic cafe pop, 100 BPM, light romantic mood, piano + soft bass, clean cozy mix, medium energy." },
  { id: "chill-4", name: "Indie Acoustic Pop", category: "Chill / Indie", bpm: 88, meta: "Male • Indie • 88 BPM", prompt: "Male vocal, indie acoustic pop, 88 BPM, reflective calm mood, acoustic guitar + light percussion, natural warm mix, medium energy." },
  { id: "chill-5", name: "Ambient Chill Pop", category: "Chill / Indie", bpm: 85, meta: "Female • Chill • 85 BPM", prompt: "Female vocal, ambient chill pop, 85 BPM, serene peaceful mood, soft pad + subtle beat, airy spacious mix, low energy." },

  // ROCK / METAL (6)
  { id: "rock-1", name: "Modern Rock", category: "Rock / Metal", bpm: 118, meta: "Male • Rock • 118 BPM", prompt: "Male vocal, modern rock, 118 BPM, energetic uplifting mood, distorted guitar + punchy live drums, polished radio mix, high energy." },
  { id: "rock-2", name: "Pop Rock Power", category: "Rock / Metal", bpm: 120, meta: "Female • Rock • 120 BPM", prompt: "Female vocal, pop rock, 120 BPM, powerful confident mood, electric guitar + driving drums, big stadium mix, high energy." },
  { id: "rock-3", name: "Alternative Rock", category: "Rock / Metal", bpm: 105, meta: "Male • Rock • 105 BPM", prompt: "Male vocal, alternative rock, 105 BPM, dark introspective mood, gritty guitar + deep bass groove, textured modern mix, medium-high energy." },
  { id: "rock-4", name: "Emotional Rock Ballad", category: "Rock / Metal", bpm: 85, meta: "Female • Rock • 85 BPM", prompt: "Female vocal, emotional rock ballad, 85 BPM, dramatic heartfelt mood, piano + electric guitar, cinematic wide mix, medium energy." },
  { id: "rock-5", name: "Hard Rock Modern", category: "Rock / Metal", bpm: 130, meta: "Male • Rock • 130 BPM", prompt: "Male vocal, hard rock, 130 BPM, bold aggressive mood, heavy guitar riff + strong drums, punchy high-impact mix, high energy." },
  { id: "rock-6", name: "Modern Metalcore", category: "Rock / Metal", bpm: 150, meta: "Male • Metalcore • 150 BPM", prompt: "Clean and aggressive male vocal, modern metalcore, 150 BPM, intense melodic mood, heavy distorted guitars + double kick drums + breakdown section, polished high-impact mix, very high energy." },

  // R&B (4)
  { id: "rnb-1", name: "Modern R&B Smooth", category: "R&B", bpm: 95, meta: "Female • R&B • 95 BPM", prompt: "Female vocal, modern R&B, 95 BPM, smooth soulful mood, electric piano + deep bass groove, warm polished mix, medium energy." },
  { id: "rnb-2", name: "Slow Jam R&B", category: "R&B", bpm: 72, meta: "Male • R&B • 72 BPM", prompt: "Male vocal, slow jam R&B, 72 BPM, romantic intimate mood, soft keys + subtle drums, silky clean mix, low energy." },
  { id: "rnb-3", name: "Trap R&B", category: "R&B", bpm: 110, meta: "Female • R&B • 110 BPM", prompt: "Female vocal, trap R&B, 110 BPM, moody seductive mood, 808 bass + airy synth, modern crisp mix, medium energy." },
  { id: "rnb-4", name: "Soulful Groove R&B", category: "R&B", bpm: 98, meta: "Male • R&B • 98 BPM", prompt: "Male vocal, soulful R&B groove, 98 BPM, heartfelt warm mood, electric piano + rhythmic bass, smooth balanced mix, medium energy." },

  // HIP-HOP / RAP (4)
  { id: "hiphop-1", name: "Modern Trap Rap", category: "Hip-Hop / Rap", bpm: 140, meta: "Male • Rap • 140 BPM", prompt: "Male vocal, modern trap rap, 140 BPM, confident intense mood, 808 bass + hi-hat rolls, punchy urban mix, high energy." },
  { id: "hiphop-2", name: "Boom Bap", category: "Hip-Hop / Rap", bpm: 92, meta: "Male • Hip-Hop • 92 BPM", prompt: "Male vocal, boom bap hip-hop, 92 BPM, raw authentic mood, classic drum break + bass loop, gritty analog mix, medium energy." },
  { id: "hiphop-3", name: "Melodic Rap Pop", category: "Hip-Hop / Rap", bpm: 105, meta: "Female • Rap • 105 BPM", prompt: "Female vocal, melodic rap pop, 105 BPM, emotional expressive mood, 808 bass + soft synth, clean modern mix, medium energy." },
  { id: "hiphop-4", name: "Dark Drill", category: "Hip-Hop / Rap", bpm: 145, meta: "Male • Drill • 145 BPM", prompt: "Male vocal, dark drill rap, 145 BPM, aggressive edgy mood, sliding 808 + minimal piano, hard punchy mix, high energy." },

  // FOLK (3)
  { id: "folk-1", name: "Acoustic Folk", category: "Folk", bpm: 88, meta: "Female • Folk • 88 BPM", prompt: "Female vocal, acoustic folk, 88 BPM, sincere storytelling mood, acoustic guitar + light percussion, natural organic mix, medium energy." },
  { id: "folk-2", name: "Indie Folk", category: "Folk", bpm: 92, meta: "Male • Folk • 92 BPM", prompt: "Male vocal, indie folk, 92 BPM, nostalgic reflective mood, acoustic guitar + subtle strings, warm textured mix, medium energy." },
  { id: "folk-3", name: "Cinematic Folk", category: "Folk", bpm: 85, meta: "Female • Folk • 85 BPM", prompt: "Female vocal, cinematic folk, 85 BPM, emotional hopeful mood, acoustic guitar + orchestral strings, wide atmospheric mix, medium energy." },
];
