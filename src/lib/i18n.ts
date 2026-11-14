export type Lang = "en" | "es" | "fr" | "pt";

export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  pt: "PT",
};

export interface Translations {
  badge: string;
  subtitle: string;
  step1Label: string;
  step1Title: string;
  useMyLocation: string;
  loadingMap: string;
  mapHint: string;
  satellite: string;
  mapView: string;
  activeParcel: string;
  customParcel: string;
  currentCropLabel: string;
  freeLocationNote: string;
  climate30d: string;
  loadingNasa: string;
  tempAvg: string;
  minMax: (min: string, max: string) => string;
  rain30d: string;
  last30d: string;
  humidity: string;
  average: string;
  solar: string;
  solarUnit: string;
  latLabel: string;
  lonLabel: string;
  goBtn: string;
  invalidCoords: string;
  geoUnsupported: string;
  geoError: string;
  step2Label: string;
  step2Title: string;
  showSci: string;
  analyzing: string;
  elevLabel: string;
  slopeLabel: string;
  soilMoistLabel: string;
  eoLabel: string;
  zoneLabel: string;
  step3Label: string;
  step3Title: string;
  calculatingRot: string;
  bestChoice: string;
  optionN: (n: number) => string;
  waterSaving: string;
  soilCare: string;
  climateFit: string;
  sanidadLabel: string;
  tradeOffLabel: string;
  sciBaseLabel: string;
  priorities: {
    water: string;
    soil: string;
    climate: string;
    erosion: string;
  };
  zones: {
    tropicalArid: string;
    tropicalHumid: string;
    highland: string;
    temperate: string;
  };
  methodTitle: string;
  methodItems: string[];
  farmerDisclaimer: string;
}

