import type { TranslationKey } from "./en";

export const sv: Record<TranslationKey, string> = {
  // App
  "app.name": "My Music Notes",

  // Home
  "home.pinnedNotes": "Fästa",
  "home.otherNotes": "Anteckningar",
  "home.noNotes": "Inga anteckningar ännu",
  "home.noNotesDesc": "Tryck på + knappen för att skapa din första låtanteckning",
  "home.noPinnedNotes": "Inga fästa anteckningar",
  "home.noSearchResults": "Inga anteckningar hittades",
  "home.searchPlaceholder": "Sök anteckningar...",

  // Sort options
  "sort.updatedDesc": "Senast uppdaterad",
  "sort.createdDesc": "Senast skapad",
  "sort.titleAsc": "Alfabetisk",

  // Note card
  "card.pin": "Fäst",
  "card.unpin": "Lossa",
  "card.duplicate": "Duplicera",
  "card.delete": "Radera",

  // Editor
  "editor.newNote": "Ny anteckning",
  "editor.editNote": "Redigera anteckning",
  "editor.title": "Låttitel",
  "editor.composer": "Kompositör",
  "editor.lyrics": "Text",
  "editor.style": "Stil",
  "editor.extraInfo": "Extra information",
  "editor.tags": "Taggar",
  "editor.tagsPlaceholder": "Lägg till taggar...",
  "editor.save": "Spara",
  "editor.saving": "Sparar...",
  "editor.saved": "Sparad",
  "editor.undo": "Ångra",
  "editor.copy": "Kopiera",
  "editor.clear": "Rensa",
  "editor.insertSheet": "Infoga",
  "editor.backgroundColor": "Bakgrundsfärg",
  "editor.expand": "Expandera",
  "editor.collapse": "Minimera",
  "editor.copyLyrics": "Kopiera text",
  "editor.clearLyrics": "Rensa text",
  "editor.copyStyle": "Kopiera stil",
  "editor.clearStyle": "Rensa stil",

  // More menu
  "menu.print": "Skriv ut",
  "menu.exportPdf": "Exportera PDF",
  "menu.exportJson": "Exportera JSON",
  "menu.importJson": "Importera JSON",
  "menu.copyAll": "Kopiera allt",
  "menu.duplicate": "Duplicera",
  "menu.timeline": "Tidslinje",
  "menu.delete": "Radera",

  // Insert sheet
  "insertSheet.title": "Infoga",
  "insertSheet.sections": "Låtsektioner",
  "insertSheet.vocalEffects": "Vokaleffekter",
  "insertSheet.instruments": "Snabbinstrument",

  // Style picker
  "stylePicker.title": "Stil",
  "stylePicker.voiceType": "Rösttyp",
  "stylePicker.vocalTechniques": "Vokalteknik",
  "stylePicker.mood": "Stämning",
  "stylePicker.instruments": "Instrument",
  "stylePicker.musicGenres": "Musikgenrer",

  // Settings
  "settings.title": "Inställningar",
  "settings.theme": "Tema",
  "settings.themeA": "Varm kräm",
  "settings.themeB": "Sval skiffer",
  "settings.themeC": "Mjuk salvia",
  "settings.themeD": "Mjuk mörk",
  "settings.themeE": "Dimmig mörk",
  "settings.defaultSort": "Standardsortering",
  "settings.about": "Om",
  "settings.version": "Version 1.0.0",

  // Timeline
  "timeline.title": "Tidslinje",
  "timeline.created": "Skapad",
  "timeline.updated": "Uppdaterad",
  "timeline.noChanges": "Inga ändringar registrerade",

  // Dialogs
  "dialog.deleteTitle": "Radera anteckning",
  "dialog.deleteMessage": "Är du säker på att du vill radera denna anteckning? Denna åtgärd kan inte ångras.",
  "dialog.cancel": "Avbryt",
  "dialog.confirm": "Radera",
  "dialog.clearTitle": "Rensa text",
  "dialog.clearMessage": "Är du säker på att du vill rensa all text?",
  "dialog.clearConfirm": "Rensa",
  "dialog.clearStyleTitle": "Rensa stil",
  "dialog.clearStyleMessage": "Är du säker på att du vill rensa alla stiltaggar?",

  // Print dialog
  "print.title": "Utskriftsalternativ",
  "print.textOnly": "Endast text",
  "print.appLayout": "Applayout",
  "print.printButton": "Skriv ut",
  "print.created": "Skapad",
  "print.updated": "Senast uppdaterad",
  "print.printed": "Utskriven",

  // Import dialog
  "import.title": "Importera anteckning",
  "import.selectFile": "Välj JSON-fil",
  "import.importing": "Importerar...",
  "import.success": "Anteckning importerad",
  "import.error": "Kunde inte importera anteckning",
  "import.limitReached": "Daglig importgräns nådd",
  "import.limitMessage": "Gratisanvändare kan importera upp till 2 anteckningar per dag. Uppgradera till Pro för obegränsade importer.",
  "import.remainingToday": "importer kvar idag",

  // Toast messages
  "toast.noteSaved": "Anteckning sparad",
  "toast.noteDeleted": "Anteckning raderad",
  "toast.noteDuplicated": "Anteckning duplicerad",
  "toast.notePinned": "Anteckning fäst",
  "toast.noteUnpinned": "Anteckning lossad",
  "toast.pinLimit": "Du kan bara fästa upp till 6 anteckningar",
  "toast.lyricsCopied": "Text kopierad",
  "toast.styleCopied": "Stil kopierad",
  "toast.allCopied": "Allt innehåll kopierat",
  "toast.lyricsCleared": "Text rensad",
  "toast.styleCleared": "Stil rensad",
  "toast.undoApplied": "Ångrat",
  "toast.noUndoHistory": "Inget att ångra",
  "toast.jsonExported": "JSON exporterad",
  "toast.insertedAt": "Infogat vid markören",

  // Colors
  "color.default": "Standard",
  "color.cream": "Kräm",
  "color.pink": "Rosa",
  "color.blue": "Blå",
  "color.green": "Grön",
  "color.yellow": "Gul",
  "color.purple": "Lila",
  "color.orange": "Orange",
};
