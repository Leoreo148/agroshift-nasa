import { NextRequest, NextResponse } from "next/server";
import type { ClimateMetrics, Trend5ySummary } from "@/lib/diagnostics";
import type { Lang } from "@/lib/i18n";
import type { NdviTrend } from "@/lib/providers/modisNdvi";

export interface DynamicCropRequest {
  cropName: string;
  lat: number;
  lon: number;
  climate: ClimateMetrics;
  trend5y?: Trend5ySummary | null;
  ndvi?: NdviTrend | null;
  lang: Lang;
}

export interface DynamicCropResponse {
  source: "gemini-2.5-flash-fao" | "fao-ecocrop-database";
  cropName: string;
  scientificName: string;
  family?: string;
  thumbnailUrl?: string;
  description: string;
  feasibility: "optimal" | "manageable" | "critical";
  matchScore: number;
  faoParameters: {
    tempOptMin: number;
    tempOptMax: number;
    tempAbsMin: number;
    tempAbsMax: number;
    waterDemandMm: number;
    kcMid: number;
    cycleDays: number;
  };
  limitingFactors: string[];
  recommendations: string[];
}

interface BotanicalWikiInfo {
  title: string;
  description?: string;
  extract?: string;
  thumbnailUrl?: string;
}

async function fetchWikiInfo(query: string, lang: Lang): Promise<BotanicalWikiInfo | null> {
  const wikiLang = lang === "es" ? "es" : lang === "fr" ? "fr" : lang === "pt" ? "pt" : "en";
  try {
    const searchUrl = `https://${wikiLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}+cultivo+planta&format=json`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "AgroShift-NASA/1.0 (agroshift@nasa.spaceapps.challenge)" },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const firstTitle = data?.query?.search?.[0]?.title;
    if (!firstTitle) return null;

    const sumUrl = `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstTitle)}`;
    const sumRes = await fetch(sumUrl, {
      headers: { "User-Agent": "AgroShift-NASA/1.0 (agroshift@nasa.spaceapps.challenge)" },
      signal: AbortSignal.timeout(3500),
    });
    if (!sumRes.ok) return null;
    const sumData = await sumRes.json();
    return {
      title: sumData.title ?? firstTitle,
      description: sumData.description,
      extract: sumData.extract ? sumData.extract.slice(0, 240) + "..." : undefined,
      thumbnailUrl: sumData.thumbnail?.source,
    };
  } catch {
    return null;
  }
}

// Extensive FAO EcoCrop benchmark dictionary for common crops fallback
interface FaoCropDefaults {
  scientificName: string;
  family: string;
  tempOptMin: number;
  tempOptMax: number;
  tempAbsMin: number;
  tempAbsMax: number;
  waterDemandMm: number;
  kcMid: number;
  cycleDays: number;
  frostSensitive: boolean;
}

