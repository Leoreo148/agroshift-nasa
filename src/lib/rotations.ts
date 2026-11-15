import type { AgroZone, ClimateMetrics } from "@/lib/diagnostics";
import type { Lang } from "@/lib/i18n";

export type FarmerPriority = "water" | "soil" | "climate" | "erosion";
export type CurrentCropType = "cereal" | "tuber" | "legume" | "perennial";
export type BotanicalGroup =
  | "horticulture"
  | "tuber"
  | "legume"
  | "cereal"
  | "pseudocereal"
  | "oilseed"
  | "cover";

export interface CropText {
  name: string;
  category: string;
  pestBreakBenefit: string;
  tradeOff: string;
}

export interface CropOption {
  id: string;
  scientificName: string;
  botanicalGroup: BotanicalGroup;
  suitableZones: AgroZone[];
  waterRangeMm: [number, number];
  ecoCropTempC: [number, number, number, number];
  bnfKgNHa: [number, number];
  rusleCFactor: number;
  kcMid: number;
  cycleDays: [number, number];
  reference: string;
  citations: string[];
  i18n: Record<Lang, CropText>;
}

export interface EvaluatedCrop {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  botanicalGroup: BotanicalGroup;
  pestBreakBenefit: string;
  tradeOff: string;
  reference: string;
  citations: string[];
  matchScore: number;
  waterSavingScore: number;
  climateFitScore: number;
  soilScore: number;
  reason: string;
  waterRangeMm: [number, number];
  ecoCropTempC: [number, number, number, number];
  bnfKgNHa: [number, number];
  kcMid: number;
  cycleDays: [number, number];
  feasibility: "optimal" | "manageable" | "critical";
  feasibilityLabel: string;
  limitingFactor: string | null;
}

