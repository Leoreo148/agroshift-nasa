import type { ClimateMetrics } from "@/lib/diagnostics";

export type FarmerPriority = "water" | "soil" | "climate" | "erosion";

export interface CropOption {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  /** Requerimiento hídrico estacional FAO-56 (mm/ciclo): [min, max] */
  waterRangeMm: [number, number];
  /** Umbrales térmicos FAO EcoCrop (°C): [T_abs_min, T_opt_min, T_opt_max, T_abs_max] */
  ecoCropTempC: [number, number, number, number];
  /** Fijación biológica de nitrógeno estimada (kg N/ha/ciclo) según meta-análisis */
  bnfKgNHa: [number, number];
  /** Factor C aproximado en RUSLE (menor = protege más contra la erosión, suelo desnudo = 1.0) */
  rusleCFactor: number;
  pestBreakBenefit: string;
  tradeOff: string;
  reference: string;
}

export interface EvaluatedCrop extends CropOption {
  matchScore: number;
  waterSavingScore: number;
  climateFitScore: number;
  soilScore: number;
  reason: string;
}

const CROP_CATALOG: CropOption[] = [
  {
    id: "quinoa",
    name: "Quinua",
    scientificName: "Chenopodium quinoa",
    category: "Grano andino rústico",
    waterRangeMm: [300, 500],
    ecoCropTempC: [-3, 15, 25, 34],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.30,
    pestBreakBenefit: "Corta ciclos de plagas tras papa o cereales.",
    tradeOff: "Sensible a calor fuerte (>32–34 °C) durante floración y a encharcamiento.",
    reference: "FAO EcoCrop · FAO-56 (Allen et al., 1998)",
  },
  {
    id: "cover-oats-vetch",
    name: "Avena + Vicia (Cobertura)",
    scientificName: "Avena sativa + Vicia sativa",
    category: "Cobertura y abono verde",
    waterRangeMm: [350, 550],
    ecoCropTempC: [-3, 12, 24, 31],
    bnfKgNHa: [50, 150],
    rusleCFactor: 0.12,
    pestBreakBenefit: "Suprime malezas y reduce la erosión hídrica en >50% frente a suelo desnudo.",
    tradeOff: "No da grano comercial directo, pero aporta 50–150 kg N/ha y frena erosión.",
    reference: "FAO EcoCrop · RUSLE (Renard et al.) · BNF Vicia sativa",
  },
  {
    id: "legume-bean",
    name: "Frijol común (Leguminosa)",
    scientificName: "Phaseolus vulgaris",
    category: "Leguminosa de grano",
    waterRangeMm: [350, 500],
    ecoCropTempC: [10, 15, 27, 35],
    bnfKgNHa: [10, 60],
    rusleCFactor: 0.32,
    pestBreakBenefit: "Rompe ciclos de plagas de gramíneas (maíz/sorgo).",
    tradeOff: "Fija menos N (10–60 kg/ha) que coberturas de vicia y es sensible a >30 °C en floración.",
    reference: "FAO EcoCrop · FAO-56 · Meta-análisis BNF P. vulgaris",
  },
  {
    id: "sorghum",
    name: "Sorgo",
    scientificName: "Sorghum bicolor",
    category: "Cereal tolerante a sequía y calor",
    waterRangeMm: [450, 650],
    ecoCropTempC: [12, 20, 34, 42],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.35,
    pestBreakBenefit: "Corta ciclos de nemátodos y enfermedades de raíz.",
    tradeOff: "Requiere al menos ~12–15 °C para establecerse; menor precio que hortalizas.",
    reference: "FAO EcoCrop · FAO-56 (Allen et al., 1998)",
  },
  {
    id: "maize",
    name: "Maíz",
    scientificName: "Zea mays",
    category: "Cereal de alta demanda",
    waterRangeMm: [500, 800],
    ecoCropTempC: [10, 18, 32, 40],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.40,
    pestBreakBenefit: "Deja alto volumen de rastrojo si se maneja sin quema y en rotación.",
    tradeOff: "Exige 500–800 mm/ciclo y mayor nitrógeno; vulnerable a erosión en etapas iniciales.",
    reference: "FAO EcoCrop · FAO-56 · RUSLE C-factor",
  },
];

/**
 * Función trapezoidal estándar de aptitud FAO EcoCrop para temperatura (°C).
 */
