const MODIS_BASE_URL = "https://modis.ornl.gov/rst/api/v1";
const NDVI_PRODUCT = "MOD13Q1";
const NDVI_BAND = "250m_16_days_NDVI";
const NDVI_SCALE = 0.0001;
const NDVI_FILL_MIN_RAW = -2000; // below this is the product's fill/invalid sentinel (-3000)
const COMPOSITES_IN_WINDOW = 4; // ~64 days of 16-day composites
// shortcut: ORNL's subset service is slow and occasionally 503/504s; no retry here.
// One shared budget (not per-call) bounds the two sequential requests together —
// raise this if hit rate is too low, there's no hard reason it must be 18s.
const TOTAL_BUDGET_MS = 18000;

export interface NdviObservation {
  date: string;
  ndvi: number;
}

export interface NdviTrend {
  current: number;
  deltaPct: number;
  observations: NdviObservation[];
}

interface ModisComposite {
  modis_date: string;
  calendar_date: string;
}

interface ModisSubsetEntry {
  calendar_date: string;
  data: number[];
}

async function fetchModisJson(url: string, signal: AbortSignal): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`MODIS web service responded ${res.status}`);
  return res.json();
}

async function fetchRecentComposites(
  lat: number,
  lon: number,
  signal: AbortSignal
): Promise<ModisComposite[]> {
  const url =
    `${MODIS_BASE_URL}/${NDVI_PRODUCT}/dates` +
    `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}`;
  const json = (await fetchModisJson(url, signal)) as { dates?: ModisComposite[] };
  return (json.dates ?? []).slice(-COMPOSITES_IN_WINDOW);
}

async function fetchNdviSubset(
  lat: number,
  lon: number,
  composites: ModisComposite[],
  signal: AbortSignal
): Promise<ModisSubsetEntry[]> {
  const startDate = composites[0].modis_date;
  const endDate = composites[composites.length - 1].modis_date;
  const url =
    `${MODIS_BASE_URL}/${NDVI_PRODUCT}/subset` +
    `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&band=${NDVI_BAND}&startDate=${startDate}&endDate=${endDate}` +
    `&kmAboveBelow=0&kmLeftRight=0`;
  const json = (await fetchModisJson(url, signal)) as { subset?: ModisSubsetEntry[] };
  return json.subset ?? [];
}

function toObservations(entries: ModisSubsetEntry[]): NdviObservation[] {
  return entries
    .map((entry) => ({ date: entry.calendar_date, raw: entry.data?.[0] }))
    .filter(
      (e): e is { date: string; raw: number } =>
        typeof e.raw === "number" && e.raw >= NDVI_FILL_MIN_RAW
    )
    .map((e) => ({
      date: e.date,
      ndvi: Number((e.raw * NDVI_SCALE).toFixed(3)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function computeTrend(observations: NdviObservation[]): NdviTrend | null {
  if (observations.length < 2) return null;
  const first = observations[0].ndvi;
  const last = observations[observations.length - 1].ndvi;
  const base = Math.max(Math.abs(first), 0.05);
  return {
    current: last,
    deltaPct: Math.round(((last - first) / base) * 100),
    observations,
  };
}

/** NASA/ORNL DAAC MODIS vegetation-index trend for one point. Never throws — returns null when the service is unavailable, too slow, or data is insufficient. */
export async function fetchNdviTrend(
  lat: number,
  lon: number
): Promise<NdviTrend | null> {
  const controller = new AbortController();
  const budget = setTimeout(() => controller.abort(), TOTAL_BUDGET_MS);
  try {
    const composites = await fetchRecentComposites(lat, lon, controller.signal);
    if (composites.length < 2) return null;
    const subset = await fetchNdviSubset(lat, lon, composites, controller.signal);
    return computeTrend(toObservations(subset));
  } catch {
    return null;
  } finally {
    clearTimeout(budget);
  }
}
