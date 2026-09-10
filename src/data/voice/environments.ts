import type { EnvironmentOption } from "@/types/voiceOption";

// Environment options — single selection only.
export const environmentOptions: EnvironmentOption[] = [
  {
    id: "studio",
    label: "Studio",
    prompt: "studio vocal environment",
    hint: {
      en: "Clean, controlled recording space with minimal room sound.",
      th: "พื้นที่บันทึกเสียงสะอาด ควบคุมได้ เสียงห้องน้อย",
      sv: "Ren, kontrollerad inspelningsmiljö med minimal rumsklang.",
    },
    searchKeywords: { en: ["studio", "clean"], th: ["สตูดิโอ", "ห้องอัด"], sv: ["studio"] },
  },
  {
    id: "concert",
    label: "Concert",
    prompt: "live concert vocal environment",
    hint: {
      en: "Live stage feel with crowd energy and hall ambience.",
      th: "บรรยากาศเวทีสด มีพลังจากผู้ชมและเสียงก้องของฮอลล์",
      sv: "Livekänsla med publikenergi och hallakustik.",
    },
    searchKeywords: { en: ["concert", "live", "stage"], th: ["คอนเสิร์ต", "สด", "เวที"], sv: ["konsert", "live", "scen"] },
  },
  {
    id: "outdoor",
    label: "Outdoor",
    prompt: "outdoor open-air vocal environment",
    hint: {
      en: "Open-air setting with natural, airy space and little reflection.",
      th: "พื้นที่กลางแจ้ง โปร่ง เป็นธรรมชาติ เสียงสะท้อนน้อย",
      sv: "Utomhusmiljö med naturlig, luftig rymd och få reflektioner.",
    },
    searchKeywords: { en: ["outdoor", "open air", "outside"], th: ["กลางแจ้ง", "ข้างนอก"], sv: ["utomhus", "ute"] },
  },
];
