# Fishing App — Claude Code Handoff Brief

A Lithuanian recreational fishing app. Tells anglers where they can fish today, lets them save spots, and shows which fish live in each water body.

The HTML prototype in this project (`Fishing App.html` + `data.js`, `screens.jsx`, `map.jsx`, `ui.jsx`) is a **visual + interaction spec, not production code**. Treat it as a design reference.

---

## 1. Product scope

### Core features (MVP)
1. **Map of Lithuania** with color-coded fishing status (green = allowed, amber = partial, red = prohibited) per water body, for today's date
2. **Water body detail** — rules, calendar of allowed/restricted days, species list, weather
3. **Species detail** — regulation info (min size, bag limit, closed season), habitat, best bait/time
4. **Saved spots** — bookmark water bodies for quick access
5. **Search** — find water bodies by name

### Secondary features (v1.1+)
- Catch log / diary (photo + species + size + weight + location)
- Weather & bite forecast
- Licence storage / purchase link

### Out of scope for v1
- Social / community feed
- Friends, group trips
- Gear checklist
- Moon phase / solunar calculators
- Notifications

---

## 2. Navigation map

```
Bottom tab bar: Map · Saved · Log · More

Map
  └─ (tap water body on map OR search result)
      └─ Water body detail
          ├─ Rules tab        (per-species yes/no + general rules)
          ├─ Calendar tab     (month grid, color-coded days)
          ├─ Species tab      (list of species in this water body)
          │   └─ Species detail (tap any species)
          └─ Weather tab      (bite index + conditions)

Saved
  └─ Water body detail (same as above)

Log
  └─ Individual catch entry (not designed yet — see open questions)

More
  ├─ Licence card (static in v1)
  ├─ Buy licence (external link)
  ├─ Report violation
  └─ Help / About
```

Species detail can be reached from Rules tab or Species tab.

---

## 3. Placeholder → production mapping

The prototype has stand-ins. Here's what each one becomes in production:

