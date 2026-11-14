import type { AgroZone, ClimateMetrics } from "@/lib/diagnostics";
import type { Lang } from "@/lib/i18n";

export type FarmerPriority = "water" | "soil" | "climate" | "erosion";

interface CropText {
  name: string;
  category: string;
  pestBreakBenefit: string;
  tradeOff: string;
}

export interface CropOption {
  id: string;
  scientificName: string;
  /** Zonas agroclimáticas donde este cultivo tiene viabilidad agronómica real */
  suitableZones: AgroZone[];
  /** Requerimiento hídrico estacional FAO-56 (mm/ciclo): [min, max] */
  waterRangeMm: [number, number];
  /** Umbrales térmicos FAO EcoCrop (°C): [T_abs_min, T_opt_min, T_opt_max, T_abs_max] */
  ecoCropTempC: [number, number, number, number];
  /** Fijación biológica de nitrógeno estimada (kg N/ha/ciclo) */
  bnfKgNHa: [number, number];
  /** Factor C aproximado en RUSLE (menor = protege más contra erosión, suelo desnudo = 1.0) */
  rusleCFactor: number;
  reference: string;
  i18n: Record<Lang, CropText>;
}

export interface EvaluatedCrop {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  pestBreakBenefit: string;
  tradeOff: string;
  reference: string;
  matchScore: number;
  waterSavingScore: number;
  climateFitScore: number;
  soilScore: number;
  reason: string;
}

