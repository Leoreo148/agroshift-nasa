import type { Lang } from "@/lib/i18n";

export type RiskLevel = "good" | "warn" | "alert";
export type AgroZone = "tropicalArid" | "tropicalHumid" | "highland" | "temperate";

export interface DiagnosticCard {
  id: "water" | "heat" | "health" | "erosion";
  title: string;
  level: RiskLevel;
  statusLabel: string;
  explanation: string;
}

export interface ClimateMetrics {
  tempAvgC: number | null;
  tempMaxC: number | null;
  tempMinC: number | null;
  humidityPct: number | null;
  rain30dMm: number | null;
  solarMjM2Day: number | null;
  elevationM: number | null;
  slopePct: number | null;
  soilMoistureM3: number | null;
  eoMmDay: number | null;
}

export function detectAgroZone(lat: number, climate: ClimateMetrics): AgroZone {
  const absLat = Math.abs(lat);
  const elev = climate.elevationM ?? 200;
  const tAvg = climate.tempAvgC ?? 20;
  const rain = climate.rain30dMm ?? 20;

  if (elev >= 1800 || (absLat <= 35 && tAvg <= 15.5)) {
    return "highland";
  }
  if (absLat <= 28) {
    return rain < 60 ? "tropicalArid" : "tropicalHumid";
  }
  return "temperate";
}

const COPY: Record<
  Lang,
  {
    water: Record<RiskLevel, { title: string; status: string; desc: string }>;
    heat: {
      title: string;
      frost: { status: string; desc: string };
      hot: { status: string; desc: string };
      warn: { status: string; desc: string };
      good: { status: string; desc: string };
    };
    health: Record<RiskLevel, { title: string; status: string; desc: string }>;
    erosion: Record<RiskLevel, { title: string; status: string; desc: string }>;
    headlineOk: string;
    headlineAlert: (items: string) => string;
    headlineWarn: (items: string) => string;
  }
