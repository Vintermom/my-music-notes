import { getCurrentLang } from "@/i18n";

type Strings = Record<string, string>;

const en: Strings = {
  "score.create": "Score",
  "score.back": "Back to notes",
  "score.titlePlaceholder": "Score title",
  "score.untitled": "Untitled score",
  "score.toolbar": "Score tools",
  "score.toolbarSoon": "Notation tools are coming in a later update.",
  "score.clef": "Clef",
  "score.clef.treble": "Treble",
  "score.clef.bass": "Bass",
  "score.time": "Time",
  "score.key": "Key",
  "score.tempo": "Tempo (BPM)",
  "score.workspace": "Staff",
  "score.workspaceEmpty": "Your notation will appear here.",
  "score.lyrics": "Lyrics",
  "score.lyricsSoon": "Lyrics under notes are coming in a later update.",
  "score.notFound": "Score not found",
  "score.saved": "Saved",
};

const th: Strings = {
  "score.create": "โน้ตเพลง",
  "score.back": "กลับไปที่โน้ต",
  "score.titlePlaceholder": "ชื่อโน้ตเพลง",
  "score.untitled": "โน้ตเพลงไม่มีชื่อ",
  "score.toolbar": "เครื่องมือโน้ตเพลง",
  "score.toolbarSoon": "เครื่องมือเขียนโน้ตจะมาในอัปเดตถัดไป",
  "score.clef": "กุญแจ",
  "score.clef.treble": "ซอล",
  "score.clef.bass": "ฟา",
  "score.time": "อัตราจังหวะ",
  "score.key": "คีย์",
  "score.tempo": "ความเร็ว (BPM)",
  "score.workspace": "บรรทัดห้าเส้น",
  "score.workspaceEmpty": "โน้ตของคุณจะแสดงที่นี่",
  "score.lyrics": "เนื้อเพลง",
  "score.lyricsSoon": "เนื้อเพลงใต้ตัวโน้ตจะมาในอัปเดตถัดไป",
  "score.notFound": "ไม่พบโน้ตเพลง",
  "score.saved": "บันทึกแล้ว",
};

const sv: Strings = {
  "score.create": "Noter",
  "score.back": "Tillbaka till anteckningar",
  "score.titlePlaceholder": "Titel på noter",
  "score.untitled": "Namnlösa noter",
  "score.toolbar": "Notverktyg",
  "score.toolbarSoon": "Notverktyg kommer i en senare uppdatering.",
  "score.clef": "Klav",
  "score.clef.treble": "Diskant",
  "score.clef.bass": "Bas",
  "score.time": "Taktart",
  "score.key": "Tonart",
  "score.tempo": "Tempo (BPM)",
  "score.workspace": "Notsystem",
  "score.workspaceEmpty": "Dina noter visas här.",
  "score.lyrics": "Text",
  "score.lyricsSoon": "Text under noterna kommer i en senare uppdatering.",
  "score.notFound": "Noterna hittades inte",
  "score.saved": "Sparat",
};

const strings: Record<string, Strings> = { en, th, sv };

/** Score translator; falls back to English for other app languages. */
export function scoreT(key: string, lang: string = getCurrentLang()): string {
  return strings[lang]?.[key] || en[key] || key;
}
