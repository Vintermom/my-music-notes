import type { TranslationKey } from "./en";

export const th: Record<TranslationKey, string> = {
  // App
  "app.name": "My Music Notes",

  // Home
  "home.pinnedNotes": "ปักหมุด",
  "home.otherNotes": "โน้ต",
  "home.noNotes": "ยังไม่มีโน้ต",
  "home.noNotesDesc": "แตะปุ่ม + เพื่อสร้างโน้ตเพลงแรกของคุณ",
  "home.noPinnedNotes": "ไม่มีโน้ตที่ปักหมุด",
  "home.noSearchResults": "ไม่พบโน้ต",
  "home.searchPlaceholder": "ค้นหาโน้ต...",

  // Sort options
  "sort.updatedDesc": "อัปเดตล่าสุด",
  "sort.createdDesc": "สร้างล่าสุด",
  "sort.titleAsc": "ชื่อ ก-ฮ",

  // Note card
  "card.pin": "ปักหมุด",
  "card.unpin": "เลิกปักหมุด",
  "card.duplicate": "ทำสำเนา",
  "card.delete": "ลบ",

  // Editor
  "editor.newNote": "โน้ตใหม่",
  "editor.editNote": "แก้ไขโน้ต",
  "editor.title": "ชื่อเพลง",
  "editor.composer": "ผู้แต่ง",
  "editor.lyrics": "เนื้อเพลง",
  "editor.style": "สไตล์",
  "editor.extraInfo": "ข้อมูลเพิ่มเติม",
  "editor.tags": "แท็ก",
  "editor.tagsPlaceholder": "เพิ่มแท็ก...",
  "editor.save": "บันทึก",
  "editor.saving": "กำลังบันทึก...",
  "editor.saved": "บันทึกแล้ว",
  "editor.undo": "เลิกทำ",
  "editor.copy": "คัดลอก",
  "editor.clear": "ล้าง",
  "editor.insertSheet": "แทรก",
  "editor.backgroundColor": "สีพื้นหลัง",

  // More menu
  "menu.print": "พิมพ์",
  "menu.exportPdf": "ส่งออก PDF",
  "menu.exportJson": "ส่งออก JSON",
  "menu.copyAll": "คัดลอกทั้งหมด",
  "menu.duplicate": "ทำสำเนา",
  "menu.timeline": "ไทม์ไลน์",
  "menu.delete": "ลบ",

  // Insert sheet
  "insertSheet.title": "แทรก",
  "insertSheet.sections": "ส่วนของเพลง",
  "insertSheet.vocalEffects": "เอฟเฟกต์เสียง",
  "insertSheet.instruments": "เครื่องดนตรี",

  // Style picker
  "stylePicker.title": "สไตล์",
  "stylePicker.voiceType": "ประเภทเสียง",
  "stylePicker.vocalTechniques": "เทคนิคร้อง",
  "stylePicker.mood": "อารมณ์",
  "stylePicker.instruments": "เครื่องดนตรี",
  "stylePicker.musicGenres": "แนวเพลง",

  // Settings
  "settings.title": "การตั้งค่า",
  "settings.theme": "ธีม",
  "settings.themeA": "ครีมอุ่น",
  "settings.themeB": "สเลทเย็น",
  "settings.themeC": "เขียวอ่อน",
  "settings.defaultSort": "การเรียงลำดับ",
  "settings.about": "เกี่ยวกับ",
  "settings.version": "เวอร์ชัน 1.0.0",

  // Timeline
  "timeline.title": "ไทม์ไลน์",
  "timeline.created": "สร้างเมื่อ",
  "timeline.updated": "อัปเดตเมื่อ",
  "timeline.noChanges": "ไม่มีการเปลี่ยนแปลง",

  // Dialogs
  "dialog.deleteTitle": "ลบโน้ต",
  "dialog.deleteMessage": "คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้",
  "dialog.cancel": "ยกเลิก",
  "dialog.confirm": "ลบ",
  "dialog.clearTitle": "ล้างเนื้อเพลง",
  "dialog.clearMessage": "คุณแน่ใจหรือไม่ว่าต้องการล้างเนื้อเพลงทั้งหมด?",
  "dialog.clearConfirm": "ล้าง",

  // Toast messages
  "toast.noteSaved": "บันทึกโน้ตแล้ว",
  "toast.noteDeleted": "ลบโน้ตแล้ว",
  "toast.noteDuplicated": "ทำสำเนาโน้ตแล้ว",
  "toast.notePinned": "ปักหมุดโน้ตแล้ว",
  "toast.noteUnpinned": "เลิกปักหมุดโน้ตแล้ว",
  "toast.pinLimit": "คุณสามารถปักหมุดได้สูงสุด 6 โน้ตเท่านั้น",
  "toast.lyricsCopied": "คัดลอกเนื้อเพลงแล้ว",
  "toast.allCopied": "คัดลอกเนื้อหาทั้งหมดแล้ว",
  "toast.lyricsCleared": "ล้างเนื้อเพลงแล้ว",
  "toast.undoApplied": "เลิกทำแล้ว",
  "toast.noUndoHistory": "ไม่มีอะไรให้เลิกทำ",
  "toast.jsonExported": "ส่งออก JSON แล้ว",
  "toast.insertedAt": "แทรกที่ตำแหน่งเคอร์เซอร์แล้ว",

  // Colors
  "color.default": "ค่าเริ่มต้น",
  "color.cream": "ครีม",
  "color.pink": "ชมพู",
  "color.blue": "ฟ้า",
  "color.green": "เขียว",
  "color.yellow": "เหลือง",
  "color.purple": "ม่วง",
  "color.orange": "ส้ม",
};