export const CROP_CATALOG: CropOption[] = [
  // --- HORTALIZAS / VEGETABLES ---
  {
    id: "tomato",
    scientificName: "Solanum lycopersicum",
    botanicalGroup: "horticulture",
    suitableZones: ["tropicalArid", "tropicalHumid", "temperate", "highland"],
    waterRangeMm: [400, 600],
    ecoCropTempC: [10, 18, 28, 35],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.35,
    kcMid: 1.15,
    cycleDays: [90, 120],
    reference: "FAO-56 · FAO EcoCrop #2081",
    citations: [
      "Allen, R. G. et al. (1998). Crop evapotranspiration (FAO Irrigation & Drainage Paper No. 56, Tomato Kc_mid = 1.15).",
      "FAO EcoCrop Database (Code 2081: T_opt 18–28 °C, T_max 35 °C).",
    ],
    i18n: {
      en: {
        name: "Tomato",
        category: "Commercial Solanaceous Vegetable",
        pestBreakBenefit: "High local market demand; breaks monoculture grain pest cycles.",
        tradeOff: "Requires support staking, foliar disease scouting, and drip irrigation under dry spells.",
      },
      es: {
        name: "Tomate",
        category: "Hortaliza comercial de alta demanda",
        pestBreakBenefit: "Alta rotación y demanda comercial; rompe ciclos de plagas de gramíneas.",
        tradeOff: "Sensible a heladas y hongos foliares; requiere riego por goteo en secas.",
      },
      fr: {
        name: "Tomate",
        category: "Légume commercial à haute valeur",
        pestBreakBenefit: "Forte demande sur les marchés locaux ; rompt les cycles de ravageurs des céréales.",
        tradeOff: "Sensible au gel et aux maladies fongiques ; requiert un arrosage régulier.",
      },
      pt: {
        name: "Tomate",
        category: "Hortaliça comercial de alta demanda",
        pestBreakBenefit: "Alta liquidez no mercado local; quebra o ciclo de pragas de gramíneas.",
        tradeOff: "Sensível a geadas e doenças fúngicas; exige irrigação por gotejamento.",
      },
    },
  },
  {
    id: "chili-pepper",
    scientificName: "Capsicum annuum",
    botanicalGroup: "horticulture",
    suitableZones: ["tropicalArid", "tropicalHumid", "temperate"],
    waterRangeMm: [450, 650],
    ecoCropTempC: [12, 20, 30, 38],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.32,
    kcMid: 1.05,
    cycleDays: [90, 130],
    reference: "FAO-56 · FAO EcoCrop #398",
    citations: [
      "Allen, R. G. et al. (1998). FAO-56 Paper (Sweet/Hot Peppers Kc_mid = 1.05).",
      "FAO EcoCrop Database (Code 398: T_opt 20–30 °C, T_max 38 °C).",
    ],
    i18n: {
      en: {
        name: "Chili / Bell Pepper",
        category: "High-value cash vegetable",
        pestBreakBenefit: "Excellent cash crop with stable regional and processing demand.",
        tradeOff: "Sensitive to waterlogging and cold spells (<12 °C); blossom drop under extreme heat (>35 °C).",
      },
      es: {
        name: "Pimiento / Ají / Chile",
        category: "Hortaliza de renta y fruto comercial",
        pestBreakBenefit: "Excelente precio por kilo y demanda continua en fresco y seco.",
        tradeOff: "No tolera encharcamiento ni frío (<12 °C); aborta flor con calor excesivo (>35 °C).",
      },
      fr: {
        name: "Piment / Poivron",
        category: "Légume-fruit à forte valeur",
        pestBreakBenefit: "Excellente valeur marchande et débouchés réguliers.",
        tradeOff: "Craint l'engorgement et le froid (<12 °C) ; avortement floral au-delà de 35 °C.",
      },
      pt: {
        name: "Pimentão / Pimenta",
        category: "Hortaliça de fruto e alta renda",
        pestBreakBenefit: "Excelente valor comercial por hectare e mercado garantido.",
        tradeOff: "Não tolera encharcamento nem frio (<12 °C); aborta flores com calor extremo.",
      },
    },
  },
  {
    id: "onion",
    scientificName: "Allium cepa",
    botanicalGroup: "horticulture",
    suitableZones: ["tropicalArid", "temperate", "highland"],
    waterRangeMm: [350, 550],
    ecoCropTempC: [8, 15, 25, 32],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.38,
    kcMid: 1.05,
    cycleDays: [100, 140],
    reference: "FAO-56 · FAO EcoCrop #191",
    citations: [
      "Allen, R. G. et al. (1998). FAO-56 Paper (Dry Onion Kc_mid = 1.05).",
      "FAO EcoCrop Database (Code 191: T_opt 15–25 °C, T_max 32 °C).",
    ],
    i18n: {
      en: {
        name: "Onion",
        category: "Storable Bulb Vegetable",
        pestBreakBenefit: "Root sulfur exudates suppress soil nematode and fungal populations.",
        tradeOff: "Shallow root system requires precise surface moisture during bulb formation.",
      },
      es: {
        name: "Cebolla",
        category: "Hortaliza de bulbo de fácil almacenaje",
        pestBreakBenefit: "Exudados azufrados que reducen nematodos y patógenos en el suelo.",
        tradeOff: "Raíz poco profunda; requiere humedad controlada durante el llenado de bulbo.",
      },
      fr: {
        name: "Oignon",
        category: "Légume-bulbe de garde",
        pestBreakBenefit: "Exsudats racinaires répulsifs contre nématodes et champignons.",
        tradeOff: "Enracinement superficiel exigeant une humidité régulière au grossissement.",
      },
      pt: {
        name: "Cebola",
        category: "Hortaliça de bulbo de fácil conservação",
        pestBreakBenefit: "Compostos sulfurados ajudam a repelir pragas e nematoides do solo.",
        tradeOff: "Raízes superficiais que exigem irrigação uniforme na fase de bulbo.",
      },
    },
  },
  {
    id: "carrot",
    scientificName: "Daucus carota",
    botanicalGroup: "horticulture",
    suitableZones: ["temperate", "highland", "tropicalHumid"],
    waterRangeMm: [350, 500],
    ecoCropTempC: [7, 15, 22, 30],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.30,
    kcMid: 1.05,
    cycleDays: [80, 110],
    reference: "FAO-56 · FAO EcoCrop #946",
    citations: [
      "Allen, R. G. et al. (1998). FAO-56 Paper (Carrot Kc_mid = 1.05).",
      "FAO EcoCrop Database (Code 946: T_opt 15–22 °C, T_max 30 °C).",
    ],
    i18n: {
      en: {
        name: "Carrot",
        category: "Cool-season Root Vegetable",
        pestBreakBenefit: "Deep taproot loosens soil sub-layers; high vitamin and retail market demand.",
        tradeOff: "Requires stone-free, loose soil; high temperatures (>25 °C) produce bitter, woody roots.",
      },
      es: {
        name: "Zanahoria",
        category: "Hortaliza de raíz de clima templado/fresco",
        pestBreakBenefit: "Raíz pivotante que descompacta el suelo; demanda sostenida en el mercado.",
        tradeOff: "Exige suelo suelto sin piedras; el calor excesivo endurece la raíz.",
      },
      fr: {
        name: "Carotte",
        category: "Légume-racine de saison fraîche",
        pestBreakBenefit: "Racine pivotante décompactant les couches d'assise du sol.",
        tradeOff: "Exige un sol meuble et frais ; le trop chaud altère la tendreté.",
      },
      pt: {
        name: "Cenoura",
        category: "Hortaliça de raiz de clima ameno",
        pestBreakBenefit: "Raiz pivotante que descompacta o solo e tem venda rápida no comércio.",
        tradeOff: "Exige solo solto e bem drenado; calor intenso reduz a doçura da raiz.",
      },
    },
  },
  {
    id: "squash",
    scientificName: "Cucurbita pepo",
    botanicalGroup: "horticulture",
    suitableZones: ["tropicalArid", "tropicalHumid", "temperate", "highland"],
    waterRangeMm: [300, 500],
    ecoCropTempC: [10, 18, 30, 36],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.20,
    kcMid: 0.95,
    cycleDays: [80, 120],
    reference: "FAO-56 · FAO EcoCrop #903",
    citations: [
      "Allen, R. G. et al. (1998). FAO-56 (Squash / Pumpkin Kc_mid = 0.95).",
      "FAO EcoCrop Database (Code 903: T_opt 18–30 °C, T_max 36 °C).",
    ],
    i18n: {
      en: {
        name: "Squash / Pumpkin",
        category: "Living Mulch Cucurbit",
        pestBreakBenefit: "Broad foliage blankets soil, suppressing weeds and drastically reducing soil evaporation.",
        tradeOff: "Susceptible to powdery mildew in high humidity; bulky fruit harvest logistics.",
      },
      es: {
        name: "Calabaza / Zapallo",
        category: "Cucurbitácea de gran cobertura de suelo",
        pestBreakBenefit: "Hojas anchas que hacen sombra total, frenando malezas y evaporación.",
        tradeOff: "Sensible al oídio con exceso de humedad foliar; requiere espacio de guía.",
      },
      fr: {
        name: "Courge / Potiron",
        category: "Cucurbitacée à large couverture",
        pestBreakBenefit: "Feuillage dense ombrageant le sol et étouffant les adventices.",
        tradeOff: "Sensible à l'oïdium en cas d'humidité stagnante ; encombrement végétatif.",
      },
      pt: {
        name: "Abóbora / Mogango",
        category: "Cucurbitácea de cobertura viva de solo",
        pestBreakBenefit: "Folhas largas que cobrem o solo e retêm umidade contra a evaporação.",
        tradeOff: "Sensível a oídio em ambientes úmidos; exige espaço para os ramos.",
      },
    },
  },

  // --- TUBÉRCULOS Y RAÍCES ---
  {
    id: "potato",
    scientificName: "Solanum tuberosum",
    botanicalGroup: "tuber",
    suitableZones: ["highland", "temperate"],
    waterRangeMm: [450, 700],
    ecoCropTempC: [6, 14, 22, 28],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.32,
    kcMid: 1.15,
    cycleDays: [90, 150],
    reference: "CIP · FAO-56 · FAO EcoCrop #2082",
    citations: [
      "International Potato Center (CIP) agronomy benchmarks.",
      "Allen, R. G. et al. (1998). FAO-56 (Potato Kc_mid = 1.15).",
      "FAO EcoCrop Database (Code 2082: T_opt 14–22 °C, T_max 28 °C).",
    ],
    i18n: {
      en: {
        name: "Potato",
        category: "Cool-climate Staple Tuber",
        pestBreakBenefit: "High caloric and economic yield per hectare; deep hilling aerates soil profile.",
        tradeOff: "Tuber initiation requires cool night temperatures (<18 °C); blight risk under wet fog.",
      },
      es: {
        name: "Papa / Patata",
        category: "Tubérculo andino y templado de alta producción",
        pestBreakBenefit: "Gran rendimiento alimenticio y comercial; el aporque descompacta el suelo.",
        tradeOff: "Necesita noches frescas (<18 °C) para tuberosuperficial; riesgo de tizón con niebla.",
      },
      fr: {
        name: "Pomme de terre",
        category: "Tubercule vivrier majeur",
        pestBreakBenefit: "Haut rendement calorique et forte valeur nutritionnelle par hectare.",
        tradeOff: "Exige des nuits fraîches (<18 °C) ; vigilance sur le mildiou par temps humide.",
      },
      pt: {
        name: "Batata-inglesa",
        category: "Tubérculo básico de alto rendimento",
        pestBreakBenefit: "Alta produtividade e demanda de mercado garantida o ano todo.",
        tradeOff: "Tubercular exige noites frescas (<18 °C); risco de requeima sob alta umidade.",
      },
    },
  },
  {
    id: "sweet-potato",
    scientificName: "Ipomoea batatas",
    botanicalGroup: "tuber",
    suitableZones: ["tropicalArid", "tropicalHumid", "temperate"],
    waterRangeMm: [350, 600],
    ecoCropTempC: [12, 20, 30, 38],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.18,
    kcMid: 1.00,
    cycleDays: [100, 140],
    reference: "CIP · FAO-56 · FAO EcoCrop #1322",
    citations: [
      "International Potato Center (CIP) drought-resilient sweetpotato varieties.",
      "FAO EcoCrop Database (Code 1322: T_opt 20–30 °C, T_max 38 °C).",
    ],
    i18n: {
      en: {
        name: "Sweet Potato",
        category: "Drought-resilient Nutritious Tuber",
        pestBreakBenefit: "Dense trailing vine canopy prevents erosion; exceptional drought and heat tolerance.",
        tradeOff: "Sensitive to frost and waterlogged conditions; requires weevil pest scouting.",
      },
      es: {
        name: "Camote / Batata / Boniato",
        category: "Tubérculo rústico tolerante a sequía y calor",
        pestBreakBenefit: "Guías rastreras que sellan el suelo contra la erosión; resiste sequía.",
        tradeOff: "No tolera heladas ni suelo encharcado; vigilar ataque de gorgojo.",
      },
      fr: {
        name: "Patate douce",
        category: "Tubercule résistant à la sécheresse",
        pestBreakBenefit: "Couverture rampante efficace contre l'érosion ; très économe en eau.",
        tradeOff: "Sensible au gel et aux sols détrempés ; surveiller les charançons.",
      },
      pt: {
        name: "Batata-doce",
        category: "Tubérculo rústico de alta resiliência",
        pestBreakBenefit: "Ramas rasteiras que cobrem o solo e protegem contra o ressecamento.",
        tradeOff: "Não suporta geadas nem solos alagados; controle preventivo de brocas.",
      },
    },
  },
  {
    id: "cassava",
    scientificName: "Manihot esculenta",
    botanicalGroup: "tuber",
    suitableZones: ["tropicalArid", "tropicalHumid"],
    waterRangeMm: [400, 800],
    ecoCropTempC: [14, 22, 32, 40],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.28,
    kcMid: 0.85,
    cycleDays: [240, 360],
    reference: "CIAT · FAO-56 · FAO EcoCrop #1472",
    citations: [
      "International Center for Tropical Agriculture (CIAT) cassava climate guidelines.",
      "FAO EcoCrop Database (Code 1472: T_opt 22–32 °C, T_max 40 °C).",
    ],
    i18n: {
      en: {
        name: "Cassava / Yuca",
        category: "Extreme Drought-Hardy Tuber",
        pestBreakBenefit: "Unmatched survival under dry spells and poor soils; storable in-ground as living reserve.",
        tradeOff: "Long growing season (8–12 months); cannot tolerate any frost (<12 °C).",
      },
      es: {
        name: "Yuca / Mandioca",
        category: "Tubérculo tropical de extrema resistencia a sequía",
        pestBreakBenefit: "Produce en suelos marginales y resiste meses sin lluvia; almacenable en tierra.",
        tradeOff: "Ciclo largo (8–12 meses); requiere calor constante y es sensible a heladas.",
      },
      fr: {
        name: "Manioc",
        category: "Tubercule tropical ultra-résistant",
        pestBreakBenefit: "Tolère les sécheresses sévères et les sols pauvres ; réserve vivrière sur pied.",
        tradeOff: "Cycle végétatif long (8–12 mois) ; intolérant au froid (<14 °C).",
      },
      pt: {
        name: "Mandioca / Macaxeira",
        category: "Tubérculo tropical ultra-resistente",
        pestBreakBenefit: "Resistência imbatível à estiagem e adaptação a solos de baixa fertilidade.",
        tradeOff: "Ciclo de 8 a 12 meses; requer temperaturas quentes e não tolera geadas.",
      },
    },
  },

  // --- LEGUMINOSAS / FIJADORAS DE NITRÓGENO ---
  {
    id: "cowpea",
    scientificName: "Vigna unguiculata",
    botanicalGroup: "legume",
    suitableZones: ["tropicalArid", "tropicalHumid"],
    waterRangeMm: [300, 600],
    ecoCropTempC: [10, 20, 35, 42],
    bnfKgNHa: [40, 100],
    rusleCFactor: 0.24,
    kcMid: 1.05,
    cycleDays: [70, 100],
    reference: "Ehlers & Hall (1997) · Herridge et al. (2008) · FAO EcoCrop #2153",
    citations: [
      "Ehlers, J. D. & Hall, A. E. (1997). Field Crops Research 53, 187–204.",
      "Herridge, D. F. et al. (2008). Plant and Soil 311, 1–18 (BNF 40–100 kg N/ha).",
    ],
    i18n: {
      en: {
        name: "Cowpea",
        category: "Heat-hardy Nitrogen Fixer",
        pestBreakBenefit: "Fixes 40–100 kg N/ha; suppresses weeds with quick canopy closure.",
        tradeOff: "Sensitive to frost (<10 °C); continuous heavy rains encourage foliar blight.",
      },
      es: {
        name: "Caupí (Frijol de ojo negro)",
        category: "Leguminosa tolerante al calor y sequía",
        pestBreakBenefit: "Fija 40–100 kg N/ha gratis; cubre el suelo rápido contra malezas.",
        tradeOff: "No tolera heladas (<10 °C); el exceso prolongado de lluvia favorece hongos.",
      },
      fr: {
        name: "Niébé",
        category: "Légumineuse fixatrice tolérante à la chaleur",
        pestBreakBenefit: "Fixe 40 à 100 kg N/ha et étouffe rapidement les mauvaises herbes.",
        tradeOff: "Sensible au froid (<10 °C) et aux excès d'eau prolongés.",
      },
      pt: {
        name: "Feijão-caupi (Feijão-fradinho)",
        category: "Leguminosa fixadora de nitrogênio e calor",
        pestBreakBenefit: "Fixa 40–100 kg N/ha e protege o solo com crescimento rápido.",
        tradeOff: "Sensível ao frio (<10 °C); excesso de chuva causa problemas fúngicos.",
      },
    },
  },
  {
    id: "legume-bean",
    scientificName: "Phaseolus vulgaris",
    botanicalGroup: "legume",
    suitableZones: ["tropicalHumid", "temperate", "highland"],
    waterRangeMm: [350, 500],
    ecoCropTempC: [10, 16, 26, 32],
    bnfKgNHa: [30, 80],
    rusleCFactor: 0.28,
    kcMid: 1.15,
    cycleDays: [75, 105],
    reference: "CIAT · FAO-56 · FAO EcoCrop #1688",
    citations: [
      "CIAT common bean adaptation metrics.",
      "Allen, R. G. et al. (1998). FAO-56 (Dry Beans Kc_mid = 1.15).",
    ],
    i18n: {
      en: {
        name: "Common Dry Bean",
        category: "High-protein Short Cycle Legume",
        pestBreakBenefit: "Short 75–100 day cycle fits easily into rotation; enriches topsoil nitrogen.",
        tradeOff: "Vulnerable to high temperatures (>30 °C) during flowering; low frost tolerance.",
      },
      es: {
        name: "Frijol Común / Poroto / Alubia",
        category: "Leguminosa proteica de ciclo corto",
        pestBreakBenefit: "Ciclo rápido (75–100 días) que deja nitrógeno en el suelo para el siguiente cultivo.",
        tradeOff: "El calor excesivo (>30 °C) en floración aborta vainas; no soporta heladas.",
      },
      fr: {
        name: "Haricot commun",
        category: "Légumineuse protéique à cycle court",
        pestBreakBenefit: "Cycle rapide (75–100 jours) libérant de l'azote pour la culture suivante.",
        tradeOff: "Chaleur excessive (>30 °C) nuisible à la floraison ; craint le gel.",
      },
      pt: {
        name: "Feijão-comum",
        category: "Leguminosa de ciclo curto e alta proteína",
        pestBreakBenefit: "Ciclo ágil (75–100 dias) que adiciona nitrogênio biológico ao solo.",
        tradeOff: "Sensível a calor forte (>30 °C) na floração e a geadas.",
      },
    },
  },
  {
    id: "chickpea",
    scientificName: "Cicer arietinum",
    botanicalGroup: "legume",
    suitableZones: ["tropicalArid", "temperate", "highland"],
    waterRangeMm: [300, 450],
    ecoCropTempC: [7, 14, 26, 32],
    bnfKgNHa: [40, 90],
    rusleCFactor: 0.26,
    kcMid: 1.00,
    cycleDays: [90, 120],
    reference: "ICRISAT · FAO-56 · FAO EcoCrop #492",
    citations: [
      "ICRISAT chickpea drought-tolerance research.",
      "FAO EcoCrop Database (Code 492: T_opt 14–26 °C).",
    ],
    i18n: {
      en: {
        name: "Chickpea",
        category: "Cool-season Drought Legume",
        pestBreakBenefit: "Deep taproot extracts residual moisture; highly profitable protein crop.",
        tradeOff: "High humidity during flowering causes ascochyta blight; dislikes soggy clay.",
      },
      es: {
        name: "Garbanzo",
        category: "Leguminosa de secano y clima fresco",
        pestBreakBenefit: "Raíz profunda que aprovecha humedad residual; excelente valor en grano.",
        tradeOff: "Humedad alta o lluvias en floración provocan rabia (Ascochyta); detesta encharcamiento.",
      },
      fr: {
        name: "Pois chiche",
        category: "Légumineuse de saison fraîche économe",
        pestBreakBenefit: "Enracinement profond valorisant l'eau résiduelle du sol.",
        tradeOff: "Humidité excessive favorisant l'anthracnose ; craint l'asphyxie racinaire.",
      },
      pt: {
        name: "Grão-de-bico",
        category: "Leguminosa de clima ameno e grão nobre",
        pestBreakBenefit: "Raiz pivotante profunda que aproveita a umidade residual do solo.",
        tradeOff: "Excesso de umidade na floração causa doenças; solo encharcado apodrece raiz.",
      },
    },
  },
  {
    id: "lentil",
    scientificName: "Lens culinaris",
    botanicalGroup: "legume",
    suitableZones: ["temperate", "highland", "tropicalArid"],
    waterRangeMm: [250, 400],
    ecoCropTempC: [6, 14, 24, 30],
    bnfKgNHa: [35, 75],
    rusleCFactor: 0.25,
    kcMid: 1.00,
    cycleDays: [80, 110],
    reference: "ICARDA · FAO-56 · FAO EcoCrop #1405",
    citations: [
      "ICARDA lentil dryland improvement program.",
      "FAO EcoCrop Database (Code 1405: T_opt 14–24 °C).",
    ],
    i18n: {
      en: {
        name: "Lentil",
        category: "Ultra-low Water Cool Legume",
        pestBreakBenefit: "Very low water demand (250–400 mm); enriches soil and commands strong market prices.",
        tradeOff: "Low plant stature makes weed management and manual harvest challenging.",
      },
      es: {
        name: "Lenteja",
        category: "Leguminosa de muy bajo consumo hídrico",
        pestBreakBenefit: "Produce con solo 250–400 mm de agua; abona la tierra y cotiza bien en mercado.",
        tradeOff: "Planta de bajo porte; requiere cuidado contra malezas en estadios iniciales.",
      },
      fr: {
        name: "Lentille",
        category: "Légumineuse très sobre en eau",
        pestBreakBenefit: "Très sobre en eau (250–400 mm) ; enrichit la rotation en azote biologique.",
        tradeOff: "Port bas rendant le désherbage et la récolte délicats.",
      },
      pt: {
        name: "Lentilha",
        category: "Leguminosa de baixíssimo consumo de água",
        pestBreakBenefit: "Desenvolve-se com pouca chuva (250–400 mm); fixa nitrogênio no solo.",
        tradeOff: "Porte pequeno exigente em controle inicial de plantas invasoras.",
      },
    },
  },
  {
    id: "faba-bean",
    scientificName: "Vicia faba",
    botanicalGroup: "legume",
    suitableZones: ["highland", "temperate"],
    waterRangeMm: [400, 650],
    ecoCropTempC: [4, 12, 20, 26],
    bnfKgNHa: [80, 160],
    rusleCFactor: 0.22,
    kcMid: 1.15,
    cycleDays: [110, 160],
    reference: "Jensen et al. (2010) · FAO EcoCrop #2148",
    citations: [
      "Jensen, E. S. et al. (2010). Faba bean in crop rotations. Field Crops Research 115, 203–216.",
      "FAO EcoCrop Database (Code 2148: T_opt 12–20 °C, BNF up to 160 kg N/ha).",
    ],
    i18n: {
      en: {
        name: "Faba Bean / Broad Bean",
        category: "Champion High-Altitude Nitrogen Fixer",
        pestBreakBenefit: "Fixes huge nitrogen amounts (80–160 kg N/ha); excellent cool mountain adaptation.",
        tradeOff: "Intolerant of heat (>26 °C) which causes flower sterility; chocolate spot in fog.",
      },
      es: {
        name: "Haba",
        category: "Leguminosa andina y templada gran fijadora",
        pestBreakBenefit: "Fija entre 80 y 160 kg N/ha; campeona de fertilidad en valles y altura.",
        tradeOff: "No tolera golpes de calor (>26 °C); sensible a mancha de chocolate con humedad alta.",
      },
      fr: {
        name: "Fève",
        category: "Super-fixatrice d'azote d'altitude",
        pestBreakBenefit: "Fixation d'azote record (80–160 kg N/ha) ; excellente rusticité au froid.",
        tradeOff: "Très sensible aux chaleurs (>26 °C) ; maladie des taches chocolat par temps humide.",
      },
      pt: {
        name: "Fava",
        category: "Leguminosa de alta altitude e super-fixadora",
        pestBreakBenefit: "Fixação biológica de até 160 kg N/ha; enriquece solos de montanha.",
        tradeOff: "Sofre com calor (>26 °C); sensível a mancha-chocolate em períodos chuvosos.",
      },
    },
  },
  {
    id: "alfalfa",
    scientificName: "Medicago sativa",
    botanicalGroup: "legume",
    suitableZones: ["tropicalArid", "temperate", "highland"],
    waterRangeMm: [500, 900],
    ecoCropTempC: [5, 15, 27, 35],
    bnfKgNHa: [120, 250],
    rusleCFactor: 0.08,
    kcMid: 1.15,
    cycleDays: [120, 360],
    reference: "Putnam et al. (2007) · FAO-56 · FAO EcoCrop #1488",
    citations: [
      "Putnam, D. H. et al. (2007). Alfalfa water management and nitrogen fixation.",
      "FAO EcoCrop Database (Code 1488: T_opt 15–27 °C, BNF up to 250 kg N/ha).",
    ],
    i18n: {
      en: {
        name: "Alfalfa",
        category: "Perennial Queen of Forages",
        pestBreakBenefit: "Perennial deep roots (>2m) break plow pan, fix up to 250 kg N/ha and yield repeated cuts.",
        tradeOff: "Requires well-drained, neutral/alkaline soil (pH > 6.5); high seasonal water volume.",
      },
      es: {
        name: "Alfalfa",
        category: "Forrajera perenne reina de la fertilidad",
        pestBreakBenefit: "Raíces a más de 2 m que rompen piso de arado; fija hasta 250 kg N/ha y da múltiples cortes.",
        tradeOff: "Exige suelo bien drenado (no ácido, pH > 6.5); demanda agua continua por ser perenne.",
      },
      fr: {
        name: "Luzerne",
        category: "Reine des fourrages et régénératrice",
        pestBreakBenefit: "Enracinement à plus de 2 m régénérant la structure du sol ; fixe jusqu'à 250 kg N/ha.",
        tradeOff: "Exige un sol bien drainé et non acide ; consommation d'eau annuelle globale élevée.",
      },
      pt: {
        name: "Alfafa",
        category: "Forrageira perene de máxima proteína",
        pestBreakBenefit: "Raízes profundas que quebram camadas duras e fixam até 250 kg N/ha.",
        tradeOff: "Exige solos férteis e neutros (pH > 6,5); não tolera solos encharcados.",
      },
    },
  },
  {
    id: "cover-oats-vetch",
    scientificName: "Avena sativa + Vicia villosa",
    botanicalGroup: "cover",
    suitableZones: ["highland", "temperate", "tropicalHumid"],
    waterRangeMm: [250, 450],
    ecoCropTempC: [2, 12, 22, 28],
    bnfKgNHa: [50, 110],
    rusleCFactor: 0.12,
    kcMid: 1.05,
    cycleDays: [60, 90],
    reference: "Clark (2008) SARE · USDA RUSLE Handbook #703",
    citations: [
      "Clark, A. (2008). Managing Cover Crops Profitably (SARE Handbook No. 9).",
    ],
    i18n: {
      en: {
        name: "Oat + Hairy Vetch Cover Mix",
        category: "Erosion Armor & Biomass Cover",
        pestBreakBenefit: "Grass + legume synergy fixes nitrogen while carbon-rich oats armor soil surface.",
        tradeOff: "Green manure purpose: generated for soil health and livestock rather than commercial grain.",
      },
      es: {
        name: "Abono Verde: Avena + Vicia",
        category: "Cobertura protectora y enriquecedora",
        pestBreakBenefit: "La avena aporta fibra y frena erosión mientras la vicia inyecta nitrógeno biológico.",
        tradeOff: "Objetivo de regeneración de suelo o forraje; no se cosecha como grano comercial.",
      },
      fr: {
        name: "Mélange Avoine + Vesce",
        category: "Couvert végétal anti-érosion",
        pestBreakBenefit: "Synergie graminée-légumineuse blindant le sol contre le ruissellement.",
        tradeOff: "Vocation d'engrais vert ou fourrage plutôt que de graine marchande.",
      },
      pt: {
        name: "Adubação Verde: Aveia + Ervilhaca",
        category: "Cobertura do solo e fixação biológica",
        pestBreakBenefit: "A aveia fornece palhada duradoura e a ervilhaca injeta nitrogênio no solo.",
        tradeOff: "Destinado à recuperação do solo ou forragem, não a grão comercial.",
      },
    },
  },

  // --- GRANOS Y CEREALES ---
  {
    id: "maize",
    scientificName: "Zea mays",
    botanicalGroup: "cereal",
    suitableZones: ["tropicalHumid", "temperate", "tropicalArid"],
    waterRangeMm: [500, 800],
    ecoCropTempC: [10, 18, 30, 38],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.38,
    kcMid: 1.20,
    cycleDays: [100, 140],
    reference: "FAO-56 · FAO EcoCrop #2161",
    citations: [
      "Allen, R. G. et al. (1998). FAO-56 Paper (Maize Kc_mid = 1.20).",
      "FAO EcoCrop Database (Code 2161: T_opt 18–30 °C).",
    ],
    i18n: {
      en: {
        name: "Maize / Corn",
        category: "High-yield Staple Grain",
        pestBreakBenefit: "Primary staple with massive local food and animal feed market liquidity.",
        tradeOff: "Heavy nitrogen feeder; extremely sensitive to water stress during 2-week silking window.",
      },
      es: {
        name: "Maíz",
        category: "Cereal rey de consumo y forraje",
        pestBreakBenefit: "Máxima demanda de mercado para grano, choclo y alimento de ganado.",
        tradeOff: "Gran consumidor de nitrógeno; muy sensible a falta de agua en espigado/floración.",
      },
      fr: {
        name: "Maïs",
        category: "Céréale majeure à haut potentiel",
        pestBreakBenefit: "Débouchés massifs en alimentation humaine et animale.",
        tradeOff: "Gourmand en azote et en eau ; très vulnérable au stress hydrique à la floraison.",
      },
      pt: {
        name: "Milho",
        category: "Cereal básico de alta produtividade",
        pestBreakBenefit: "Consumo e comercialização garantidos tanto para grão quanto silagem.",
        tradeOff: "Exige muito nitrogênio e água; quebra de safra se faltar chuva no pendoamento.",
      },
    },
  },
  {
    id: "sorghum",
    scientificName: "Sorghum bicolor",
    botanicalGroup: "cereal",
    suitableZones: ["tropicalArid", "tropicalHumid", "temperate"],
    waterRangeMm: [400, 650],
    ecoCropTempC: [12, 20, 34, 42],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.34,
    kcMid: 1.05,
    cycleDays: [90, 130],
    reference: "FAO-56 · FAO EcoCrop #2012",
    citations: [
      "Allen, R. G. et al. (1998). FAO-56 Paper (Sorghum Kc_mid = 1.00–1.05).",
      "FAO EcoCrop Database (Code 2012: T_opt 20–34 °C, T_max 42 °C).",
    ],
    i18n: {
      en: {
        name: "Sorghum",
        category: "Drought & Heat Armor Cereal",
        pestBreakBenefit: "Tolerates high temperatures and temporary drought; roots break nematode cycles.",
        tradeOff: "Needs warm seedbed (>15 °C) to emerge; lower per-ton price than maize.",
      },
      es: {
        name: "Sorgo",
        category: "Cereal rústico tolerante a calor y sequía",
        pestBreakBenefit: "Soporta altas temperaturas donde el maíz falla; corta nematodos del suelo.",
        tradeOff: "Exige suelo cálido (>15 °C) para germinar; precio por tonelada algo menor al maíz.",
      },
      fr: {
        name: "Sorgho",
        category: "Céréale rustique tolérante à la sécheresse",
        pestBreakBenefit: "Remplace avantageusement le maïs en zone aride ; coupe les cycles parasitaires.",
        tradeOff: "Exige une terre réchauffée pour la levée (>15 °C) ; cours inférieur au maïs.",
      },
      pt: {
        name: "Sorgo",
        category: "Cereal resistente à seca e calor",
        pestBreakBenefit: "Excelente alternativa ao milho em períodos secos; reduz nematoides no solo.",
        tradeOff: "Precisa de solo quente (>15 °C) para germinar; cotação geralmente inferior ao milho.",
      },
    },
  },
  {
    id: "pearl-millet",
    scientificName: "Pennisetum glaucum",
    botanicalGroup: "cereal",
    suitableZones: ["tropicalArid", "tropicalHumid"],
    waterRangeMm: [300, 500],
    ecoCropTempC: [12, 25, 35, 44],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.30,
    kcMid: 1.00,
    cycleDays: [65, 95],
    reference: "Vadez et al. (2012) · FAO-56 · FAO EcoCrop #1636",
    citations: [
      "Vadez, V. et al. (2012). Phenotyping pearl millet for adaptation to drought.",
    ],
    i18n: {
      en: {
        name: "Pearl Millet",
        category: "Ultra-Drought C4 Champion",
        pestBreakBenefit: "Fast 70–90 day cycle; prospers in dry, sandy soils with blistering heat (>40 °C).",
        tradeOff: "Small seed requires shallow planting; intolerant of waterlogged soils.",
      },
      es: {
        name: "Mijo Perla",
        category: "Cereal C4 ultra-resistente a calor extremo",
        pestBreakBenefit: "Ciclo rápido (70–90 días); cosecha grano en arenas secas con calor de >40 °C.",
        tradeOff: "Semilla pequeña que exige siembra superficial; no tolera encharcamientos.",
      },
      fr: {
        name: "Mil perlé",
        category: "Céréale C4 championne de la sécheresse",
        pestBreakBenefit: "Cycle ultra-court (70–90 jours) produisant sur sols sableux et brûlants.",
        tradeOff: "Semence fine nécessitant un lit de semence soigné ; craint l'asphyxie d'eau.",
      },
      pt: {
        name: "Milheto",
        category: "Cereal C4 ultra-tolerante à seca",
        pestBreakBenefit: "Ciclo veloz (70–90 dias); produz em areias quentes onde nenhum cereal vinga.",
        tradeOff: "Semente miúda de semeadura rasa; não aceita solo encharcado.",
      },
    },
  },
  {
    id: "wheat",
    scientificName: "Triticum aestivum",
    botanicalGroup: "cereal",
    suitableZones: ["temperate", "highland"],
    waterRangeMm: [450, 650],
    ecoCropTempC: [4, 15, 23, 30],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.36,
    kcMid: 1.15,
    cycleDays: [110, 150],
    reference: "CIMMYT · FAO-56 · FAO EcoCrop #2113",
    citations: [
      "CIMMYT wheat agronomy handbook.",
      "Allen, R. G. et al. (1998). FAO-56 (Winter/Spring Wheat Kc_mid = 1.15).",
    ],
    i18n: {
      en: {
        name: "Wheat",
        category: "Temperate Commercial Grain",
        pestBreakBenefit: "Global staple with universal liquidity and established grain storage infrastructure.",
        tradeOff: "Terminal heat stress (>28 °C during grain fill) drastically shrivels kernel weight.",
      },
      es: {
        name: "Trigo",
        category: "Cereal templado y de valles comerciales",
        pestBreakBenefit: "Demanda universal y comercialización inmediata con silos y molinos.",
        tradeOff: "El calor en el llenado de grano (>28 °C) encoge el grano; sensible a roya foliar.",
      },
      fr: {
        name: "Blé",
        category: "Céréale commerciale majeure",
        pestBreakBenefit: "Commercialisation garantie et débouchés industriels mondiaux.",
        tradeOff: "Échaudage thermique redoutable si les températures dépassent 28 °C au remplissage.",
      },
      pt: {
        name: "Trigo",
        category: "Cereal nobre de inverno e clima temperado",
        pestBreakBenefit: "Liquidez comercial mundial e infraestrutura de moagem estabelecida.",
        tradeOff: "Calor acima de 28 °C no enchimento de grãos reduz drasticamente a produtividade.",
      },
    },
  },
  {
    id: "barley",
    scientificName: "Hordeum vulgare",
    botanicalGroup: "cereal",
    suitableZones: ["highland", "temperate", "tropicalArid"],
    waterRangeMm: [300, 450],
    ecoCropTempC: [3, 12, 22, 28],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.32,
    kcMid: 1.10,
    cycleDays: [80, 115],
    reference: "ICARDA · FAO-56 · FAO EcoCrop #1245",
    citations: [
      "ICARDA barley salinity and drought tolerance programs.",
      "FAO EcoCrop Database (Code 1245: T_opt 12–22 °C).",
    ],
    i18n: {
      en: {
        name: "Barley",
        category: "Salinity & Cold Tolerant Cereal",
        pestBreakBenefit: "Superior salt and frost tolerance; earlier harvest window than wheat.",
        tradeOff: "Susceptible to lodging if over-fertilized with nitrogen; lower baking price than wheat.",
      },
      es: {
        name: "Cebada",
        category: "Cereal rústico tolerante a salinidad y frío",
        pestBreakBenefit: "Tolera salinidad y frío mejor que el trigo; se cosecha varias semanas antes.",
        tradeOff: "Riesgo de encamado con exceso de nitrógeno; cotización sujeta a calidad maltera.",
      },
      fr: {
        name: "Orge",
        category: "Céréale rustique tolérante à la salinité",
        pestBreakBenefit: "Excellente tolérance au gel et aux sols salins ; cycle plus précoce que le blé.",
        tradeOff: "Risque de verse en cas d'excès d'azote ; exigences précises pour le malt.",
      },
      pt: {
        name: "Cevada",
        category: "Cereal precoce e tolerante a salinidade",
        pestBreakBenefit: "Tolera solos salinos e frio muito melhor que o trigo; colheita mais antecipada.",
        tradeOff: "Acama fácil com excesso de adubo; valorização atrelada à qualidade cervejeira.",
      },
    },
  },

  // --- OLEAGINOSAS Y CULTIVOS COMERCIALES ---
  {
    id: "sunflower",
    scientificName: "Helianthus annuus",
    botanicalGroup: "oilseed",
    suitableZones: ["temperate", "tropicalArid", "tropicalHumid"],
    waterRangeMm: [400, 600],
    ecoCropTempC: [8, 18, 28, 36],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.32,
    kcMid: 1.05,
    cycleDays: [90, 125],
    reference: "FAO-56 · FAO EcoCrop #1218",
    citations: [
      "Allen, R. G. et al. (1998). FAO-56 (Sunflower Kc_mid = 1.05).",
      "FAO EcoCrop Database (Code 1218: T_opt 18–28 °C).",
    ],
    i18n: {
      en: {
        name: "Sunflower",
        category: "Deep-rooting Oilseed Crop",
        pestBreakBenefit: "Aggressive taproot (>1.8m) mines deep subsoil water and residual nutrients.",
        tradeOff: "Bird damage at seed ripening; leaves low residue cover after harvest.",
      },
      es: {
        name: "Girasol",
        category: "Oleaginosa de raíz profunda exploradora",
        pestBreakBenefit: "Raíz de hasta 1.8 m que extrae agua profunda que otros cultivos no alcanzan.",
        tradeOff: "Ataque de aves en maduración; deja poca cobertura de rastrojo en el suelo.",
      },
      fr: {
        name: "Tournesol",
        category: "Oléagineux à fort enracinement",
        pestBreakBenefit: "Système racinaire puissant (>1,8 m) pompant l'eau et l'azote en profondeur.",
        tradeOff: "Dégâts d'oiseaux à maturité ; laisse peu de résidus après récolte.",
      },
      pt: {
        name: "Girassol",
        category: "Oleaginosa de raiz profunda e alta extração",
        pestBreakBenefit: "Raiz vigorosa que busca água no subsolo profundo onde o milho não chega.",
        tradeOff: "Ataque de pássaros na colheita; palhada fina de rápida decomposição.",
      },
    },
  },
  {
    id: "sesame",
    scientificName: "Sesamum indicum",
    botanicalGroup: "oilseed",
    suitableZones: ["tropicalArid", "tropicalHumid"],
    waterRangeMm: [300, 500],
    ecoCropTempC: [14, 24, 35, 42],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.30,
    kcMid: 0.95,
    cycleDays: [80, 115],
    reference: "FAO EcoCrop #1988 · Langham (2007)",
    citations: [
      "Langham, D. R. (2007). Phenology of sesame. Issues in new crops and new uses.",
      "FAO EcoCrop Database (Code 1988: T_opt 24–35 °C).",
    ],
    i18n: {
      en: {
        name: "Sesame",
        category: "High-value Arid Oilseed",
        pestBreakBenefit: "Thrives in baking heat and low moisture where other oilseeds fail; premium seed prices.",
        tradeOff: "Very sensitive to standing water and poor drainage; shattering losses during dry harvest.",
      },
      es: {
        name: "Ajonjolí / Sésamo",
        category: "Oleaginosa rústica de alto valor comercial",
        pestBreakBenefit: "Prospera con calor intenso y poca agua; excelente precio de venta por kilo.",
        tradeOff: "No tolera encharcamientos (se asfixia en 24h); cuidado con apertura de cápsulas.",
      },
      fr: {
        name: "Sésame",
        category: "Oléagineux aride à haute valorisation",
        pestBreakBenefit: "Tolère les fortes chaleurs et la sécheresse ; graines très recherchées.",
        tradeOff: "Asphyxie racinaire immédiate en sol gorgé d'eau ; égrenage à surveiller.",
      },
      pt: {
        name: "Gergelim",
        category: "Oleaginosa de alto valor para regiões secas",
        pestBreakBenefit: "Produz grãos ricos em óleo sob calor intenso; preço elevado na venda.",
        tradeOff: "Intolerante a solos encharcados; perda de grãos se passar do ponto de colheita.",
      },
    },
  },
  {
    id: "peanut",
    scientificName: "Arachis hypogaea",
    botanicalGroup: "oilseed",
    suitableZones: ["tropicalArid", "tropicalHumid", "temperate"],
    waterRangeMm: [450, 650],
    ecoCropTempC: [12, 22, 30, 38],
    bnfKgNHa: [40, 90],
    rusleCFactor: 0.22,
    kcMid: 1.05,
    cycleDays: [100, 140],
    reference: "ICRISAT · FAO-56 · FAO EcoCrop #263",
    citations: [
      "ICRISAT groundnut breeding and production guidelines.",
      "FAO EcoCrop Database (Code 263: T_opt 22–30 °C).",
    ],
    i18n: {
      en: {
        name: "Peanut / Groundnut",
        category: "Dual Oilseed & Legume Fixer",
        pestBreakBenefit: "Dual income: edible oilseed and biological nitrogen fixation (40–90 kg N/ha).",
        tradeOff: "Requires loose sandy/loam soil for pegging; aflatoxin monitoring required at harvest.",
      },
      es: {
        name: "Maní / Cacahuate",
        category: "Oleaginosa fijadora de doble propósito",
        pestBreakBenefit: "Doble ganancia: cosecha granos de alto valor y fija 40–90 kg N/ha en el suelo.",
        tradeOff: "Exige suelo suelto y arenoso para el clavado; secado estricto contra aflatoxinas.",
      },
      fr: {
        name: "Arachide",
        category: "Oléagineuse fixatrice d'azote",
        pestBreakBenefit: "Double atout : graines riches et fixation symbiotique de 40 à 90 kg N/ha.",
        tradeOff: "Nécessite une terre meuble et légère pour l'enterrage des gousses.",
      },
      pt: {
        name: "Amendoim",
        category: "Oleaginosa leguminosa de dupla aptidão",
        pestBreakBenefit: "Colheita de alta renda e fixação biológica de 40 a 90 kg N/ha.",
        tradeOff: "Exige solo arenoso/leve para penetração das vagens; secagem rápida pós-arranquio.",
      },
    },
  },

  // --- GRANOS ANDINOS / SUPERFOODS ---
  {
    id: "quinoa",
    scientificName: "Chenopodium quinoa",
    botanicalGroup: "pseudocereal",
    suitableZones: ["highland", "tropicalArid", "temperate"],
    waterRangeMm: [250, 450],
    ecoCropTempC: [-2, 12, 20, 32],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.28,
    kcMid: 0.95,
    cycleDays: [110, 160],
    reference: "Jacobsen et al. (2003) · FAO EcoCrop #4432",
    citations: [
      "Jacobsen, S. E. et al. (2003). The global potential for quinoa. Food Reviews Int. 19, 167–177.",
      "FAO EcoCrop Database (Code 4432: Frost tolerance to -2 °C).",
    ],
    i18n: {
      en: {
        name: "Quinoa",
        category: "Superfood Grain of the Andes",
        pestBreakBenefit: "Tolerates salinity, frost down to -2 °C and drought; premium global export prices.",
        tradeOff: "Requires saponin washing/dehulling; high temperatures (>34 °C) cause pollen sterility.",
      },
      es: {
        name: "Quinua / Quínoa",
        category: "Superalimento andino de alta resiliencia",
        pestBreakBenefit: "Tolera heladas ligeras (-2 °C), suelos salinos y sequía; cotización destacada.",
        tradeOff: "Requiere escarificado/lavado de saponina; calor extremo (>34 °C) aborta polen.",
      },
      fr: {
        name: "Quinoa",
        category: "Super-aliment andin haute résilience",
        pestBreakBenefit: "Résiste au gel (-2 °C), aux sols salés et à la sécheresse ; haute valeur marchande.",
        tradeOff: "Exige l'élimination des saponines ; la canicule (>34 °C) stérilise le pollen.",
      },
      pt: {
        name: "Quinua",
        category: "Superalimento andino de alta cotação",
        pestBreakBenefit: "Tolera geadas leves (-2 °C), salinidade e estiagem; excelente preço de exportação.",
        tradeOff: "Exige lavagem/beneficiamento de saponinas; calor acima de 34 °C queima flores.",
      },
    },
  },
  {
    id: "amaranth",
    scientificName: "Amaranthus cruentus",
    botanicalGroup: "pseudocereal",
    suitableZones: ["tropicalArid", "tropicalHumid", "temperate", "highland"],
    waterRangeMm: [300, 500],
    ecoCropTempC: [10, 20, 32, 40],
    bnfKgNHa: [0, 0],
    rusleCFactor: 0.25,
    kcMid: 0.90,
    cycleDays: [90, 120],
    reference: "FAO EcoCrop #189 · Rastogi & Shukla (2013)",
    citations: [
      "Rastogi, A. & Shukla, S. (2013). Amaranth: a new millennium crop of nutritional security.",
      "FAO EcoCrop Database (Code 189: T_opt 20–32 °C).",
    ],
    i18n: {
      en: {
        name: "Amaranth / Kiwicha",
        category: "C4 Resilient Nutrient Dynamo",
        pestBreakBenefit: "C4 photosynthesis thrives under heat and water scarcity; grains packed with lysine protein.",
        tradeOff: "Tiny seeds require very shallow, clean seedbed; lodging in excessive nitrogen.",
      },
      es: {
        name: "Amaranto / Kiwicha",
        category: "Grano C4 hipernutritivo y resistente",
        pestBreakBenefit: "Fotosíntesis C4 que rinde con calor y sequía; grano completo rico en lisina.",
        tradeOff: "Semilla diminuta que exige cama de siembra impecable; cuidado con encamado.",
      },
      fr: {
        name: "Amarante",
        category: "Graine C4 à haute valeur protéique",
        pestBreakBenefit: "Photosynthèse C4 ultra-efficace sous chaleur et sécheresse ; haute teneur en lysine.",
        tradeOff: "Semences très fines nécessitant un semis très superficiel et soigné.",
      },
      pt: {
        name: "Amaranto",
        category: "Grão nobre C4 e supernutritivo",
        pestBreakBenefit: "Fotossíntese C4 que tolera calor e seca severa; grão riquíssimo em aminoácidos.",
        tradeOff: "Semente miúda que exige solo bem nivelado; sensível ao excesso de nitrogênio.",
      },
    },
  },
];

