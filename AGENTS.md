# Project Architecture Rules

- Derive Home display note types through `src/lib/homeNoteType.ts`; keep this presentation-only classification separate from persisted note data to preserve backward compatibility.- Keep Score note code in `src/features/score/`; existing notes only gain optional `noteType`/`score` fields so older data stays compatible.
- Score playback must go through the shared `scorePlayer` instance in `src/features/score/services/` so only one playback runs at a time; chords stay in their own list, separate from the notes.