const CROP_CATALOG: CropOption[] = [
  {
    id: "cowpea",
    scientificName: "Vigna unguiculata",
    suitableZones: ["tropicalArid", "tropicalHumid"],
    waterRangeMm: [300, 600],
    ecoCropTempC: [10, 20, 35, 42],
    bnfKgNHa: [40, 100],
    rusleCFactor: 0.24,
    reference: "FAO EcoCrop · FAO-56 · BNF Cowpea (Africa / Tropics)",
    i18n: {
      en: {
        name: "Cowpea",
        category: "Heat-hardy nitrogen fixer",
        pestBreakBenefit: "Breaks cereal root pests and suppresses weeds with rapid ground cover.",
        tradeOff: "Sensitive to frost (<10 °C); excess humidity can increase foliar disease.",
      },
      es: {
        name: "Caupí (Frijol de ojo negro)",
        category: "Leguminosa tolerante al calor",
        pestBreakBenefit: "Corta plagas de cereales y cubre el suelo rápido contra malezas.",
        tradeOff: "No tolera heladas (<10 °C); exceso de lluvia continua favorece hongos.",
      },
      fr: {
        name: "Niébé",
        category: "Légumineuse résistante à la chaleur",
        pestBreakBenefit: "Casse le cycle des ravageurs des céréales et couvre vite le sol.",
        tradeOff: "Sensible au froid (<10 °C) et aux excès d'eau prolongés.",
      },
      pt: {
        name: "Feijão-caupi",
        category: "Leguminosa tolerante ao calor",
        pestBreakBenefit: "Quebra pragas de cereais e cobre o solo rapidamente.",
        tradeOff: "Sensível ao frio (<10 °C) e ao encharcamento prolongado.",
      },
    },
  },
  {
    id: "pearl-millet",
    scientificName: "Pennisetum glaucum",
    suitableZones: ["tropicalArid", "tropicalHumid"],
    waterRangeMm: [350, 500],
    ecoCropTempC: [12, 25, 35, 44],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.30,
    reference: "FAO EcoCrop · FAO-56 (Semi-arid C4 cereal)",
    i18n: {
      en: {
        name: "Pearl Millet",
        category: "Ultra-drought C4 grain",
        pestBreakBenefit: "Thrives in poor sandy soils where maize fails under heat.",
        tradeOff: "Needs warm germination (>12 °C) and dislikes waterlogged soils.",
      },
      es: {
        name: "Mijo perla",
        category: "Cereal C4 ultrarresistente a sequía",
        pestBreakBenefit: "Produce en suelos arenosos y calurosos donde el maíz falla.",
        tradeOff: "Requiere suelo cálido (>12 °C) para germinar y no tolera encharcamiento.",
      },
      fr: {
        name: "Mil perlé",
        category: "Céréale C4 résistante à la sécheresse",
        pestBreakBenefit: "Résiste sur sols sableux et chauds là où le maïs échoue.",
        tradeOff: "Exige >12 °C pour lever et craint l'engorgement d'eau.",
      },
      pt: {
        name: "Milheto",
        category: "Cereal C4 tolerante à seca",
        pestBreakBenefit: "Produz em solos arenosos e quentes onde o milho sofre.",
        tradeOff: "Precisa de calor (>12 °C) para germinar e não tolera solo encharcado.",
      },
    },
  },
  {
    id: "sorghum",
    scientificName: "Sorghum bicolor",
    suitableZones: ["tropicalArid", "tropicalHumid", "temperate"],
    waterRangeMm: [450, 650],
    ecoCropTempC: [12, 20, 34, 42],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.35,
    reference: "FAO EcoCrop · FAO-56 (Allen et al., 1998)",
    i18n: {
      en: {
        name: "Sorghum",
        category: "Drought & heat-hardy cereal",
        pestBreakBenefit: "Breaks nematode and root disease cycles in intensive rotations.",
        tradeOff: "Needs >12–15 °C at establishment; lower price per ton than vegetables.",
      },
      es: {
        name: "Sorgo",
        category: "Cereal tolerante a sequía y calor",
        pestBreakBenefit: "Corta ciclos de nemátodos y enfermedades de raíz.",
        tradeOff: "Requiere al menos ~12–15 °C al inicio; menor precio que hortalizas.",
      },
      fr: {
        name: "Sorgho",
        category: "Céréale tolérante à la sécheresse",
        pestBreakBenefit: "Réduit les nématodes et maladies racinaires dans la rotation.",
        tradeOff: "Demande >12–15 °C au semis ; prix inférieur aux cultures maraîchères.",
      },
      pt: {
        name: "Sorgo",
        category: "Cereal tolerante à seca e calor",
        pestBreakBenefit: "Quebra ciclos de nematoides e doenças radiculares.",
        tradeOff: "Exige >12–15 °C na emergência; menor valor por tonelada que hortaliças.",
      },
    },
  },
  {
    id: "chickpea",
    scientificName: "Cicer arietinum",
    suitableZones: ["tropicalArid", "highland", "temperate"],
    waterRangeMm: [300, 500],
    ecoCropTempC: [5, 15, 25, 36],
    bnfKgNHa: [30, 80],
    rusleCFactor: 0.30,
    reference: "FAO EcoCrop · FAO-56 (Cool/residual-moisture legume)",
    i18n: {
      en: {
        name: "Chickpea",
        category: "Dryland nitrogen fixer",
        pestBreakBenefit: "Breaks cereal disease cycles while growing on residual soil moisture.",
        tradeOff: "Sensitive to heavy rain/fungal blight and frost during flowering.",
      },
      es: {
        name: "Garbanzo",
        category: "Leguminosa de secano",
        pestBreakBenefit: "Corta plagas de cereales aprovechando humedad residual del suelo.",
        tradeOff: "Sensible a lluvias excesivas (hongos) y heladas en floración.",
      },
      fr: {
        name: "Pois chiche",
        category: "Légumineuse de zone sèche",
        pestBreakBenefit: "Casse les maladies des céréales sur humidité résiduelle du sol.",
        tradeOff: "Sensible aux pluies excessives (ascochytose) et au gel en floraison.",
      },
      pt: {
        name: "Grão-de-bico",
        category: "Leguminosa de sequeiro",
        pestBreakBenefit: "Quebra doenças de cereais usando umidade residual do solo.",
        tradeOff: "Sensível a chuvas excessivas e geadas na floração.",
      },
    },
  },
  {
    id: "quinoa",
    scientificName: "Chenopodium quinoa",
    suitableZones: ["highland", "temperate"],
    waterRangeMm: [300, 500],
    ecoCropTempC: [-3, 15, 25, 34],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.30,
    reference: "FAO EcoCrop · FAO-56 (Allen et al., 1998)",
    i18n: {
      en: {
        name: "Quinoa",
        category: "Cold & drought-hardy grain",
        pestBreakBenefit: "Strong sanitary break after potato or continuous cereals.",
        tradeOff: "Sensitive to sustained heat (>32–34 °C) at flowering and waterlogging.",
      },
      es: {
        name: "Quinua",
        category: "Grano andino rústico",
        pestBreakBenefit: "Corta ciclos de plagas tras papa o cereales.",
        tradeOff: "Sensible a calor fuerte (>32–34 °C) en floración y a encharcamiento.",
      },
      fr: {
        name: "Quinoa",
        category: "Grain rustique froid & sec",
        pestBreakBenefit: "Excellente coupure sanitaire après pomme de terre ou céréales.",
        tradeOff: "Sensible aux fortes chaleurs (>32–34 °C) en floraison.",
      },
      pt: {
        name: "Quinoa",
        category: "Grão rústico ao frio e seca",
        pestBreakBenefit: "Excelente quebra sanitária após batata ou cereais.",
        tradeOff: "Sensível a calor forte (>32–34 °C) na floração e encharcamento.",
      },
    },
  },
  {
    id: "cover-oats-vetch",
    scientificName: "Avena sativa + Vicia sativa",
    suitableZones: ["highland", "temperate"],
    waterRangeMm: [350, 550],
    ecoCropTempC: [-3, 12, 24, 31],
    bnfKgNHa: [50, 150],
    rusleCFactor: 0.12,
    reference: "FAO EcoCrop · RUSLE (Renard et al.) · BNF Vicia sativa",
    i18n: {
      en: {
        name: "Oats + Vetch (Cover)",
        category: "Cover crop & green manure",
        pestBreakBenefit: "Suppresses weeds and cuts water erosion by >50% vs bare fallow.",
        tradeOff: "No direct cash grain, but supplies 50–150 kg N/ha and anchors slopes.",
      },
      es: {
        name: "Avena + Vicia (Cobertura)",
        category: "Cobertura y abono verde",
        pestBreakBenefit: "Suprime malezas y reduce la erosión hídrica en >50%.",
        tradeOff: "No da grano comercial directo, pero aporta 50–150 kg N/ha y frena erosión.",
      },
      fr: {
        name: "Avoine + Vesce (Couvert)",
        category: "Couvert végétal & engrais vert",
        pestBreakBenefit: "Étouffe les adventices et réduit l'érosion de >50%.",
        tradeOff: "Pas de récolte directe de grain, mais apporte 50–150 kg N/ha.",
      },
      pt: {
        name: "Aveia + Ervilhaca (Cobertura)",
        category: "Cobertura e adubo verde",
        pestBreakBenefit: "Suprime plantas daninhas e reduz a erosão hídrica em >50%.",
        tradeOff: "Não gera grão comercial direto, mas fixa 50–150 kg N/ha e protege o solo.",
      },
    },
  },
  {
    id: "legume-bean",
    scientificName: "Phaseolus vulgaris",
    suitableZones: ["tropicalArid", "tropicalHumid", "highland", "temperate"],
    waterRangeMm: [350, 500],
    ecoCropTempC: [10, 15, 27, 35],
    bnfKgNHa: [10, 60],
    rusleCFactor: 0.32,
    reference: "FAO EcoCrop · FAO-56 · BNF Meta-analysis P. vulgaris",
    i18n: {
      en: {
        name: "Common Bean",
        category: "Short-cycle grain legume",
        pestBreakBenefit: "Breaks grass/cereal pest cycles and diversifies farm income.",
        tradeOff: "Fixes less N (10–60 kg/ha) than vetch/cowpea; flower drop above 30 °C.",
      },
      es: {
        name: "Frijol común",
        category: "Leguminosa de grano",
        pestBreakBenefit: "Rompe ciclos de plagas de gramíneas (maíz/sorgo).",
        tradeOff: "Fija menos N (10–60 kg/ha) que vicia/caupí y sufre sobre 30 °C en floración.",
      },
      fr: {
        name: "Haricot commun",
        category: "Légumineuse à cycle court",
        pestBreakBenefit: "Casse les ravageurs des céréales et diversifie les revenus.",
        tradeOff: "Fixe moins d'azote (10–60 kg/ha) que la vesce ; sensible >30 °C.",
      },
      pt: {
        name: "Feijão comum",
        category: "Leguminosa de grão",
        pestBreakBenefit: "Quebra pragas de gramíneas e diversifica a renda.",
        tradeOff: "Fixa menos N (10–60 kg/ha) que ervilhaca/caupi; sensível acima de 30 °C.",
      },
    },
  },
  {
    id: "maize",
    scientificName: "Zea mays",
    suitableZones: ["tropicalHumid", "temperate", "tropicalArid"],
    waterRangeMm: [500, 800],
    ecoCropTempC: [10, 18, 32, 40],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.40,
    reference: "FAO EcoCrop · FAO-56 · RUSLE C-factor",
    i18n: {
      en: {
        name: "Maize",
        category: "High-demand staple cereal",
        pestBreakBenefit: "High residue biomass when managed with no-till and legume rotation.",
        tradeOff: "Demands 500–800 mm/cycle and high N; risky in dry zones without irrigation.",
      },
      es: {
        name: "Maíz",
        category: "Cereal de alta demanda",
        pestBreakBenefit: "Deja abundante rastrojo si se maneja sin quema y en rotación.",
        tradeOff: "Exige 500–800 mm/ciclo y mayor nitrógeno; riesgoso en zonas secas sin riego.",
      },
      fr: {
        name: "Maïs",
        category: "Céréale exigeante",
        pestBreakBenefit: "Forte biomasse de résidus en semis direct après légumineuse.",
        tradeOff: "Exige 500–800 mm/cycle et beaucoup d'azote ; risqué en zone sèche.",
      },
      pt: {
        name: "Milho",
        category: "Cereal de alta demanda",
        pestBreakBenefit: "Gera bastante palhada quando manejado em plantio direto.",
        tradeOff: "Exige 500–800 mm/ciclo e mais nitrogênio; arriscado sem irrigação.",
      },
    },
  },
];

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

  const sAvg = scoreForTemp(tAvg);
  const sMin = tMin < tAbsMin ? 0 : tMin < tOptMin ? 70 : 100;
  const sMax = tMax > tAbsMax ? 0 : tMax > tOptMax ? 65 : 100;
  return Math.max(5, Math.round(sAvg * 0.6 + ((sMin + sMax) / 2) * 0.4));
}

