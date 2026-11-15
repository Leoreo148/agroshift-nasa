"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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
  Award,
  Globe,
  Sparkles,
  Satellite,
} from "lucide-react";
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
  type CurrentCropType,
  type FarmerPriority,
} from "@/lib/rotations";
import { LANG_LABELS, T, type Lang } from "@/lib/i18n";
import type { Forecast7d, HistoryYear } from "@/app/api/climate/route";
import type { AdvisorResponse } from "@/app/api/ai-advisor/route";
import type { NdviTrend } from "@/lib/providers/modisNdvi";
import Logo from "@/components/Logo";

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
  const [selectedPreset, setSelectedPreset] = useState<FarmPreset | null>(
    FARM_PRESETS[0]
  );
  const [lat, setLat] = useState<number>(FARM_PRESETS[0].lat);
  const [lon, setLon] = useState<number>(FARM_PRESETS[0].lon);
  const [latInput, setLatInput] = useState<string>(String(FARM_PRESETS[0].lat));
  const [lonInput, setLonInput] = useState<string>(String(FARM_PRESETS[0].lon));

  const [loading, setLoading] = useState<boolean>(true);
  const [climate, setClimate] = useState<ClimateMetrics | null>(null);
  const [forecast, setForecast] = useState<Forecast7d | null>(null);
  const [history5y, setHistory5y] = useState<HistoryYear[]>([]);
  const [ndvi, setNdvi] = useState<NdviTrend | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);
  const [showCropScience, setShowCropScience] = useState<boolean>(false);
  const [priority, setPriority] = useState<FarmerPriority>("water");
  const [currentCropType, setCurrentCropType] = useState<CurrentCropType>(
    FARM_PRESETS[0].defaultCropType
  );
  const [aiPlan, setAiPlan] = useState<AdvisorResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
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
  }, [lat, lon, priority, currentCropType, lang]);

  // NDVI (MODIS) is a slow, best-effort satellite lookup — fetched on its own
  // request so it never delays the climate/diagnostics/rotation sections above.
  useEffect(() => {
    let active = true;
    setNdvi(null);

    fetch(`/api/ndvi?lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setNdvi(data.ndvi ?? null);
      })
      .catch(() => {
        if (active) setNdvi(null);
      });

    return () => {
      active = false;
    };
  }, [lat, lon]);

  function choosePreset(preset: FarmPreset) {
    setSelectedPreset(preset);
    setCurrentCropType(preset.defaultCropType);
    setLat(preset.lat);
    setLon(preset.lon);
    setLatInput(String(preset.lat));
    setLonInput(String(preset.lon));
  }

  function handleMapClick(newLat: number, newLon: number) {
    setSelectedPreset(null);
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
    setSelectedPreset(null);
    setLat(Number(parsedLat.toFixed(4)));
    setLon(Number(parsedLon.toFixed(4)));
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
        setSelectedPreset(null);
        setLat(myLat);
        setLon(myLon);
        setLatInput(String(myLat));
        setLonInput(String(myLon));
        setLocating(false);
      },
      () => {
        setErrorMsg(t.geoError);
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }

  const presetMeta = selectedPreset ? selectedPreset.labels[lang] : null;
  const activeLabel = presetMeta
    ? `${presetMeta.name} (${presetMeta.region})`
    : `${t.customParcel} (${lat.toFixed(2)}, ${lon.toFixed(2)})`;

  const agroZone = climate ? detectAgroZone(lat, climate) : null;

  const diagnostic = climate
    ? buildFieldDiagnostics(climate, lang, selectedPreset?.slopePct, ndvi)
    : null;

  const trend5y = analyzeTrend5y(history5y, lang);

  const rotations =
    climate && agroZone
      ? evaluateCropRotations(
          climate,
          agroZone,
          priority,
          lang,
          selectedPreset?.slopePct,
          currentCropType
        )
      : [];

  const activeProblem = t.problemByCrop[currentCropType];

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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FARM_PRESETS.map((preset) => {
            const active = selectedPreset?.id === preset.id;
            const meta = preset.labels[lang];
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => choosePreset(preset)}
                className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                  active
                    ? "border-line-strong bg-panel-raised shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                    : "border-line bg-void/40 hover:border-line-strong"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wide text-amber">
                      {meta.region}
                    </span>
                    {active && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-ink" />
                    )}
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-ink">
                    {meta.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    {meta.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5 text-[11px] text-ink-faint">
                  <span>{meta.climateTag}</span>
                  <span className="text-ink-muted">{meta.currentCrop}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <FarmMap
              lat={lat}
              lon={lon}
              label={activeLabel}
              onSelectCoords={handleMapClick}
              satelliteLabel={t.satellite}
              mapLabel={t.mapView}
              hintText={t.mapHint}
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
              <p className="mt-1 text-xs text-ink-faint">
                {presetMeta
                  ? `${t.currentCropLabel}: ${presetMeta.currentCrop}`
                  : t.freeLocationNote}
              </p>

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
              if (!vegetationCard) return null;
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

            {history5y.length > 0 && (
              <div className="mt-5 rounded-2xl border border-line bg-void/60 p-4">
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
              <div className="mt-5 grid gap-3 rounded-2xl border border-line bg-void/80 p-4 text-xs text-ink-muted sm:grid-cols-5">
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
                      : `${selectedPreset?.slopePct ?? "—"}%`}
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

        {loading || rotations.length === 0 ? (
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-void/50 p-5 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin text-amber" />
            {t.calculatingRot}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {rotations.slice(0, 3).map((crop, idx) => {
              const isBest = idx === 0;
              return (
                <div
                  key={crop.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 ${
                    isBest
                      ? "border-amber/60 bg-amber/10"
                      : "border-line bg-void/60"
                  }`}
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-ink-faint">
                        {crop.category}
                      </span>
                      {isBest ? (
                        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-amber/20 px-2.5 py-0.5 text-xs font-semibold text-amber">
                          <Award className="h-3.5 w-3.5" />
                          {t.bestChoice}
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-panel-raised px-2.5 py-0.5 text-xs text-ink-muted">
                          <Repeat className="h-3 w-3" />
                          {t.optionN(idx + 1)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink">
                          {crop.name}
                        </h3>
                        <span className="text-[11px] italic text-ink-faint">
                          {crop.scientificName}
                        </span>
                      </div>
                      <span className="font-mono text-lg font-bold text-amber">
                        {crop.matchScore}%
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                      {crop.reason}
                    </p>

                    <div className="mt-4 space-y-2.5">
                      <div>
                        <div className="mb-1 flex justify-between text-[11px] text-ink-faint">
                          <span className="inline-flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-cyan" />
                            {t.waterSaving}
                          </span>
                          <span className="font-mono text-ink-muted">
                            {crop.waterSavingScore}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full bg-cyan"
                            style={{ width: `${crop.waterSavingScore}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between text-[11px] text-ink-faint">
                          <span className="inline-flex items-center gap-1">
                            <Sprout className="h-3 w-3 text-green" />
                            {t.soilCare}
                          </span>
                          <span className="font-mono text-ink-muted">
                            {crop.soilScore}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full bg-green"
                            style={{ width: `${crop.soilScore}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between text-[11px] text-ink-faint">
                          <span className="inline-flex items-center gap-1">
                            <Thermometer className="h-3 w-3 text-amber" />
                            {t.climateFit}
                          </span>
                          <span className="font-mono text-ink-muted">
                            {crop.climateFitScore}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full bg-amber"
                            style={{ width: `${crop.climateFitScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-[11px]">
                    <p className="text-ink-muted">
                      <span className="font-semibold text-green">
                        {t.sanidadLabel}:
                      </span>{" "}
                      {crop.pestBreakBenefit}
                    </p>
                    <p className="text-ink-faint">
                      <span className="font-semibold text-amber">
                        {t.tradeOffLabel}:
                      </span>{" "}
                      {crop.tradeOff}
                    </p>
                    {showCropScience && (
                      <div className="pt-1.5 text-[10px] leading-relaxed text-ink-faint">
                        <span className="font-semibold text-ink-muted">
                          {t.sciBaseLabel}:
                        </span>
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-ink-faint">
                          {crop.citations.map((cite, cIdx) => (
                            <li key={cIdx}>{cite}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && climate && agroZone && rotations.length > 0 && (
          <div className="relative mt-5 overflow-hidden rounded-2xl border border-cyan/30 bg-panel-raised/60 p-4 sm:p-5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan/40 bg-cyan/10 text-cyan">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan">
                    {t.aiTitle}
                  </h4>
                  <p className="text-[11px] text-ink-faint">
                    Gemini 2.5 Flash · NASA POWER + MODIS NDVI + FAO-56
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={aiLoading}
                onClick={async () => {
                  setAiLoading(true);
                  try {
                    const res = await fetch("/api/ai-advisor", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        lat,
                        lon,
                        agroZoneLabel: t.zones[agroZone],
                        lang,
                        priority,
                        currentCropType,
                        climate,
                        trend5y,
                        ndvi,
                        topRotations: rotations.slice(0, 3).map((r) => ({
                          name: r.name,
                          scientificName: r.scientificName,
                          matchScore: r.matchScore,
                          reason: r.reason,
                          pestBreakBenefit: r.pestBreakBenefit,
                          tradeOff: r.tradeOff,
                        })),
                      }),
                    });
                    if (res.ok) {
                      const json = (await res.json()) as AdvisorResponse;
                      setAiPlan(json);
                    }
                  } finally {
                    setAiLoading(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan/40 bg-cyan/15 px-3.5 py-1.5 font-mono text-xs font-semibold text-cyan transition hover:border-cyan/60 hover:bg-cyan/25 disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t.aiLoadingLabel}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {t.aiButtonLabel}
                  </>
                )}
              </button>
            </div>

            {aiPlan && (
              <div className="mt-4 space-y-3 border-t border-line/70 pt-3.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">
                    {aiPlan.diagnosisSummary}
                  </p>
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                      aiPlan.source === "gemini-2.5-flash"
                        ? "border-cyan/30 bg-cyan/10 text-cyan"
                        : "border-line-strong bg-panel text-ink-muted"
                    }`}
                  >
                    {aiPlan.source === "gemini-2.5-flash"
                      ? t.aiSourceGemini
                      : t.aiSourceFallback}
                  </span>
                </div>
                <ol className="space-y-1.5 pl-0 text-ink-muted">
                  {aiPlan.actionSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-[11px] font-semibold text-cyan">
                        [0{idx + 1}]
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="rounded-xl border border-amber/30 bg-amber/5 px-3 py-2 text-[11px] leading-relaxed text-amber">
                  <span className="font-mono font-semibold uppercase tracking-wider">
                    {t.aiCheckLabel}:
                  </span>{" "}
                  {aiPlan.localCheck}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <footer
        className="animate-fade-up space-y-4 border-t border-dashed border-line pt-6"
        style={{ animationDelay: "320ms" }}
      >
        <div>
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan">
            {t.districtTitle}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
            {t.districtText}
          </p>
          <p className="mt-2 rounded-xl border border-line bg-void/60 px-3 py-2 text-[11px] leading-relaxed text-ink-faint">
            {t.sentinelNote}
          </p>
        </div>
        <div className="border-t border-dashed border-line pt-4">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-amber">
            {t.methodTitle}
          </h3>
          <ul className="mt-2.5 list-disc space-y-1 pl-5 text-xs leading-relaxed text-ink-faint">
            {t.methodItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <p className="border-t border-dashed border-line pt-3 text-xs font-medium text-ink-muted">
          {t.farmerDisclaimer}
        </p>
      </footer>
    </main>
  );
}
