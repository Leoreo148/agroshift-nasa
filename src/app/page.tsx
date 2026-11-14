import { Sprout, CloudSun, Repeat, MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10 flex flex-col gap-3 border-b border-slate-800 pb-8">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <Sprout className="h-3.5 w-3.5" />
          NASA Space Apps 2026 · Field Shift
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          AgroShift NASA
        </h1>
        <p className="max-w-2xl text-base text-slate-300">
          Decisiones simples para adaptar tu campo al clima cambiante y elegir
          la mejor rotación de cultivos con datos abiertos de NASA y ESA.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-3 inline-flex rounded-xl bg-sky-500/10 p-2.5 text-sky-400">
            <MapPin className="h-5 w-5" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-white">
            1. Elige tu campo
          </h2>
          <p className="text-sm text-slate-400">
            Selecciona una parcela de ejemplo o cualquier ubicación para evaluar
            su clima, suelo y relieve.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-3 inline-flex rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
            <CloudSun className="h-5 w-5" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-white">
            2. Diagnóstico simple
          </h2>
          <p className="text-sm text-slate-400">
            Semáforo claro de agua disponible, estrés por calor, salud del
            cultivo y riesgo de erosión.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-3 inline-flex rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
            <Repeat className="h-5 w-5" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-white">
            3. Compara rotaciones
          </h2>
          <p className="text-sm text-slate-400">
            Simula qué cultivo alternativo ahorra más agua, protege el suelo y
            resiste mejor el calor.
          </p>
        </div>
      </section>

      <footer className="mt-12 text-xs text-slate-500">
        Fuentes previstas: NASA POWER · SMAP · GPM IMERG · ECOSTRESS · SRTM ·
        Sentinel-2 · ERA5 · FAO GAEZ
      </footer>
    </main>
  );
}
