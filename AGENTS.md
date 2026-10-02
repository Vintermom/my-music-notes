# Project Architecture Rules

- Derive Home display note types through `src/lib/homeNoteType.ts`; keep this presentation-only classification separate from persisted note data to preserve backward compatibility.