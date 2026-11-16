"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  Sprout,
  MapPin,
  LocateFixed,
  CloudRain,
  Thermometer,
  Sun,
  Droplets,
  Loader2,
  CheckCircle2,
  Mountain,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Repeat,
  Globe,
  Sparkles,
  Satellite,
  Printer,
  AlertTriangle,
  Search,
  X,
  FileText,
  Download,
  CheckCheck,

} from "lucide-react";
import type { GeoResult } from "@/app/api/geocode/route";
import type { DynamicCropResponse } from "@/app/api/crops/evaluate/route";
import { generateParcelPdf, type DossierData } from "@/lib/pdfGenerator";
import { FARM_PRESETS, type FarmPreset } from "@/data/farms";

import {
  analyzeTrend5y,
  buildFieldDiagnostics,
  detectAgroZone,
  type ClimateMetrics,
  type RiskLevel,
} from "@/lib/diagnostics";
import {
  evaluateCropRotations,
  evaluateSingleCrop,
  CROP_CATALOG,
  type CurrentCropType,
  type FarmerPriority,
} from "@/lib/rotations";
import { LANG_LABELS, T, type Lang } from "@/lib/i18n";
import type { Forecast7d, HistoryYear } from "@/app/api/climate/route";
import type { AdvisorResponse } from "@/app/api/ai-advisor/route";
import type { NdviTrend } from "@/lib/providers/modisNdvi";
import Logo from "@/components/Logo";
import type { MapSelectionMode } from "@/components/FarmMap";
import {
  computePolygonMetrics,
  formatHectares,
  formatPerimeter,
  type LatLon,
} from "@/lib/geo";

const FarmMap = dynamic(() => import("@/components/FarmMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center rounded-2xl border border-line bg-panel text-sm text-ink-muted sm:h-80">
      <Loader2 className="h-5 w-5 animate-spin text-amber" />
    </div>
  ),
});

const LEVEL_STYLES: Record<
  RiskLevel,
  { border: string; text: string; dot: string }
> = {
  good: {
    border: "border-green/30 bg-green/5",
    text: "text-green",
    dot: "bg-green",
  },
  warn: {
    border: "border-amber/30 bg-amber/5",
    text: "text-amber",
    dot: "bg-amber",
  },
  alert: {
    border: "border-rose/35 bg-rose/5",
    text: "text-rose",
    dot: "bg-rose",
  },
};

const FEASIBILITY_STYLES = {
  optimal: {
    badge: "border-green/40 bg-green/10 text-green",
    dot: "bg-green",
  },
  manageable: {
    badge: "border-amber/40 bg-amber/10 text-amber",
    dot: "bg-amber",
  },
  critical: {
    badge: "border-rose/40 bg-rose/10 text-rose",
    dot: "bg-rose",
  },
};

const FEASIBILITY_LABELS: Record<"optimal" | "manageable" | "critical", Record<Lang, string>> = {
  optimal: { en: "Optimal Fit", es: "Apto / Óptimo", fr: "Optimal", pt: "Ideal / Ótimo" },
  manageable: {
    en: "Manageable with Mitigation",
    es: "Manejable con Mitigación",
    fr: "Gérable avec atténuation",
    pt: "Manejável com Mitigação",
  },
  critical: {
    en: "Critical Inviability",
    es: "Inviable / Crítico",
    fr: "Critique / Inviable",
    pt: "Inviável / Crítico",
  },
};

const CARD_ICONS = {
  water: Droplets,
  heat: Thermometer,
  health: Sprout,
  erosion: Mountain,
  vegetation: Satellite,
};

// Icon color = category (always the same metric), independent of the badge
// color = severity (good/warn/alert) — two channels, not one, so cards don't
// all blur into the same hue when several happen to share a risk level.
const CARD_ICON_COLORS: Record<keyof typeof CARD_ICONS, string> = {
  water: "text-cyan",
  heat: "text-amber",
  health: "text-green",
  erosion: "text-stone",
  vegetation: "text-ink-muted",
};

const PRIORITY_ICONS = {
  water: Droplets,
  soil: Sprout,
  climate: Thermometer,
  erosion: Mountain,
} as const;

// Same fixed category colors as CARD_ICON_COLORS — a priority button always
// means the same thing, regardless of whether it's the active selection.
const PRIORITY_COLORS: Record<keyof typeof PRIORITY_ICONS, string> = {
  water: "text-cyan",
  soil: "text-green",
  climate: "text-amber",
  erosion: "text-stone",
};

