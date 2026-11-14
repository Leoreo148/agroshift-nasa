import type { CurrentCropType } from "@/lib/rotations";

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
  forecast7dLabel: string;
  historyTitle: string;
  problemTitle: string;
  problemPoints: string[];
  solutionTitle: string;
  solutionText: string;
  districtTitle: string;
  districtText: string;
  sentinelNote: string;
  currentCropSelectorLabel: string;
  currentCropTypes: Record<CurrentCropType, string>;
  problemByCrop: Record<
    CurrentCropType,
    {
      title: string;
      points: string[];
      solutionTitle: string;
      solutionText: string;
    }
  >;
  aiButtonLabel: string;
  aiLoadingLabel: string;
  aiTitle: string;
  aiCheckLabel: string;
  aiSourceGemini: string;
  aiSourceFallback: string;
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
    forecast7dLabel: "Next 7 days (Meteomatics)",
    historyTitle: "5-Year Climate & Soil Wetness Trend (NASA POWER 2021–2025)",
    problemTitle: "The Problem: Repeating the same crop here (Monoculture)",
    problemPoints: [
      "Higher fertilizer cost: continuous cereals/tubers extract nitrogen with 0 kg N/ha biological fixation.",
      "Soil loss & erosion: repeated tillage keeps high RUSLE cover exposure (C ≈ 0.35–0.40).",
      "Pest & disease buildup: same-family crops feed nematodes, root fungi, and adapted weeds.",
    ],
    solutionTitle: "The Solution for this field",
    solutionText:
      "Rotating with the top-ranked crops below restores nitrogen naturally (BNF), cuts erosion risk, and breaks pest cycles under your local climate.",
    districtTitle: "District & Organization Scope (How to detect non-rotated areas)",
    districtText:
      "Cooperatives and local agencies combine 5-year soil wetness trends (NASA POWER GWETTOP) with multi-year vegetation indices (Sentinel-2 / MODIS NDVI) to separate stable perennial orchards from annual fields losing vigor or failing to rotate.",
    sentinelNote:
      "Remote-sensing note (Sentinel-2 / MODIS): In smallholder plots or low-canopy stages, 10–250 m pixels mix crop foliage with bare soil (mixed-pixel effect), depressing NDVI and hiding crop identity. We therefore use NDVI only for district-scale alerts and rely on climate, Eo (Penman 1948 / RELASPO), slope, and local knowledge at field level.",
    currentCropSelectorLabel: "Current crop on this plot",
    currentCropTypes: {
      cereal: "🌾 Continuous cereal (Maize/Wheat/Sorghum)",
      tuber: "🥔 Root / tuber (Potato/Cassava)",
      legume: "🫘 Legume (Bean/Cowpea)",
      perennial: "🍇 Perennial / orchard (Grape/Fruit tree)",
    },
    problemByCrop: {
      cereal: {
        title: "The Problem: Repeating cereals on this soil",
        points: [
          "Higher fertilizer spend: continuous cereals fix 0 kg N/ha and deplete soil nitrogen.",
          "Erosion exposure: row cereals leave high RUSLE cover vulnerability (C ≈ 0.35–0.40).",
          "Pest & weed buildup: repeating grass crops feeds root nematodes and adapted weeds.",
        ],
        solutionTitle: "The Solution for this soil",
        solutionText:
          "Rotating to legumes or cover crops restores natural nitrogen (BNF), protects topsoil, and breaks grass pest cycles.",
      },
      tuber: {
        title: "The Problem: Repeating potato / tubers on this soil",
        points: [
          "Heavy soil disturbance: harvesting tubers loosens topsoil and accelerates RUSLE erosion on slopes.",
          "Soil-borne pathogens: continuous tubers multiply cyst nematodes and fungal wilt.",
          "High input dependency: rising fungicide and synthetic fertilizer costs each season.",
        ],
        solutionTitle: "The Solution for this soil",
        solutionText:
          "Rotating to quinoa, oats+vetch cover, or legumes breaks tuber disease cycles and anchors soil structure.",
      },
      legume: {
        title: "The Problem: Repeating the same legume without break",
        points: [
          "Root-rot accumulation: repeating legumes builds Fusarium and anthracnose pressure.",
          "Untapped nitrogen: residual fixed nitrogen is lost if not captured by a following cereal.",
          "Lower residue cover: some pulses leave sparse stubble against wind and rain.",
        ],
        solutionTitle: "The Solution for this soil",
        solutionText:
          "Alternating with drought-hardy cereals (sorghum, millet, quinoa) or grass+legume cover captures residual N and balances soil biology.",
      },
      perennial: {
        title: "The Problem in orchards: Bare alleys (Do NOT uproot trees)",
        points: [
          "Perennial fruit crops remain for years and should NOT be rotated annually.",
          "Bare soil between rows loses moisture faster under high Eo (Penman 1948) and erodes in rain.",
          "Soil compaction & low biodiversity in clean-tilled orchard alleys.",
        ],
        solutionTitle: "The Solution: Living inter-row cover",
        solutionText:
          "Planting low-stature legumes or cover mixes between orchard rows fixes nitrogen, cuts evaporation, and stops erosion without competing with the crop.",
      },
    },
    aiButtonLabel: "Generate field transition plan (AI)",
    aiLoadingLabel: "Generating tailored transition steps...",
    aiTitle: "Tailored 3-Step Plan for This Soil",
    aiCheckLabel: "Verify locally",
    aiSourceGemini: "Gemini 2.5 Flash · Grounded in NASA & FAO data",
    aiSourceFallback: "Deterministic agronomic summary",
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
    forecast7dLabel: "Próximos 7 días (Meteomatics)",
    historyTitle: "Tendencia histórica 5 años: clima y humedad del suelo (NASA POWER 2021–2025)",
    problemTitle: "El Problema: Repetir el mismo cultivo aquí (Monocultivo)",
    problemPoints: [
      "Más gasto en fertilizante: sembrar siempre maíz, papa o cereal agota el nitrógeno (0 kg N/ha fijados).",
      "Pérdida de suelo fértil: mantener el suelo expuesto eleva el factor de erosión RUSLE (C ≈ 0.35–0.40).",
      "Entrada de plagas y hongos: repetir la misma familia multiplica nemátodos, pudriciones y malezas.",
    ],
    solutionTitle: "La Solución para este suelo",
    solutionText:
      "Rotar con las opciones recomendadas abajo aporta nitrógeno natural (BNF), protege el suelo contra erosión y corta el ciclo de plagas según tu clima real.",
    districtTitle: "Alcance para distritos y organizaciones (Detectar áreas sin rotación)",
    districtText:
      "Cooperativas y municipios cruzan la tendencia de humedad superficial (NASA POWER GWETTOP) con series históricas de NDVI/EVI (Sentinel-2 / MODIS) para distinguir frutales perennes estables de lotes anuales que no rotan y pierden vigor o suelo.",
    sentinelNote:
      "Limitación técnica de Sentinel-2 / MODIS: en parcelas pequeñas o con poco volumen foliar, el píxel de 10–250 m mezcla cultivo con suelo desnudo (píxel mixto), haciendo que el NDVI caiga y no distinga cultivos con precisión. Por eso el NDVI sirve como alerta distrital, pero en parcela decidimos con clima, Eo (Penman 1948 / RELASPO), pendiente y criterio local.",
    currentCropSelectorLabel: "¿Qué vienes sembrando aquí?",
    currentCropTypes: {
      cereal: "🌾 Cereal continuo (Maíz/Trigo/Sorgo)",
      tuber: "🥔 Tubérculo / Papa",
      legume: "🫘 Leguminosa (Frijol/Caupí)",
      perennial: "🍇 Frutal o cultivo permanente",
    },
    problemByCrop: {
      cereal: {
        title: "El Problema: Repetir cereal en este suelo",
        points: [
          "Más gasto en fertilizante: los cereales continuos fijan 0 kg N/ha y agotan el nitrógeno.",
          "Pérdida de suelo: los cultivos en hilera dejan exposición RUSLE alta (C ≈ 0.35–0.40).",
          "Entrada de plagas: repetir gramíneas multiplica nemátodos y malezas especializadas.",
        ],
        solutionTitle: "La Solución para este suelo",
        solutionText:
          "Rotar con leguminosas o coberturas aporta nitrógeno natural (BNF), protege la capa arable y corta plagas de gramíneas.",
      },
      tuber: {
        title: "El Problema: Repetir papa o tubérculos aquí",
        points: [
          "Fuerte erosión en cosecha: remover el suelo acelera el lavado en pendiente (RUSLE).",
          "Plagas de suelo persistentes: repetir papa multiplica nemátodos quiste y hongos de raíz.",
          "Mayor costo sanitario: obliga a gastar más en fungicidas y fertilizantes cada campaña.",
        ],
        solutionTitle: "La Solución para este suelo",
        solutionText:
          "Alternar con quinua, avena+vicia o leguminosas rompe el ciclo sanitario tras papa y estabiliza el suelo.",
      },
      legume: {
        title: "El Problema: Repetir leguminosa sin alternancia",
        points: [
          "Hongos radiculares: sembrar siempre leguminosa acumula Fusarium y enfermedades de raíz.",
          "Nitrógeno desaprovechado: parte del N fijado se lixivia si no sigue un cereal que lo absorba.",
          "Menor rastrojo protector frente a lluvia erosiva o viento.",
        ],
        solutionTitle: "La Solución para este suelo",
        solutionText:
          "Alternar con un cereal rústico (sorgo, mijo perla, quinua) o cobertura aprovecha el N fijado y corta patógenos.",
      },
      perennial: {
        title: "El Problema en frutales: Calles desnudas (NO se arranca el árbol)",
        points: [
          "Los frutales permanentes se mantienen años; aquí no aplica rotación anual del cultivo principal.",
          "Dejar el suelo desnudo entre surcos aumenta la evaporación (Eo Penman 1948) y la erosión.",
          "Compactación y pérdida de materia orgánica en las calles de paso.",
        ],
        solutionTitle: "La Solución: Cobertura viva entre hileras",
        solutionText:
          "Sembrar coberturas bajas o leguminosas entre calles protege la humedad del suelo, aporta N y frena erosión sin competir con el frutal.",
      },
    },
    aiButtonLabel: "Generar plan práctico para esta parcela (IA)",
    aiLoadingLabel: "Generando pasos de transición con datos NASA...",
    aiTitle: "Plan práctico de 3 pasos para este suelo",
    aiCheckLabel: "Verificar en campo",
    aiSourceGemini: "Gemini 2.5 Flash · Basado en datos NASA y FAO",
    aiSourceFallback: "Resumen agronómico determinista",
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
    forecast7dLabel: "7 prochains jours (Meteomatics)",
    historyTitle: "Tendance sur 5 ans : climat et humidité du sol (NASA POWER 2021–2025)",
    problemTitle: "Le Problème : Répéter la même culture ici (Monoculture)",
    problemPoints: [
      "Coût d'engrais accru : les céréales continues épuisent l'azote sans fixation biologique (0 kg N/ha).",
      "Érosion et perte de sol : le travail répété maintient un facteur RUSLE élevé (C ≈ 0,35–0,40).",
      "Pression des ravageurs : la même famille botanique entretient nématodes et maladies racinaires.",
    ],
    solutionTitle: "La Solution pour ce sol",
    solutionText:
      "La rotation avec les cultures classées ci-dessous restaure l'azote (BNF), réduit l'érosion et coupe les cycles parasitaires.",
    districtTitle: "Portée districts & organisations (Détecter les zones sans rotation)",
    districtText:
      "Les coopératives croisent l'humidité du sol sur 5 ans (NASA POWER GWETTOP) avec les séries NDVI/EVI (Sentinel-2 / MODIS) pour distinguer les vergers pérennes stables des parcelles annuelles en perte de vigueur.",
    sentinelNote:
      "Limite technique Sentinel-2 / MODIS : sur petites parcelles, le pixel de 10–250 m mélange végétation et sol nu (pixel mixte), faisant chuter le NDVI. Il sert donc d'alerte à l'échelle du district, complété à la parcelle par climat, Eo (Penman 1948 / RELASPO) et expertise locale.",
    currentCropSelectorLabel: "Culture actuelle sur cette parcelle",
    currentCropTypes: {
      cereal: "🌾 Céréale continue (Maïs/Blé/Sorgho)",
      tuber: "🥔 Tubercule (Pomme de terre)",
      legume: "🫘 Légumineuse (Haricot/Niébé)",
      perennial: "🍇 Culture pérenne / Verger",
    },
    problemByCrop: {
      cereal: {
        title: "Le Problème : Répéter les céréales ici",
        points: [
          "Coût d'engrais accru : les céréales fixent 0 kg N/ha et épuisent l'azote.",
          "Exposition à l'érosion : facteur RUSLE élevé (C ≈ 0,35–0,40).",
          "Pression des ravageurs et adventices spécialisées des graminées.",
        ],
        solutionTitle: "La Solution pour ce sol",
        solutionText:
          "Alterner avec légumineuses ou couverts restaure l'azote (BNF), protège le sol et coupe les cycles parasitaires.",
      },
      tuber: {
        title: "Le Problème : Répéter les tubercules ici",
        points: [
          "Forte perturbation du sol à la récolte, accélérant l'érosion en pente (RUSLE).",
          "Accumulation de nématodes et maladies fongiques du sol.",
          "Coûts croissants en intrants phytosanitaires.",
        ],
        solutionTitle: "La Solution pour ce sol",
        solutionText:
          "La rotation avec quinoa, avoine+vesce ou légumineuses assainit le sol et stabilise la structure.",
      },
      legume: {
        title: "Le Problème : Répéter la même légumineuse",
        points: [
          "Risque accru de pourritures racinaires (Fusarium) sans coupure.",
          "Azote résiduel sous-exploité faute d'une céréale suivante.",
          "Couverture de résidus souvent plus faible après récolte.",
        ],
        solutionTitle: "La Solution pour ce sol",
        solutionText:
          "Alterner avec sorgho, mil ou quinoa valorise l'azote fixé et rééquilibre le sol.",
      },
      perennial: {
        title: "En verger : Sol nu entre rangs (On ne coupe pas l'arbre)",
        points: [
          "Les cultures pérennes restent en place ; la rotation annuelle ne s'applique pas au verger.",
          "L'inter-rang nu augmente l'évaporation (Eo Penman 1948) et le ruissellement.",
          "Perte de matière organique et tassement dans les allées.",
        ],
        solutionTitle: "La Solution : Couvert vivant inter-rangs",
        solutionText:
          "Un couvert bas de légumineuses/graminées entre les rangs fixe l'azote, retient l'humidité et freine l'érosion.",
      },
    },
    aiButtonLabel: "Générer un plan de transition (IA)",
    aiLoadingLabel: "Génération du plan adapté...",
    aiTitle: "Plan pratique en 3 étapes pour ce sol",
    aiCheckLabel: "À vérifier sur place",
    aiSourceGemini: "Gemini 2.5 Flash · Basé sur données NASA & FAO",
    aiSourceFallback: "Synthèse agronomique déterministe",
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
    forecast7dLabel: "Próximos 7 dias (Meteomatics)",
    historyTitle: "Tendência de 5 anos: clima e umidade do solo (NASA POWER 2021–2025)",
    problemTitle: "O Problema: Repetir a mesma cultura aqui (Monocultivo)",
    problemPoints: [
      "Mais gasto com adubo: cereais contínuos esgotam o nitrogênio sem fixação biológica (0 kg N/ha).",
      "Perda de solo fértil: exposição contínua mantém alto fator RUSLE de erosão (C ≈ 0,35–0,40).",
      "Aumento de pragas e doenças: repetir a mesma família multiplica nematoides e fungos de solo.",
    ],
    solutionTitle: "A Solução para este solo",
    solutionText:
      "Rotacionar com as opções abaixo devolve nitrogênio natural (BNF), reduz a erosão e quebra o ciclo de pragas no seu clima real.",
    districtTitle: "Alcance para distritos e organizações (Detectar áreas sem rotação)",
    districtText:
      "Cooperativas e órgãos locais cruzam a umidade do solo de 5 anos (NASA POWER GWETTOP) com séries NDVI/EVI (Sentinel-2 / MODIS) para diferenciar pomares perenes estáveis de áreas anuais sem rotação perdendo vigor.",
    sentinelNote:
      "Limitação técnica de Sentinel-2 / MODIS: em pequenas parcelas ou baixo volume foliar, o pixel de 10–250 m mistura planta e solo exposto (efeito pixel misto), derrubando o NDVI. Por isso usamos NDVI apenas como alerta distrital e decidimos na parcela com clima, Eo (Penman 1948 / RELASPO), declive e critério local.",
    currentCropSelectorLabel: "O que você cultiva hoje aqui?",
    currentCropTypes: {
      cereal: "🌾 Cereal contínuo (Milho/Trigo/Sorgo)",
      tuber: "🥔 Tubérculo (Batata/Mandioca)",
      legume: "🫘 Leguminosa (Feijão/Caupi)",
      perennial: "🍇 Frutífera ou perene",
    },
    problemByCrop: {
      cereal: {
        title: "O Problema: Repetir cereal neste solo",
        points: [
          "Mais gasto com adubo: cereais contínuos fixam 0 kg N/ha e esgotam o nitrogênio.",
          "Exposição à erosão: alto fator RUSLE (C ≈ 0,35–0,40).",
          "Acúmulo de pragas e plantas daninhas de gramíneas.",
        ],
        solutionTitle: "A Solução para este solo",
        solutionText:
          "Rotacionar com leguminosas ou coberturas devolve nitrogênio (BNF), protege o solo e quebra ciclos de pragas.",
      },
      tuber: {
        title: "O Problema: Repetir batata ou tubérculos aqui",
        points: [
          "Forte revolvimento do solo na colheita, acelerando a erosão em declive (RUSLE).",
          "Acúmulo de nematoides e fungos de solo.",
          "Maior custo com defensivos e fertilizantes a cada safra.",
        ],
        solutionTitle: "A Solução para este solo",
        solutionText:
          "Alternar com quinoa, aveia+ervilhaca ou leguminosas quebra doenças de solo e estabiliza a área.",
      },
      legume: {
        title: "O Problema: Repetir leguminosa sem pausa",
        points: [
          "Acúmulo de fungos radiculares (Fusarium) sem alternância de família.",
          "Desperdício do nitrogênio fixado sem um cereal na sequência.",
          "Menor palhada residual contra chuva erosiva.",
        ],
        solutionTitle: "A Solução para este solo",
        solutionText:
          "Alternar com sorgo, milheto ou quinoa aproveita o N fixado e equilibra a biologia do solo.",
      },
      perennial: {
        title: "Em frutíferas: Ruas expostas (NÃO se arranca o pomar)",
        points: [
          "Culturas perenes permanecem por anos; não se aplica rotação anual da cultura principal.",
          "Solo nu nas entrelinhas aumenta a evaporação (Eo Penman 1948) e a erosão.",
          "Compactação e perda de matéria orgânica nas ruas.",
        ],
        solutionTitle: "A Solução: Cobertura viva nas entrelinhas",
        solutionText:
          "Plantar leguminosas baixas ou coberturas entre as linhas fixa N, retém umidade e contém erosão sem competir com a frutífera.",
      },
    },
    aiButtonLabel: "Gerar plano prático para esta área (IA)",
    aiLoadingLabel: "Gerando passos de transição com dados NASA...",
    aiTitle: "Plano prático em 3 passos para este solo",
    aiCheckLabel: "Verificar no campo",
    aiSourceGemini: "Gemini 2.5 Flash · Baseado em dados NASA e FAO",
    aiSourceFallback: "Resumo agronômico determinístico",
  },
};
