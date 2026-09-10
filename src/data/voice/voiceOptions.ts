import type { VoiceOption } from "@/types/voiceOption";

// TEMPORARY TEST DATASET — replace with the final Voice vocabulary in the next step.
// Keep this file as the single source of Voice option data.
export const voiceOptions: VoiceOption[] = [
  {
    id: "full-bodied",
    label: "Full-bodied",
    category: "Tone / Body",
    prompt: "full-bodied vocal tone",
    hint: {
      en: "Rich, warm and rounded vocal tone with weight in the low-mids.",
      th: "โทนเสียงร้องที่หนา อบอุ่น และกลมกล่อม มีน้ำหนักในย่านกลางต่ำ",
      sv: "Fyllig, varm och rund sångton med tyngd i lägre mellanregistret.",
    },
    commonGenres: ["Soul", "Jazz", "Ballad"],
    searchKeywords: {
      en: ["full", "rich", "warm", "thick"],
      th: ["หนา", "อบอุ่น", "กลมกล่อม"],
      sv: ["fyllig", "varm", "rund"],
    },
  },
  {
    id: "raw",
    label: "Raw",
    category: "Texture",
    prompt: "raw vocal texture",
    hint: {
      en: "Unpolished, honest vocal texture with natural imperfections.",
      th: "เนื้อเสียงดิบ ไม่ขัดเกลา จริงใจ มีความไม่สมบูรณ์แบบตามธรรมชาติ",
      sv: "Opolerad, ärlig sångtextur med naturliga ojämnheter.",
    },
    commonGenres: ["Punk Rock", "Grunge", "Indie"],
    searchKeywords: {
      en: ["raw", "unpolished", "gritty"],
      th: ["ดิบ", "หยาบ", "ไม่ขัดเกลา"],
      sv: ["rå", "opolerad", "grov"],
    },
  },
  {
    id: "powerful",
    label: "Powerful",
    category: "Power / Presence",
    prompt: "powerful vocal delivery",
    hint: {
      en: "Strong, projected vocal with commanding presence.",
      th: "เสียงร้องทรงพลัง ส่งเสียงชัด มีความโดดเด่น",
      sv: "Stark, projicerad sång med kommanderande närvaro.",
    },
    searchKeywords: {
      en: ["powerful", "strong", "big"],
      th: ["ทรงพลัง", "แข็งแรง", "พลัง"],
      sv: ["kraftfull", "stark"],
    },
  },
];