function formatUtc(d: Date) {
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss} UTC`;
}

function StepEyebrow({ n, label, title }: { n: string; label: string; title: string }) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <span
        aria-hidden
        className="select-none font-display text-4xl font-bold leading-none text-line-strong sm:text-5xl"
      >
        {n}
      </span>
      <div className="pt-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">
          {label}
        </span>
        <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("en");
  const [lat, setLat] = useState<number>(FARM_PRESETS[0].lat);
  const [lon, setLon] = useState<number>(FARM_PRESETS[0].lon);
  const [latInput, setLatInput] = useState<string>(String(FARM_PRESETS[0].lat));
  const [lonInput, setLonInput] = useState<string>(String(FARM_PRESETS[0].lon));
  const [targetZoom, setTargetZoom] = useState<number | undefined>(undefined);
  const [zoomTrigger, setZoomTrigger] = useState<number>(0);
  const [selectionMode, setSelectionMode] = useState<MapSelectionMode>("point");
  const [polygonPoints, setPolygonPoints] = useState<LatLon[]>([]);

  const [placeQuery, setPlaceQuery] = useState<string>("");
  const [placeResults, setPlaceResults] = useState<GeoResult[]>([]);
  const [placeLoading, setPlaceLoading] = useState<boolean>(false);
  const [placeOpen, setPlaceOpen] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<GeoResult | null>(null);
  const placeBoxRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [climate, setClimate] = useState<ClimateMetrics | null>(null);
  const [forecast, setForecast] = useState<Forecast7d | null>(null);
  const [history5y, setHistory5y] = useState<HistoryYear[]>([]);
  const [ndvi, setNdvi] = useState<NdviTrend | null>(null);
  const [ndviLoading, setNdviLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);
  const [showCropScience, setShowCropScience] = useState<boolean>(false);
  const [priority, setPriority] = useState<FarmerPriority>("water");
  const [checkedCropId, setCheckedCropId] = useState<string>("tomato");
  const [customCropQuery, setCustomCropQuery] = useState<string>("");
  const [dynamicCropLoading, setDynamicCropLoading] = useState<boolean>(false);
  const [dynamicCropResult, setDynamicCropResult] = useState<DynamicCropResponse | null>(null);
  const [dynamicCropError, setDynamicCropError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [currentCropType, setCurrentCropType] = useState<CurrentCropType>(
    FARM_PRESETS[0].defaultCropType
  );
  const [aiPlan, setAiPlan] = useState<AdvisorResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [dossierDownloaded, setDossierDownloaded] = useState<boolean>(false);
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.language) {
      const code = navigator.language.slice(0, 2).toLowerCase();
      if (code === "es" || code === "fr" || code === "pt" || code === "en") {
        setLang(code);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    setClock(formatUtc(new Date()));
    const id = setInterval(() => setClock(formatUtc(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  const t = T[lang];

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMsg(null);

    fetch(`/api/climate?lat=${lat}&lon=${lon}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "NASA API error");
        return data;
      })
      .then((data) => {
        if (!active) return;
        setClimate(data.summary);
        setForecast(data.forecast ?? null);
        setHistory5y(data.history5y ?? []);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setErrorMsg(err.message || "Could not load NASA climate data");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lat, lon]);

  useEffect(() => {
    setAiPlan(null);
    setDynamicCropResult(null);
  }, [lat, lon, priority, currentCropType, lang]);

  // NDVI (MODIS) is a slow, best-effort satellite lookup — fetched on its own
  // request so it never delays the climate/diagnostics/rotation sections above.
  useEffect(() => {
    let active = true;
    setNdvi(null);
    setNdviLoading(true);

    fetch(`/api/ndvi?lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setNdvi(data.ndvi ?? null);
      })
      .catch(() => {
        if (active) setNdvi(null);
      })
      .finally(() => {
        if (active) setNdviLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lat, lon]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        placeBoxRef.current &&
        !placeBoxRef.current.contains(e.target as Node)
      ) {
        setPlaceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const q = placeQuery.trim();
    if (q.length < 2) {
      setPlaceResults([]);
      setPlaceLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setPlaceLoading(true);
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(q)}&lang=${lang}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = (await res.json()) as { results?: GeoResult[] };
          setPlaceResults(data.results ?? []);
        } else {
          setPlaceResults([]);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setPlaceResults([]);
        }
      } finally {
        setPlaceLoading(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [placeQuery, lang]);

  function formatPlaceLabel(place: GeoResult) {
    return [place.name, place.admin1, place.country]
      .filter((v): v is string => Boolean(v && v.trim()))
      .filter((v, idx, arr) => arr.indexOf(v) === idx)
      .join(", ");
  }

  const polygonMetrics = computePolygonMetrics(polygonPoints);

  useEffect(() => {
    if (
      selectionMode !== "perimeter" ||
      polygonPoints.length < 3 ||
      !polygonMetrics
    ) {
      return;
    }

    const { lat: cLat, lon: cLon } = polygonMetrics.centroid;
    const timer = window.setTimeout(() => {
      setSelectedPlace(null);
      setLat(cLat);
      setLon(cLon);
      setLatInput(String(cLat));
      setLonInput(String(cLon));
    }, 550);

    return () => window.clearTimeout(timer);
    // Sync parcel centroid to NASA/MODIS only after user finishes placing corners
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionMode, polygonPoints]);

  function handleChangeSelectionMode(nextMode: MapSelectionMode) {
    setSelectionMode(nextMode);
    if (nextMode === "point") {
      setPolygonPoints([]);
    }
  }

  function handleSelectGeoResult(result: GeoResult) {
    setSelectedPlace(result);
    setPlaceQuery(formatPlaceLabel(result));
    setPlaceOpen(false);
    setPolygonPoints([]);
    setLat(result.lat);
    setLon(result.lon);
    setLatInput(String(result.lat));
    setLonInput(String(result.lon));
    setTargetZoom(result.recommendedZoom);
    setZoomTrigger((n) => n + 1);
  }

  function handleMapClick(newLat: number, newLon: number) {
    setSelectedPlace(null);
    setTargetZoom(undefined);
    setLat(newLat);
    setLon(newLon);
    setLatInput(String(newLat));
    setLonInput(String(newLon));
  }

  function applyManualCoords(e: React.FormEvent) {
    e.preventDefault();
    const parsedLat = Number(latInput);
    const parsedLon = Number(lonInput);
    if (
      !Number.isFinite(parsedLat) ||
      !Number.isFinite(parsedLon) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLon < -180 ||
      parsedLon > 180
    ) {
      setErrorMsg(t.invalidCoords);
      return;
    }
    setSelectedPlace(null);
    setSelectionMode("point");
    setPolygonPoints([]);
    setLat(Number(parsedLat.toFixed(4)));
    setLon(Number(parsedLon.toFixed(4)));
    setTargetZoom(10);
    setZoomTrigger((n) => n + 1);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setErrorMsg(t.geoUnsupported);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const myLat = Number(pos.coords.latitude.toFixed(4));
        const myLon = Number(pos.coords.longitude.toFixed(4));
        setSelectedPlace(null);
        setSelectionMode("point");
        setPolygonPoints([]);
        setLat(myLat);
        setLon(myLon);
        setLatInput(String(myLat));
        setLonInput(String(myLon));
        setTargetZoom(12);
        setZoomTrigger((n) => n + 1);
        setLocating(false);
      },
      () => {
        setErrorMsg(t.geoError);
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }

  const hasDelimitedArea =
    selectionMode === "perimeter" &&
    polygonPoints.length >= 3 &&
    polygonMetrics !== null;

  const activeLabel = hasDelimitedArea
    ? `${t.delimitedParcel} (${formatHectares(polygonMetrics.areaHa)} ha)`
    : selectedPlace
      ? formatPlaceLabel(selectedPlace)
      : `${t.customParcel} (${lat.toFixed(2)}, ${lon.toFixed(2)})`;

  async function handleSearchCropApi(queryToSearch?: string) {
    const query = (queryToSearch ?? customCropQuery).trim();
    if (!query || !climate) return;

    setDynamicCropLoading(true);
    setDynamicCropError(null);

    try {
      const res = await fetch("/api/crops/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: query,
          lat,
          lon,
          climate,
          trend5y,
          ndvi,
          lang,
        }),
      });

      if (!res.ok) {
        throw new Error("Error en la consulta a la API agronómica");
      }

      const data: DynamicCropResponse = await res.json();
      setDynamicCropResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo consultar la API";
      setDynamicCropError(msg);
    } finally {
      setDynamicCropLoading(false);
    }
  }

  const agroZone = climate ? detectAgroZone(lat, climate) : null;

  const diagnostic = climate
    ? buildFieldDiagnostics(climate, lang, undefined, ndvi)
    : null;

  const trend5y = analyzeTrend5y(history5y, lang);

  const rotations =
    climate && agroZone
      ? evaluateCropRotations(
          climate,
          agroZone,
          priority,
          lang,
          undefined,
          currentCropType,
          "all"
        )
      : [];

  const checkedCrop =
    climate && agroZone
      ? evaluateSingleCrop(
          CROP_CATALOG.find((c) => c.id === checkedCropId) ?? CROP_CATALOG[0],
          climate,
          priority,
          lang,
          undefined,
          currentCropType
        )
      : null;

  const activeProblem = t.problemByCrop[currentCropType];

  function handleDownloadPdf() {
    if (!climate || !agroZone) return;
    setIsGeneratingPdf(true);

    try {
      const dossierData: DossierData = {
        parcelName: activeLabel,
        lat,
        lon,
        agroZoneLabel: t.zones[agroZone],
        elevationM: climate.elevationM ?? 200,
        slopePct: climate.slopePct ?? 2,
        polygonMetrics,
        currentCropType,
        currentCropLabel: t.currentCropTypes[currentCropType],
        climate,
        trend5y,
        ndvi,
        priority,
        topRotations: rotations.slice(0, 3).map((r) => ({
          name: r.name,
          scientificName: r.scientificName,
          category: r.category,
          matchScore: r.matchScore,
          waterDemand: `${r.waterRangeMm[0]}–${r.waterRangeMm[1]} mm`,
          nitrogenFixation:
            r.bnfKgNHa[1] > 0 ? `+${r.bnfKgNHa[0]}–${r.bnfKgNHa[1]} kg N/ha` : "0 kg N",
        })),
        lang,
      };

      const doc = generateParcelPdf(dossierData);
      const cleanName = activeLabel.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 24);
      doc.save(`AgroShift_Ficha_Parcela_${cleanName}.pdf`);
      setDossierDownloaded(true);
      setTimeout(() => setDossierDownloaded(false), 4000);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1440px] space-y-8 px-5 py-8 sm:space-y-10 sm:px-8 sm:py-10">
      <header className="animate-fade-up relative border-b border-dashed border-line pb-5 sm:pb-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden"
        >
          <div className="animate-scan h-px w-1/3 bg-gradient-to-r from-transparent via-amber to-transparent" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 font-mono text-xs font-medium text-amber">
            <span className="animate-pulse-slow h-1.5 w-1.5 rounded-full bg-amber" />
            {t.badge}
          </div>
          <div
            className="font-mono text-[11px] tracking-wider text-ink-faint"
            suppressHydrationWarning
          >
            {clock ?? "--:--:-- UTC"}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Logo className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" />
              <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                AgroShift <span className="text-amber">NASA</span>
              </h1>
            </div>
            <p className="max-w-2xl text-sm text-ink-muted sm:text-base">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel px-3 py-1.5 font-mono text-xs font-semibold text-ink-muted transition hover:border-cyan/40 hover:text-cyan"
              title={t.printDossierLabel}
            >
              <Printer className="h-3.5 w-3.5 text-cyan" />
              <span>{t.printDossierLabel}</span>
            </button>

            <div className="flex w-fit items-center gap-1 rounded-xl border border-line bg-panel p-1">
              <Globe className="mx-1.5 h-3.5 w-3.5 text-ink-faint" />
              {(["en", "es", "fr", "pt"] as Lang[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition ${
                    lang === code
                      ? "bg-panel-raised text-ink"
                      : "text-ink-faint hover:text-ink"
                  }`}
                >
                  {LANG_LABELS[code]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* STEP 1: GLOBAL FIELD SELECTOR */}
      <section
        className="animate-fade-up rounded-lg border border-line bg-panel/70 p-5 sm:p-7"
        style={{ animationDelay: "80ms" }}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <StepEyebrow n="01" label={t.step1Label} title={t.step1Title} />

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel-raised px-3.5 py-2 text-xs font-medium text-ink-muted transition hover:-translate-y-0.5 hover:border-amber/60 hover:text-ink disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber" />
            ) : (
              <LocateFixed className="h-3.5 w-3.5 text-amber" />
            )}
            {t.useMyLocation}
          </button>
        </div>

        <div ref={placeBoxRef} className="relative">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-amber" />
            <input
              type="text"
              value={placeQuery}
              onFocus={() => {
                if (placeQuery.trim().length >= 2) setPlaceOpen(true);
              }}
              onChange={(e) => {
                const next = e.target.value;
                setPlaceQuery(next);
                setPlaceOpen(next.trim().length >= 2);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && placeResults.length > 0) {
                  e.preventDefault();
                  handleSelectGeoResult(placeResults[0]);
                } else if (e.key === "Escape") {
                  setPlaceOpen(false);
                }
              }}
              placeholder={t.searchPlacePlaceholder}
              aria-label={t.searchPlacePlaceholder}
              className="w-full rounded-xl border border-line-strong bg-void/70 py-3 pl-11 pr-20 text-sm text-ink placeholder:text-ink-faint focus:border-amber focus:outline-none"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              {placeLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-amber" />
              )}
              {placeQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPlaceQuery("");
                    setPlaceResults([]);
                    setPlaceOpen(false);
                  }}
                  className="rounded-lg p-1 text-ink-faint transition hover:bg-panel-raised hover:text-ink"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {placeOpen && placeQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 z-[1000] mt-2 max-h-72 overflow-y-auto rounded-xl border border-line-strong bg-panel shadow-2xl">
              {placeLoading && placeResults.length === 0 ? (
                <div className="flex items-center gap-2 px-4 py-3 text-xs text-ink-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber" />
                  <span>
                    {lang === "es"
                      ? "Buscando ubicación..."
                      : lang === "fr"
                        ? "Recherche en cours..."
                        : lang === "pt"
                          ? "Pesquisando local..."
                          : "Searching location..."}
                  </span>
                </div>
              ) : placeResults.length === 0 ? (
                <div className="px-4 py-3 text-xs text-ink-muted">
                  {t.searchPlaceEmpty}
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {placeResults.map((result) => {
                    const subtext = [result.admin1, result.country]
                      .filter((v): v is string => Boolean(v && v !== result.name))
                      .join(" · ");
                    return (
                      <li key={result.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectGeoResult(result)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:bg-panel-raised"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <MapPin className="h-4 w-4 shrink-0 text-amber" />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-ink">
                                {result.name}
                              </div>
                              {subtext && (
                                <div className="truncate text-xs text-ink-muted">
                                  {subtext}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="hidden font-mono text-[11px] text-ink-faint sm:inline">
                              {result.lat.toFixed(2)}, {result.lon.toFixed(2)}
                            </span>
                            <span className="rounded-full border border-line bg-void/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber">
                              {t.geoKinds[result.kind]}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <FarmMap
              lat={lat}
              lon={lon}
              label={activeLabel}
              onSelectCoords={handleMapClick}
              selectionMode={selectionMode}
              onChangeSelectionMode={handleChangeSelectionMode}
              polygonPoints={polygonPoints}
              onPolygonChange={setPolygonPoints}
              areaHa={
                polygonMetrics && polygonPoints.length >= 3
                  ? polygonMetrics.areaHa
                  : null
              }
              satelliteLabel={t.satellite}
              mapLabel={t.mapView}
              hintText={t.mapHint}
              modePointLabel={t.modePointLabel}
              modePerimeterLabel={t.modePerimeterLabel}
              perimeterHint={t.perimeterHint}
              perimeterUndoLabel={t.perimeterUndoLabel}
              perimeterClearLabel={t.perimeterClearLabel}
              verticesLabel={t.verticesCount(polygonPoints.length)}
              targetZoom={targetZoom}
              zoomTrigger={zoomTrigger}
            />
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-line bg-void/50 p-5 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono text-xs font-medium text-amber">
                  <MapPin className="h-4 w-4" />
                  {t.activeParcel}
                </div>
                {agroZone && (
                  <span className="rounded-full border border-line bg-panel-raised px-2.5 py-0.5 text-[11px] font-medium text-amber">
                    {t.zones[agroZone]}
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-lg font-semibold text-ink">
                {activeLabel}
              </h3>
              {hasDelimitedArea && polygonMetrics ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-cyan/40 bg-cyan/10 px-2.5 py-1 font-mono text-xs font-semibold text-cyan">
                    {formatHectares(polygonMetrics.areaHa)} ha
                  </span>
                  <span className="rounded-lg border border-line bg-panel px-2.5 py-1 font-mono text-[11px] text-ink-muted">
                    {t.perimeterLengthLabel}:{" "}
                    {formatPerimeter(polygonMetrics.perimeterM)}
                  </span>
                  <span className="font-mono text-[11px] text-ink-faint">
                    {t.verticesCount(polygonPoints.length)}
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-ink-faint">
                  {selectedPlace && selectedPlace.kind !== "place"
                    ? t.searchCountryHint
                    : t.freeLocationNote}
                </p>
              )}

              <div className="mt-5 border-t border-line pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-muted">
                    {t.climate30d}
                  </span>
                  <span className="rounded-md bg-panel-raised px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-cyan">
                    NASA POWER
                  </span>
                </div>

                {loading ? (
                  <div className="flex items-center gap-2 py-8 text-sm text-ink-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-amber" />
                    {t.loadingNasa}
                  </div>
                ) : errorMsg ? (
                  <div className="rounded-xl border border-rose/30 bg-rose/10 p-3 text-xs text-rose">
                    {errorMsg}
                  </div>
                ) : climate ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-line bg-panel p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                        <Thermometer className="h-3.5 w-3.5 text-amber" />
                        {t.tempAvg}
                      </div>
                      <div className="mt-1 font-mono text-xl font-bold text-ink">
                        {climate.tempAvgC ?? "—"} °C
                      </div>
                      <div className="text-[11px] text-ink-faint">
                        {t.minMax(
                          String(climate.tempMinC ?? "—"),
                          String(climate.tempMaxC ?? "—")
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-line bg-panel p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                        <CloudRain className="h-3.5 w-3.5 text-cyan" />
                        {t.rain30d}
                      </div>
                      <div className="mt-1 font-mono text-xl font-bold text-ink">
                        {climate.rain30dMm ?? "—"} mm
                      </div>
                      <div className="text-[11px] text-ink-faint">
                        {t.last30d}
                      </div>
                    </div>

                    <div className="rounded-xl border border-line bg-panel p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                        <Droplets className="h-3.5 w-3.5 text-cyan" />
                        {t.humidity}
                      </div>
                      <div className="mt-1 font-mono text-xl font-bold text-ink">
                        {climate.humidityPct ?? "—"}%
                      </div>
                      <div className="text-[11px] text-ink-faint">
                        {t.average}
                      </div>
                    </div>

                    <div className="rounded-xl border border-line bg-panel p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                        <Sun className="h-3.5 w-3.5 text-amber" />
                        {t.solar}
                      </div>
                      <div className="mt-1 font-mono text-xl font-bold text-ink">
                        {climate.solarMjM2Day ?? "—"}
                      </div>
                      <div className="text-[11px] text-ink-faint">
                        {t.solarUnit}
                      </div>
                    </div>
                  </div>
                ) : null}

                {!loading && forecast && (
                  <div className="mt-3 rounded-xl border border-line bg-panel-raised px-3 py-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-cyan">
                        {t.forecast7dLabel}
                      </span>
                      <span className="font-mono text-[11px] text-ink-muted">
                        {forecast.minTempC}°–{forecast.maxTempC}°C ·{" "}
                        {forecast.totalRainMm} mm
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={applyManualCoords}
              className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4"
            >
              <div className="min-w-[90px] flex-1">
                <label className="block text-[10px] uppercase tracking-wide text-ink-faint">
                  {t.latLabel}
                </label>
                <input
                  type="text"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-line bg-void px-2.5 py-1.5 font-mono text-xs text-ink focus:border-amber focus:outline-none"
                />
              </div>
              <div className="min-w-[90px] flex-1">
                <label className="block text-[10px] uppercase tracking-wide text-ink-faint">
                  {t.lonLabel}
                </label>
                <input
                  type="text"
                  value={lonInput}
                  onChange={(e) => setLonInput(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-line bg-void px-2.5 py-1.5 font-mono text-xs text-ink focus:border-amber focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-amber px-3 py-1.5 text-xs font-semibold text-void transition hover:bg-amber/80"
              >
                {t.goBtn}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* STEP 2: SIMPLE TRAFFIC-LIGHT FIELD DIAGNOSTICS */}
      <section
        className="animate-fade-up rounded-lg border border-line bg-panel/70 p-5 sm:p-7"
        style={{ animationDelay: "160ms" }}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <StepEyebrow n="02" label={t.step2Label} title={t.step2Title} />

          <button
            type="button"
            onClick={() => setShowTechDetails((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-void/60 px-3 py-1.5 text-xs text-ink-muted transition hover:border-line-strong hover:text-ink"
          >
            {showTechDetails ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {t.showSci}
          </button>
        </div>

        {loading || !diagnostic ? (
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-void/50 p-5 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin text-amber" />
            {t.analyzing}
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-line bg-void/70 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
              <p className="text-sm font-medium text-ink">
                {diagnostic.headline}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {diagnostic.cards
                .filter((card) => card.id !== "vegetation")
                .map((card) => {
                  const style = LEVEL_STYLES[card.level];
                  const Icon = CARD_ICONS[card.id];
                  return (
                    <div
                      key={card.id}
                      className={`flex flex-col justify-between rounded-2xl border p-4 ${style.border}`}
                    >
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <Icon className={`h-5 w-5 ${CARD_ICON_COLORS[card.id]}`} />
                          <span
                            className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${style.text}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`}
                            />
                            {card.statusLabel}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-ink">
                          {card.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                          {card.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {(() => {
              const vegetationCard = diagnostic.cards.find(
                (card) => card.id === "vegetation"
              );
              if (!vegetationCard) {
                if (ndviLoading) {
                  return (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-cyan/30 bg-cyan/5 p-4 font-mono text-xs text-cyan">
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan" />
                      <span>[MODIS/VIIRS] {t.ndviLoadingLabel}</span>
                    </div>
                  );
                }
                return null;
              }
              const style = LEVEL_STYLES[vegetationCard.level];
              return (
                <div
                  className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 ${style.border}`}
                >
                  <Satellite className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-ink">
                        {vegetationCard.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${style.text}`}
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
                        {vegetationCard.statusLabel}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                      {vegetationCard.explanation}
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setShowTechDetails((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-void/60 px-3 py-1.5 font-mono text-xs text-ink-muted transition hover:border-cyan/50 hover:text-cyan"
              >
                {showTechDetails ? (
                  <ChevronUp className="h-3.5 w-3.5 text-cyan" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-cyan" />
                )}
                {showTechDetails ? t.techDetailsToggleHide : t.techDetailsToggleShow}
              </button>

              {history5y.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistory((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-void/60 px-3 py-1.5 font-mono text-xs text-ink-muted transition hover:border-cyan/50 hover:text-cyan"
                >
                  {showHistory ? (
                    <ChevronUp className="h-3.5 w-3.5 text-cyan" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-cyan" />
                  )}
                  {showHistory ? t.historyToggleHide : t.historyToggleShow}
                </button>
              )}
            </div>

            {showHistory && history5y.length > 0 && (
              <div className="mt-4 rounded-2xl border border-line bg-void/60 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan">
                    {t.historyTitle}
                  </h3>
                  {trend5y && (
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${LEVEL_STYLES[trend5y.level].text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_STYLES[trend5y.level].dot}`}
                      />
                      {trend5y.badge}
                    </span>
                  )}
                </div>
                {trend5y && (
                  <p className="mb-3 text-[11px] text-ink-muted">
                    {trend5y.explanation}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {history5y.map((yr) => (
                    <div
                      key={yr.year}
                      className="rounded-xl border border-line bg-panel p-2.5 text-xs"
                    >
                      <div className="font-mono font-semibold text-ink">{yr.year}</div>
                      <div className="mt-1 text-[11px] text-ink-muted">
                        {yr.tempAvgC} °C · {yr.rainMmYear} mm
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-faint">
                        <span>GWETTOP</span>
                        <span className="text-cyan">
                          {Math.round(yr.soilWetness * 100)}%
                        </span>
                      </div>
                      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-cyan"
                          style={{
                            width: `${Math.min(100, Math.round(yr.soilWetness * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showTechDetails && (
              <div className="mt-4 grid gap-3 rounded-2xl border border-line bg-void/80 p-4 text-xs text-ink-muted sm:grid-cols-5">
                <div>
                  <span className="block text-[11px] text-ink-faint">
                    {t.zoneLabel}
                  </span>
                  <span className="font-mono font-semibold text-amber">
                    {agroZone ? t.zones[agroZone] : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-ink-faint">
                    {t.elevLabel}
                  </span>
                  <span className="font-mono font-semibold text-ink">
                    {climate?.elevationM !== null
                      ? `${climate?.elevationM} m`
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-ink-faint">
                    {t.slopeLabel}
                  </span>
                  <span className="font-mono font-semibold text-ink">
                    {climate?.slopePct !== null
                      ? `${climate?.slopePct}%`
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-ink-faint">
                    {t.soilMoistLabel}
                  </span>
                  <span className="font-mono font-semibold text-ink">
                    {climate?.soilMoistureM3 !== null
                      ? `${climate?.soilMoistureM3} m³/m³`
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-ink-faint">
                    {t.eoLabel}
                  </span>
                  <span className="font-mono font-semibold text-ink">
                    {climate?.eoMmDay !== null
                      ? `${climate?.eoMmDay} mm/d`
                      : "—"}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* STEP 3: REGION-ADAPTED CROP ROTATION COMPARATOR */}
      <section
        className="animate-fade-up rounded-lg border border-line bg-panel/70 p-5 sm:p-7"
        style={{ animationDelay: "240ms" }}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <StepEyebrow n="03" label={t.step3Label} title={t.step3Title} />
            {agroZone && (
              <span className="mt-1 hidden rounded-full bg-panel-raised px-2 py-0.5 text-[10px] font-medium text-ink-muted sm:inline-block">
                {t.zones[agroZone]}
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => setShowCropScience((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-void/60 px-3 py-1.5 text-xs text-ink-muted transition hover:border-line-strong hover:text-ink"
            >
              {showCropScience ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {t.showSci}
            </button>

            <div className="flex flex-wrap justify-end gap-2">
              {(["water", "soil", "climate", "erosion"] as const).map((id) => {
                const Icon = PRIORITY_ICONS[id];
                const active = priority === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPriority(id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition hover:-translate-y-0.5 ${
                      active
                        ? "border-line-strong bg-panel-raised text-ink"
                        : "border-line bg-void/60 text-ink-muted hover:border-line-strong"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${PRIORITY_COLORS[id]}`} />
                    {t.priorities[id]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-line bg-void/60 p-3.5">
          <div className="mb-2 text-xs font-medium text-ink-muted">
            {t.currentCropSelectorLabel}
          </div>
          <div className="flex flex-wrap gap-2">
            {(["cereal", "tuber", "legume", "perennial"] as CurrentCropType[]).map(
              (cropKey) => (
                <button
                  key={cropKey}
                  type="button"
                  onClick={() => setCurrentCropType(cropKey)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition hover:-translate-y-0.5 ${
                    currentCropType === cropKey
                      ? "border-line-strong bg-panel-raised text-ink"
                      : "border-line bg-panel text-ink-muted hover:border-line-strong"
                  }`}
                >
                  {t.currentCropTypes[cropKey]}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-rose/30 bg-rose/5 p-4">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-rose">
              {activeProblem.title}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-ink-muted">
              {activeProblem.points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-green/30 bg-green/5 p-4">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-green">
              {activeProblem.solutionTitle}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              {activeProblem.solutionText}
            </p>
          </div>
        </div>

        {/* PLANT CHECKER TOOL (DYNAMIC API + CALIBRATED CATALOG) */}
        <div className="mb-6 rounded-2xl border border-cyan/40 bg-void/80 p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-cyan">
                <Sparkles className="h-4 w-4 text-cyan" />
                {t.plantCheckerTitle}
              </h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                {t.plantCheckerPrompt}
              </p>
            </div>

            {/* DYNAMIC API SEARCH FORM */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchCropApi();
              }}
              className="mt-1 flex flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={customCropQuery}
                  onChange={(e) => setCustomCropQuery(e.target.value)}
                  placeholder={t.dynamicSearchPlaceholder}
                  className="w-full rounded-xl border border-line-strong bg-panel-raised py-2.5 pl-9 pr-3 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-cyan focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={dynamicCropLoading || !customCropQuery.trim() || !climate}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/50 bg-cyan/15 px-4 py-2.5 font-mono text-xs font-semibold text-cyan transition hover:bg-cyan/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {dynamicCropLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t.dynamicSearchLoading}</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    <span>{t.dynamicSearchButton}</span>
                  </>
                )}
              </button>
            </form>

            {/* QUICK API QUERY CHIPS */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-mono text-[11px] text-ink-faint">
                {t.dynamicSearchQuickSuggestions}
              </span>
              {[
                { label: "🥑 Palta / Aguacate", q: "aguacate" },
                { label: "☕ Café", q: "cafe" },
                { label: "🥭 Mango", q: "mango" },
                { label: "🌵 Pitahaya", q: "pitahaya" },
                { label: "🍫 Cacao", q: "cacao" },
                { label: "🍇 Vid / Uva", q: "uva" },
                { label: "🫐 Arándano", q: "arandano" },
                { label: "🌾 Quinua", q: "quinua" },
              ].map((item) => (
                <button
                  key={item.q}
                  type="button"
                  disabled={dynamicCropLoading || !climate}
                  onClick={() => {
                    setCustomCropQuery(item.q);
                    handleSearchCropApi(item.q);
                  }}
                  className="rounded-lg border border-line bg-panel px-2.5 py-1 text-[11px] font-medium text-ink-muted transition hover:border-cyan/40 hover:text-cyan disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* DYNAMIC API ERROR MESSAGE */}
            {dynamicCropError && (
              <div className="rounded-lg border border-rose/40 bg-rose/10 px-3 py-2 text-xs text-rose">
                {dynamicCropError}
              </div>
            )}

            {/* DYNAMIC API RESULT CARD */}
            {dynamicCropResult && (
              <div className="mt-2 rounded-xl border border-cyan/40 bg-panel p-4 shadow-md transition-all">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    {dynamicCropResult.thumbnailUrl ? (
                      <img
                        src={dynamicCropResult.thumbnailUrl}
                        alt={dynamicCropResult.cropName}
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                        className="h-16 w-16 rounded-xl object-cover border border-line shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-line bg-void/60 text-cyan shrink-0">
                        <Sprout className="h-8 w-8" />
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold text-ink">
                          {dynamicCropResult.cropName}
                        </h4>
                        <span className="font-mono text-xs italic text-ink-faint">
                          ({dynamicCropResult.scientificName}{dynamicCropResult.family ? ` · ${dynamicCropResult.family}` : ""})
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                        {dynamicCropResult.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold ${
                        FEASIBILITY_STYLES[dynamicCropResult.feasibility].badge
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          FEASIBILITY_STYLES[dynamicCropResult.feasibility].dot
                        }`}
                      />
                      {FEASIBILITY_LABELS[dynamicCropResult.feasibility][lang]} ({dynamicCropResult.matchScore}%)
                    </span>
                    <span className="font-mono text-[10px] text-ink-faint">
                      {dynamicCropResult.source === "gemini-2.5-flash-fao"
                        ? "⚡ Gemini 2.5 Flash + NASA POWER"
                        : "📚 FAO EcoCrop Engine + NASA POWER"}
                    </span>
                  </div>
                </div>

                {/* Limiting factors from API */}
                {dynamicCropResult.limitingFactors.length > 0 && (
                  <div className="mt-3 space-y-1.5 rounded-lg border border-amber/40 bg-amber/10 p-3 text-xs text-amber">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Factores Limitantes Detectados con Telemetría NASA:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-ink-muted">
                      {dynamicCropResult.limitingFactors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Practical recommendations from API */}
                {dynamicCropResult.recommendations.length > 0 && (
                  <div className="mt-3 space-y-1.5 rounded-lg border border-green/30 bg-green/5 p-3 text-xs text-green">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Recomendaciones Agronómicas de Manejo:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-ink-muted">
                      {dynamicCropResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* FAO Physiological Parameters Grid */}
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs">
                  <div className="rounded-lg border border-line bg-void/60 p-2.5">
                    <span className="block text-[10px] text-ink-faint">
                      Demanda Hídrica (FAO-56)
                    </span>
                    <span className="font-semibold text-cyan">
                      ~{dynamicCropResult.faoParameters.waterDemandMm} mm
                    </span>
                  </div>
                  <div className="rounded-lg border border-line bg-void/60 p-2.5">
                    <span className="block text-[10px] text-ink-faint">
                      Temperatura Óptima
                    </span>
                    <span className="font-semibold text-green">
                      {dynamicCropResult.faoParameters.tempOptMin}° a {dynamicCropResult.faoParameters.tempOptMax}°C
                    </span>
                  </div>
                  <div className="rounded-lg border border-line bg-void/60 p-2.5">
                    <span className="block text-[10px] text-ink-faint">
                      Límite Helada Mortal
                    </span>
                    <span className="font-semibold text-rose">
                      {dynamicCropResult.faoParameters.tempAbsMin}°C
                    </span>
                  </div>
                  <div className="rounded-lg border border-line bg-void/60 p-2.5">
                    <span className="block text-[10px] text-ink-faint">
                      Ciclo / Factor Kc
                    </span>
                    <span className="font-semibold text-amber">
                      {dynamicCropResult.faoParameters.cycleDays}d (Kc {dynamicCropResult.faoParameters.kcMid})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SECONDARY SELECTOR FOR 26 BENCHMARK CROPS */}
            <div className="mt-3 border-t border-line/60 pt-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-mono text-xs text-ink-muted">
                  {t.dynamicOrCatalog}
                </span>
                <div className="w-full sm:w-80">
                  <select
                    value={checkedCropId}
                    onChange={(e) => setCheckedCropId(e.target.value)}
                    className="w-full rounded-xl border border-line-strong bg-panel-raised px-3 py-2 font-mono text-xs text-ink focus:border-cyan focus:outline-none"
                  >
                    {CROP_CATALOG.map((crop) => {
                      const txt = crop.i18n[lang] ?? crop.i18n.es;
                      return (
                        <option key={crop.id} value={crop.id}>
                          {txt.name} ({crop.scientificName})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {checkedCrop && (
                <div className="mt-3 rounded-xl border border-line bg-panel p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-ink">{checkedCrop.name}</h4>
                        <span className="font-mono text-xs italic text-ink-faint">
                          ({checkedCrop.scientificName})
                        </span>
                      </div>
                      <span className="text-xs text-ink-muted">{checkedCrop.category}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold ${
                        FEASIBILITY_STYLES[checkedCrop.feasibility].badge
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          FEASIBILITY_STYLES[checkedCrop.feasibility].dot
                        }`}
                      />
                      {checkedCrop.feasibilityLabel} ({checkedCrop.matchScore}%)
                    </span>
                  </div>

                  {checkedCrop.limitingFactor && (
                    <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber/40 bg-amber/10 px-3 py-1.5 text-xs text-amber">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
                      <span>{checkedCrop.limitingFactor}</span>
                    </div>
                  )}

                  <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs">
                    <div className="rounded-lg border border-line bg-void/60 p-2">
                      <span className="block text-[10px] text-ink-faint">
                        Demanda Hídrica
                      </span>
                      <span className="font-semibold text-cyan">
                        {checkedCrop.waterRangeMm[0]}–{checkedCrop.waterRangeMm[1]} mm
                      </span>
                    </div>
                    <div className="rounded-lg border border-line bg-void/60 p-2">
                      <span className="block text-[10px] text-ink-faint">
                        Temp. Óptima
                      </span>
                      <span className="font-semibold text-amber">
                        {checkedCrop.ecoCropTempC[1]}–{checkedCrop.ecoCropTempC[2]} °C
                      </span>
                    </div>
                    <div className="rounded-lg border border-line bg-void/60 p-2">
                      <span className="block text-[10px] text-ink-faint">
                        Fijación N
                      </span>
                      <span className="font-semibold text-green">
                        {checkedCrop.bnfKgNHa[1] > 0
                          ? `${checkedCrop.bnfKgNHa[0]}–${checkedCrop.bnfKgNHa[1]} kg N/ha`
                          : "0 kg N"}
                      </span>
                    </div>
                    <div className="rounded-lg border border-line bg-void/60 p-2">
                      <span className="block text-[10px] text-ink-faint">
                        Ciclo
                      </span>
                      <span className="font-semibold text-ink">
                        {checkedCrop.cycleDays[0]}–{checkedCrop.cycleDays[1]} días
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {!loading && climate && agroZone && rotations.length > 0 && (
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-cyan/40 bg-void/80 p-5 sm:p-6 shadow-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line/60 pb-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan/40 bg-cyan/15 text-cyan shrink-0">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                    {t.dossierTitle}
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {t.dossierSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan/50 bg-cyan px-4 py-2 font-mono text-xs font-semibold text-void transition hover:bg-cyan/90 shadow-sm disabled:opacity-50"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-void" />
                      <span>Generando PDF...</span>
                    </>
                  ) : dossierDownloaded ? (
                    <>
                      <CheckCheck className="h-4 w-4 text-void" />
                      <span>¡PDF Descargado!</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>{t.dossierDownloadPdf}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="no-print inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel px-3.5 py-2 font-mono text-xs font-semibold text-ink-muted transition hover:border-line-strong hover:text-ink"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>{t.dossierPrintBtn}</span>
                </button>
              </div>
            </div>

            {/* SYNTHESIZED EXECUTIVE DOSSIER VIEW (ON SCREEN) */}
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {/* BLOCK 1: PARCEL & USER PROFILE */}
              <div className="rounded-xl border border-line bg-panel p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-ink-faint">
                    <span className="uppercase tracking-wider text-cyan font-semibold">1. Datos de la Parcela</span>
                    <MapPin className="h-3.5 w-3.5 text-cyan" />
                  </div>
                  <h4 className="mt-2 text-base font-bold text-ink">
                    {activeLabel}
                  </h4>
                  <div className="mt-2.5 space-y-1.5 font-mono text-xs text-ink-muted">
                    <p><span className="text-ink-faint">Coordenadas:</span> Lat {lat.toFixed(4)}, Lon {lon.toFixed(4)}</p>
                    <p><span className="text-ink-faint">Zona:</span> {t.zones[agroZone]}</p>
                    <p><span className="text-ink-faint">Elevación SRTM:</span> {climate.elevationM ?? 200} m</p>
                    <p><span className="text-ink-faint">Pendiente:</span> ~{climate.slopePct ?? 2}%</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-line/50 pt-2 text-xs">
                  <span className="text-ink-faint text-[11px]">Cultivo Actual:</span>
                  <p className="font-semibold text-ink">{t.currentCropTypes[currentCropType]}</p>
                </div>
              </div>

              {/* BLOCK 2: SOIL WATER & MOISTURE STATUS */}
              <div className="rounded-xl border border-line bg-panel p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-ink-faint">
                    <span className="uppercase tracking-wider text-amber font-semibold">2. Diagnóstico del Agua</span>
                    <Droplets className="h-3.5 w-3.5 text-amber" />
                  </div>
                  <h4 className="mt-2 text-base font-bold text-ink">
                    {t.dossierWaterStatus}
                  </h4>
                  <div className="mt-2.5 space-y-1.5 font-mono text-xs text-ink-muted">
                    <p><span className="text-ink-faint">Evaporación Penman (Eo):</span> <strong className="text-amber">{climate.eoMmDay ?? 4.5} mm/día</strong></p>
                    <p><span className="text-ink-faint">Lluvia últimos 30d:</span> <strong className="text-cyan">{climate.rain30dMm ?? 0} mm</strong></p>
                    <p><span className="text-ink-faint">Humedad Superficial (0-5cm):</span> {climate.soilMoistureM3 !== null ? Math.round(climate.soilMoistureM3 * 100) : 35}%</p>
                    <p><span className="text-ink-faint">Vigor Vegetal (NDVI):</span> {ndvi ? ndvi.current.toFixed(2) : "Calculando..."}</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-line/50 pt-2 text-xs">
                  <div className="rounded-lg border border-amber/30 bg-amber/10 px-2.5 py-1.5 text-[11px] text-amber font-medium">
                    {((climate.rain30dMm ?? 0) - (climate.eoMmDay ?? 4.5) * 30) < -40
                      ? "Déficit hídrico estival: el suelo pierde más agua por evaporación que la lluvia recibida."
                      : "Balance hídrico estable para el ciclo agronómico actual."}
                  </div>
                </div>
              </div>

              {/* BLOCK 3: SOIL RECOMMENDATIONS & NEXT STEPS */}
              <div className="rounded-xl border border-line bg-panel p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-ink-faint">
                    <span className="uppercase tracking-wider text-green font-semibold">3. Recomendaciones de Suelo</span>
                    <Sprout className="h-3.5 w-3.5 text-green" />
                  </div>
                  <h4 className="mt-2 text-base font-bold text-ink">
                    {t.dossierRecommendations}
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-ink-muted leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-green font-bold">1.</span>
                      <span>
                        {currentCropType === "perennial"
                          ? "Sembrar cobertura viva (trébol/vicia) en calles para frenar evaporación."
                          : "Rotar en la siguiente campaña con leguminosa fijadora de nitrógeno."}
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-green font-bold">2.</span>
                      <span>
                        {(climate.slopePct ?? 2) >= 8
                          ? "Trazar siembras en curvas de nivel para frenar erosión por escorrentía."
                          : "Mantener acolchado orgánico (mulch) de mínimo 30% sobre el suelo."}
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-green font-bold">3.</span>
                      <span>
                        Optar por riego presurizado por goteo en turnos vespertinos contra la evaporación Penman.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-3 border-t border-line/50 pt-2">
                  <span className="text-ink-faint text-[10px] font-mono block">Top 3 Cultivos Sugeridos:</span>
                  <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-mono">
                    {rotations.slice(0, 3).map((r) => (
                      <span key={r.id} className="rounded bg-panel-raised px-2 py-0.5 border border-line text-ink">
                        {r.name} ({r.matchScore}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
