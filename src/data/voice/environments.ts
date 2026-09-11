import type { EnvironmentOption } from "@/types/voiceOption";
import { outdoorCafeEnvironment } from "./outdoorCafe";

// Environment options — single selection only.
export const environmentOptions: EnvironmentOption[] = [
  {
    id: "studio",
    label: "Studio",
    // Recording-room environment only — does not imply acoustic/minimal arrangement or genre.
    prompt: "studio-recorded vocal, close-miked, controlled studio ambience",
    hint: {
      en: "Studio-recorded vocal with close-miked presence and controlled studio ambience.",
      th: "เสียงร้องแบบบันทึกในห้องอัด ไมค์ใกล้ และควบคุมบรรยากาศของห้อง",
      sv: "Studioinspelad sång med närmickad närvaro och kontrollerad studiomiljö.",
    },
    searchKeywords: { en: ["studio", "clean"], th: ["สตูดิโอ", "ห้องอัด"], sv: ["studio"] },
  },
  {
    id: "concert",
    label: "Concert",
    // Note: intentionally no crowd noise, applause, cheering or audience sounds.
    prompt: "live stage vocal, strong stage projection, natural live venue ambience",
    hint: {
      en: "Live stage vocal with projection and natural venue ambience.",
      th: "เสียงร้องบนเวที มีแรงส่งและบรรยากาศสถานที่แสดงสด",
      sv: "Livesång på scen med stark projektion och naturlig konsertambience",
    },
    searchKeywords: { en: ["concert", "live", "stage"], th: ["คอนเสิร์ต", "สด", "เวที"], sv: ["konsert", "live", "scen"] },
  },
  {
    id: "outdoor",
    label: "Outdoor",
    prompt: "open-air live vocal with natural outdoor acoustics and minimal room reflections",
    hint: {
      en: "Open-air vocal with natural acoustics and few room reflections.",
      th: "เสียงร้องกลางแจ้ง มี acoustic แบบพื้นที่เปิดและไม่มีเสียงสะท้อนแบบห้องมาก",
      sv: "Livesång utomhus med naturlig öppen akustik och minimala rumsreflektioner",
    },
    searchKeywords: { en: ["outdoor", "open air", "outside"], th: ["กลางแจ้ง", "ข้างนอก"], sv: ["utomhus", "ute"] },
  },
  outdoorCafeEnvironment,
];