function ecoCropTempSuitability(
  tAvg: number,
  tMin: number,
  tMax: number,
  eco: [number, number, number, number]
): number {
  const [tAbsMin, tOptMin, tOptMax, tAbsMax] = eco;

  if (tMin < tAbsMin - 3 || tMax > tAbsMax + 4) return 5;
  if (tMin < tAbsMin || tMax > tAbsMax) return 25;

  if (tAvg >= tOptMin && tAvg <= tOptMax) return 96;

  if (tAvg < tOptMin) {
    const span = Math.max(1, tOptMin - tAbsMin);
    const frac = Math.max(0, (tAvg - tAbsMin) / span);
    return Math.round(35 + frac * 55);
  }

  const span = Math.max(1, tAbsMax - tOptMax);
  const frac = Math.max(0, (tAbsMax - tAvg) / span);
  return Math.round(35 + frac * 55);
}

function getRotationBonus(
  currentCropType: CurrentCropType,
  candidateGroup: BotanicalGroup
): number {
  if (currentCropType === "perennial") {
    if (candidateGroup === "cover" || candidateGroup === "legume") return 8;
    if (candidateGroup === "cereal") return -18;
    return -6;
  }
  if (currentCropType === "cereal") {
    if (candidateGroup === "legume" || candidateGroup === "cover") return 8;
    if (
      candidateGroup === "tuber" ||
      candidateGroup === "horticulture" ||
      candidateGroup === "oilseed"
    )
      return 6;
    if (candidateGroup === "pseudocereal") return 4;
    return -8;
  }
  if (currentCropType === "tuber") {
    if (
      candidateGroup === "cover" ||
      candidateGroup === "pseudocereal" ||
      candidateGroup === "cereal"
    )
      return 6;
    if (candidateGroup === "legume") return 6;
    if (candidateGroup === "horticulture") return 2;
    return -4;
  }
  // legume
  if (
    candidateGroup === "cereal" ||
    candidateGroup === "pseudocereal" ||
    candidateGroup === "horticulture" ||
    candidateGroup === "oilseed"
  )
    return 6;
  if (candidateGroup === "cover") return 4;
  return -8;
}

