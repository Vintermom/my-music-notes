import type { QuickVoiceControl } from "@/types/voiceOption";

// Quick Voice Controls — compact shortcuts that combine several producer terms.
// Can be selected together with normal Voice options.
export const quickVoiceControls: QuickVoiceControl[] = [
  {
    id: "quick-fuller-vocal",
    label: "Fuller Vocal",
    prompt: "full-bodied lead vocal, solid vocal tone, strong natural resonance",
    hint: {
      en: "Makes the vocal fuller and more solid, less thin.",
      th: "เพิ่มเนื้อเสียงให้เต็ม แน่น และลดความรู้สึกเสียงบาง",
      sv: "Gör rösten fylligare, stabilare och mindre tunn",
    },
    searchKeywords: { en: ["fuller", "full", "body"], th: ["เต็ม", "หนา"], sv: ["fylligare"] },
  },
  {
    id: "quick-bring-vocal-forward",
    label: "Bring Vocal Forward",
    prompt:
      "lead vocal upfront in the mix, vocal-forward balance, clear separation from instrumentation, consistent lead-vocal presence throughout",
    hint: {
      en: "Pushes the vocal to the front so it is not buried by the instruments.",
      th: "ดันเสียงร้องให้อยู่ด้านหน้ามิกซ์ ชัดเหนือเครื่องดนตรี และลดอาการเสียงร้องถูกกลืน",
      sv: "Flytta leadsången fram i mixen, tydligt över instrumenten och med jämn närvaro",
    },
    searchKeywords: { en: ["forward", "upfront", "mix"], th: ["ด้านหน้า", "ดันเสียง"], sv: ["fram", "mix"] },
  },
  {
    id: "quick-raw-less-polished",
    label: "Raw / Less Polished",
    prompt:
      "raw unpolished vocal texture, natural vocal dynamics, minimal vocal processing, minimal pitch correction",
    hint: {
      en: "Makes the vocal rawer and more natural with less processing.",
      th: "ทำให้เสียงร้องดิบและเป็นธรรมชาติมากขึ้น ลดการขัดเสียงและการประมวลผล",
      sv: "Gör rösten råare och naturligare med mindre bearbetning och tonhöjdskorrigering",
    },
    searchKeywords: { en: ["raw", "unpolished", "natural"], th: ["ดิบ", "ธรรมชาติ"], sv: ["rå", "opolerad"] },
  },
];
