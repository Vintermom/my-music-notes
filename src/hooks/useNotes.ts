import { useState, useEffect, useCallback } from "react";
import { Note, SortOption, Settings } from "@/domain/types";
import {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  duplicateNote,
  pinNote,
  sortNotes,
  searchNotes,
} from "@/storage/notesRepo";
import { getSettings, updateSettings } from "@/storage/settingsRepo";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [settings, setSettings] = useState<Settings>(getSettings);
  const [searchQuery, setSearchQuery] = useState("");

  const loadNotes = useCallback(() => {
    const allNotes = getAllNotes();
    setNotes(allNotes);
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const filteredNotes = searchNotes(notes, searchQuery);
  const sortedNotes = sortNotes(filteredNotes, settings.defaultSort);
  const pinnedNotes = sortedNotes.filter((n) => n.isPinned);
  const otherNotes = sortedNotes.filter((n) => !n.isPinned);

  const handleCreateNote = useCallback((data?: Partial<Note>) => {
    const note = createNote(data);
    loadNotes();
    return note;
  }, [loadNotes]);

  const handleUpdateNote = useCallback((id: string, updates: Partial<Note>) => {
    const note = updateNote(id, updates);
    loadNotes();
    return note;
  }, [loadNotes]);

  const handleDeleteNote = useCallback((id: string) => {
    const success = deleteNote(id);
    loadNotes();
    return success;
  }, [loadNotes]);

  const handleDuplicateNote = useCallback((id: string) => {
    const note = duplicateNote(id);
    loadNotes();
    return note;
  }, [loadNotes]);

  const handlePinNote = useCallback((id: string) => {
    const result = pinNote(id);
    loadNotes();
    return result;
  }, [loadNotes]);

  const handleSetSort = useCallback((sort: SortOption) => {
    const updated = updateSettings({ defaultSort: sort });
    setSettings(updated);
  }, []);

  const handleSetTheme = useCallback((theme: Settings["theme"]) => {
    const updated = updateSettings({ theme });
    setSettings(updated);
  }, []);

  return {
    notes: sortedNotes,
    pinnedNotes,
    otherNotes,
    settings,
    searchQuery,
    setSearchQuery,
    createNote: handleCreateNote,
    updateNote: handleUpdateNote,
    deleteNote: handleDeleteNote,
    duplicateNote: handleDuplicateNote,
    pinNote: handlePinNote,
    setSort: handleSetSort,
    setTheme: handleSetTheme,
    refreshNotes: loadNotes,
  };
}
