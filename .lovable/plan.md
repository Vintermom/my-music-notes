# MyMuNotes V1.5.0 — Score Editing Polish

## Scope
Update only the existing Score feature and its short README development note. Preserve Text, Record, Share/Export, Print/PDF, Home, Settings, Voice, Environment, Production Control, storage structure, navigation, and existing Score playback/linked-recording behavior.

## Implementation

1. **Chord entry**
   - Extend the existing chord dialog with data-driven quick choices covering common major, minor, seventh, major-seventh, and minor-seventh chords.
   - Keep the current custom text field and existing save/edit/delete behavior.

2. **Time signatures**
   - Expand presets to 2/2, 2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8, and 12/8.
   - Add a Custom option with validated numerator and denominator inputs.
   - Continue accepting and sanitizing old saved Score data without migration; keep clefs limited to Treble and Bass.

3. **Score-local history**
   - Add a Score-specific history hook that stores undo/redo snapshots only for the currently open Score note.
   - Route notation, chord, time-signature, lyric mapping, and relevant Score-setting changes through history-aware updates.
   - Add touch-friendly Undo/Redo buttons and Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z shortcuts without intercepting native undo while typing in inputs.

4. **Selection and measure controls**
   - Keep and clarify note/rest deletion in the selected-item panel.
   - Add direct per-note lyric editing there, updating the visible lyric immediately.
   - Add a small contextual measure menu to the existing staff with Clear measure and Delete measure; confirm whole-measure deletion, and keep chord measure indexes consistent.

5. **Safe lyric placement**
   - Preserve the master Lyrics box and section formatting.
   - Change normal placement to fill only unassigned notes with lyrics not already represented by assigned note lyrics.
   - Add an explicit Re-place all action; request confirmation before overwriting existing note lyrics.
   - Keep master lyrics and per-note lyric mapping separate.

6. **Notation spacing**
   - Compute each measure’s minimum width from event duration/count, accidentals, chord labels, and lyric labels.
   - Reflow systems to give dense measures more room, while retaining readable staff behavior across mobile, tablet, and desktop.

7. **Localization and documentation**
   - Add Score-local EN/TH/SV strings for the new controls, with existing fallback behavior for other languages.
   - Add only a short README development note for this Score editing polish update.

## Verification
- Selectively test pure Score editing utilities and history behavior.
- Browser-check desktop keyboard history, touch controls, chord presets/custom chord, custom time, note lyric editing, incremental and full lyric placement, clear/delete measure confirmation, dense notation spacing, save/reopen, playback, linked recording, Print/PDF, Help, and Score filtering.
- Repeat the key editing flow at a mobile viewport and confirm no overlap or clipped controls.
- Confirm the preview build is clean and no unrelated files changed.

## Technical details
- Keep all new implementation under `src/features/score/` wherever possible.
- Preserve the persisted split between `score.lyrics` and each note event’s optional `lyric`.
- Keep chord symbols in `score.chords`; deleting a measure removes its chords and shifts later chord indexes.
- Time signatures remain serialized as validated `numerator/denominator` strings, so existing values remain compatible and future values remain extendable.