function formatReason(
  lang: Lang,
  waterRange: [number, number],
  bnf: [number, number],
  climateFit: number,
  tAvg: number,
  slope: number,
  cFactor: number
): string {
  const midW = (waterRange[0] + waterRange[1]) / 2;
  const parts: string[] = [];

  if (lang === "en") {
    if (midW <= 450) parts.push(`low water demand (${waterRange[0]}–${waterRange[1]} mm)`);
    if (bnf[1] > 0) parts.push(`fixes ${bnf[0]}–${bnf[1]} kg N/ha`);
    if (climateFit >= 85) parts.push(`well-suited to ${tAvg} °C mean temperature`);
    if (slope >= 8 && cFactor <= 0.25) parts.push(`low erosion factor (C=${cFactor})`);
    return parts.length > 0
      ? `Recommended: ${parts.join("; ")}.`
      : "Viable option with supplemental irrigation and balanced fertilization.";
  }
  if (lang === "fr") {
    if (midW <= 450) parts.push(`faible besoin en eau (${waterRange[0]}–${waterRange[1]} mm)`);
    if (bnf[1] > 0) parts.push(`fixe ${bnf[0]}–${bnf[1]} kg N/ha`);
    if (climateFit >= 85) parts.push(`adapté à ${tAvg} °C en moyenne`);
    if (slope >= 8 && cFactor <= 0.25) parts.push(`faible facteur d'érosion (C=${cFactor})`);
    return parts.length > 0
      ? `Recommandé : ${parts.join(" ; ")}.`
      : "Option viable avec irrigation d'appoint et fertilisation adaptée.";
  }
  if (lang === "pt") {
    if (midW <= 450) parts.push(`baixo consumo hídrico (${waterRange[0]}–${waterRange[1]} mm)`);
    if (bnf[1] > 0) parts.push(`fixa ${bnf[0]}–${bnf[1]} kg N/ha`);
    if (climateFit >= 85) parts.push(`ótimo para média de ${tAvg} °C`);
    if (slope >= 8 && cFactor <= 0.25) parts.push(`baixo fator de erosão (C=${cFactor})`);
    return parts.length > 0
      ? `Recomendado: ${parts.join("; ")}.`
      : "Opção viável com irrigação de apoio e adubação equilibrada.";
  }

  if (midW <= 450) parts.push(`bajo consumo hídrico (${waterRange[0]}–${waterRange[1]} mm/ciclo)`);
  if (bnf[1] > 0) parts.push(`fija ${bnf[0]}–${bnf[1]} kg N/ha`);
  if (climateFit >= 85) parts.push(`óptimo para ${tAvg} °C promedio en esta zona`);
  if (slope >= 8 && cFactor <= 0.25) parts.push(`bajo factor de erosión (C=${cFactor})`);
  return parts.length > 0
    ? `Recomendado: ${parts.join("; ")}.`
    : "Opción viable con riego de apoyo y manejo de fertilización.";
}