> = {
  en: {
    water: {
      alert: {
        title: "Available water",
        status: "Dry / Deficit",
        desc: "Very low rainfall over 30 days and dry soil. Prioritize drought-hardy crops or drip irrigation.",
      },
      warn: {
        title: "Available water",
        status: "Moderate",
        desc: "Limited moisture. Mulching or rotating with water-efficient crops helps preserve soil water.",
      },
      good: {
        title: "Available water",
        status: "Good moisture",
        desc: "Soil moisture and recent rainfall are adequate to establish a new crop cycle.",
      },
    },
    heat: {
      title: "Temperature extremes",
      frost: {
        status: "Frost risk",
        desc: "Nighttime lows approach freezing. Choose cold-tolerant crops or adjust planting dates.",
      },
      hot: {
        status: "Heat stress",
        desc: "High daytime peaks accelerate water loss. Sensitive crops can lose yield during flowering.",
      },
      warn: {
        title_unused: "",
        status: "Moderate stress",
        desc: "Slightly demanding highs or cool nights. Check cultivar temperature thresholds.",
      } as { status: string; desc: string },
      good: {
        status: "Favorable",
        desc: "Balanced temperatures for most adapted crops.",
      },
    },
    health: {
      alert: {
        title: "Crop environment",
        status: "Fungal risk",
        desc: "High humidity and frequent rain favor foliar diseases. Rotation helps break pest cycles.",
      },
      warn: {
        title: "Crop environment",
        status: "Watch humidity",
        desc: "High air humidity or low sunlight. Avoid waterlogging and improve canopy airflow.",
      },
      good: {
        title: "Crop environment",
        status: "Healthy",
        desc: "Good solar radiation and balanced humidity for clean leaf development.",
      },
    },
    erosion: {
      alert: {
        title: "Soil protection",
        status: "Erosion risk",
        desc: "Sloped terrain at risk of topsoil loss. Use cover crops or dense roots to anchor soil.",
      },
      warn: {
        title: "Soil protection",
        status: "Moderate slope",
        desc: "Keep crop residues or contour strips to slow down rainwater runoff.",
      },
      good: {
        title: "Soil protection",
        status: "Stable terrain",
        desc: "Gentle slope with low risk of soil wash-off during rain.",
      },
    },
    headlineOk: "Your field shows generally stable conditions.",
    headlineAlert: (items) =>
      `Main attention needed on: ${items}. Smart crop rotation can reduce this risk.`,
    headlineWarn: (items) =>
      `Manageable conditions, with caution on: ${items}.`,
  },
  es: {
    water: {
      alert: {
        title: "Agua disponible",
        status: "Escasez / Seco",
        desc: "Casi no ha llovido en 30 días y el suelo está seco. Prioriza cultivos de bajo consumo o riego eficiente.",
      },
      warn: {
        title: "Agua disponible",
        status: "Humedad justa",
        desc: "Lluvia moderada. Conviene usar coberturas o rotar con cultivos resistentes a periodos secos.",
      },
      good: {
        title: "Agua disponible",
        status: "Buena humedad",
        desc: "El suelo cuenta con humedad suficiente para establecer un cultivo sin estrés inmediato.",
      },
    },
    heat: {
      title: "Temperatura extrema",
      frost: {
        status: "Riesgo de heladas",
        desc: "Las mínimas se acercan a 0 °C. Elige cultivos tolerantes al frío o ajusta la fecha de siembra.",
      },
      hot: {
        status: "Calor fuerte",
        desc: "Máximas altas que aceleran la pérdida de agua. Cultivos sensibles pueden perder rendimiento.",
      },
      warn: {
        status: "Exigencia moderada",
        desc: "Temperaturas algo exigentes en horas pico o madrugadas frías. Revisa la tolerancia del cultivo.",
      },
      good: {
        status: "Clima favorable",
        desc: "Temperaturas estables y cómodas para el crecimiento de cultivos adaptados.",
      },
    },
    health: {
      alert: {
        title: "Ambiente del cultivo",
        status: "Riesgo de hongos",
        desc: "Mucha humedad y lluvia seguida favorecen enfermedades en hojas. Rotar corta el ciclo de plagas.",
      },
      warn: {
        title: "Ambiente del cultivo",
        status: "Vigilar humedad",
        desc: "Humedad ambiental alta o poca luz solar. Evita encharcamientos y mejora la ventilación.",
      },
      good: {
        title: "Ambiente del cultivo",
        status: "Ambiente sano",
        desc: "Buena radiación solar y humedad equilibrada, condiciones limpias para el follaje.",
      },
    },
    erosion: {
      alert: {
        title: "Protección del suelo",
        status: "Riesgo de erosión",
        desc: "Terreno inclinado con riesgo de perder capa fértil. Usa coberturas o raíces que fijen el suelo.",
      },
      warn: {
        title: "Protección del suelo",
        status: "Pendiente moderada",
        desc: "Conviene mantener rastrojo o cultivos en fajas para evitar arrastre de nutrientes.",
      },
      good: {
        title: "Protección del suelo",
        status: "Terreno estable",
        desc: "Relieve prácticamente plano, con bajo riesgo de arrastre de suelo por lluvia.",
      },
    },
    headlineOk: "Tu campo muestra condiciones estables en general.",
    headlineAlert: (items) =>
      `Atención principal en: ${items}. Una buena rotación puede reducir este riesgo.`,
    headlineWarn: (items) =>
      `Condiciones manejables, con precaución en: ${items}.`,
  },
  fr: {
    water: {
      alert: {
        title: "Eau disponible",
        status: "Sec / Déficit",
        desc: "Très peu de pluie sur 30 jours et sol sec. Privilégiez des cultures sobres en eau.",
      },
      warn: {
        title: "Eau disponible",
        status: "Humidité juste",
        desc: "Pluie modérée. Le paillage ou des cultures tolérantes à la sécheresse protègent l'eau du sol.",
      },
      good: {
        title: "Eau disponible",
        status: "Bonne humidité",
        desc: "Le sol dispose d'une humidité suffisante pour démarrer une culture.",
      },
    },
    heat: {
      title: "Températures extrêmes",
      frost: {
        status: "Risque de gel",
        desc: "Les nuits approchent 0 °C. Choisissez des espèces tolérantes au froid.",
      },
      hot: {
        status: "Forte chaleur",
        desc: "Pics élevés accélérant l'évaporation. Les cultures sensibles risquent des pertes.",
      },
      warn: {
        status: "Exigence modérée",
        desc: "Températures un peu chaudes ou nuits fraîches. Vérifiez les seuils de la culture.",
      },
      good: {
        status: "Climat favorable",
        desc: "Températures équilibrées pour les cultures adaptées à la région.",
      },
    },
    health: {
      alert: {
        title: "Santé du milieu",
        status: "Risque fongique",
        desc: "Forte humidité et pluies favorisant les maladies foliaires. La rotation casse ces cycles.",
      },
      warn: {
        title: "Santé du milieu",
        status: "Humidité à suivre",
        desc: "Humidité élevée ou faible ensoleillement. Évitez l'excès d'eau stagnante.",
      },
      good: {
        title: "Santé du milieu",
        status: "Milieu sain",
        desc: "Bon ensoleillement et humidité équilibrée pour le feuillage.",
      },
    },
    erosion: {
      alert: {
        title: "Protection du sol",
        status: "Risque d'érosion",
        desc: "Terrain en pente exposé au ruissellement. Utilisez des couverts végétaux.",
      },
      warn: {
        title: "Protection du sol",
        status: "Pente modérée",
        desc: "Gardez des résidus ou bandes végétales pour freiner le ruissellement.",
      },
      good: {
        title: "Protection du sol",
        status: "Terrain stable",
        desc: "Relief plat avec faible risque d'érosion hydrique.",
      },
    },
    headlineOk: "Votre parcelle présente des conditions globalement stables.",
    headlineAlert: (items) =>
      `Attention principale sur : ${items}. Une rotation adaptée réduit ce risque.`,
    headlineWarn: (items) =>
      `Conditions gérables, avec prudence sur : ${items}.`,
  },
  pt: {
    water: {
      alert: {
        title: "Água disponível",
        status: "Seco / Déficit",
        desc: "Pouquíssima chuva em 30 dias e solo seco. Priorize culturas econômicas em água.",
      },
      warn: {
        title: "Água disponível",
        status: "Umidade moderada",
        desc: "Chuva moderada. Cobertura vegetal ou culturas tolerantes à seca ajudam a reter água.",
      },
      good: {
        title: "Água disponível",
        status: "Boa umidade",
        desc: "O solo tem umidade suficiente para iniciar o ciclo da cultura.",
      },
    },
    heat: {
      title: "Extremos de temperatura",
      frost: {
        status: "Risco de geada",
        desc: "Mínimas próximas de 0 °C. Escolha culturas resistentes ao frio.",
      },
      hot: {
        status: "Calor intenso",
        desc: "Máximas elevadas aceleram a perda de água e podem reduzir a produtividade.",
      },
      warn: {
        status: "Atenção térmica",
        desc: "Temperaturas um pouco altas ou noites frias. Verifique a tolerância da cultura.",
      },
      good: {
        status: "Clima favorável",
        desc: "Temperaturas equilibradas para o desenvolvimento das culturas.",
      },
    },
    health: {
      alert: {
        title: "Ambiente da lavoura",
        status: "Risco de fungos",
        desc: "Alta umidade e chuvas favorecem doenças foliares. A rotação ajuda a quebrar ciclos.",
      },
      warn: {
        title: "Ambiente da lavoura",
        status: "Vigiar umidade",
        desc: "Umidade alta ou pouca luz solar. Evite encharcamentos.",
      },
      good: {
        title: "Ambiente da lavoura",
        status: "Ambiente sadio",
        desc: "Boa radiação solar e umidade equilibrada para o crescimento foliar.",
      },
    },
    erosion: {
      alert: {
        title: "Proteção do solo",
        status: "Risco de erosão",
        desc: "Terreno inclinado sujeito à perda de solo. Use plantas de cobertura.",
      },
      warn: {
        title: "Proteção do solo",
        status: "Declive moderado",
        desc: "Mantenha palhada ou faixas de contenção para reduzir o escoamento.",
      },
      good: {
        title: "Proteção do solo",
        status: "Terreno estável",
        desc: "Relevo plano com baixo risco de arraste de solo.",
      },
    },
    headlineOk: "Sua área apresenta condições estáveis no geral.",
    headlineAlert: (items) =>
      `Atenção principal em: ${items}. Uma boa rotação reduz esse risco.`,
    headlineWarn: (items) =>
      `Condições manejáveis, com atenção em: ${items}.`,
  },
};