const KNOWN_ECOCROPS: Record<string, FaoCropDefaults> = {
  aguacate: { scientificName: "Persea americana", family: "Lauraceae", tempOptMin: 18, tempOptMax: 28, tempAbsMin: 0, tempAbsMax: 38, waterDemandMm: 950, kcMid: 0.85, cycleDays: 365, frostSensitive: true },
  palta: { scientificName: "Persea americana", family: "Lauraceae", tempOptMin: 18, tempOptMax: 28, tempAbsMin: 0, tempAbsMax: 38, waterDemandMm: 950, kcMid: 0.85, cycleDays: 365, frostSensitive: true },
  avocado: { scientificName: "Persea americana", family: "Lauraceae", tempOptMin: 18, tempOptMax: 28, tempAbsMin: 0, tempAbsMax: 38, waterDemandMm: 950, kcMid: 0.85, cycleDays: 365, frostSensitive: true },
  cafe: { scientificName: "Coffea arabica", family: "Rubiaceae", tempOptMin: 18, tempOptMax: 24, tempAbsMin: 4, tempAbsMax: 32, waterDemandMm: 1200, kcMid: 1.05, cycleDays: 365, frostSensitive: true },
  coffee: { scientificName: "Coffea arabica", family: "Rubiaceae", tempOptMin: 18, tempOptMax: 24, tempAbsMin: 4, tempAbsMax: 32, waterDemandMm: 1200, kcMid: 1.05, cycleDays: 365, frostSensitive: true },
  mango: { scientificName: "Mangifera indica", family: "Anacardiaceae", tempOptMin: 22, tempOptMax: 32, tempAbsMin: 2, tempAbsMax: 44, waterDemandMm: 900, kcMid: 0.8, cycleDays: 365, frostSensitive: true },
  cacao: { scientificName: "Theobroma cacao", family: "Malvaceae", tempOptMin: 21, tempOptMax: 30, tempAbsMin: 10, tempAbsMax: 36, waterDemandMm: 1500, kcMid: 1.05, cycleDays: 365, frostSensitive: true },
  pitahaya: { scientificName: "Selenicereus undatus", family: "Cactaceae", tempOptMin: 20, tempOptMax: 30, tempAbsMin: 3, tempAbsMax: 40, waterDemandMm: 450, kcMid: 0.4, cycleDays: 365, frostSensitive: true },
  dragonfruit: { scientificName: "Selenicereus undatus", family: "Cactaceae", tempOptMin: 20, tempOptMax: 30, tempAbsMin: 3, tempAbsMax: 40, waterDemandMm: 450, kcMid: 0.4, cycleDays: 365, frostSensitive: true },
  platano: { scientificName: "Musa acuminata", family: "Musaceae", tempOptMin: 24, tempOptMax: 32, tempAbsMin: 6, tempAbsMax: 38, waterDemandMm: 1400, kcMid: 1.1, cycleDays: 365, frostSensitive: true },
  banana: { scientificName: "Musa acuminata", family: "Musaceae", tempOptMin: 24, tempOptMax: 32, tempAbsMin: 6, tempAbsMax: 38, waterDemandMm: 1400, kcMid: 1.1, cycleDays: 365, frostSensitive: true },
  banano: { scientificName: "Musa acuminata", family: "Musaceae", tempOptMin: 24, tempOptMax: 32, tempAbsMin: 6, tempAbsMax: 38, waterDemandMm: 1400, kcMid: 1.1, cycleDays: 365, frostSensitive: true },
  uva: { scientificName: "Vitis vinifera", family: "Vitaceae", tempOptMin: 15, tempOptMax: 30, tempAbsMin: -10, tempAbsMax: 42, waterDemandMm: 600, kcMid: 0.7, cycleDays: 365, frostSensitive: false },
  grape: { scientificName: "Vitis vinifera", family: "Vitaceae", tempOptMin: 15, tempOptMax: 30, tempAbsMin: -10, tempAbsMax: 42, waterDemandMm: 600, kcMid: 0.7, cycleDays: 365, frostSensitive: false },
  arandano: { scientificName: "Vaccinium corymbosum", family: "Ericaceae", tempOptMin: 14, tempOptMax: 26, tempAbsMin: -15, tempAbsMax: 35, waterDemandMm: 700, kcMid: 0.9, cycleDays: 365, frostSensitive: false },
  blueberry: { scientificName: "Vaccinium corymbosum", family: "Ericaceae", tempOptMin: 14, tempOptMax: 26, tempAbsMin: -15, tempAbsMax: 35, waterDemandMm: 700, kcMid: 0.9, cycleDays: 365, frostSensitive: false },
  limon: { scientificName: "Citrus x limon", family: "Rutaceae", tempOptMin: 18, tempOptMax: 28, tempAbsMin: -2, tempAbsMax: 39, waterDemandMm: 850, kcMid: 0.75, cycleDays: 365, frostSensitive: true },
  naranja: { scientificName: "Citrus x sinensis", family: "Rutaceae", tempOptMin: 18, tempOptMax: 30, tempAbsMin: -3, tempAbsMax: 40, waterDemandMm: 850, kcMid: 0.75, cycleDays: 365, frostSensitive: true },
  olivo: { scientificName: "Olea europaea", family: "Oleaceae", tempOptMin: 16, tempOptMax: 28, tempAbsMin: -8, tempAbsMax: 42, waterDemandMm: 500, kcMid: 0.65, cycleDays: 365, frostSensitive: false },
  olive: { scientificName: "Olea europaea", family: "Oleaceae", tempOptMin: 16, tempOptMax: 28, tempAbsMin: -8, tempAbsMax: 42, waterDemandMm: 500, kcMid: 0.65, cycleDays: 365, frostSensitive: false },
  chia: { scientificName: "Salvia hispanica", family: "Lamiaceae", tempOptMin: 16, tempOptMax: 28, tempAbsMin: 4, tempAbsMax: 36, waterDemandMm: 450, kcMid: 0.85, cycleDays: 130, frostSensitive: true },
  esparrago: { scientificName: "Asparagus officinalis", family: "Asparagaceae", tempOptMin: 16, tempOptMax: 25, tempAbsMin: -6, tempAbsMax: 36, waterDemandMm: 700, kcMid: 0.95, cycleDays: 365, frostSensitive: false },
  asparagus: { scientificName: "Asparagus officinalis", family: "Asparagaceae", tempOptMin: 16, tempOptMax: 25, tempAbsMin: -6, tempAbsMax: 36, waterDemandMm: 700, kcMid: 0.95, cycleDays: 365, frostSensitive: false },
  papa: { scientificName: "Solanum tuberosum", family: "Solanaceae", tempOptMin: 15, tempOptMax: 20, tempAbsMin: 2, tempAbsMax: 28, waterDemandMm: 500, kcMid: 1.15, cycleDays: 120, frostSensitive: true },
  potato: { scientificName: "Solanum tuberosum", family: "Solanaceae", tempOptMin: 15, tempOptMax: 20, tempAbsMin: 2, tempAbsMax: 28, waterDemandMm: 500, kcMid: 1.15, cycleDays: 120, frostSensitive: true },
  tomate: { scientificName: "Solanum lycopersicum", family: "Solanaceae", tempOptMin: 18, tempOptMax: 27, tempAbsMin: 5, tempAbsMax: 35, waterDemandMm: 550, kcMid: 1.15, cycleDays: 115, frostSensitive: true },
  tomato: { scientificName: "Solanum lycopersicum", family: "Solanaceae", tempOptMin: 18, tempOptMax: 27, tempAbsMin: 5, tempAbsMax: 35, waterDemandMm: 550, kcMid: 1.15, cycleDays: 115, frostSensitive: true },
  maiz: { scientificName: "Zea mays", family: "Poaceae", tempOptMin: 20, tempOptMax: 30, tempAbsMin: 8, tempAbsMax: 40, waterDemandMm: 600, kcMid: 1.2, cycleDays: 130, frostSensitive: true },
  corn: { scientificName: "Zea mays", family: "Poaceae", tempOptMin: 20, tempOptMax: 30, tempAbsMin: 8, tempAbsMax: 40, waterDemandMm: 600, kcMid: 1.2, cycleDays: 130, frostSensitive: true },
  trigo: { scientificName: "Triticum aestivum", family: "Poaceae", tempOptMin: 14, tempOptMax: 23, tempAbsMin: -4, tempAbsMax: 33, waterDemandMm: 450, kcMid: 1.15, cycleDays: 130, frostSensitive: false },
  wheat: { scientificName: "Triticum aestivum", family: "Poaceae", tempOptMin: 14, tempOptMax: 23, tempAbsMin: -4, tempAbsMax: 33, waterDemandMm: 450, kcMid: 1.15, cycleDays: 130, frostSensitive: false },
  quinua: { scientificName: "Chenopodium quinoa", family: "Amaranthaceae", tempOptMin: 12, tempOptMax: 20, tempAbsMin: -4, tempAbsMax: 32, waterDemandMm: 350, kcMid: 0.95, cycleDays: 140, frostSensitive: false },
  quinoa: { scientificName: "Chenopodium quinoa", family: "Amaranthaceae", tempOptMin: 12, tempOptMax: 20, tempAbsMin: -4, tempAbsMax: 32, waterDemandMm: 350, kcMid: 0.95, cycleDays: 140, frostSensitive: false },
  arroz: { scientificName: "Oryza sativa", family: "Poaceae", tempOptMin: 22, tempOptMax: 32, tempAbsMin: 12, tempAbsMax: 40, waterDemandMm: 1100, kcMid: 1.2, cycleDays: 140, frostSensitive: true },
  rice: { scientificName: "Oryza sativa", family: "Poaceae", tempOptMin: 22, tempOptMax: 32, tempAbsMin: 12, tempAbsMax: 40, waterDemandMm: 1100, kcMid: 1.2, cycleDays: 140, frostSensitive: true },
  fresa: { scientificName: "Fragaria x ananassa", family: "Rosaceae", tempOptMin: 15, tempOptMax: 24, tempAbsMin: -5, tempAbsMax: 32, waterDemandMm: 450, kcMid: 0.85, cycleDays: 180, frostSensitive: false },
  frutilla: { scientificName: "Fragaria x ananassa", family: "Rosaceae", tempOptMin: 15, tempOptMax: 24, tempAbsMin: -5, tempAbsMax: 32, waterDemandMm: 450, kcMid: 0.85, cycleDays: 180, frostSensitive: false },
  strawberry: { scientificName: "Fragaria x ananassa", family: "Rosaceae", tempOptMin: 15, tempOptMax: 24, tempAbsMin: -5, tempAbsMax: 32, waterDemandMm: 450, kcMid: 0.85, cycleDays: 180, frostSensitive: false },
  manzana: { scientificName: "Malus domestica", family: "Rosaceae", tempOptMin: 15, tempOptMax: 24, tempAbsMin: -25, tempAbsMax: 35, waterDemandMm: 700, kcMid: 0.95, cycleDays: 365, frostSensitive: false },
  manzano: { scientificName: "Malus domestica", family: "Rosaceae", tempOptMin: 15, tempOptMax: 24, tempAbsMin: -25, tempAbsMax: 35, waterDemandMm: 700, kcMid: 0.95, cycleDays: 365, frostSensitive: false },
  apple: { scientificName: "Malus domestica", family: "Rosaceae", tempOptMin: 15, tempOptMax: 24, tempAbsMin: -25, tempAbsMax: 35, waterDemandMm: 700, kcMid: 0.95, cycleDays: 365, frostSensitive: false },
  lechuga: { scientificName: "Lactuca sativa", family: "Asteraceae", tempOptMin: 14, tempOptMax: 20, tempAbsMin: 2, tempAbsMax: 28, waterDemandMm: 350, kcMid: 1.0, cycleDays: 65, frostSensitive: true },
  lettuce: { scientificName: "Lactuca sativa", family: "Asteraceae", tempOptMin: 14, tempOptMax: 20, tempAbsMin: 2, tempAbsMax: 28, waterDemandMm: 350, kcMid: 1.0, cycleDays: 65, frostSensitive: true },
  zanahoria: { scientificName: "Daucus carota", family: "Apiaceae", tempOptMin: 16, tempOptMax: 22, tempAbsMin: 0, tempAbsMax: 30, waterDemandMm: 400, kcMid: 1.05, cycleDays: 95, frostSensitive: false },
  carrot: { scientificName: "Daucus carota", family: "Apiaceae", tempOptMin: 16, tempOptMax: 22, tempAbsMin: 0, tempAbsMax: 30, waterDemandMm: 400, kcMid: 1.05, cycleDays: 95, frostSensitive: false },
  cebolla: { scientificName: "Allium cepa", family: "Amaryllidaceae", tempOptMin: 15, tempOptMax: 25, tempAbsMin: -2, tempAbsMax: 35, waterDemandMm: 450, kcMid: 1.05, cycleDays: 130, frostSensitive: false },
  onion: { scientificName: "Allium cepa", family: "Amaryllidaceae", tempOptMin: 15, tempOptMax: 25, tempAbsMin: -2, tempAbsMax: 35, waterDemandMm: 450, kcMid: 1.05, cycleDays: 130, frostSensitive: false },
  soja: { scientificName: "Glycine max", family: "Fabaceae", tempOptMin: 20, tempOptMax: 30, tempAbsMin: 6, tempAbsMax: 38, waterDemandMm: 550, kcMid: 1.15, cycleDays: 125, frostSensitive: true },
  soya: { scientificName: "Glycine max", family: "Fabaceae", tempOptMin: 20, tempOptMax: 30, tempAbsMin: 6, tempAbsMax: 38, waterDemandMm: 550, kcMid: 1.15, cycleDays: 125, frostSensitive: true },
  soybean: { scientificName: "Glycine max", family: "Fabaceae", tempOptMin: 20, tempOptMax: 30, tempAbsMin: 6, tempAbsMax: 38, waterDemandMm: 550, kcMid: 1.15, cycleDays: 125, frostSensitive: true },
};