function ecoCropTempSuitability(
  tAvg: number,
  tMin: number,
  tMax: number,
  [tAbsMin, tOptMin, tOptMax, tAbsMax]: [number, number, number, number]
): number {
  const scoreForTemp = (t: number): number => {
    if (t <= tAbsMin || t >= tAbsMax) return 0;
    if (t >= tOptMin && t <= tOptMax) return 100;
    if (t < tOptMin) return ((t - tAbsMin) / (tOptMin - tAbsMin)) * 100;
    return ((tAbsMax - t) / (tAbsMax - tOptMax)) * 100;
  };

  // Combinamos aptitud de la media (60%) con penalización por extremos reales mín/máx (40%)
  const sAvg = scoreForTemp(tAvg);
  const sMin = tMin < tAbsMin ? 0 : tMin < tOptMin ? 70 : 100;
  const sMax = tMax > tAbsMax ? 0 : tMax > tOptMax ? 65 : 100;
  return Math.max(5, Math.round(sAvg * 0.6 + ((sMin + sMax) / 2) * 0.4));
}

export function evaluateCropRotations(
  climate: ClimateMetrics,
  priority: FarmerPriority,
  fallbackSlopePct?: number
): EvaluatedCrop[] {
  const rain30d = climate.rain30dMm ?? 20;
  const eoDay = climate.eoMmDay ?? 4.5;
  const tAvg = climate.tempAvgC ?? 20;
  const tMin = climate.tempMinC ?? 12;
  const tMax = climate.tempMaxC ?? 26;
  const slope = climate.slopePct ?? fallbackSlopePct ?? 2;

  // Demanda evaporativa mensual Eo (Penman 1948) frente a lluvia mensual
  const monthlyEo = eoDay * 30;
  const waterDeficitRatio = Math.min(1.6, Math.max(0.3, monthlyEo / Math.max(25, rain30d + 25)));

  const evaluated = CROP_CATALOG.map((crop) => {
    const midWaterMm = (crop.waterRangeMm[0] + crop.waterRangeMm[1]) / 2;

    // 1. Eficiencia hídrica basada en rango estacional FAO-56 (300–800 mm)
    const baseWaterScore = ((850 - midWaterMm) / (850 - 350)) * 100;
    const deficitPenalty = waterDeficitRatio > 1.05 && midWaterMm > 520 ? 18 : 0;
    const waterSavingScore = Math.max(
      10,
      Math.min(98, Math.round(baseWaterScore - deficitPenalty))
    );

    // 2. Aptitud térmica trapezoidal FAO EcoCrop
    const climateFitScore = ecoCropTempSuitability(
      tAvg,
      tMin,
      tMax,
      crop.ecoCropTempC
    );

    // 3. Cuidado del suelo y control de erosión (BNF + Factor C RUSLE)
    const bnfMid = (crop.bnfKgNHa[0] + crop.bnfKgNHa[1]) / 2;
    const bnfScore = Math.min(100, 40 + (bnfMid / 100) * 60);
    const erosionProtection = Math.max(10, Math.min(100, Math.round((1 - crop.rusleCFactor) * 105)));

    const soilScore =
      slope >= 8
        ? Math.round(bnfScore * 0.4 + erosionProtection * 0.6)
        : Math.round(bnfScore * 0.65 + erosionProtection * 0.35);

    const weights: Record<
      FarmerPriority,
      { wWater: number; wSoil: number; wClimate: number }
    > = {
      water: { wWater: 0.5, wSoil: 0.2, wClimate: 0.3 },
      soil: { wWater: 0.2, wSoil: 0.55, wClimate: 0.25 },
      climate: { wWater: 0.25, wSoil: 0.2, wClimate: 0.55 },
      erosion: { wWater: 0.2, wSoil: 0.55, wClimate: 0.25 },
    };

    const w = weights[priority];
    const matchScore = Math.min(
      99,
      Math.round(
        waterSavingScore * w.wWater +
          soilScore * w.wSoil +
          climateFitScore * w.wClimate
      )
    );

    const reasons: string[] = [];
    if (midWaterMm <= 450) {
      reasons.push(`demanda hídrica baja (${crop.waterRangeMm[0]}–${crop.waterRangeMm[1]} mm/ciclo)`);
    }
    if (crop.bnfKgNHa[1] > 0) {
      reasons.push(`fija ${crop.bnfKgNHa[0]}–${crop.bnfKgNHa[1]} kg N/ha`);
    }
    if (climateFitScore >= 85) {
      reasons.push(`óptimo para ${tAvg} °C promedio en esta zona`);
    }
    if (slope >= 8 && crop.rusleCFactor <= 0.2) {
      reasons.push(`bajo factor de erosión (C=${crop.rusleCFactor})`);
    }

    const reason =
      reasons.length > 0
        ? `Recomendado: ${reasons.join("; ")}.`
        : "Opción viable con riego de apoyo y manejo de fertilización.";

    return {
      ...crop,
      matchScore,
      waterSavingScore,
      climateFitScore,
      soilScore,
      reason,
    };
  });

  return evaluated.sort((a, b) => b.matchScore - a.matchScore);
}
