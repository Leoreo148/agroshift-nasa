import type { Lang } from "@/lib/i18n";

export interface FarmPreset {
  id: string;
  lat: number;
  lon: number;
  slopePct: number;
  labels: Record<
    Lang,
    {
      name: string;
      region: string;
      climateTag: string;
      currentCrop: string;
      description: string;
    }
  >;
}

export const FARM_PRESETS: FarmPreset[] = [
  {
    id: "sahel-africa",
    lat: 13.5116,
    lon: 2.1254,
    slopePct: 1.8,
    labels: {
      en: {
        name: "Sahel Semi-Arid",
        region: "Niamey, Niger (West Africa)",
        climateTag: "Hot & erratic rain",
        currentCrop: "Sorghum / Pearl millet",
        description:
          "High heat and short rainy windows where drought-hardy cereals and legumes protect food security.",
      },
      es: {
        name: "Sahel Semiárido",
        region: "Niamey, Níger (África Occidental)",
        climateTag: "Calor fuerte y lluvia irregular",
        currentCrop: "Sorgo / Mijo perla",
        description:
          "Zona cálida con lluvias cortas donde rotar con leguminosas y cereales rústicos asegura cosecha.",
      },
      fr: {
        name: "Sahel Semi-Aride",
        region: "Niamey, Niger (Afrique de l'Ouest)",
        climateTag: "Chaleur et pluies irrégulières",
        currentCrop: "Sorgho / Mil perlé",
        description:
          "Forte chaleur et saisons des pluies courtes où la rotation céréales-légumineuses protège les rendements.",
      },
      pt: {
        name: "Sahel Semiárido",
        region: "Niamey, Níger (África Ocidental)",
        climateTag: "Calor e chuvas irregulares",
        currentCrop: "Sorgo / Milheto",
        description:
          "Região quente com chuvas curtas onde leguminosas e cereais rústicos garantem segurança alimentar.",
      },
    },
  },
  {
    id: "arid-valley",
    lat: -7.1139,
    lon: -79.4688,
    slopePct: 2.1,
    labels: {
      en: {
        name: "Arid Coastal Valley",
        region: "Northern Coast, Peru",
        climateTag: "Dry & sunny",
        currentCrop: "Irrigated fruits / Row crops",
        description:
          "Almost zero rainfall, high solar radiation, and high reliance on water-efficient crops.",
      },
      es: {
        name: "Valle Costero Árido",
        region: "Costa Norte, Perú",
        climateTag: "Seco y soleado",
        currentCrop: "Frutales / Cultivos irrigados",
        description:
          "Lluvias casi nulas, alta radiación y fuerte dependencia de cultivos eficientes en agua.",
      },
      fr: {
        name: "Vallée Côtière Aride",
        region: "Côte Nord, Pérou",
        climateTag: "Sec et ensoleillé",
        currentCrop: "Vergers / Cultures irriguées",
        description:
          "Pluies quasi nulles, fort ensoleillement et besoin de cultures économes en eau.",
      },
      pt: {
        name: "Vale Costeiro Árido",
        region: "Costa Norte, Peru",
        climateTag: "Seco e ensolarado",
        currentCrop: "Fruticultura / Irrigado",
        description:
          "Chuvas quase nulas, alta radiação e forte dependência de cultivos econômicos em água.",
      },
    },
  },
  {
    id: "andean-slope",
    lat: -13.5319,
    lon: -71.9675,
    slopePct: 14.5,
    labels: {
      en: {
        name: "Highland Slope",
        region: "Southern Andes, Peru",
        climateTag: "Cool & seasonal rain",
        currentCrop: "Potato / Highland maize",
        description:
          "Sloped terrain with night frost risk and soil erosion pressure during seasonal rains.",
      },
      es: {
        name: "Ladera Interandina",
        region: "Sierra Sur, Perú",
        climateTag: "Frío y lluvia estacional",
        currentCrop: "Papa / Maíz amiláceo",
        description:
          "Parcela en pendiente con riesgo de heladas nocturnas y pérdida de suelo por lluvia.",
      },
      fr: {
        name: "Versant Andin",
        region: "Andes du Sud, Pérou",
        climateTag: "Frais et pluies saisonnières",
        currentCrop: "Pomme de terre / Maïs",
        description:
          "Terrain en pente exposé au gel nocturne et à l'érosion pendant la saison des pluies.",
      },
      pt: {
        name: "Encosta Andina",
        region: "Serra Sul, Peru",
        climateTag: "Frio e chuva sazonal",
        currentCrop: "Batata / Milho",
        description:
          "Terreno inclinado com risco de geadas noturnas e erosão durante as chuvas.",
      },
    },
  },
  {
    id: "temperate-plain",
    lat: 41.878,
    lon: -93.62,
    slopePct: 3.4,
    labels: {
      en: {
        name: "Temperate Plain",
        region: "Iowa, USA",
        climateTag: "Temperate & variable rain",
        currentCrop: "Continuous maize",
        description:
          "Broad rainfed farmland where alternating with legumes and cover crops restores soil nitrogen.",
      },
      es: {
        name: "Planicie Templada",
        region: "Iowa, EE. UU.",
        climateTag: "Templado y lluvia variable",
        currentCrop: "Maíz continuo",
        description:
          "Campo extensivo de secano donde alternar con leguminosas y coberturas recupera el suelo.",
      },
      fr: {
        name: "Plaine Tempérée",
        region: "Iowa, États-Unis",
        climateTag: "Tempéré et pluies variables",
        currentCrop: "Maïs continu",
        description:
          "Grande culture pluviale où les légumineuses et couverts végétaux régénèrent l'azote du sol.",
      },
      pt: {
        name: "Planície Temperada",
        region: "Iowa, EUA",
        climateTag: "Temperado e chuva variável",
        currentCrop: "Milho contínuo",
        description:
          "Lavoura extensiva onde alternar com leguminosas e cobertura recupera a fertilidade.",
      },
    },
  },
];
