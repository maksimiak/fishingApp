# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two distinct parts — do not confuse them:

- **`/` (repo root)** — HTML/JSX prototype: `index.html`, `data.js`, `screens.jsx`, `map.jsx`, `ui.jsx`, etc. This is a **visual + interaction spec, not production code**. Treat it as a design reference. The product brief in `CLAUDE_CODE_BRIEF.md` describes what each prototype piece becomes in production.
- **`/mobile`** — the actual shipping app: an Expo / React Native rewrite of the prototype. All real work happens here.

When the user says "the app" or asks to change behavior, they mean `mobile/`. `cd mobile/` before running anything.

## Commands (run from `mobile/`)

```bash
npm install
npm start              # expo start (Metro)
npm run android        # expo start --android
npm run ios            # expo start --ios
npm run web            # expo start --web
npm run lint           # expo lint (eslint-config-expo flat config)
npx tsc --noEmit       # type-check (strict mode is on)

# Builds (EAS, credentials in mobile/credentials.json + mobile/app-keystore.jks)
eas build -p android --profile preview        # internal APK
eas build -p android --profile production     # autoIncrement, .aab

# Regenerate map geometries from OSM (rarely needed)
node scripts/fetch-waterbodies.mjs            # writes src/data/waterbodies.geojson.json
```

There is **no test runner** wired up; do not invent `npm test`. The rule engine in `src/data/rules.ts` is a pure function and is the natural unit-test target if tests get added later.

## Architecture (`mobile/`)

### Routing — Expo Router file-based, two layers

`app/` is **only routing**. Screens live in `src/screens/` and are rendered by the route files. Adding a screen means: create the route file in `app/`, render the corresponding component from `src/screens/`.

```
app/_layout.tsx              Stack: (tabs) | waterbody/[id] | species/[id]
app/(tabs)/_layout.tsx       Bottom tabs: Map · Saved · Log · More
app/(tabs)/index.tsx         → renders <MapScreen/>
app/waterbody/[id].tsx       → renders <DetailScreen/>
app/species/[id].tsx         → renders <SpeciesScreen/>
```

### State — one Context, no Redux/Zustand

`src/state/AppState.tsx` provides everything global: `lang`, `savedIds`, `date`, `t` (translated copy). Use the `useApp()` hook. There is no async storage / persistence yet — saved spots reset on launch.

### Rules engine — pure function, client-side

`src/data/rules.ts` exports `getStatus(waterbody, date) → { status, openSpecies, closedSpecies, reasonLt/En, ... }`. Status is derived from each species' `closedSeason` tuple in `src/data/species.ts`. Per-water-body overrides are currently hardcoded inside `getStatus` (the Galvė winter closure is the only one) — this is known tech debt; a typed override schema is the next planned refactor.

Keep this module **pure and synchronous**. It runs inside `useMemo` on every render of the map and detail screens.

### Map — MapLibre + MapTiler vector tiles

`src/components/LithuaniaMapReal.tsx` is the production map. The simpler `LithuaniaMap.tsx` (stylized SVG) is the legacy fallback — don't extend it.

Two layers of interaction stacked on the same MapLibre view:

1. **Curated overlay** — `src/data/waterbodies.geojson.json` (10 hand-fetched OSM features, simplified with `@turf/simplify`) rendered as `GeoJSONSource` + fill/line layers, coloured by `getStatus()`. Taps go through `onPress` on the source and resolve to a `waterbody_id` we own.
2. **Tap-anywhere fallback** — when a tap doesn't hit the curated overlay, the `Map.onPress` handler calls `mapRef.current.queryRenderedFeatures(point, { layers: TILE_WATER_LAYERS })` against the MapTiler `outdoor-v2` style's visible water layers (`'Water'`, `'River'`, `'River tunnel'`) and surfaces the OSM name to the parent via `onSelectGeneric`.

**MapTiler gotchas**:
- Source name in `outdoor-v2` is `maptiler_planet`, **not** `openmaptiles`. Don't add invisible layers pointing at `openmaptiles` — they won't render and `queryRenderedFeatures` will return nothing.
- The visible layer IDs above are not stable across MapTiler styles; if the style changes, re-inspect `style.json` to find the new IDs.
- The MapTiler key lives in `app.json` under `expo.extra.maptilerKey` and is read via `Constants.expoConfig?.extra`.

**Camera framing**: use `initialViewState.bounds` + `padding` (fitBounds-style) rather than `centerCoordinate` + `zoomLevel` so Lithuania fills the viewport on every device. `LITHUANIA_BOUNDS` in `src/data/waterbodies.ts` is the source of truth.

### Data shapes & i18n

- All user-facing strings are bilingual: data objects expose `nameLt` / `nameEn` and `{ lt, en }` sub-objects; copy lookups go through `useApp().t` (which is `COPY[lang]` from `src/data/copy.ts`).
- New strings must be added to `COPY` for both `lt` and `en` — never hardcode.
- Lithuanian is the default and the priority. EN exists but isn't fully audited.

### Theme

`src/theme/colors.ts` is the only theme. The `THEMES` exploration in the prototype's `ui.jsx` is not used in production; only the `nature` palette ships, and only light mode for now.

## EAS Build setup

- `mobile/eas.json` defines `preview` (APK, internal) and `production` (AAB, autoIncrement) profiles, both using `credentialsSource: "local"`.
- The keystore (`mobile/app-keystore.jks`) and `mobile/credentials.json` live in the repo. They contain real signing credentials — never run `eas credentials` operations that could overwrite them, and don't commit additional copies.
- `expo.extra.eas.projectId` in `app.json` ties the build to the `gelding33` Expo account.

## Conventions worth knowing

- **TypeScript is strict.** No implicit any, no `// @ts-ignore` without a follow-up reason. The repo has had to thread MapLibre's `PressEventWithFeatures` through `NativeSyntheticEvent` to satisfy this — keep the pattern.
- **Bump `expo.version` in `app.json`** before each EAS build (the current convention is manual semver bumps, e.g. `1.3.1`).
- **Prefer editing `LithuaniaMapReal.tsx` over forking** when changing map behavior. The surface area (curated source + tap-anywhere) is small enough that a second map component would diverge fast.
- **`src/data/waterbodies.geojson.json` is generated.** If you need to edit geometries, change `scripts/fetch-waterbodies.mjs` and re-run it; don't hand-edit the JSON.
- **Overpass API requires a User-Agent header.** The fetch script sets one; if you write a new OSM-querying script, do the same or you'll get `406 Not Acceptable`.