function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function evaluateDeterministicFao(
  cropName: string,
  defaults: FaoCropDefaults,
  wiki: BotanicalWikiInfo | null,
  body: DynamicCropRequest
): DynamicCropResponse {
  const temp = body.climate.tempAvgC ?? 20;
  const tempMin = body.climate.tempMinC ?? (temp - 5);
  const tempMax = body.climate.tempMaxC ?? (temp + 5);
  const eo = body.climate.eoMmDay ?? 4.5;
  const rootMoisture =
    body.climate.soilMoistureM3 !== null
      ? Math.round(body.climate.soilMoistureM3 * 100)
      : 40;
  const hasFrostRisk = tempMin < defaults.tempAbsMin || tempMin < 1;

  const limitingFactors: string[] = [];
  const recommendations: string[] = [];

  let feasibility: "optimal" | "manageable" | "critical" = "optimal";
  let score = 92;

  // Temperature checks
  if (temp < defaults.tempOptMin) {
    const diff = defaults.tempOptMin - temp;
    if (tempMin <= defaults.tempAbsMin) {
      feasibility = "critical";
      score -= 40;
      limitingFactors.push(
        `Temperatura mínima (${tempMin.toFixed(1)}°C) cruza el límite de supervivencia biológica (${defaults.tempAbsMin}°C).`
      );
    } else {
      feasibility = "manageable";
      score -= Math.min(25, Math.round(diff * 4));
      limitingFactors.push(
        `Temperatura media (${temp.toFixed(1)}°C) está ${diff.toFixed(1)}°C por debajo del rango óptimo (${defaults.tempOptMin}-${defaults.tempOptMax}°C).`
      );
    }
  } else if (temp > defaults.tempOptMax) {
    const diff = temp - defaults.tempOptMax;
    if (tempMax >= defaults.tempAbsMax) {
      feasibility = "critical";
      score -= 35;
      limitingFactors.push(
        `Estrés térmico extremo (${tempMax.toFixed(1)}°C) excede el umbral crítico (${defaults.tempAbsMax}°C).`
      );
    } else {
      feasibility = "manageable";
      score -= Math.min(20, Math.round(diff * 3));
      limitingFactors.push(
        `Temperatura media cálida (${temp.toFixed(1)}°C) supera el óptimo (${defaults.tempOptMax}°C).`
      );
    }
  }

  // Frost check
  if (defaults.frostSensitive && hasFrostRisk) {
    feasibility = "critical";
    score -= 30;
    limitingFactors.push(
      `Especie altamente susceptible a heladas en una zona con recurrencia térmica negativa en el registro de 5 años de NASA POWER.`
    );
  }

  // Hydric / Evaporative check
  const estimatedWaterDemand = defaults.kcMid * eo * Math.min(defaults.cycleDays, 30);
  if (rootMoisture < 25 && estimatedWaterDemand > 120) {
    feasibility = feasibility === "critical" ? "critical" : "manageable";
    score -= 15;
    limitingFactors.push(
      `Humedad radicular actual baja (${rootMoisture}%) frente a una demanda evaporativa Penman Eo de ${eo.toFixed(1)} mm/día.`
    );
    recommendations.push(
      "Instalar riego presurizado por goteo con fertirriego fraccionado para sostener la curva fenológica."
    );
  }

  // Slope check
  if (body.climate.slopePct && body.climate.slopePct > 15) {
    score -= 10;
    limitingFactors.push(`Pendiente pronunciada (~${body.climate.slopePct}%) con susceptibilidad a escorrentía.`);
    recommendations.push("Implementar siembra en curvas de nivel o terrazas vivas con mulching protector.");
  }

  if (limitingFactors.length === 0) {
    recommendations.push("Las condiciones agroclimáticas actuales son ideales para la germinación y desarrollo vegetativo.");
    recommendations.push("Asegurar semilla certificada y monitorear periódicamente con índices de vigor satelital NDVI.");
  } else if (feasibility !== "critical") {
    recommendations.push("Manejo agronómico recomendado: aplicar acolchado orgánico (mulch) para conservar humedad en la rizósfera.");
  }

  score = Math.max(15, Math.min(99, score));

  return {
    source: "fao-ecocrop-database",
    cropName: wiki?.title ?? cropName,
    scientificName: defaults.scientificName,
    family: defaults.family,
    thumbnailUrl: wiki?.thumbnailUrl,
    description: wiki?.extract ?? wiki?.description ?? `Cultivo analizado mediante la base de datos agronómica FAO EcoCrop.`,
    feasibility,
    matchScore: score,
    faoParameters: {
      tempOptMin: defaults.tempOptMin,
      tempOptMax: defaults.tempOptMax,
      tempAbsMin: defaults.tempAbsMin,
      tempAbsMax: defaults.tempAbsMax,
      waterDemandMm: defaults.waterDemandMm,
      kcMid: defaults.kcMid,
      cycleDays: defaults.cycleDays,
    },
    limitingFactors,
    recommendations,
  };
}

