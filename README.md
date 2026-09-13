# MyMuNotes

## Brand rename

- **Brand/display name:** My Music Notes → MyMuNotes
- **Domain:** mmnotes.app — unchanged
- This is a display-name-only rename.

A beautiful songwriting note app for capturing your musical ideas, lyrics, and compositions.

## Features

- 📝 Create and manage song notes with lyrics, style, and metadata
- 🎨 Multiple color themes and note backgrounds
- 📌 Pin important notes (up to 6)
- 🔍 Search and sort notes
- 📤 Export/Import notes as JSON
- 🖨️ Print notes in text or app layout
- 🌐 Multi-language support (EN, SV, TH)
- 📱 PWA installable on mobile

## V1.4.0 — Voice Update (internal notes)

Included in V1.4.0:

- Advanced Voice controls (`+ Voice`, multi-select, functional categories, EN/TH/SV hints & search)
- Environment separated from Voice (`+ Environment`, single-select: Studio, Concert, Outdoor, Outdoor Café)
- Studio environment wording clarified — describes a studio recording room only; does not imply acoustic/minimal arrangement or genre
- Presets moved before `+ Style`
- Preset hints added (EN / TH / SV)
- Preset prompt output upgraded to concise producer-style prompts
- Lyrics → Insert improved
  - Section is now optional
  - Instrument or Vocal Effect can be inserted without selecting a Section
  - Vocal Effects are multi-select, e.g. `[Chorus (Backing vocals, Harmony)]`
  - No-Section output keeps instruments and vocal effects on separate lines, e.g. `[Piano, Violin]` + `[Backing vocals, Harmony]`
  - Section-based syntax unchanged, e.g. `[Intro Piano, Synth lead (Whisper)]`
- Added Sections: Post-Chorus, Hook, Refrain, Build, Drop, Breakdown, Interlude
- Added Vocal Effects: Harmony, Backing vocals, Call and response, Chant
- Style Full Screen (expand icon; same Style state as the normal field, no extra save step)
- Remove All via trash icon for Lyrics and Style (confirmation dialog, per-field only, disabled when empty)
- My Styles / Saved Styles — user-saved reusable Style prompts (save with name, insert, rename, delete; stored locally under `mymusicnotes_myStyles`, shared across notes, never auto-saved)
- Style remains up to 2000 characters (counter format `825/2000`)
- Text 1001–N selection helper (appears when Style > 1000 chars; selects that range in the existing textarea)
- Copy menu when Style > 1000 chars: Copy 1–1000 / Copy 1001–N / Copy all (single Copy icon; ≤1000 copies immediately)

Also included in V1.4.0 — Share / Save (additive):

- Share current song from a new Share icon in the editor header (before the three-dot menu)
- Share PDF (Share-specific PDF builder; existing Print / Export PDF untouched)
  - A4 portrait, white background, comfortable margins, natural multi-page flow (long songs continue onto page 2, 3, …)
  - Content order: Song Title, Composer, Lyrics, then Style / Extra Info / Tags only when they have content
  - Lyrics are preserved exactly: line breaks, blank lines, indentation and user-written section labels such as `[Verse 1]` / `[Chorus]`
  - Real Unicode text (not a screenshot): Thai (vowels and tone marks positioned correctly), Swedish (å ä ö Å Ä Ö), English, Korean, Japanese and mixed-language lyrics
  - Locally bundled SIL-OFL fonts in `public/fonts/share/` (Noto Sans, Noto Sans Thai, Noto Sans KR, Noto Sans JP); only the fonts needed for the song's scripts are loaded, and they are cached after first use
  - Small footer `MyMuNotes • V1.4.0` with page numbers; no internal IDs or technical metadata
- Share Audio (existing recording, read-only, not re-encoded; option hidden when no recording exists)
- Share All Files — shares PDF + Audio together as multiple files when the device supports it
- All Files checks `navigator.canShare({ files })` with both files before sharing; when multiple-file sharing is unsupported it falls back to downloading PDF and Audio separately
- All Files with no recording falls back to PDF only
- Save All to Folder — when the browser/platform provides a user-approved folder capability (`showDirectoryPicker`), the user picks a location and a `Song-Title/` folder is created containing `Song-Title.pdf` and the recording (PDF only when there is no recording)
- Save All fallback — where folder access is unavailable (or denied), the same files are saved/downloaded separately with matching song-based filenames; no ZIP, no server
- JSON is not part of Share — JSON remains available through the existing (...) > Export JSON option, unchanged
- Native device/browser Share Sheet via the Web Share API (`navigator.share` + `navigator.canShare({ files })`)
- Mail / Gmail / Google Drive / iCloud Drive / Files / AirDrop / other apps are chosen by the operating system Share Sheet, not by the app
- Download fallback when native file sharing is unsupported or fails
- Local-first privacy: all files (including the PDF) are prepared on-device, nothing is uploaded to any server
- No direct cloud API integration (no Gmail/Drive/iCloud/Dropbox APIs, no OAuth, no sync)
- Files leave the device only when the user explicitly chooses to share or save them
- Share cancellation and folder-picker cancellation are treated as normal actions, not errors
- Share code lives in `src/features/share/` (`ShareButton`, `ShareMenu`, `shareService`, `exporters/`, `pdf/sharePdfFonts`, `utils/` incl. `folderSave`); no ZIP packaging is used

Explicitly not included:

- No SFX system was added
- No Symbols toolbar was added
- No user-facing What's New / update popup is enabled

## Technology Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- localStorage (no backend required)

## Development

```sh
npm install
npm run dev
```

## Release Checklist

### Security Checks Performed

- ✅ **XSS Prevention**: All user content rendered as plain text (no dangerouslySetInnerHTML)
- ✅ **Input Limits**: Field limits enforced (title/composer: 200, lyrics: 50K, style: 500, tags: 20×50)
- ✅ **Storage Validation**: Schema versioning (v1), corruption handling, safe defaults
- ✅ **Import Safety**: JSON-only, 3MB limit, strict schema validation, backup before import
- ✅ **Export Safety**: Includes schema version, sanitized filenames
- ✅ **Privacy**: Local-only storage note in Settings/About
- ✅ **No Secrets**: No API keys or tokens in codebase

### Web/PWA Release Steps

1. Run `npm run build` to create production build
2. Test PWA installation on mobile browsers
3. Verify offline functionality
4. Deploy static files to hosting (Vercel, Netlify, GitHub Pages, etc.)

### Android/Play Store Release Steps

This project uses Capacitor for native Android builds.

1. Clone the repo and install dependencies: `npm install`
2. If not added yet: `npx cap add android`
3. Build and sync: `npm run build && npx cap sync android`
4. Open in Android Studio: `npx cap open android`
5. In Android Studio:
   - Update `versionCode` (integer, increment each release)
   - Update `versionName` (e.g., "1.0.0")
   - Generate signed APK/AAB for Play Store
6. Ensure no unnecessary permissions in AndroidManifest.xml

**Capacitor Config** (set in `capacitor.config.ts`):
- `appId: "io.vintermom.mymusicnotes"`
- `appName: "MyMuNotes"`
- `webDir: "dist"`

### Version Management

- Storage schema: `STORAGE_SCHEMA_VERSION = 1` (in `src/domain/types.ts`)
- App version: Update in `src/i18n/locales/*.ts` (`settings.version`)
- Android: Update in `android/app/build.gradle`

## License

MIT
