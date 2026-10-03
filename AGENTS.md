# Project Architecture Rules

- Derive Home display note types through `src/lib/homeNoteType.ts`; keep this presentation-only classification separate from persisted note data to preserve backward compatibility.- Keep Score note code in `src/features/score/`; existing notes only gain optional `noteType`/`score` fields so older data stays compatible.
- Score playback must go through the shared `scorePlayer` instance in `src/features/score/services/` so only one playback runs at a time; chords stay in their own list, separate from the notes.
- Score printing lives in `src/features/score/print/` and uses its own HTML/SVG layout, opened through the browser print dialog; it never reuses the app's existing Print/Export/Share code.
- Keep Score undo/redo snapshots session-local in the Score feature; persistence continues through the existing note repository so saved data remains compatible.
- Keep mobile Score staff spacing content-aware per system while preserving the fixed notation geometry; print and PDF layout remain independent.