export function buildFieldDiagnostics(
  climate: ClimateMetrics,
  lang: Lang,
  fallbackSlopePct?: number
): { cards: DiagnosticCard[]; headline: string } {
  const c = COPY[lang];
  const rain = climate.rain30dMm ?? 0;
  const sm = climate.soilMoistureM3;
  const tMax = climate.tempMaxC ?? 24;
  const tMin = climate.tempMinC ?? 14;
  const rh = climate.humidityPct ?? 65;
  const slope = climate.slopePct ?? fallbackSlopePct ?? 2;

  const wLevel: RiskLevel =
    rain < 15 && (sm === null || sm < 0.16)
      ? "alert"
      : rain < 45 || (sm !== null && sm < 0.22)
        ? "warn"
        : "good";
  const water: DiagnosticCard = {
    id: "water",
    title: c.water[wLevel].title,
    level: wLevel,
    statusLabel: c.water[wLevel].status,
    explanation: c.water[wLevel].desc,
  };

  let heat: DiagnosticCard;
  if (tMin <= 2) {
    heat = {
      id: "heat",
      title: c.heat.title,
      level: "alert",
      statusLabel: c.heat.frost.status,
      explanation: c.heat.frost.desc,
    };
  } else if (tMax >= 32) {
    heat = {
      id: "heat",
      title: c.heat.title,
      level: "alert",
      statusLabel: c.heat.hot.status,
      explanation: c.heat.hot.desc,
    };
  } else if (tMax >= 28 || tMin <= 6) {
    heat = {
      id: "heat",
      title: c.heat.title,
      level: "warn",
      statusLabel: c.heat.warn.status,
      explanation: c.heat.warn.desc,
    };
  } else {
    heat = {
      id: "heat",
      title: c.heat.title,
      level: "good",
      statusLabel: c.heat.good.status,
      explanation: c.heat.good.desc,
    };
  }

  const hLevel: RiskLevel =
    rh >= 82 && rain >= 40
      ? "alert"
      : rh >= 78 || (climate.solarMjM2Day !== null && climate.solarMjM2Day < 12.5)
        ? "warn"
        : "good";
  const health: DiagnosticCard = {
    id: "health",
    title: c.health[hLevel].title,
    level: hLevel,
    statusLabel: c.health[hLevel].status,
    explanation: c.health[hLevel].desc,
  };

  const eLevel: RiskLevel =
    slope >= 15 || (slope >= 8 && rain >= 50)
      ? "alert"
      : slope >= 6
        ? "warn"
        : "good";
  const erosion: DiagnosticCard = {
    id: "erosion",
    title: c.erosion[eLevel].title,
    level: eLevel,
    statusLabel: c.erosion[eLevel].status,
    explanation: c.erosion[eLevel].desc,
  };

  const cards = [water, heat, health, erosion];
  const alerts = cards.filter((x) => x.level === "alert").map((x) => x.title.toLowerCase());
  const warns = cards.filter((x) => x.level === "warn").map((x) => x.title.toLowerCase());

  const headline =
    alerts.length > 0
      ? c.headlineAlert(alerts.join(" / "))
      : warns.length > 0
        ? c.headlineWarn(warns.join(" / "))
        : c.headlineOk;

  return { cards, headline };
}

