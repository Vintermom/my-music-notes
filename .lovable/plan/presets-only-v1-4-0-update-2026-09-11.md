# Presets-only V1.4.0 update

## Scope
- Move the existing **Presets** action before **+ Style** without changing control styling or wrapping.
- Add a subtle localized Presets introduction in English, Thai, and Swedish.
- Extend the existing preset data model with localized hints and search keywords.
- Preserve every preset ID, title, category, and BPM while replacing only its prompt with a concise V6 producer-style music/arrangement prompt.
- Keep Voice, Environment, Lyrics, storage, exports, versioning, and update notifications untouched.

## Implementation
- Update the dedicated Presets type and data module so each existing preset owns `hint.en`, `hint.th`, `hint.sv`, and `searchKeywords` alongside its upgraded prompt.
- Update only the existing Presets sheet to localize its introduction and per-card hint, and include the new data in search.
- Change the Style action order in the editor and preserve the existing insertion pathway, ensuring preset text is appended safely rather than replacing existing Style text.

## Verification
- Confirm all 40 existing presets remain with unchanged titles, categories, and BPM values.
- Check prompts contain no Voice-control or Environment instructions.
- Verify English, Thai, and Swedish intro/card hints, search, insertion, Style preservation, and editability.
- Verify the unchanged Voice, Environment, and Lyrics controls remain present and no update announcement appears.
