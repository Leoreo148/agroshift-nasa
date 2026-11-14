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
} from "lucide-react";
import { FARM_PRESETS, type FarmPreset } from "@/data/farms";
import {
  buildFieldDiagnostics,
  type ClimateMetrics,
  type RiskLevel,
} from "@/lib/diagnostics";

const FarmMap = dynamic(() => import("@/components/FarmMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-sm text-slate-400 sm:h-80">
      Cargando mapa satelital...
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

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMsg(null);

    fetch(`/api/climate?lat=${lat}&lon=${lon}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error consultando NASA");
        return data;
      })
      .then((data) => {
        if (!active) return;
        setClimate(data.summary);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setErrorMsg(err.message || "No se pudo cargar el clima");
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
      setErrorMsg("Ingresa coordenadas válidas (Lat: -90 a 90, Lon: -180 a 180).");
      return;
    }
    setSelectedPreset(null);
    setLat(Number(parsedLat.toFixed(4)));
    setLon(Number(parsedLon.toFixed(4)));
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setErrorMsg("Tu navegador no permite geolocalización.");
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
        setErrorMsg("No se pudo obtener tu ubicación actual.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }

  const activeLabel = selectedPreset
    ? `${selectedPreset.name} (${selectedPreset.region})`
    : `Parcela personalizada (${lat.toFixed(2)}, ${lon.toFixed(2)})`;

  const diagnostic = climate
    ? buildFieldDiagnostics(climate, selectedPreset?.slopePct)
    : null;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-2 border-b border-slate-800/90 pb-6">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <Sprout className="h-3.5 w-3.5" />
          NASA Space Apps 2026 · Field Shift
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          AgroShift NASA
        </h1>
        <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
          Elige una parcela, entiende sus riesgos en lenguaje simple y descubre
          qué rotación de cultivos la protege mejor.
        </p>
      </header>

      {/* PASO 1: SELECTOR DE PARCELA */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Paso 1 de 3
            </span>
            <h2 className="text-xl font-semibold text-white">
              Elige tu parcela o ubicación
            </h2>
          </div>

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-500/60 hover:bg-slate-800 disabled:opacity-50"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : (
              <LocateFixed className="h-3.5 w-3.5 text-emerald-400" />
            )}
            Usar mi ubicación
          </button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {FARM_PRESETS.map((preset) => {
            const isSelected = selectedPreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => choosePreset(preset)}
                className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-950/30"
                    : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-400">
                      {preset.region}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {preset.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-300">
                  <span>{preset.climateTag}</span>
                  <span className="text-slate-400">{preset.currentCrop}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <FarmMap
              lat={lat}
              lon={lon}
              label={activeLabel}
              onSelectCoords={handleMapClick}
            />
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 lg:col-span-5">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-emerald-400">
                <MapPin className="h-3.5 w-3.5" />
                Parcela activa
              </div>
              <h3 className="text-lg font-semibold text-white">
                {activeLabel}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {selectedPreset
                  ? `Cultivo actual: ${selectedPreset.currentCrop}`
                  : "Ubicación elegida libremente en el mapa."}
              </p>

              <div className="mt-5">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Clima real últimos 30 días
                  </span>
                  <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-300">
                    NASA POWER
                  </span>
                </div>

                {loading ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    Consultando datos satelitales de la NASA...
                  </div>
                ) : errorMsg ? (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                    {errorMsg}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                        Temperatura media
                      </div>
                      <div className="mt-1 text-lg font-bold text-white">
                        {climate?.tempAvgC !== null
                          ? `${climate?.tempAvgC} °C`
                          : "—"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Mín {climate?.tempMinC ?? "—"}° · Máx{" "}
                        {climate?.tempMaxC ?? "—"}°
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <CloudRain className="h-3.5 w-3.5 text-sky-400" />
                        Lluvia acumulada
                      </div>
                      <div className="mt-1 text-lg font-bold text-white">
                        {climate?.rain30dMm !== null
                          ? `${climate?.rain30dMm} mm`
                          : "—"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Últimos 30 días
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                        Humedad del aire
                      </div>
                      <div className="mt-1 text-lg font-bold text-white">
                        {climate?.humidityPct !== null
                          ? `${climate?.humidityPct}%`
                          : "—"}
                      </div>
                      <div className="text-[11px] text-slate-400">Promedio</div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Sun className="h-3.5 w-3.5 text-yellow-400" />
                        Energía solar
                      </div>
                      <div className="mt-1 text-lg font-bold text-white">
                        {climate?.solarMjM2Day !== null
                          ? `${climate?.solarMjM2Day}`
                          : "—"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        MJ/m² al día
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={applyManualCoords}
              className="mt-2 flex flex-wrap items-end gap-2 border-t border-slate-800 pt-3"
            >
              <div className="min-w-[90px] flex-1">
                <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                  Latitud
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
                  Longitud
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
                Ir
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* PASO 2: DIAGNÓSTICO SIMPLE (SEMÁFORO SIN TECNICISMOS) */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Paso 2 de 3
            </span>
            <h2 className="text-xl font-semibold text-white">
              ¿Cómo está tu campo hoy?
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
            Ver datos científicos
          </button>
        </div>

        {loading || !diagnostic ? (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            Analizando riesgos climáticos y del terreno...
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
              <div className="mt-5 grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 sm:grid-cols-4">
                <div>
                  <span className="block text-[11px] text-slate-500">
                    Elevación (DEM / SRTM)
                  </span>
                  <span className="font-semibold text-white">
                    {climate?.elevationM !== null
                      ? `${climate?.elevationM} m s.n.m.`
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">
                    Pendiente estimada
                  </span>
                  <span className="font-semibold text-white">
                    {climate?.slopePct !== null
                      ? `${climate?.slopePct}%`
                      : `${selectedPreset?.slopePct ?? "—"}%`}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">
                    Humedad suelo (0–7 cm)
                  </span>
                  <span className="font-semibold text-white">
                    {climate?.soilMoistureM3 !== null
                      ? `${climate?.soilMoistureM3} m³/m³`
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">
                    Evaporación E₀ (Penman 1948)
                  </span>
                  <span className="font-semibold text-white">
                    {climate?.eoMmDay !== null
                      ? `${climate?.eoMmDay} mm/día`
                      : "—"}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
