# MyMuNotes V1.5.0 — Score Final Completion

## Scope

Complete the remaining Score-only polish while preserving all existing MyMuNotes behavior. V1.5.0 stays unreleased: no publish, deploy, GitHub update, popup, What’s New, or release notification.

## Implementation

1. **Compact shared Score toolbar**
   - Keep one toolbar for Add and Edit modes.
   - Place Undo, Redo, Note, Rest, Chord, duration, accidentals, and confirmed Clear Score in that toolbar.
   - Preserve selected-item editing, preview, move, pitch, direct lyric editing, delete, and exit; tapping empty staff exits Edit mode.

2. **Reuse the existing Lyrics editor completely**
   - Continue rendering the shared MyMuNotes Lyrics editor so its section insertion, cursor behavior, touch suggestions, outline, and editor controls remain intact.
   - Add Score-only Import, Place, and confirmed Re-place actions around that shared editor only.
   - Keep one Lyrics state in normal and fullscreen modes, with a compact fullscreen header and nearly full-height editor.

3. **Safe destructive actions and metadata**
   - Keep confirmed Clear Score for notation, chords, rests, and mapped lyrics only.
   - Add strongly confirmed Clear All / Start Over to the existing More menu; reset editable Score content and settings while preserving the note identity and original Created date.
   - Preserve Last edited semantics, duplicate timestamps, and JSON timestamp export.

4. **Clef correctness and help**
   - Remove clef-based pitch clamping during clef changes and selected-note edits so Treble/Bass changes only alter display.
   - Keep ledger-line rendering for pitches outside the staff.
   - Add localized Score help explaining that clef changes display, not pitch.

5. **Score output and existing PDF close**
   - Keep Score Print, Save as PDF, and Share PDF on the existing Score-only A4 renderer, including wrapping, pagination, text spacing, vector notation, metadata, page numbers, and footer.
   - Leave Text/Record output untouched except verify and, only if needed, repair the existing desktop PDF preview Close/X behavior.

6. **Verification and documentation**
   - Exercise add/edit/delete, preview, Undo/Redo and shortcuts, multi-word note lyrics, import/placement/re-placement, section insertion, both fullscreen sizes, both clear actions, timestamps, clef pitch preservation, persistence, and Score output.
   - Visually inspect short and multi-page A4 PDFs with long lyrics and chords.
   - Verify the existing Text/Record PDF preview closes on desktop.
   - Replace the current Score Final README line with one short dated development note covering only the requested topics; do not alter prior history.

## Technical details

- Keep Score changes under `src/features/score/`; only the shared desktop PDF close implementation may be touched outside it.
- Keep Score history session-local and persistence through the existing note repository.
- Use the existing `LyricsEditor`, Score player, Score print modules, shared confirmation dialog, and existing controls.
- Do not redesign unrelated UI or change Text/Record behavior.
