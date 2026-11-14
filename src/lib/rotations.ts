import type { ClimateMetrics } from "@/lib/diagnostics";

export type FarmerPriority = "water" | "soil" | "climate" | "erosion";

export interface CropOption {
  id: string;
  name: string;
  category: string;
  waterNeedLevel: "Muy bajo" | "Bajo" | "Moderado" | "Alto";
  waterDemandMmCycle: number;
  minTempC: number;
  maxTempC: number;
  nitrogenFixer: boolean;
  erosionControl: number; // 1 a 100
  soilHealthBoost: number; // 1 a 100
  pestBreakBenefit: string;
  tradeOff: string;
}

export interface EvaluatedCrop extends CropOption {
  matchScore: number; // 0 a 100
  waterSavingScore: number; // 0 a 100
  climateFitScore: number; // 0 a 100
  soilScore: number; // 0 a 100
  reason: string;
}

const CROP_CATALOG: CropOption[] = [
  {
    id: "sorghum",
    name: "Sorgo granífero / forrajero",
    category: "Cereal resistente a sequía",
    waterNeedLevel: "Bajo",
    waterDemandMmCycle: 380,
    minTempC: 10,
    maxTempC: 38,
    nitrogenFixer: false,
    erosionControl: 68,
    soilHealthBoost: 60,
    pestBreakBenefit: "Corta ciclos de nemátodos y hongos de raíz.",
    tradeOff: "Menor precio por tonelada que hortalizas, pero asegura cosecha con poca agua.",
  },
  {
    id: "legume-bean",
    name: "Frijol / Pallar (Leguminosa)",
    category: "Fijador de nitrógeno",
    waterNeedLevel: "Bajo",
    waterDemandMmCycle: 340,
    minTempC: 10,
    maxTempC: 33,
    nitrogenFixer: true,
    erosionControl: 62,
    soilHealthBoost: 92,
    pestBreakBenefit: "Rompe plagas de gramíneas y mejora la biología del suelo.",
    tradeOff: "Sensible a encharcamientos prolongados o heladas fuertes.",
  },
  {
    id: "quinoa",
    name: "Quinua",
    category: "Grano andino rústico",
    waterNeedLevel: "Muy bajo",
    waterDemandMmCycle: 290,
    minTempC: -2,
    maxTempC: 30,
    nitrogenFixer: false,
    erosionControl: 65,
    soilHealthBoost: 70,
    pestBreakBenefit: "Excelente corte sanitario tras papa o maíz.",
    tradeOff: "No tolera exceso de humedad ni calor extremo sostenido (>32 °C).",
  },
  {
    id: "cover-oats-vetch",
    name: "Avena + Vicia (Cobertura)",
    category: "Cultivo de cobertura y abono verde",
    waterNeedLevel: "Bajo",
    waterDemandMmCycle: 310,
    minTempC: 0,
    maxTempC: 29,
    nitrogenFixer: true,
    erosionControl: 95,
    soilHealthBoost: 96,
    pestBreakBenefit: "Suprime malezas y protege el suelo contra lluvia erosiva.",
    tradeOff: "No genera venta directa inmediata, pero ahorra fertilizante y frena erosión.",
  },
  {
    id: "maize",
    name: "Maíz",
    category: "Cereal de alta demanda",
    waterNeedLevel: "Alto",
    waterDemandMmCycle: 560,
    minTempC: 8,
    maxTempC: 34,
    nitrogenFixer: false,
    erosionControl: 52,
    soilHealthBoost: 45,
    pestBreakBenefit: "Aporta abundante rastrojo si se rota después con leguminosas.",
    tradeOff: "Exige mucha agua y nitrógeno; riesgoso en zonas secas sin riego.",
  },
];

export function evaluateCropRotations(
  climate: ClimateMetrics,
  priority: FarmerPriority,
  fallbackSlopePct?: number
): EvaluatedCrop[] {
  const rain30d = climate.rain30dMm ?? 20;
  const eoDay = climate.eoMmDay ?? 4.5;
  const tMin = climate.tempMinC ?? 12;
  const tMax = climate.tempMaxC ?? 26;
  const slope = climate.slopePct ?? fallbackSlopePct ?? 2;

  // Estimación simple de déficit hídrico mensual (mm) usando lluvia 30d vs Eo*30
  const monthlyEo = eoDay * 30;
  const drynessRatio = Math.min(1.5, Math.max(0.2, monthlyEo / Math.max(25, rain30d + 25)));

  const evaluated = CROP_CATALOG.map((crop) => {
    // 1. Ahorro de agua (cultivos con menor demanda puntúan más alto, sobre todo en zonas secas)
    const rawWaterSaving = Math.round(
      Math.max(15, Math.min(98, ((650 - crop.waterDemandMmCycle) / 400) * 100))
    );
    const waterFitPenalty =
      drynessRatio > 1.1 && crop.waterDemandMmCycle > 450 ? 22 : 0;
    const waterSavingScore = Math.max(10, rawWaterSaving - waterFitPenalty);

    // 2. Ajuste térmico local
    let climateFitScore = 92;
    if (tMin < crop.minTempC) {
      climateFitScore -= Math.min(55, (crop.minTempC - tMin) * 8);
    }
    if (tMax > crop.maxTempC) {
      climateFitScore -= Math.min(55, (tMax - crop.maxTempC) * 9);
    }
    climateFitScore = Math.max(15, Math.round(climateFitScore));

    // 3. Cuidado del suelo y control de erosión
    const soilScore =
      slope >= 8
        ? Math.round(crop.soilHealthBoost * 0.45 + crop.erosionControl * 0.55)
        : Math.round(crop.soilHealthBoost * 0.75 + crop.erosionControl * 0.25);

    // Ponderación según prioridad elegida por el agricultor
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
    let matchScore = Math.round(
      waterSavingScore * w.wWater +
        soilScore * w.wSoil +
        climateFitScore * w.wClimate
    );

    // Bonus si hay pendiente fuerte y el cultivo protege bien el suelo
    if (priority === "erosion" && crop.erosionControl >= 90) {
      matchScore = Math.min(99, matchScore + 6);
    }

    const reasons: string[] = [];
    if (waterSavingScore >= 75) reasons.push("consume poca agua");
    if (crop.nitrogenFixer) reasons.push("aporta nitrógeno natural al suelo");
    if (climateFitScore >= 85) reasons.push("se adapta bien a las temperaturas de esta zona");
    if (slope >= 8 && crop.erosionControl >= 80) reasons.push("protege laderas contra la erosión");

    const reason =
      reasons.length > 0
        ? `Recomendado porque ${reasons.join(" y ")}.`
        : "Opción viable si cuentas con riego de apoyo y manejo de fertilización.";

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
