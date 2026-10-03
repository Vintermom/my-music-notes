# Compact Mobile Score Spacing

## Scope
- Keep the Score toolbar, note/clef/staff sizing, event placement, touch targets, inline lyric editing, playback, persistence, and all document output unchanged.
- Change only the on-screen Score staff layout on mobile; desktop/tablet behavior remains unchanged.

## Implementation
- Replace the fixed mobile staff-system height with per-system vertical bounds derived from actual content.
- Reserve top space only when a system contains chords, while retaining the measure action target and notation clearance.
- Reserve bottom space only when a system contains per-note lyrics or the active inline lyric field.
- Keep staff geometry and note glyph sizing intact; map pointer input, ties, highlights, chords, lyrics, and inline input through the same dynamic system offsets.
- Keep a compact minimum system gap so adjacent staves remain visually distinct and tappable.

## Verification
- Test a long mobile Score containing chord + lyrics, lyrics only, chord only, and simple/empty measures.
- Confirm inline lyric editing advances correctly and the selected field remains visible at a phone viewport.
- Confirm desktop layout and protected Score features remain unchanged, and check the current build and runtime status.

## Release
- Run the required security check, then publish the tested current Main build.
- Reuse the existing PWA update behavior without changing its message, popup architecture, or notification content.
