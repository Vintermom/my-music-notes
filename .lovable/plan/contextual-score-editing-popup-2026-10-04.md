# Contextual Score Editing Popup

## What will change
- Keep the existing Score add toolbar visible and unchanged for Note, Rest, Chord, duration, dots, and accidentals.
- Remove its selected-note/rest/chord editing state so selecting existing content never replaces the add toolbar.
- Add one reusable contextual popup inside the Score staff for existing notes, rests, and chords.
- Reuse the current note controls and chord picker behavior; inline per-note lyrics remain directly below notes.

## Popup behavior
- Anchor the popup near the selected staff item and automatically place it above, below, or beside the item to remain inside the visible screen.
- Preserve the current staff and page scroll positions when opening, switching, and closing the popup.
- Close with ×, outside tap/click, or by selecting another item; selecting another item opens the popup for that item.
- Keep touch targets and controls identical across desktop, tablet, and mobile.

## Technical details
- Extend the Score editor’s existing calculated event/chord positions to report an anchor rectangle without changing notation or staff geometry.
- Extract the current selected-item controls into a Score-only popup component; continue calling the existing patch, move, tie, preview, delete, chord picker, and history handlers.
- Leave the chord picker dialog as the existing picker opened by “Change chord”; custom chords and deletion continue through the current flow.
- Keep Undo, Redo, and Clear Score in the main add toolbar.

## Verification and release
- Test a long Score at desktop, tablet, and phone widths, including notes and chords near the bottom, viewport containment, outside/× dismissal, selection switching, staff scroll preservation, and inline lyric editing.
- Confirm the compact mobile staff layout and protected Score features remain unchanged.
- Run project checks and the required security check, then publish the tested Main maintenance update without adding or changing any What’s New message.
