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
} from "lucide-react";
import { FARM_PRESETS, type FarmPreset } from "@/data/farms";
import {
  buildFieldDiagnostics,
  detectAgroZone,
  type ClimateMetrics,
  type RiskLevel,
} from "@/lib/diagnostics";
import {
  evaluateCropRotations,
  type FarmerPriority,
} from "@/lib/rotations";
import { LANG_LABELS, T, type Lang } from "@/lib/i18n";

const FarmMap = dynamic(() => import("@/components/FarmMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-sm text-slate-400 sm:h-80">
      <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
    </div>
  ),
});

const LEVEL_STYLES: Record<
  RiskLevel,
  { border: string; badge: string; dot: string }
> = {
  good: {
    border: "border-emerald-500/30 bg-emerald-500/5",
    badge: "bg-emerald-500/15 text-emerald-300",
    dot: "bg-emerald-400",
  },
  warn: {
    border: "border-amber-500/30 bg-amber-500/5",
    badge: "bg-amber-500/15 text-amber-300",
    dot: "bg-amber-400",
  },
  alert: {
    border: "border-rose-500/35 bg-rose-500/5",
    badge: "bg-rose-500/15 text-rose-300",
    dot: "bg-rose-400",
  },
};

const CARD_ICONS = {
  water: Droplets,
  heat: Thermometer,
  health: Sprout,
  erosion: Mountain,
};

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);
  const [priority, setPriority] = useState<FarmerPriority>("water");

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.language) {
      const code = navigator.language.slice(0, 2).toLowerCase();
      if (code === "es" || code === "fr" || code === "pt" || code === "en") {
        setLang(code);
      }
    }
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

  function choosePreset(preset: FarmPreset) {
    setSelectedPreset(preset);
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
    ? buildFieldDiagnostics(climate, lang, selectedPreset?.slopePct)
    : null;

  const rotations =
    climate && agroZone
      ? evaluateCropRotations(
          climate,
          agroZone,
          priority,
          lang,
          selectedPreset?.slopePct
        )
      : [];

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-3 border-b border-slate-800/90 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <Sprout className="h-3.5 w-3.5" />
            {t.badge}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            AgroShift NASA
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            {t.subtitle}
          </p>
        </div>

        <div className="flex w-fit items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1">
          <Globe className="mx-1.5 h-3.5 w-3.5 text-slate-400" />
          {(["en", "es", "fr", "pt"] as Lang[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                lang === code
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {LANG_LABELS[code]}
            </button>
          ))}
        </div>
      </header>

      {/* STEP 1: GLOBAL FIELD SELECTOR */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {t.step1Label}
            </span>
            <h2 className="text-xl font-semibold text-white">
              {t.step1Title}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-500/60 hover:text-white disabled:opacity-50"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : (
              <LocateFixed className="h-3.5 w-3.5 text-emerald-400" />
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
                className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-emerald-400">
                      {meta.region}
                    </span>
                    {active && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    )}
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-white">
                    {meta.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {meta.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
                  <span>{meta.climateTag}</span>
                  <span className="text-slate-300">{meta.currentCrop}</span>
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

          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-5 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <MapPin className="h-4 w-4" />
                  {t.activeParcel}
                </div>
                {agroZone && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                    {t.zones[agroZone]}
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-lg font-semibold text-white">
                {activeLabel}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {presetMeta
                  ? `${t.currentCropLabel}: ${presetMeta.currentCrop}`
                  : t.freeLocationNote}
              </p>

              <div className="mt-5 border-t border-slate-800 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    {t.climate30d}
                  </span>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                    NASA POWER
                  </span>
                </div>

                {loading ? (
                  <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    {t.loadingNasa}
                  </div>
                ) : errorMsg ? (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                    {errorMsg}
                  </div>
                ) : climate ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                        {t.tempAvg}
                      </div>
                      <div className="mt-1 text-xl font-bold text-white">
                        {climate.tempAvgC ?? "—"} °C
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.minMax(
                          String(climate.tempMinC ?? "—"),
                          String(climate.tempMaxC ?? "—")
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <CloudRain className="h-3.5 w-3.5 text-sky-400" />
                        {t.rain30d}
                      </div>
                      <div className="mt-1 text-xl font-bold text-white">
                        {climate.rain30dMm ?? "—"} mm
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.last30d}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                        {t.humidity}
                      </div>
                      <div className="mt-1 text-xl font-bold text-white">
                        {climate.humidityPct ?? "—"}%
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.average}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Sun className="h-3.5 w-3.5 text-yellow-400" />
                        {t.solar}
                      </div>
                      <div className="mt-1 text-xl font-bold text-white">
                        {climate.solarMjM2Day ?? "—"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.solarUnit}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <form
              onSubmit={applyManualCoords}
              className="mt-4 flex flex-wrap items-end gap-2 border-t border-slate-800 pt-4"
            >
              <div className="min-w-[90px] flex-1">
                <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                  {t.latLabel}
                </label>
                <input
                  type="text"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="min-w-[90px] flex-1">
                <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                  {t.lonLabel}
                </label>
                <input
                  type="text"
                  value={lonInput}
                  onChange={(e) => setLonInput(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
              >
                {t.goBtn}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* STEP 2: SIMPLE TRAFFIC-LIGHT FIELD DIAGNOSTICS */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {t.step2Label}
            </span>
            <h2 className="text-xl font-semibold text-white">
              {t.step2Title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowTechDetails((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-700 hover:text-white"
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
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            {t.analyzing}
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-sm font-medium text-slate-200">
                {diagnostic.headline}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {diagnostic.cards.map((card) => {
                const style = LEVEL_STYLES[card.level];
                const Icon = CARD_ICONS[card.id];
                return (
                  <div
                    key={card.id}
                    className={`flex flex-col justify-between rounded-2xl border p-4 ${style.border}`}
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <Icon className="h-5 w-5 text-slate-200" />
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                          />
                          {card.statusLabel}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-white">
                        {card.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                        {card.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {showTechDetails && (
              <div className="mt-5 grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 sm:grid-cols-5">
                <div>
                  <span className="block text-[11px] text-slate-500">
                    {t.zoneLabel}
                  </span>
                  <span className="font-semibold text-emerald-300">
                    {agroZone ? t.zones[agroZone] : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">
                    {t.elevLabel}
                  </span>
                  <span className="font-semibold text-white">
                    {climate?.elevationM !== null
                      ? `${climate?.elevationM} m`
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">
                    {t.slopeLabel}
                  </span>
                  <span className="font-semibold text-white">
                    {climate?.slopePct !== null
                      ? `${climate?.slopePct}%`
                      : `${selectedPreset?.slopePct ?? "—"}%`}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">
                    {t.soilMoistLabel}
                  </span>
                  <span className="font-semibold text-white">
                    {climate?.soilMoistureM3 !== null
                      ? `${climate?.soilMoistureM3} m³/m³`
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">
                    {t.eoLabel}
                  </span>
                  <span className="font-semibold text-white">
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
      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {t.step3Label}
              </span>
              {agroZone && (
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                  {t.zones[agroZone]}
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-white">
              {t.step3Title}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "water", label: `💧 ${t.priorities.water}` },
                { id: "soil", label: `🌱 ${t.priorities.soil}` },
                { id: "climate", label: `🌡️ ${t.priorities.climate}` },
                { id: "erosion", label: `⛰️ ${t.priorities.erosion}` },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPriority(opt.id)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                  priority === opt.id
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                    : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading || rotations.length === 0 ? (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
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
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-950/60"
                  }`}
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-400">
                        {crop.category}
                      </span>
                      {isBest ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                          <Award className="h-3.5 w-3.5" />
                          {t.bestChoice}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
                          <Repeat className="h-3 w-3" />
                          {t.optionN(idx + 1)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {crop.name}
                        </h3>
                        <span className="text-[11px] italic text-slate-400">
                          {crop.scientificName}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-emerald-400">
                        {crop.matchScore}%
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-slate-200">
                      {crop.reason}
                    </p>

                    <div className="mt-4 space-y-2.5">
                      <div>
                        <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                          <span>{t.waterSaving}</span>
                          <span className="text-slate-200">
                            {crop.waterSavingScore}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-sky-400"
                            style={{ width: `${crop.waterSavingScore}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                          <span>{t.soilCare}</span>
                          <span className="text-slate-200">
                            {crop.soilScore}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{ width: `${crop.soilScore}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                          <span>{t.climateFit}</span>
                          <span className="text-slate-200">
                            {crop.climateFitScore}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${crop.climateFitScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3 text-[11px]">
                    <p className="text-slate-300">
                      <span className="font-semibold text-emerald-300">
                        {t.sanidadLabel}:
                      </span>{" "}
                      {crop.pestBreakBenefit}
                    </p>
                    <p className="text-slate-400">
                      <span className="font-semibold text-amber-300">
                        {t.tradeOffLabel}:
                      </span>{" "}
                      {crop.tradeOff}
                    </p>
                    <div className="pt-1.5 text-[10px] leading-relaxed text-slate-400">
                      <span className="font-semibold text-slate-300">
                        {t.sciBaseLabel}:
                      </span>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-slate-500">
                        {crop.citations.map((cite, cIdx) => (
                          <li key={cIdx}>{cite}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5 sm:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          {t.methodTitle}
        </h3>
        <ul className="mt-2.5 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-400">
          {t.methodItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 border-t border-slate-800/80 pt-3 text-xs font-medium text-slate-300">
          {t.farmerDisclaimer}
        </p>
      </footer>
    </main>
  );
}