function buildReason(
  crop: CropOption,
  climateFit: number,
  tAvg: number,
  slope: number,
  currentCropType: CurrentCropType,
  lang: Lang
): string {
  const parts: string[] = [];
  const midW = (crop.waterRangeMm[0] + crop.waterRangeMm[1]) / 2;
  const bnf = crop.bnfKgNHa;
  const cFactor = crop.rusleCFactor;
  const group = crop.botanicalGroup;
  const waterRange = crop.waterRangeMm;

  if (lang === "en") {
    if (currentCropType === "perennial" && (group === "cover" || group === "legume")) {
      parts.push("living orchard alley cover without uprooting perennials");
    }
    if (midW <= 450) parts.push(`low water demand (${waterRange[0]}–${waterRange[1]} mm)`);
    if (bnf[1] > 0) parts.push(`fixes ${bnf[0]}–${bnf[1]} kg N/ha`);
    if (climateFit >= 85) parts.push(`optimal thermal fit for ~${tAvg} °C`);
    if (slope >= 8 && cFactor <= 0.25) parts.push(`low erosion factor (C=${cFactor})`);
    return parts.length > 0 ? parts.join("; ") : "Viable option with standard irrigation.";
  }

  if (lang === "fr") {
    if (currentCropType === "perennial" && (group === "cover" || group === "legume")) {
      parts.push("couvert végétal entre les rangs sans arrachage du verger");
    }
    if (midW <= 450) parts.push(`faible besoin en eau (${waterRange[0]}–${waterRange[1]} mm)`);
    if (bnf[1] > 0) parts.push(`fixe ${bnf[0]}–${bnf[1]} kg N/ha`);
    if (climateFit >= 85) parts.push(`adaptation thermique optimale pour ~${tAvg} °C`);
    if (slope >= 8 && cFactor <= 0.25) parts.push(`bonne protection contre l'érosion (C=${cFactor})`);
    return parts.length > 0 ? parts.join("; ") : "Option viable avec irrigation.";
  }

  if (lang === "pt") {
    if (currentCropType === "perennial" && (group === "cover" || group === "legume")) {
      parts.push("cobertura viva nas entrelinhas sem arrancar o pomar");
    }
    if (midW <= 450) parts.push(`baixo consumo hídrico (${waterRange[0]}–${waterRange[1]} mm)`);
    if (bnf[1] > 0) parts.push(`fixa ${bnf[0]}–${bnf[1]} kg N/ha`);
    if (climateFit >= 85) parts.push(`ótimo para média de ${tAvg} °C`);
    if (slope >= 8 && cFactor <= 0.25) parts.push(`baixo fator de erosão (C=${cFactor})`);
    return parts.length > 0 ? parts.join("; ") : "Opção viável com irrigação de apoio.";
  }

  if (currentCropType === "perennial" && (group === "cover" || group === "legume")) {
    parts.push("cobertura viva entre hileras sin retirar el cultivo permanente");
  }
  if (midW <= 450) parts.push(`bajo consumo hídrico (${waterRange[0]}–${waterRange[1]} mm/ciclo)`);
  if (bnf[1] > 0) parts.push(`fija ${bnf[0]}–${bnf[1]} kg N/ha`);
  if (climateFit >= 85) parts.push(`óptimo para ${tAvg} °C promedio en esta zona`);
  if (slope >= 8 && cFactor <= 0.25) parts.push(`bajo factor de erosión (C=${cFactor})`);
  return parts.length > 0 ? parts.join("; ") : "Opción viable con manejo de riego.";
}

