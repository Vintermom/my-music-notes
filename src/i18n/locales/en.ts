export const en = {
  // Settings Help
  "settings.help": "Help",
  "settings.quickGuide": "Quick Guide",
  "settings.helpLocal": "Notes are saved locally on this device.",
  "settings.helpSection": "Use [Section Instrument] to structure your lyrics.",
  "settings.helpVocal": "Use (VocalEffect) to describe voice details.",
  "settings.helpStyle": "Style defines the overall sound of the song.",
  "settings.helpExport": "Export or import notes using JSON files to move data between devices.",
  "settings.helpBackup": "To avoid data loss, export your notes regularly, especially before clearing browser data.",
  // App
  "app.name": "My Music Notes",

  // Home
  "home.pinnedNotes": "Pinned",
  "home.otherNotes": "Notes",
  "home.noNotes": "No notes yet",
  "home.noNotesDesc": "Tap the + button to create your first song note",
  "home.noPinnedNotes": "No pinned notes",
  "home.noSearchResults": "No notes found",
  "home.searchPlaceholder": "Search notes...",

  // Sort options
  "sort.updatedDesc": "Recently updated",
  "sort.createdDesc": "Recently created",
  "sort.titleAsc": "Alphabetical",

  // Note card
  "card.pin": "Pin",
  "card.unpin": "Unpin",
  "card.duplicate": "Duplicate",
  "card.delete": "Delete",

  // Editor
  "editor.newNote": "New Note",
  "editor.editNote": "Edit Note",
  "editor.title": "Song Title",
  "editor.composer": "Composer",
  "editor.lyrics": "Lyrics",
  "editor.style": "Style",
  "editor.extraInfo": "Extra Info",
  "editor.tags": "Tags",
  "editor.tagsPlaceholder": "Add tags...",
  "editor.save": "Save",
  "editor.saving": "Saving...",
  "editor.saved": "Saved",
  "editor.autoSaving": "Saving…",
  "editor.autoSaved": "Saved",
  "editor.undo": "Undo",
  "editor.copy": "Copy",
  "editor.clear": "Clear",
  "editor.insertSheet": "Insert",
  "editor.backgroundColor": "Background Color",
  "editor.expand": "Expand",
  "editor.collapse": "Collapse",
  "editor.copyLyrics": "Copy Lyrics",
  "editor.clearLyrics": "Clear Lyrics",
  "editor.copyStyle": "Copy Style",
  "editor.clearStyle": "Clear Style",

  // More menu
  "menu.print": "Print",
  "menu.exportPdf": "Export PDF",
  "menu.exportJson": "Export JSON",
  "menu.importJson": "Import JSON",
  "menu.copyAll": "Copy All",
  "menu.duplicate": "Duplicate",
  "menu.timeline": "Timeline",
  "menu.delete": "Delete",

  // Insert sheet
  "insertSheet.title": "Insert",
  "insertSheet.sections": "Section",
  "insertSheet.vocalEffects": "Vocal Effect",
  "insertSheet.instruments": "Instruments",
  "insertSheet.insert": "Insert",

  // Style picker
  "stylePicker.title": "Style",
  "stylePicker.voiceType": "Voice Type",
  "stylePicker.vocalTechniques": "Vocal Techniques",
  "stylePicker.mood": "Mood",
  "stylePicker.instruments": "Instruments",
  "stylePicker.musicGenres": "Music Genres",

  // Settings
  "settings.title": "Settings",
  "settings.theme": "Theme",
  "settings.themeA": "Warm Cream",
  "settings.themeB": "Cool Slate",
  "settings.themeD": "Dark",
  "settings.about": "About",
  "settings.version": "Version 1.0.0",
  "settings.privacyNote": "All notes are stored locally on your device. No data is uploaded.",

  // Timeline
  "timeline.title": "Timeline",
  "timeline.created": "Created",
  "timeline.updated": "Updated",
  "timeline.noChanges": "No changes recorded",

  // Dialogs
  "dialog.deleteTitle": "Delete Note",
  "dialog.deleteMessage": "Are you sure you want to delete this note? This action cannot be undone.",
  "dialog.cancel": "Cancel",
  "dialog.confirm": "Delete",
  "dialog.clearTitle": "Clear Lyrics",
  "dialog.clearMessage": "Are you sure you want to clear all lyrics?",
  "dialog.clearConfirm": "Clear",
  "dialog.clearStyleTitle": "Clear Style",
  "dialog.clearStyleMessage": "Are you sure you want to clear all style tags?",

  // Print dialog
  "print.title": "Print Options",
  "print.pdfTitle": "Export PDF",
  "print.textOnly": "Text only",
  "print.appLayout": "App layout",
  "print.printButton": "Print",
  "print.saveButton": "Save",
  "print.created": "Created",
  "print.updated": "Last updated",
  "print.printed": "Printed",
  "print.saved": "Saved",
  // Print labels (localized section headers)
  "print.labelTitle": "Song Title",
  "print.labelComposer": "Composer",
  "print.labelLyrics": "Lyrics",
  "print.labelStyle": "Style",
  "print.labelExtra": "Extra Info",
  "print.labelTags": "Tags",

  // Import dialog
  "import.title": "Import Note",
  "import.selectFile": "Select JSON file",
  "import.importing": "Importing...",
  "import.success": "Note imported successfully",
  "import.error": "Failed to import note",
  "import.invalidFormat": "Only JSON files are allowed",
  "import.fileTooLarge": "File too large (max 3MB)",
  "import.limitReached": "Daily import limit reached",
  "import.limitMessage": "Free users can import up to 2 notes per day. Upgrade to Pro for unlimited imports.",
  "import.remainingToday": "imports remaining today",

  // Toast messages
  "toast.noteSaved": "Note saved",
  "toast.noteDeleted": "Note deleted",
  "toast.noteDuplicated": "Note duplicated",
  "toast.notePinned": "Note pinned",
  "toast.noteUnpinned": "Note unpinned",
  "toast.pinLimit": "You can only pin up to 6 notes",
  "toast.lyricsCopied": "Lyrics copied",
  "toast.styleCopied": "Style copied",
  "toast.allCopied": "All content copied",
  "toast.lyricsCleared": "Lyrics cleared",
  "toast.styleCleared": "Style cleared",
  "toast.undoApplied": "Undo applied",
  "toast.noUndoHistory": "Nothing to undo",
  "toast.jsonExported": "JSON exported",
  "toast.insertedAt": "Inserted at cursor",

  // Colors
  "color.default": "Default",
  "color.cream": "Cream",
  "color.pink": "Pink",
  "color.blue": "Blue",
  "color.green": "Green",
  "color.yellow": "Yellow",
  "color.purple": "Purple",
  "color.orange": "Orange",
};

export type TranslationKey = keyof typeof en;
