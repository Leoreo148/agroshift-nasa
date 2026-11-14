export type RiskLevel = "good" | "warn" | "alert";

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

export function buildFieldDiagnostics(
  climate: ClimateMetrics,
  fallbackSlopePct?: number
): { cards: DiagnosticCard[]; headline: string } {
  const rain = climate.rain30dMm ?? 0;
  const sm = climate.soilMoistureM3;
  const tMax = climate.tempMaxC ?? 24;
  const tMin = climate.tempMinC ?? 14;
  const rh = climate.humidityPct ?? 65;
  const slope = climate.slopePct ?? fallbackSlopePct ?? 2;

  // 1. Agua disponible
  let water: DiagnosticCard;
  if (rain < 15 && (sm === null || sm < 0.16)) {
    water = {
      id: "water",
      title: "Agua disponible",
      level: "alert",
      statusLabel: "Escasez / Seco",
      explanation:
        "Casi no ha llovido en 30 días y el suelo está seco. Prioriza cultivos que consuman poca agua o riego por goteo.",
    };
  } else if (rain < 45 || (sm !== null && sm < 0.22)) {
    water = {
      id: "water",
      title: "Agua disponible",
      level: "warn",
      statusLabel: "Humedad justa",
      explanation:
        "Lluvia moderada. Conviene usar coberturas o rotar con cultivos resistentes a periodos secos.",
    };
  } else {
    water = {
      id: "water",
      title: "Agua disponible",
      level: "good",
      statusLabel: "Buena disponibilidad",
      explanation:
        "El suelo cuenta con humedad suficiente para sostener un cultivo sin estrés hídrico inmediato.",
    };
  }

  // 2. Estrés por calor o frío
  let heat: DiagnosticCard;
  if (tMin <= 2) {
    heat = {
      id: "heat",
      title: "Temperatura extrema",
      level: "alert",
      statusLabel: "Riesgo de heladas",
      explanation:
        "Las mínimas se acercan a 0 °C. Elige cultivos tolerantes al frío o ajusta la fecha de siembra.",
    };
  } else if (tMax >= 32) {
    heat = {
      id: "heat",
      title: "Temperatura extrema",
      level: "alert",
      statusLabel: "Calor fuerte",
      explanation:
        "Máximas altas que aceleran la pérdida de agua. Cultivos sensibles pueden perder rendimiento.",
    };
  } else if (tMax >= 28 || tMin <= 6) {
    heat = {
      id: "heat",
      title: "Temperatura extrema",
      level: "warn",
      statusLabel: "Exigencia moderada",
      explanation:
        "Temperaturas algo exigentes en horas pico o madrugadas frías. Revisa la tolerancia de tu cultivo.",
    };
  } else {
    heat = {
      id: "heat",
      title: "Temperatura extrema",
      level: "good",
      statusLabel: "Clima favorable",
      explanation:
        "Temperaturas estables y cómodas para el crecimiento de la mayoría de cultivos.",
    };
  }

  // 3. Salud del cultivo / riesgo de hongos
  let health: DiagnosticCard;
  if (rh >= 82 && rain >= 40) {
    health = {
      id: "health",
      title: "Ambiente del cultivo",
      level: "alert",
      statusLabel: "Riesgo de hongos",
      explanation:
        "Mucha humedad y lluvia seguida favorecen enfermedades en hojas. Rotar corta el ciclo de plagas.",
    };
  } else if (rh >= 78 || (climate.solarMjM2Day !== null && climate.solarMjM2Day < 12.5)) {
    health = {
      id: "health",
      title: "Ambiente del cultivo",
      level: "warn",
      statusLabel: "Vigilar humedad",
      explanation:
        "Humedad ambiental alta o poca luz solar. Evita encharcamientos y mejora la ventilación del terreno.",
    };
  } else {
    health = {
      id: "health",
      title: "Ambiente del cultivo",
      level: "good",
      statusLabel: "Ambiente sano",
      explanation:
        "Buena radiación solar y humedad equilibrada, condiciones limpias para el desarrollo foliar.",
    };
  }

  // 4. Riesgo de erosión del suelo
  let erosion: DiagnosticCard;
  if (slope >= 15 || (slope >= 8 && rain >= 50)) {
    erosion = {
      id: "erosion",
      title: "Protección del suelo",
      level: "alert",
      statusLabel: "Riesgo de erosión",
      explanation:
        "Terreno inclinado con riesgo de perder capa fértil. Usa cultivos de cobertura o raíces que fijen el suelo.",
    };
  } else if (slope >= 6) {
    erosion = {
      id: "erosion",
      title: "Protección del suelo",
      level: "warn",
      statusLabel: "Pendiente moderada",
      explanation:
        "Conviene mantener rastrojo o cultivos en fajas para evitar arrastre de nutrientes cuando llueva.",
    };
  } else {
    erosion = {
      id: "erosion",
      title: "Protección del suelo",
      level: "good",
      statusLabel: "Terreno estable",
      explanation:
        "Relieve prácticamente plano, con bajo riesgo de arrastre de suelo por lluvia.",
    };
  }

  const cards = [water, heat, health, erosion];
  const alerts = cards.filter((c) => c.level === "alert").map((c) => c.title.toLowerCase());
  const warns = cards.filter((c) => c.level === "warn").map((c) => c.title.toLowerCase());

  let headline = "Tu campo muestra condiciones estables en general.";
  if (alerts.length > 0) {
    headline = `Atención principal en: ${alerts.join(" y ")}. Una buena rotación puede reducir este riesgo.`;
  } else if (warns.length > 0) {
    headline = `Condiciones manejables, con precaución en: ${warns.join(" y ")}.`;
  }

  return { cards, headline };
}