| Prototype | Production |
|---|---|
| Stylized SVG map of Lithuania (`map.jsx`) | **MapLibre GL** or Mapbox with OSM tiles + real Lithuanian water body polygons from [OpenStreetMap](https://www.openstreetmap.org/) (or national GIS data from geoportal.lt) |
| Hand-coded rules in `data.js` (`SPECIES` array, `getStatus()`) | **Rules service** — admin-editable content, versioned. Source of truth: Aplinkos apsaugos agentūra (AAA) / zvejogidas.lt. Needs per-water-body overrides (some lakes have custom rules). |
| `getForecast()` mock data | [meteo.lt API](https://api.meteo.lt/) (native LT) or [Open-Meteo](https://open-meteo.com/) |
| Fish SVG silhouettes in `ui.jsx` (`FishIcon`) | Commissioned species illustrations (PNG/SVG, 2–3 sizes) |
| `SAVED_SPOTS` array, `MY_CATCHES` array | Backend (Supabase or Firebase): auth + per-user saved spots + catch log + photo storage |
| Static licence card in `MoreScreen` | Integration with *Elektroninė žvejybos sistema* (or at minimum, link out + let user photo-upload their paper licence) |
| 10 hardcoded water bodies | Full dataset — ~3000 named Lithuanian lakes + major rivers. Start with top ~200 by popularity. |

---

## 4. Data model (proposed)

```ts
WaterBody {
  id, nameLt, nameEn, type: 'lake'|'river'|'reservoir'|'lagoon',
  geometry: GeoJSON polygon/line,
  region, area,
  speciesIds: string[],
  customRules?: RuleOverride[],   // e.g. winter closure on Galvė
  licenceRequired?: boolean,
  note?: { lt, en },
}

Species {
  id, nameLt, nameEn, latin,
  minSizeCm, bagLimit,
  closedSeasons: [{ startMonth, startDay, endMonth, endDay, reason }],
  habitat, bestBait, bestTime, description,
  illustrationUrl,
}

User {
  id, email, licenceNumber?, savedSpotIds[], locale: 'lt'|'en',
}

Catch {
  id, userId, speciesId, waterBodyId,
  lengthCm, weightKg, caughtAt, photoUrl?, notes?,
}
```

The **rule engine** (`getStatus(waterBody, date)`) takes a water body + date and returns `{ status: 'open'|'partial'|'closed', openSpecies[], closedSpecies[], reason, warning }`. Keep this as a pure function so it can run client-side (offline) and server-side (for push notifications later).

---

## 5. Tech stack preference

**Recommended: React Native with Expo** — one codebase for iOS + Android, maps cleanly to the React prototype.

- Navigation: `expo-router` or `@react-navigation/native`
- Map: `react-native-maplibre-gl` or `@rnmapbox/maps`
- State: React Query for server data, Zustand for local
- Backend: Supabase (auth + Postgres + storage + row-level security)
- i18n: `i18next` with namespaces `lt` / `en`
- Offline: cache water body + species data so map works without signal (anglers are often out of coverage)

If you prefer native (Swift + Kotlin), the data model and rule engine still apply — just reimplement.

---

## 6. Design tokens

All tokens are defined in `ui.jsx` under `THEMES`. Use the **`nature`** theme as the default — the other three (light/dark/marine) were exploration, not shipping variants. Only `nature` + `dark` mode for launch.

Key colors:
- accent: `#4a7048` (moss green)
- success: `#3d7a4a`, successSoft: `#dfecd6`
- warning: `#c98a2e`, warningSoft: `#f5e4c1`
- danger: `#b54842`, dangerSoft: `#f3d6d0`
- ink: `#1f2619`, inkMuted: `#5a6550`, inkSubtle: `#8a9378`
- bg: `#f4f2ea`, card: `#ffffff`, surfaceAlt: `#ede9d9`

Type: system sans (SF / Roboto). Title 26–34px / 700, body 14px / 500, small 11–12px.

---

## 7. Language

**Lithuanian first.** EN is a later add-on (nice-to-have, not blocking). All user-facing strings should go through i18n from day one even if only LT is shipped — don't hardcode.

See `COPY` in `data.js` for the existing string dictionary. Tone: practical and factual, like a government service. Short, clear, no exclamation marks.

---

## 8. Open questions to resolve with the user before building

1. **Who supplies rules data?** Scrape/attribution deal with zvejogidas.lt, or partner with AAA, or hire someone to maintain a CMS?
2. **Offline behavior** — cache last-seen rules + map tiles? How stale is acceptable?
3. **Licence integration** — any connection to the official e-licence system, or just link out + photo upload?
4. **Photo storage cost/quotas** — catch log can grow fast; cap per user?
5. **Launch geography** — LT only, or also Latvia/Estonia for v1.1?

---

## 9. Suggested milestones

**M1 — Foundation (2 weeks)**
Expo project, navigation, design tokens, i18n scaffold, mock data replicating current prototype.

**M2 — Real map (2–3 weeks)**
MapLibre integration, top 50 water bodies from OSM, color overlay driven by rule engine.

**M3 — Rules + species content (2 weeks)**
Migrate hand-coded rules to Supabase, admin dashboard for editing, content entered for top 50 water bodies + ~15 species.

**M4 — Accounts & saved spots (1 week)**
Supabase auth, saved spots sync.

**M5 — Catch log (2 weeks)**
Add-catch flow, photo upload, list + detail views.

**M6 — Weather (1 week)**
meteo.lt integration, bite index calculation.

**M7 — Polish + beta (2 weeks)**
Onboarding, empty states, settings, testing with real anglers in LT.

---

## 10. What to deliver back first

Before writing screens, please:
1. Confirm the data model in section 4 and propose a Supabase schema
2. Scaffold the Expo project with navigation + theme + i18n
3. Build the **rule engine** as a unit-tested module — it's the heart of the app and we want to get it right
4. Then start on the Map screen

Ship a walkthrough of each milestone as a short video or screenshots.
