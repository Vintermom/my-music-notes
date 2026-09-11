# My Music Notes

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

- Advanced Voice controls
- Environment separated from Voice
- Presets moved before `+ Style`
- Preset hints added (EN / TH / SV)
- Preset prompt output upgraded to concise producer-style prompts
- Lyrics → Insert improved
  - Section is now optional
  - Instrument or Vocal Effect can be inserted without selecting a Section
  - No-Section output keeps instruments and vocal effect on separate lines, e.g. `[Piano, Violin]` + `[Backing vocals]`
  - Section-based syntax unchanged, e.g. `[Intro Piano, Synth lead (Whisper)]`
- Added Sections: Post-Chorus, Hook, Refrain, Build, Drop, Breakdown, Interlude
- Added Vocal Effects: Harmony, Backing vocals, Call and response, Chant

Explicitly not included:

- No SFX system was added
- No Symbols toolbar was added
- No user-facing What's New / update popup is enabled yet

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
- `appName: "My Music Notes"`
- `webDir: "dist"`

### Version Management

- Storage schema: `STORAGE_SCHEMA_VERSION = 1` (in `src/domain/types.ts`)
- App version: Update in `src/i18n/locales/*.ts` (`settings.version`)
- Android: Update in `android/app/build.gradle`

## License

MIT