export function evaluateCropRotations(
  climate: ClimateMetrics,
  zone: AgroZone,
  priority: FarmerPriority,
  lang: Lang,
  fallbackSlopePct?: number
): EvaluatedCrop[] {
  const rain30d = climate.rain30dMm ?? 20;
  const eoDay = climate.eoMmDay ?? 4.5;
  const tAvg = climate.tempAvgC ?? 20;
  const tMin = climate.tempMinC ?? 12;
  const tMax = climate.tempMaxC ?? 26;
  const slope = climate.slopePct ?? fallbackSlopePct ?? 2;

  const monthlyEo = eoDay * 30;
  const waterDeficitRatio = Math.min(1.6, Math.max(0.3, monthlyEo / Math.max(25, rain30d + 25)));

  // Filtrar primero cultivos ecológicamente compatibles con la zona agroclimática detectada
  const regionalPool = CROP_CATALOG.filter((c) => c.suitableZones.includes(zone));
  const pool = regionalPool.length >= 3 ? regionalPool : CROP_CATALOG;

  const evaluated = pool.map((crop) => {
    const midWaterMm = (crop.waterRangeMm[0] + crop.waterRangeMm[1]) / 2;

    const baseWaterScore = ((850 - midWaterMm) / (850 - 350)) * 100;
    const deficitPenalty = waterDeficitRatio > 1.05 && midWaterMm > 520 ? 18 : 0;
    const waterSavingScore = Math.max(
      10,
      Math.min(98, Math.round(baseWaterScore - deficitPenalty))
    );

    const climateFitScore = ecoCropTempSuitability(
      tAvg,
      tMin,
      tMax,
      crop.ecoCropTempC
    );

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

    const txt = crop.i18n[lang];

    return {
      id: crop.id,
      name: txt.name,
      scientificName: crop.scientificName,
      category: txt.category,
      pestBreakBenefit: txt.pestBreakBenefit,
      tradeOff: txt.tradeOff,
      reference: crop.reference,
      matchScore,
      waterSavingScore,
      climateFitScore,
      soilScore,
      reason: formatReason(
        lang,
        crop.waterRangeMm,
        crop.bnfKgNHa,
        climateFitScore,
        tAvg,
        slope,
        crop.rusleCFactor
      ),
    };
  });

  return evaluated.sort((a, b) => b.matchScore - a.matchScore);
}
