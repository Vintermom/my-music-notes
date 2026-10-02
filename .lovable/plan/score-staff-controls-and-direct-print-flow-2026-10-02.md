# Score staff controls and direct print flow

## What will change
- Keep the current Score editing toolbar exactly as it is.
- Place the existing Hint and Score Fullscreen controls at the top-right of the notation/staff container on all screen sizes.
- Keep the existing help content and fullscreen state; no duplicate Score editor state will be introduced.
- Remove the intermediate Text/Record print-preview popup from both Print and Export PDF actions.
- Send both actions directly into the existing hidden-frame browser print flow, preserving the generated Text/Record document content and layout.

## Protected behavior
- Do not change Score Print/PDF, Share, Audio export, or any generated document layout.
- Do not add the old popup to Score.
- Do not change the Score toolbar arrangement.

## Verification
- Check Score staff controls and fullscreen on desktop and mobile.
- Confirm Text/Record Print and Export PDF open the system print flow directly with no remaining app popup.
- Run type and focused lint checks and review preview diagnostics.
