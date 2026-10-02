# Home note type filter

## Changes
- Add a compact Home-only segmented filter below Search: All, Lyrics, Record, Score.
- Classify existing notes without migration: `hasAudio === true` is Record; every other current note is Lyrics; reserve Score for future data.
- Apply the filter to both pinned and regular note sections while preserving search, sort, pinning, and card behavior.
- Add a small localized Lyrics/Record/Score badge to each note card.
- Show the existing clean empty state when a filter has no matches.
- Keep Create note unchanged with Text and Record only.
- Add a short dated `2026-10-02` README entry only.

## Technical details
- Add a `NoteTypeFilter` presentation component and a Home filter type; no storage schema changes or migrations.
- Add localized Home filter and badge strings to all currently supported app languages so the typed translation map remains complete.
- Make only minimal integration edits to `HomePage`, `NoteGrid`, and `NoteCard`.
- Verify desktop and mobile layouts, filtering across pinned and regular notes, empty Score state, and unchanged Create note choices.