export function evaluateSingleCrop(
  crop: CropOption,
  climate: ClimateMetrics,
  priority: FarmerPriority,
  lang: Lang,
  fallbackSlopePct: number = 2,
  currentCropType: CurrentCropType = "cereal"
): EvaluatedCrop {
  const rain30d = climate.rain30dMm ?? 20;
  const eoDay = climate.eoMmDay ?? 4.5;
  const tAvg = climate.tempAvgC ?? 20;
  const tMin = climate.tempMinC ?? 12;
  const tMax = climate.tempMaxC ?? 26;
  const slope = climate.slopePct ?? fallbackSlopePct ?? 2;

  const monthlyEo = eoDay * 30;
  const waterDeficitRatio = Math.min(
    1.6,
    Math.max(0.3, monthlyEo / Math.max(25, rain30d + 25))
  );

  const midWaterMm = (crop.waterRangeMm[0] + crop.waterRangeMm[1]) / 2;
  const baseWaterScore = ((850 - midWaterMm) / (850 - 250)) * 100;
  const deficitPenalty = waterDeficitRatio > 1.05 && midWaterMm > 500 ? 16 : 0;
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
  const bnfScore = Math.min(100, 35 + (bnfMid / 100) * 65);
  const erosionProtection = Math.max(
    10,
    Math.min(100, Math.round((1 - crop.rusleCFactor) * 105))
  );

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
  const rotationBonus = getRotationBonus(currentCropType, crop.botanicalGroup);
  const matchScore = Math.max(
    15,
    Math.min(
      99,
      Math.round(
        waterSavingScore * w.wWater +
          soilScore * w.wSoil +
          climateFitScore * w.wClimate +
          rotationBonus
      )
    )
  );

  // Determination of Feasibility
  let feasibility: "optimal" | "manageable" | "critical" = "optimal";
  let limitingFactor: string | null = null;

  const [tAbsMin, , , tAbsMax] = crop.ecoCropTempC;
  if (tMin < tAbsMin) {
    feasibility = "critical";
    limitingFactor =
      lang === "es"
        ? `Riesgo de helada o frío limitante (T_mín: ${tMin}°C vs límite: ${tAbsMin}°C)`
        : `Frost or cold stress risk (T_min: ${tMin}°C vs threshold: ${tAbsMin}°C)`;
  } else if (tMax > tAbsMax) {
    feasibility = "critical";
    limitingFactor =
      lang === "es"
        ? `Estrés térmico extremo / aborto de flor (T_máx: ${tMax}°C vs límite: ${tAbsMax}°C)`
        : `Extreme heat stress risk (T_max: ${tMax}°C vs threshold: ${tAbsMax}°C)`;
  } else if (waterDeficitRatio > 1.25 && midWaterMm > 550) {
    feasibility = "manageable";
    limitingFactor =
      lang === "es"
        ? `Déficit hídrico en secano: requiere riego por goteo o auxilio (${crop.waterRangeMm[0]}–${crop.waterRangeMm[1]} mm)`
        : `Rainfed water deficit: requires drip or supplemental irrigation (${crop.waterRangeMm[0]}–${crop.waterRangeMm[1]} mm)`;
  } else if (matchScore < 60 || climateFitScore < 50) {
    feasibility = "manageable";
    limitingFactor =
      lang === "es"
        ? `Ajuste moderado: requiere monitoreo agronómico de suelo y agua`
        : `Moderate fit: requires soil and water agronomic oversight`;
  }

  const feasibilityLabels: Record<
    Lang,
    Record<"optimal" | "manageable" | "critical", string>
  > = {
    en: {
      optimal: "Highly Recommended",
      manageable: "Viable with Irrigation / Care",
      critical: "High Climatic Risk",
    },
    es: {
      optimal: "Altamente Recomendado",
      manageable: "Viable con Riego / Manejo",
      critical: "Alto Riesgo Climático",
    },
    fr: {
      optimal: "Hautement Recommandé",
      manageable: "Viable avec Irrigation / Soin",
      critical: "Risque Climatique Élevé",
    },
    pt: {
      optimal: "Altamente Recomendado",
      manageable: "Viável com Irrigação / Manejo",
      critical: "Alto Risco Climático",
    },
  };

  const txt = crop.i18n[lang] ?? crop.i18n.es;
  const reason = buildReason(
    crop,
    climateFitScore,
    tAvg,
    slope,
    currentCropType,
    lang
  );

  return {
    id: crop.id,
    name: txt.name,
    scientificName: crop.scientificName,
    category: txt.category,
    botanicalGroup: crop.botanicalGroup,
    pestBreakBenefit: txt.pestBreakBenefit,
    tradeOff: txt.tradeOff,
    reference: crop.reference,
    citations: crop.citations,
    matchScore,
    waterSavingScore,
    climateFitScore,
    soilScore,
    reason,
    waterRangeMm: crop.waterRangeMm,
    ecoCropTempC: crop.ecoCropTempC,
    bnfKgNHa: crop.bnfKgNHa,
    kcMid: crop.kcMid,
    cycleDays: crop.cycleDays,
    feasibility,
    feasibilityLabel: feasibilityLabels[lang][feasibility],
    limitingFactor,
  };
}

export function evaluateCropRotations(
  climate: ClimateMetrics,
  zone: AgroZone,
  priority: FarmerPriority,
  lang: Lang,
  fallbackSlopePct?: number,
  currentCropType: CurrentCropType = "cereal",
  filterGroup?: BotanicalGroup | "all"
): EvaluatedCrop[] {
  // First consider crops suitable for zone, but if user explicitly filtered or pool is small, allow full catalog
  const regionalPool = CROP_CATALOG.filter((c) => c.suitableZones.includes(zone));
  const pool = regionalPool.length >= 6 ? regionalPool : CROP_CATALOG;

  const targetList =
    filterGroup && filterGroup !== "all"
      ? pool.filter((c) => c.botanicalGroup === filterGroup)
      : pool;

  const evaluated = (targetList.length > 0 ? targetList : pool).map((crop) =>
    evaluateSingleCrop(
      crop,
      climate,
      priority,
      lang,
      fallbackSlopePct,
      currentCropType
    )
  );

  return evaluated.sort((a, b) => b.matchScore - a.matchScore);
}