export const T: Record<Lang, Translations> = {
  en: {
    badge: "NASA Space Apps 2026 · Field Shift",
    subtitle:
      "Pick any farm worldwide, understand climate risks in plain language, and compare scientifically backed crop rotations.",
    step1Label: "Step 1 of 3",
    step1Title: "Choose your field or location",
    useMyLocation: "Use my location",
    loadingMap: "Loading satellite map...",
    mapHint: "Click anywhere on the map to move your field",
    satellite: "Satellite",
    mapView: "Map",
    activeParcel: "Active field",
    customParcel: "Custom field",
    currentCropLabel: "Current crop",
    freeLocationNote: "Location selected directly on the map.",
    climate30d: "Real climate (last 30 days)",
    loadingNasa: "Fetching NASA satellite data...",
    tempAvg: "Mean temperature",
    minMax: (min, max) => `Min ${min}° · Max ${max}°`,
    rain30d: "Total rainfall",
    last30d: "Last 30 days",
    humidity: "Air humidity",
    average: "Average",
    solar: "Solar radiation",
    solarUnit: "MJ/m² per day",
    latLabel: "Latitude",
    lonLabel: "Longitude",
    goBtn: "Go",
    invalidCoords: "Enter valid coordinates (Lat: -90 to 90, Lon: -180 to 180).",
    geoUnsupported: "Your browser does not support geolocation.",
    geoError: "Could not retrieve your current location.",
    step2Label: "Step 2 of 3",
    step2Title: "How is your field doing today?",
    showSci: "Scientific data",
    analyzing: "Analyzing climate and terrain risks...",
    elevLabel: "Elevation (DEM / SRTM)",
    slopeLabel: "Estimated slope",
    soilMoistLabel: "Soil moisture (0–7 cm)",
    eoLabel: "Evaporation Eo (Penman 1948)",
    zoneLabel: "Detected agro-zone",
    step3Label: "Step 3 of 3",
    step3Title: "Which crop should you rotate here?",
    calculatingRot: "Evaluating global crop rotations for this location...",
    bestChoice: "Best match",
    optionN: (n) => `Option #${n}`,
    waterSaving: "Water efficiency",
    soilCare: "Soil & erosion care",
    climateFit: "Local climate fit",
    sanidadLabel: "Crop health",
    tradeOffLabel: "Trade-off",
    sciBaseLabel: "Scientific basis",
    priorities: {
      water: "💧 Save water",
      soil: "🌱 Improve soil",
      climate: "🌡️ Heat/frost resilience",
      erosion: "⛰️ Stop erosion",
    },
    zones: {
      tropicalArid: "Arid / Semi-arid Tropical & Subtropical",
      tropicalHumid: "Humid Tropical & Subtropical",
      highland: "Highland / Cool Mountain",
      temperate: "Temperate / Continental",
    },
    methodTitle: "Formulas & Peer-Reviewed Basis (RELASPO · Penman 1948 · FAO-56 · RUSLE)",
    methodItems: [
      "Reference Evaporation (Eo): Penman, H. L. (1948), Proc. R. Soc. Lond. A 193, 120–145; hydrological formulation following Dr. Jorge Pinna Cabrejos (1974), Relaciones Agua–Suelo–Planta (RELASPO).",
      "Crop Water & Thermal Thresholds: Allen, R. G. et al. (1998), FAO Irrigation & Drainage Paper No. 56; FAO EcoCrop Database.",
      "Soil Erosion Cover Factor (C): Renard, K. G. et al. (1997), USDA-ARS Agriculture Handbook No. 703 (RUSLE).",
      "Biological Nitrogen Fixation (BNF): Herridge, D. F., Peoples, M. B., & Boddey, R. M. (2008), Plant and Soil, 311, 1–18.",
    ],
    farmerDisclaimer:
      "Decision-support notice: This tool helps identify climate patterns and crop rotation possibilities from open NASA & FAO data, and does not replace the farmer's judgment or local agricultural experience.",
  },
  es: {
    badge: "NASA Space Apps 2026 · Field Shift",
    subtitle:
      "Elige cualquier parcela del mundo, entiende sus riesgos en lenguaje simple y compara rotaciones respaldadas por ciencia.",
    step1Label: "Paso 1 de 3",
    step1Title: "Elige tu parcela o ubicación",
    useMyLocation: "Usar mi ubicación",
    loadingMap: "Cargando mapa satelital...",
    mapHint: "Haz clic en cualquier parte del mundo para mover tu parcela",
    satellite: "Satélite",
    mapView: "Mapa",
    activeParcel: "Parcela activa",
    customParcel: "Parcela personalizada",
    currentCropLabel: "Cultivo actual",
    freeLocationNote: "Ubicación elegida libremente en el mapa.",
    climate30d: "Clima real últimos 30 días",
    loadingNasa: "Consultando datos satelitales de la NASA...",
    tempAvg: "Temperatura media",
    minMax: (min, max) => `Mín ${min}° · Máx ${max}°`,
    rain30d: "Lluvia acumulada",
    last30d: "Últimos 30 días",
    humidity: "Humedad del aire",
    average: "Promedio",
    solar: "Energía solar",
    solarUnit: "MJ/m² al día",
    latLabel: "Latitud",
    lonLabel: "Longitud",
    goBtn: "Ir",
    invalidCoords: "Ingresa coordenadas válidas (Lat: -90 a 90, Lon: -180 a 180).",
    geoUnsupported: "Tu navegador no permite geolocalización.",
    geoError: "No se pudo obtener tu ubicación actual.",
    step2Label: "Paso 2 de 3",
    step2Title: "¿Cómo está tu campo hoy?",
    showSci: "Ver datos científicos",
    analyzing: "Analizando riesgos climáticos y del terreno...",
    elevLabel: "Elevación (DEM / SRTM)",
    slopeLabel: "Pendiente estimada",
    soilMoistLabel: "Humedad suelo (0–7 cm)",
    eoLabel: "Evaporación Eo (Penman 1948)",
    zoneLabel: "Zona agroclimática",
    step3Label: "Paso 3 de 3",
    step3Title: "¿Qué cultivo te conviene rotar aquí?",
    calculatingRot: "Evaluando rotaciones globales para esta ubicación...",
    bestChoice: "Mejor opción",
    optionN: (n) => `Opción #${n}`,
    waterSaving: "Ahorro de agua",
    soilCare: "Cuidado del suelo",
    climateFit: "Ajuste al clima",
    sanidadLabel: "Sanidad",
    tradeOffLabel: "A tener en cuenta",
    sciBaseLabel: "Base científica",
    priorities: {
      water: "💧 Ahorrar agua",
      soil: "🌱 Mejorar suelo",
      climate: "🌡️ Resistir clima",
      erosion: "⛰️ Frenar erosión",
    },
    zones: {
      tropicalArid: "Tropical / Subtropical Árido y Semiárido",
      tropicalHumid: "Tropical / Subtropical Húmedo",
      highland: "Sierra / Montaña Fría",
      temperate: "Templado / Continental",
    },
    methodTitle: "Fórmulas y respaldo científico (RELASPO · Penman 1948 · FAO-56 · RUSLE)",
    methodItems: [
      "Evaporación de referencia (Eo): Penman, H. L. (1948), Proc. R. Soc. Lond. A 193, 120–145; formulación hidrológica del libro RELASPO — Relaciones Agua–Suelo–Planta (Dr. Jorge Pinna Cabrejos, 1974).",
      "Requerimiento hídrico y umbrales térmicos: Allen, R. G. et al. (1998), FAO Riego y Drenaje N.° 56; Base de datos FAO EcoCrop.",
      "Factor C de cobertura contra erosión: Renard, K. G. et al. (1997), USDA-ARS Agriculture Handbook No. 703 (RUSLE).",
      "Fijación biológica de nitrógeno (BNF): Herridge, D. F., Peoples, M. B., & Boddey, R. M. (2008), Plant and Soil, 311, 1–18.",
    ],
    farmerDisclaimer:
      "Herramienta de apoyo: Ayuda a identificar patrones climáticos y posibilidades de rotación con datos abiertos de NASA y FAO, pero no sustituye el criterio del agricultor ni la experiencia agrícola local.",
  },
  fr: {
    badge: "NASA Space Apps 2026 · Field Shift",
    subtitle:
      "Choisissez n'importe quelle parcelle dans le monde, comprenez les risques simplement et comparez des rotations scientifiquement validées.",
    step1Label: "Étape 1 sur 3",
    step1Title: "Choisissez votre parcelle ou position",
    useMyLocation: "Ma position",
    loadingMap: "Chargement de la carte satellite...",
    mapHint: "Cliquez n'importe où sur la carte pour déplacer votre parcelle",
    satellite: "Satellite",
    mapView: "Carte",
    activeParcel: "Parcelle active",
    customParcel: "Parcelle personnalisée",
    currentCropLabel: "Culture actuelle",
    freeLocationNote: "Emplacement choisi directement sur la carte.",
    climate30d: "Climat réel (30 derniers jours)",
    loadingNasa: "Récupération des données NASA...",
    tempAvg: "Température moyenne",
    minMax: (min, max) => `Min ${min}° · Max ${max}°`,
    rain30d: "Précipitations totales",
    last30d: "30 derniers jours",
    humidity: "Humidité de l'air",
    average: "Moyenne",
    solar: "Énergie solaire",
    solarUnit: "MJ/m² par jour",
    latLabel: "Latitude",
    lonLabel: "Longitude",
    goBtn: "Aller",
    invalidCoords: "Entrez des coordonnées valides (Lat: -90 à 90, Lon: -180 à 180).",
    geoUnsupported: "Votre navigateur ne supporte pas la géolocalisation.",
    geoError: "Impossible d'obtenir votre position.",
    step2Label: "Étape 2 sur 3",
    step2Title: "Quel est l'état de votre champ aujourd'hui ?",
    showSci: "Données scientifiques",
    analyzing: "Analyse des risques climatiques et du sol...",
    elevLabel: "Altitude (DEM / SRTM)",
    slopeLabel: "Pente estimée",
    soilMoistLabel: "Humidité du sol (0–7 cm)",
    eoLabel: "Évaporation Eo (Penman 1948)",
    zoneLabel: "Zone agroclimatique",
    step3Label: "Étape 3 sur 3",
    step3Title: "Quelle rotation cultiver ici ?",
    calculatingRot: "Évaluation des rotations pour ce lieu...",
    bestChoice: "Meilleur choix",
    optionN: (n) => `Option #${n}`,
    waterSaving: "Économie d'eau",
    soilCare: "Soin du sol",
    climateFit: "Adaptation au climat",
    sanidadLabel: "Santé des cultures",
    tradeOffLabel: "Compromis",
    sciBaseLabel: "Base scientifique",
    priorities: {
      water: "💧 Économiser l'eau",
      soil: "🌱 Améliorer le sol",
      climate: "🌡️ Résister au climat",
      erosion: "⛰️ Freiner l'érosion",
    },
    zones: {
      tropicalArid: "Tropical / Subtropical Aride & Semi-aride",
      tropicalHumid: "Tropical / Subtropical Humide",
      highland: "Haute Altitude / Montagne Fraîche",
      temperate: "Tempéré / Continental",
    },
    methodTitle: "Formules & base scientifique (RELASPO · Penman 1948 · FAO-56 · RUSLE)",
    methodItems: [
      "Évaporation de référence (Eo) : Penman, H. L. (1948), Proc. R. Soc. Lond. A 193, 120–145 ; formulation hydrologique RELASPO — Relaciones Agua–Suelo–Planta (Dr. Jorge Pinna Cabrejos, 1974).",
      "Besoins en eau et seuils thermiques : Allen, R. G. et al. (1998), Bulletin FAO d'irrigation et de drainage n° 56 ; base FAO EcoCrop.",
      "Facteur C d'érosion hydrique : Renard, K. G. et al. (1997), USDA-ARS Agriculture Handbook No. 703 (RUSLE).",
      "Fixation biologique de l'azote (BNF) : Herridge, D. F., Peoples, M. B., & Boddey, R. M. (2008), Plant and Soil, 311, 1–18.",
    ],
    farmerDisclaimer:
      "Outil d'aide à la décision : cette application aide à identifier des tendances climatiques et des possibilités de rotation via les données ouvertes NASA/FAO, sans remplacer le jugement de l'agriculteur ni l'expérience locale.",
  },
  pt: {
    badge: "NASA Space Apps 2026 · Field Shift",
    subtitle:
      "Escolha qualquer área no mundo, entenda os riscos em linguagem simples e compare rotações com base científica.",
    step1Label: "Passo 1 de 3",
    step1Title: "Escolha sua área ou localização",
    useMyLocation: "Usar minha localização",
    loadingMap: "Carregando mapa de satélite...",
    mapHint: "Clique em qualquer ponto do mapa para mover sua área",
    satellite: "Satélite",
    mapView: "Mapa",
    activeParcel: "Área ativa",
    customParcel: "Área personalizada",
    currentCropLabel: "Cultura atual",
    freeLocationNote: "Localização escolhida diretamente no mapa.",
    climate30d: "Clima real (últimos 30 dias)",
    loadingNasa: "Consultando satélites da NASA...",
    tempAvg: "Temperatura média",
    minMax: (min, max) => `Mín ${min}° · Máx ${max}°`,
    rain30d: "Chuva acumulada",
    last30d: "Últimos 30 dias",
    humidity: "Umidade do ar",
    average: "Média",
    solar: "Radiação solar",
    solarUnit: "MJ/m² por dia",
    latLabel: "Latitude",
    lonLabel: "Longitude",
    goBtn: "Ir",
    invalidCoords: "Insira coordenadas válidas (Lat: -90 a 90, Lon: -180 a 180).",
    geoUnsupported: "Seu navegador não suporta geolocalização.",
    geoError: "Não foi possível obter sua localização.",
    step2Label: "Passo 2 de 3",
    step2Title: "Como está seu campo hoje?",
    showSci: "Dados científicos",
    analyzing: "Analisando riscos climáticos e do terreno...",
    elevLabel: "Elevação (DEM / SRTM)",
    slopeLabel: "Declividade estimada",
    soilMoistLabel: "Umidade do solo (0–7 cm)",
    eoLabel: "Evaporação Eo (Penman 1948)",
    zoneLabel: "Zona agroclimática",
    step3Label: "Passo 3 de 3",
    step3Title: "Qual rotação plantar aqui?",
    calculatingRot: "Avaliando rotações globais para este local...",
    bestChoice: "Melhor opção",
    optionN: (n) => `Opção #${n}`,
    waterSaving: "Economia de água",
    soilCare: "Cuidado do solo",
    climateFit: "Ajuste ao clima",
    sanidadLabel: "Sanidade",
    tradeOffLabel: "Ponto de atenção",
    sciBaseLabel: "Base científica",
    priorities: {
      water: "💧 Economizar água",
      soil: "🌱 Melhorar o solo",
      climate: "🌡️ Resistir ao clima",
      erosion: "⛰️ Conter erosão",
    },
    zones: {
      tropicalArid: "Tropical / Subtropical Árido e Semiárido",
      tropicalHumid: "Tropical / Subtropical Úmido",
      highland: "Altitude / Montanha Fria",
      temperate: "Temperado / Continental",
    },
    methodTitle: "Fórmulas e base científica (RELASPO · Penman 1948 · FAO-56 · RUSLE)",
    methodItems: [
      "Evaporação de referência (Eo): Penman, H. L. (1948), Proc. R. Soc. Lond. A 193, 120–145; formulação hidrológica do livro RELASPO — Relaciones Agua–Suelo–Planta (Dr. Jorge Pinna Cabrejos, 1974).",
      "Demanda hídrica e limites térmicos: Allen, R. G. et al. (1998), Boletim FAO Irrigação e Drenagem n° 56; base FAO EcoCrop.",
      "Fator C de cobertura e erosão: Renard, K. G. et al. (1997), USDA-ARS Agriculture Handbook No. 703 (RUSLE).",
      "Fixação biológica de nitrogênio (BNF): Herridge, D. F., Peoples, M. B., & Boddey, R. M. (2008), Plant and Soil, 311, 1–18.",
    ],
    farmerDisclaimer:
      "Ferramenta de apoio: ajuda a identificar padrões climáticos e possibilidades de rotação com dados abertos da NASA e FAO, sem substituir o critério do agricultor nem a experiência agrícola local.",
  },
};
