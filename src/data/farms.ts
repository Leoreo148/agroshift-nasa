export interface FarmPreset {
  id: string;
  name: string;
  region: string;
  climateTag: string;
  currentCrop: string;
  description: string;
  lat: number;
  lon: number;
  slopePct: number;
}

export const FARM_PRESETS: FarmPreset[] = [
  {
    id: "arid-valley",
    name: "Valle Costero Árido",
    region: "Costa Norte, Perú",
    climateTag: "Seco y soleado",
    currentCrop: "Uva / Frutales de exportación",
    description:
      "Zona con lluvias casi nulas, alta radiación y dependencia total de riego eficiente.",
    lat: -7.1139,
    lon: -79.4688,
    slopePct: 2.1,
  },
  {
    id: "andean-slope",
    name: "Ladera Interandina",
    region: "Sierra Sur, Perú",
    climateTag: "Lluvia estacional y frío",
    currentCrop: "Papa / Maíz amiláceo",
    description:
      "Parcela en pendiente moderada con riesgo de heladas nocturnas y pérdida de suelo por lluvia.",
    lat: -13.5319,
    lon: -71.9675,
    slopePct: 14.5,
  },
  {
    id: "temperate-plain",
    name: "Planicie Agrícola",
    region: "Iowa, EE. UU.",
    climateTag: "Templado con lluvias variables",
    currentCrop: "Maíz continuo",
    description:
      "Campo extensivo de secano donde alternar con leguminosas y cobertura mejora el suelo.",
    lat: 41.878,
    lon: -93.62,
    slopePct: 3.4,
  },
];