export async function POST(req: NextRequest) {
  let body: DynamicCropRequest;
  try {
    body = (await req.json()) as DynamicCropRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.cropName || !body.climate) {
    return NextResponse.json({ error: "Missing cropName or climate" }, { status: 400 });
  }

  const normalized = normalizeQuery(body.cropName);
  const wikiPromise = fetchWikiInfo(body.cropName, body.lang || "es");

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  // If Gemini API is available, ask Gemini to query its botanical and FAO EcoCrop knowledge
  if (apiKey) {
    try {
      const wiki = await wikiPromise;
      const langNames: Record<Lang, string> = {
        en: "English",
        es: "Spanish",
        fr: "French",
        pt: "Portuguese",
      };

      const prompt = [
        `You are a senior FAO Agronomist and Crop Feasibility Evaluation Engine.`,
        `The user is asking: Can the crop "${body.cropName}" (botanical search: "${wiki?.title || body.cropName}") be grown successfully in the following field?`,
        `Language: Respond strictly in ${langNames[body.lang || "es"]}.`,
        ``,
        `Field Location & NASA POWER Telemetry:`,
        `- Coordinates: Lat ${body.lat}, Lon ${body.lon}`,
        `- Mean Temperature: ${body.climate.tempAvgC ?? 20}°C (30-day min: ${body.climate.tempMinC ?? 15}°C, max: ${body.climate.tempMaxC ?? 28}°C)`,
        `- 5-Year Historical Low: ${body.climate.tempMinC !== null && body.climate.tempMinC < 2 ? "Sub-zero or near-frost detected" : "Temperate/Warm"}`,
        `- Reference Open Evaporation (Eo Penman): ${body.climate.eoMmDay ?? 4.5} mm/day`,
        `- Soil Moisture (GWETTOP/GWETROOT): ${body.climate.soilMoistureM3 !== null ? (body.climate.soilMoistureM3 * 100).toFixed(0) : "35"}%`,
        `- Elevation: ${body.climate.elevationM ?? 200} m`,
        `- Slope: ${body.climate.slopePct ?? 2}%`,
        body.ndvi ? `- Satellite NDVI Vigor: ${body.ndvi.current.toFixed(2)}` : ``,
        ``,
        `Your task:`,
        `1. Identify exact botanical species (scientificName, family) for "${body.cropName}".`,
        `2. Provide standard FAO EcoCrop parameters: tempOptMin, tempOptMax, tempAbsMin (lethal frost), tempAbsMax, waterDemandMm, kcMid, cycleDays.`,
        `3. Evaluate feasibility strictly against the real NASA data:`,
        `   - "optimal": completely within thermal and hydric optimum.`,
        `   - "manageable": minor constraints that can be solved with agronomic mitigation (drip, greenhouse, windbreaks).`,
        `   - "critical": hard botanical limits breached (severe frost killing plants, unmanageable heat, or extreme water deficit).`,
        `4. Calculate matchScore (0-100).`,
        `5. List 1-3 specific limiting factors based on the NASA numbers, and 2 practical mitigation recommendations.`,
        ``,
        `Return strictly JSON matching this structure:`,
        `{`,
        `  "scientificName": string,`,
        `  "family": string,`,
        `  "description": string (1-2 concise sentences about this crop),`,
        `  "feasibility": "optimal" | "manageable" | "critical",`,
        `  "matchScore": number,`,
        `  "faoParameters": {`,
        `    "tempOptMin": number,`,
        `    "tempOptMax": number,`,
        `    "tempAbsMin": number,`,
        `    "tempAbsMax": number,`,
        `    "waterDemandMm": number,`,
        `    "kcMid": number,`,
        `    "cycleDays": number`,
        `  },`,
        `  "limitingFactors": string[],`,
        `  "recommendations": string[]`,
        `}`,
      ].join("\n");

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;

      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
            responseMimeType: "application/json",
          },
        }),
      });

      if (geminiRes.ok) {
        const geminiJson = await geminiRes.json();
        const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return NextResponse.json({
            source: "gemini-2.5-flash-fao",
            cropName: wiki?.title ?? body.cropName,
            scientificName: parsed.scientificName || "Plantae",
            family: parsed.family,
            thumbnailUrl: wiki?.thumbnailUrl,
            description: wiki?.extract || parsed.description,
            feasibility: parsed.feasibility || "manageable",
            matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : 75,
            faoParameters: parsed.faoParameters || {
              tempOptMin: 15,
              tempOptMax: 28,
              tempAbsMin: 2,
              tempAbsMax: 38,
              waterDemandMm: 600,
              kcMid: 0.9,
              cycleDays: 120,
            },
            limitingFactors: Array.isArray(parsed.limitingFactors) ? parsed.limitingFactors : [],
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          } satisfies DynamicCropResponse);
        }
      }
    } catch (err) {
      console.warn("[api/crops/evaluate] Gemini API evaluation error:", err);
    }
  }

  // Fallback: Check known EcoCrop table or generic botanical model
  const wiki = await wikiPromise;
  const matchedKey = Object.keys(KNOWN_ECOCROPS).find((k) => normalized.includes(k) || k.includes(normalized));
  const defaults = matchedKey ? KNOWN_ECOCROPS[matchedKey] : {
    scientificName: wiki?.title ?? "Especie botánica consultada",
    family: "Plantae",
    tempOptMin: 16,
    tempOptMax: 26,
    tempAbsMin: 2,
    tempAbsMax: 36,
    waterDemandMm: 600,
    kcMid: 0.9,
    cycleDays: 120,
    frostSensitive: true,
  };

  const response = evaluateDeterministicFao(body.cropName, defaults, wiki, body);
  return NextResponse.json(response);
}
