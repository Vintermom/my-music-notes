export const en = {
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
  "sort.titleAsc": "Title A-Z",

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
  "editor.undo": "Undo",
  "editor.copy": "Copy",
  "editor.clear": "Clear",
  "editor.insertSheet": "Insert",
  "editor.backgroundColor": "Background Color",

  // More menu
  "menu.print": "Print",
  "menu.exportPdf": "Export PDF",
  "menu.exportJson": "Export JSON",
  "menu.copyAll": "Copy All",
  "menu.duplicate": "Duplicate",
  "menu.timeline": "Timeline",
  "menu.delete": "Delete",

  // Insert sheet
  "insertSheet.title": "Insert",
  "insertSheet.sections": "Song Sections",
  "insertSheet.vocalEffects": "Vocal Effects",
  "insertSheet.instruments": "Quick Instruments",

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
  "settings.themeC": "Soft Sage",
  "settings.defaultSort": "Default Sort",
  "settings.about": "About",
  "settings.version": "Version 1.0.0",

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

  // Toast messages
  "toast.noteSaved": "Note saved",
  "toast.noteDeleted": "Note deleted",
  "toast.noteDuplicated": "Note duplicated",
  "toast.notePinned": "Note pinned",
  "toast.noteUnpinned": "Note unpinned",
  "toast.pinLimit": "You can only pin up to 6 notes",
  "toast.lyricsCopied": "Lyrics copied",
  "toast.allCopied": "All content copied",
  "toast.lyricsCleared": "Lyrics cleared",
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
