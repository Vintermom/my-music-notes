import type { TranslationKey } from "./en";

export const ar: Record<TranslationKey, string> = {
  // Settings Help
  "settings.help": "مساعدة",
  "settings.quickGuide": "دليل سريع",
  "settings.helpLocal": "يتم حفظ الملاحظات محلياً على هذا الجهاز.",
  "settings.helpSection": "استخدم [Section Instrument] لتنظيم كلماتك.",
  "settings.helpVocal": "استخدم (VocalEffect) لوصف تفاصيل الصوت.",
  "settings.helpStyle": "النمط يحدد الصوت العام للأغنية.",
  "settings.helpExport": "قم بتصدير أو استيراد الملاحظات باستخدام ملفات JSON لنقل البيانات بين الأجهزة.",
  "settings.helpBackup": "لتجنب فقدان البيانات، قم بتصدير ملاحظاتك بانتظام، خاصة قبل مسح بيانات المتصفح.",

  // App
  "app.name": "My Music Notes",

  // Home
  "home.pinnedNotes": "مثبتة",
  "home.otherNotes": "ملاحظات",
  "home.noNotes": "لا توجد ملاحظات بعد",
  "home.noNotesDesc": "اضغط على زر + لإنشاء أول ملاحظة أغنية",
  "home.noPinnedNotes": "لا توجد ملاحظات مثبتة",
  "home.noSearchResults": "لم يتم العثور على ملاحظات",
  "home.searchPlaceholder": "البحث في الملاحظات...",

  // Sort options
  "sort.updatedDesc": "آخر تحديث",
  "sort.createdDesc": "الأحدث إنشاءً",
  "sort.titleAsc": "أبجدي",

  // Note card
  "card.pin": "تثبيت",
  "card.unpin": "إلغاء التثبيت",
  "card.duplicate": "تكرار",
  "card.delete": "حذف",

  // Editor
  "editor.newNote": "ملاحظة جديدة",
  "editor.editNote": "تعديل الملاحظة",
  "editor.title": "عنوان الأغنية",
  "editor.composer": "الملحن",
  "editor.lyrics": "كلمات",
  "editor.style": "النمط",
  "editor.extraInfo": "معلومات إضافية",
  "editor.tags": "الوسوم",
  "editor.tagsPlaceholder": "إضافة وسوم...",
  "editor.save": "حفظ",
  "editor.saving": "جارٍ الحفظ...",
  "editor.saved": "تم الحفظ",
  "editor.autoSaving": "جارٍ الحفظ…",
  "editor.autoSaved": "تم الحفظ",
  "editor.undo": "تراجع",
  "editor.copy": "نسخ",
  "editor.clear": "مسح",
  "editor.insertSheet": "إدراج",
  "editor.backgroundColor": "لون الخلفية",
  "editor.expand": "توسيع",
  "editor.collapse": "طي",
  "editor.copyLyrics": "نسخ الكلمات",
  "editor.clearLyrics": "مسح الكلمات",
  "editor.copyStyle": "نسخ النمط",
  "editor.clearStyle": "مسح النمط",

  // More menu
  "menu.print": "طباعة",
  "menu.exportPdf": "تصدير PDF",
  "menu.saveAsPdf": "حفظ كـ PDF",
  "menu.exportJson": "تصدير JSON",
  "menu.importJson": "استيراد JSON",
  "menu.copyAll": "نسخ الكل",
  "menu.duplicate": "تكرار",
  "menu.delete": "حذف",

  // Insert sheet
  "insertSheet.title": "إدراج",
  "insertSheet.sections": "القسم",
  "insertSheet.vocalEffects": "تأثير صوتي",
  "insertSheet.instruments": "الآلات",
  "insertSheet.insert": "إدراج",

  // Style picker
  "stylePicker.title": "النمط",
  "stylePicker.voiceType": "نوع الصوت",
  "stylePicker.vocalTechniques": "تقنيات الصوت",
  "stylePicker.mood": "المزاج",
  "stylePicker.instruments": "الآلات",
  "stylePicker.musicGenres": "أنواع الموسيقى",

  // Settings
  "settings.title": "الإعدادات",
  "settings.theme": "المظهر",
  "settings.themeSystem": "النظام",
  "settings.themeA": "فاتح – كريمي",
  "settings.themeC": "فاتح – أخضر",
  "settings.themeD": "داكن",
  "settings.about": "حول",
  "settings.version": "الإصدار",
  "settings.privacyNote": "يتم تخزين جميع الملاحظات محلياً على جهازك. لا يتم رفع أي بيانات.",

  // PDF export metadata
  "print.exportedFrom": "تم التصدير من",
  "print.appType": "تطبيق ويب",
  "print.version": "الإصدار",
  "print.uiLanguage": "لغة الواجهة",
  "print.exportedAt": "تم التصدير في",
  "print.langEnglish": "الإنجليزية",
  "print.langThai": "التايلاندية",
  "print.langSwedish": "السويدية",

  // Timestamps
  "timestamp.lastEdited": "آخر تعديل",
  "timestamp.created": "تاريخ الإنشاء",

  // Dialogs
  "dialog.deleteTitle": "حذف الملاحظة",
  "dialog.deleteMessage": "هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.",
  "dialog.cancel": "إلغاء",
  "dialog.confirm": "حذف",
  "dialog.clearTitle": "مسح الكلمات",
  "dialog.clearMessage": "هل أنت متأكد من مسح جميع الكلمات؟",
  "dialog.clearConfirm": "مسح",
  "dialog.clearStyleTitle": "مسح النمط",
  "dialog.clearStyleMessage": "هل أنت متأكد من مسح جميع وسوم النمط؟",

  // Print dialog
  "print.title": "خيارات الطباعة",
  "print.pdfTitle": "تصدير PDF",
  "print.textOnly": "نص فقط",
  "print.appLayout": "تخطيط التطبيق",
  "print.printButton": "طباعة",
  "print.saveButton": "حفظ",
  "print.created": "تاريخ الإنشاء",
  "print.updated": "آخر تحديث",
  "print.printed": "تاريخ الطباعة",
  "print.saved": "تاريخ الحفظ",
  // Print labels (localized section headers)
  "print.labelTitle": "عنوان الأغنية",
  "print.labelComposer": "الملحن",
  "print.labelLyrics": "كلمات",
  "print.labelStyle": "النمط",
  "print.labelExtra": "معلومات إضافية",
  "print.labelTags": "الوسوم",

  // Import dialog
  "import.title": "استيراد ملاحظة",
  "import.selectFile": "اختر ملف JSON",
  "import.importing": "جارٍ الاستيراد...",
  "import.success": "تم استيراد الملاحظة بنجاح",
  "import.error": "فشل استيراد الملاحظة",
  "import.invalidFormat": "يُسمح فقط بملفات JSON",
  "import.fileTooLarge": "الملف كبير جداً (الحد الأقصى 3MB)",
  "import.limitReached": "تم الوصول إلى حد الاستيراد اليومي",
  "import.limitMessage": "يمكن للمستخدمين المجانيين استيراد ما يصل إلى 2 ملاحظات يومياً. قم بالترقية إلى Pro للاستيراد غير المحدود.",
  "import.remainingToday": "الاستيراد المتبقي اليوم",

  // Toast messages
  "toast.noteSaved": "تم حفظ الملاحظة",
  "toast.noteDeleted": "تم حذف الملاحظة",
  "toast.noteDuplicated": "تم تكرار الملاحظة",
  "toast.notePinned": "تم تثبيت الملاحظة",
  "toast.noteUnpinned": "تم إلغاء تثبيت الملاحظة",
  "toast.pinLimit": "يمكنك تثبيت 6 ملاحظات كحد أقصى",
  "toast.lyricsCopied": "تم نسخ الكلمات",
  "toast.styleCopied": "تم نسخ النمط",
  "toast.allCopied": "تم نسخ كل المحتوى",
  "toast.lyricsCleared": "تم مسح الكلمات",
  "toast.styleCleared": "تم مسح النمط",
  "toast.undoApplied": "تم التراجع",
  "toast.noUndoHistory": "لا يوجد شيء للتراجع عنه",
  "toast.jsonExported": "تم تصدير JSON",
  "toast.jsonExportedFile": "تم التصدير: {filename}",
  "toast.pdfSaved": "تم حفظ PDF: {filename}",
  "toast.exportFailed": "فشل التصدير",
  "toast.printNotAvailable": "الطباعة غير متاحة على الهاتف",
  "toast.insertedAt": "تم الإدراج عند المؤشر",
  "toast.demoCopySaved": "تم حفظ نسختك!",

  // Colors
  "color.default": "افتراضي",
  "color.cream": "كريمي",
  "color.pink": "وردي",
  "color.blue": "أزرق",
  "color.green": "أخضر",
  "color.yellow": "أصفر",
  "color.purple": "بنفسجي",
  "color.orange": "برتقالي",

  // Landing page
  "landing.tagline": "اكتب الأغاني. احفظها بأمان.",
  "landing.supporting": "مكان بسيط لكتابة الأغاني، بطريقتك.",
  "landing.installApp": "تثبيت التطبيق",
  "landing.openApp": "فتح التطبيق",
  "landing.tryDemo": "جرب العرض التوضيحي",
  "landing.about": "حول",
  "landing.copyright": "© My Music Notes",

  // Demo mode
  "demo.badge": "تجريبي",
  "demo.helper": "الحفظ ينشئ نسختك الخاصة",
  "demo.sampleTitle": "نسيم الصيف",
  "demo.sampleComposer": "فنان تجريبي",
  "demo.sampleLyrics": "[مقدمة]\n\n[المقطع 1]\nضوء الصباح يأتي من خلال نافذتي...",
  "demo.sampleStyle": "أكوستيك، حالم، فولك بوب",
  "demo.sampleTags": "تجريبي، أكوستيك، صيف",

  // Language settings
  "settings.language": "اللغة",
  "settings.languageAuto": "تلقائي (النظام)",
  "settings.langThai": "ไทย",
  "settings.langEnglish": "English",
  "settings.langSwedish": "Svenska",
  "settings.langKorean": "한국어",
  "settings.langJapanese": "日本語",
  "settings.langArabic": "العربية",

  // Update check
  "settings.updates": "التحديثات",
  "settings.checkForUpdates": "التحقق من التحديثات",
  "settings.upToDate": "أنت على آخر إصدار!",
  "settings.upToDateMessage": "لديك أحدث إصدار ({version}).",
  "settings.updateAvailable": "تحديث متاح",
  "settings.updateAvailableMessage": "إصدار جديد ({version}) متاح. يرجى تحديث الصفحة أو إعادة تثبيت التطبيق.",
  "settings.checkingForUpdates": "جارٍ التحقق من التحديثات...",
  "toast.updateCheckFailed": "فشل التحقق من التحديثات",
};
