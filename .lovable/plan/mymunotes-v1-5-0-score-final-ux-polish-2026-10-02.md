# MyMuNotes V1.5.0 — Score Final UX Polish

## Scope

Finish the existing unreleased Score feature without changing Text, Record, Share, export, Home, Settings, or release messaging. Keep new behavior inside `src/features/score/` except for reuse of existing note components and storage actions.

## Implementation

1. **Header and metadata**
   - Remove the temporary build-check label.
   - Match the existing MyMuNotes note header: Back, Pin, Theme, existing Share button, and More menu.
   - Keep title and composer in the normal note-content area, then add Style, Tags, Created, and Last edited using existing controls and date formatting.
   - Route all real Score or metadata edits through the existing note repository so `createdAt` remains immutable and `updatedAt` changes only after an edit; opening the page remains read-only.

2. **One contextual Score toolbar**
   - Replace the separate fixed selection panel with the current Score entry toolbar switching between Add and Edit context.
   - In Edit context, show the selected note/rest name, selected duration/accidental, pitch and position controls, direct lyric input, preview, delete, and Done.
   - Make duration changes capacity-safe with the existing helpful message. Keep chord selection in the current chord picker with its existing edit/delete behavior.
   - Preserve Score-local visible Undo/Redo and keyboard shortcuts.

3. **Lyrics workflows**
   - Keep master Lyrics text and per-note mappings separate.
   - Add an in-feature chooser that copies lyrics from an existing non-Score Text/Lyrics note without linking or modifying the source.
   - Preserve incremental placement and confirmed Re-place all.
   - Add Lyrics fullscreen using the same state and the existing Done/Close interaction pattern, keeping import and placement actions available.

4. **Workspace and destructive actions**
   - Add Score fullscreen using the same live Score state and controls, including toolbar, Undo/Redo, playback, BPM, and volume.
   - Add confirmed Clear Score that clears measures, rests, chords, and per-note lyrics while retaining master Lyrics and all metadata.
   - Keep adaptive dense-measure reflow and verify it across phone, tablet, and desktop widths.

5. **Existing action patterns**
   - Use the current Share icon component; do not create a second Share system.
   - Add the existing More menu pattern with Score Print/PDF, JSON export, Duplicate, and Delete. Score Print/PDF continues through the isolated Score print module; non-Score Share/export/print code remains untouched.
   - Ensure duplicate timestamps are new and JSON retains both timestamps through the existing repository behavior.

6. **Verification and documentation**
   - Exercise note creation/edit/deletion, edit-mode duration and accidentals, selected-note preview, Undo/Redo, direct and incremental lyrics, lyrics import, both fullscreen views, reopen persistence, timestamps, JSON fields, playback, linked recording, and Print/PDF.
   - Test desktop, tablet, and mobile rendering and dense notation.
   - Add only one short V1.5.0 development note to README.

## Technical details

- Extend `useScoreNote` with metadata setters while preserving repository timestamp semantics.
- Keep history session-local; volume, linked recording, and note metadata stay outside notation history.
- Add focused Score components for the contextual toolbar, lyrics import chooser, fullscreen shells, and Score More menu where useful.
- Preview one selected note through the shared Score audio service rather than introducing a second playback engine.
- No release popup, update notice change, deployment, publication, or GitHub action.
