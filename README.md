# AgroShift NASA

Decision-support tool for the **Field Shift: Adapting Farms with NASA Data** challenge (NASA Space Apps Challenge 2026).

Pick any farm on Earth, see its real climate risks in plain language, and compare crop-rotation options backed by published agronomic science — in English, Spanish, French, or Portuguese.

## Features

- **Global field picker** — satellite map, geolocation, manual coordinates, or four preset farms across different climates (Sahel, coastal Peru, the Andes, Iowa).
- **Plain-language field diagnostics** — water, heat, crop-environment, and erosion risk as a traffic-light read on real NASA climate data, plus a 5-year trend and a satellite vegetation-vigor signal (MODIS NDVI).
- **Crop rotation comparator** — ranks rotation crops against the field's own climate/soil/slope, scored against FAO EcoCrop, FAO-56, RUSLE, and BNF literature, filterable by farmer priority (water, soil, climate resilience, erosion control).
- **AI Field Advisor (Gemini 2.5 Flash)** — grounded agronomic action plan synthesizing NASA POWER climate telemetry, MODIS NDVI vegetation vigor, and FAO crop rotation rankings.
- **7-day forecast** when a Meteomatics key is configured.

## Data sources

| Source | Used for |
|---|---|
| [NASA POWER](https://power.larc.nasa.gov/) | 30-day & 5-year temperature, humidity, rainfall, solar radiation, wind |
| [Open-Meteo elevation + soil moisture](https://open-meteo.com/) | Terrain slope (5-point sample) and 0–7 cm soil moisture |
| [ORNL DAAC MODIS/VIIRS subset service](https://modis.ornl.gov/) | MOD13Q1 NDVI trend (vegetation vigor), best-effort |
| [Google Gemini 2.5 Flash](https://aistudio.google.com/) | Grounded AI decision-support synthesis & practical action steps |
| [Meteomatics](https://www.meteomatics.com/) | 7-day forecast (optional, requires credentials) |

Scoring references: Penman (1948) / RELASPO for reference evaporation, FAO Irrigation & Drainage Paper 56 and the FAO EcoCrop database for crop water/thermal thresholds, RUSLE (USDA Handbook 703) for erosion cover factor, and Herridge et al. (2008) for biological nitrogen fixation.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4, Leaflet for the map, lucide-react for icons. No client-side state library — plain React state.

## Project structure

```
src/app/page.tsx               main UI (3-step flow: pick field → diagnose → compare rotations)
src/app/api/climate/route.ts   NASA POWER + elevation + soil + forecast (fast path)
src/app/api/ndvi/route.ts      MODIS NDVI, isolated in its own route (slow, best-effort)
src/app/api/ai-advisor/route.ts Gemini 2.5 Flash grounded assistant (with deterministic fallback)
src/lib/diagnostics.ts         risk-level logic + copy for the diagnostic cards
src/lib/rotations.ts           crop-rotation scoring
src/lib/providers/modisNdvi.ts  MODIS subset fetch/parse, decoupled from the HTTP layer
src/components/FarmMap.tsx     Leaflet map (satellite/street toggle, click-to-select)
```

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Environment variables (`.env.local`)

```bash
# Recommended: Enables Gemini 2.5 Flash grounded assistant via Google AI Studio
GEMINI_API_KEY=your_key_here

# Optional: Enables the 7-day Meteomatics forecast panel
METEOMATICS_USER=...
METEOMATICS_PASS=...
```

Without API keys, the application remains fully functional:
- If `GEMINI_API_KEY` is omitted, the AI Advisor automatically falls back to an offline deterministic agronomic rule-engine in all 4 supported languages (EN, ES, FR, PT).
- If Meteomatics keys are omitted, the 7-day forecast panel simply hides cleanly.

## Disclaimer

This tool surfaces climate patterns and rotation possibilities from open NASA/FAO data. It is decision support, not a replacement for a farmer's judgment or local agronomic experience.