export interface HistoryPoint {
  year: number;
  tempAvgC: number;
  rainMmYear: number;
  soilWetness: number;
}

export interface Trend5ySummary {
  level: RiskLevel;
  badge: string;
  explanation: string;
  tempDeltaC: number;
  soilWetnessDeltaPct: number;
  rainDeltaPct: number;
}

export function analyzeTrend5y(
  history: HistoryPoint[],
  lang: Lang
): Trend5ySummary | null {
  if (history.length < 4) return null;

  const early = history.slice(0, 2);
  const recent = history.slice(-2);

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const tEarly = avg(early.map((x) => x.tempAvgC));
  const tRecent = avg(recent.map((x) => x.tempAvgC));
  const wEarly = avg(early.map((x) => x.soilWetness));
  const wRecent = avg(recent.map((x) => x.soilWetness));
  const rEarly = avg(early.map((x) => x.rainMmYear));
  const rRecent = avg(recent.map((x) => x.rainMmYear));

  const tempDeltaC = Number((tRecent - tEarly).toFixed(1));
  const soilWetnessDeltaPct = Math.round((wRecent - wEarly) * 100);
  const rainDeltaPct =
    rEarly > 10 ? Math.round(((rRecent - rEarly) / rEarly) * 100) : 0;

  const isWarming = tempDeltaC >= 0.5;
  const isDrying = soilWetnessDeltaPct <= -3 || rainDeltaPct <= -12;

  const level: RiskLevel =
    isWarming && isDrying ? "alert" : isWarming || isDrying ? "warn" : "good";

  const signT = tempDeltaC >= 0 ? `+${tempDeltaC}` : `${tempDeltaC}`;
  const signW =
    soilWetnessDeltaPct >= 0
      ? `+${soilWetnessDeltaPct}`
      : `${soilWetnessDeltaPct}`;
  const signR = rainDeltaPct >= 0 ? `+${rainDeltaPct}` : `${rainDeltaPct}`;

  const badges: Record<Lang, Record<RiskLevel, string>> = {
    en: {
      alert: "Warming & drying trend",
      warn: isDrying ? "Progressive drying signal" : "Warming trend",
      good: "Stable 5-year trend",
    },
    es: {
      alert: "Tendencia cálida y seca",
      warn: isDrying ? "Señal de secado progresivo" : "Tendencia de calentamiento",
      good: "Tendencia estable (5 años)",
    },
    fr: {
      alert: "Tendance chaude et sèche",
      warn: isDrying ? "Assèchement progressif" : "Tendance au réchauffement",
      good: "Tendance stable (5 ans)",
    },
    pt: {
      alert: "Tendência quente e seca",
      warn: isDrying ? "Sinal de secagem progressiva" : "Tendência de aquecimento",
      good: "Tendência estável (5 anos)",
    },
  };

  const explanations: Record<Lang, string> = {
    en: `2024–2025 vs 2021–2022: temp ${signT} °C, rainfall ${signR}%, soil wetness (GWETTOP) ${signW} pts.`,
    es: `2024–2025 vs 2021–2022: temp ${signT} °C, lluvia ${signR}%, humedad superficial (GWETTOP) ${signW} pts.`,
    fr: `2024–2025 vs 2021–2022 : temp ${signT} °C, pluie ${signR}%, humidité du sol (GWETTOP) ${signW} pts.`,
    pt: `2024–2025 vs 2021–2022: temp ${signT} °C, chuva ${signR}%, umidade do solo (GWETTOP) ${signW} pts.`,
  };

  return {
    level,
    badge: badges[lang][level],
    explanation: explanations[lang],
    tempDeltaC,
    soilWetnessDeltaPct,
    rainDeltaPct,
  };
}
