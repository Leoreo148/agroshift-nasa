import { jsPDF } from "jspdf";
import type { ClimateMetrics, Trend5ySummary } from "@/lib/diagnostics";
import type { Lang } from "@/lib/i18n";
import type { CurrentCropType, FarmerPriority } from "@/lib/rotations";
import type { NdviTrend } from "@/lib/providers/modisNdvi";
import type { PolygonMetrics } from "@/lib/geo";

export interface DossierData {
  parcelName: string;
  lat: number;
  lon: number;
  agroZoneLabel: string;
  elevationM: number;
  slopePct: number;
  polygonMetrics: PolygonMetrics | null;
  currentCropType: CurrentCropType;
  currentCropLabel: string;
  climate: ClimateMetrics;
  trend5y: Trend5ySummary | null;
  ndvi: NdviTrend | null;
  priority: FarmerPriority;
  topRotations: Array<{
    name: string;
    scientificName: string;
    category: string;
    matchScore: number;
    waterDemand: string;
    nitrogenFixation: string;
  }>;
  lang: Lang;
}

type RGB = readonly [number, number, number];

function cleanText(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/[🌀-🫿]|[☀-⛿]|[✀-➿]/gu, "")
    .split("")
    .filter((ch) => ch.charCodeAt(0) >= 32)
    .join("")
    .trim();
}

function truncateText(str: string, maxLen: number): string {
  const clean = cleanText(str);
  return clean.length > maxLen ? clean.slice(0, maxLen - 1) + "…" : clean;
}

/**
 * jsPDF's roundedRect does not reliably keep the fill/draw color set by a
 * prior call once other draw ops (esp. text) run in between — always set
 * both immediately before filling, or the box silently inherits a stale
 * color (this produced solid-dark unreadable boxes before this fix).
 */
function box(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: RGB,
  border: RGB,
  style: string = "FD",
  r: number = 1.5
) {
  doc.setFillColor(fill[0], fill[1], fill[2]);
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.roundedRect(x, y, w, h, r, r, style);
}

// Big ghost numeral + title — the same signature as the web's StepEyebrow,
// so the PDF reads as the same product instead of a plain text report.
function sectionHeader(doc: jsPDF, x: number, y: number, num: string, title: string, color: RGB) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(221, 226, 230);
  doc.text(num, x, y + 8.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(title, x + 13, y + 6);
}

// jsPDF's base Helvetica has no glyph for "check mark" (U+2713) — it silently
// falls back to an unrelated character. Draw the check as two short strokes.
function checkIcon(doc: jsPDF, x: number, y: number, color: RGB) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.5);
  doc.line(x, y, x + 0.9, y + 0.9);
  doc.line(x + 0.9, y + 0.9, x + 2.4, y - 1.1);
}

function stripe(doc: jsPDF, x: number, y: number, w: number, h: number, color: RGB) {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(x, y, w, h, "F");
}

export function generateParcelPdf(data: DossierData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Brand tokens (same hues as the web app's amber/cyan/green/rose/stone).
  // "Bright" = the exact web hex, used for small decorative fills/stripes
  // on the dark header or as flat color blocks (contrast doesn't depend on
  // text legibility there). "Print" = the same hue darkened to clear ~5:1
  // contrast on white paper — used for every colored TEXT on a light card,
  // since the bright web shades were calibrated for light text on dark.
  const cPanel = [15, 22, 19] as const; // #0F1613, same dark as the web header
  const cCardBorder = [203, 213, 225] as const;
  const cDark = [15, 23, 42] as const;
  const cMuted = [71, 85, 105] as const;

  const cAmberBright = [242, 163, 61] as const; // #F2A33D
  const cCyanBright = [79, 209, 222] as const; // #4FD1DE
  const cGreenBright = [95, 217, 138] as const; // #5FD98A

  const cAmber = [143, 85, 10] as const; // print-safe amber
  const cCyan = [24, 119, 129] as const; // print-safe cyan
  const cGreen = [29, 124, 63] as const; // print-safe green
  const cRose = [153, 0, 0] as const; // print-safe rose

  // 1. ENCABEZADO
  box(doc, 0, 0, pageWidth, 26, cPanel, cPanel, "F", 0);
  stripe(doc, 0, 25, pageWidth, 1.2, cAmberBright);

  // Marca: anillo punteado (órbita) + satélite + brote — mismo logo que la web
  const logoX = margin + 4;
  const logoY = 13;
  doc.setDrawColor(cAmberBright[0], cAmberBright[1], cAmberBright[2]);
  doc.setLineWidth(0.35);
  doc.setLineDashPattern([0.6, 0.6], 0);
  doc.circle(logoX, logoY, 3.3, "S");
  doc.setLineDashPattern([], 0); // reset — dash state otherwise leaks into every later stroke
  doc.setFillColor(cAmberBright[0], cAmberBright[1], cAmberBright[2]);
  doc.circle(logoX, logoY - 3.3, 0.6, "F");
  doc.setFillColor(cGreenBright[0], cGreenBright[1], cGreenBright[2]);
  doc.circle(logoX, logoY, 1.1, "F");

  const textX = margin + 10;
  doc.setTextColor(239, 244, 236);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("AGROSHIFT NASA · GUÍA PRÁCTICA DE TU PARCELA", textX, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(180, 196, 188);
  doc.text("¿Cómo está tu tierra hoy y qué te conviene sembrar? · Datos Satelitales NASA", textX, 18);

  const now = new Date();
  const dateStr = `${now.toLocaleDateString("es-ES")} ${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")} UTC`;
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(cAmberBright[0], cAmberBright[1], cAmberBright[2]);
  doc.text(dateStr, pageWidth - margin - 45, 11);
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`, pageWidth - margin - 45, 18);

  let curY = 32;

  // 2. BLOQUE 1: DATOS DE TU PARCELA
  const b1H = data.polygonMetrics ? 36 : 29;
  box(doc, margin, curY, contentWidth, b1H, [236, 250, 251], cCardBorder, "FD", 2);
  stripe(doc, margin, curY, 3, b1H, cCyanBright);
  sectionHeader(doc, margin + 6, curY, "01", "DATOS DE TU PARCELA Y UBICACIÓN", cCyan);

  const col1X = margin + 6;
  const col2X = margin + 94;
  doc.setFontSize(8.5);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text("Tu Parcela:", col1X, curY + 13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(truncateText(data.parcelName, 28), col1X + 22, curY + 13);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text("Clima del lugar:", col2X, curY + 13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(truncateText(data.agroZoneLabel, 30), col2X + 26, curY + 13);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text("Cultivo actual:", col1X, curY + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(cAmber[0], cAmber[1], cAmber[2]);
  doc.text(truncateText(cleanText(data.currentCropLabel), 28), col1X + 22, curY + 20);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text("Pendiente del suelo:", col2X, curY + 20);
  doc.setFont("courier", "normal");
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  const slopeDesc = data.slopePct >= 12 ? `~${data.slopePct}% (Inclinada)` : data.slopePct >= 6 ? `~${data.slopePct}% (Bajada suave)` : `~${data.slopePct}% (Plano)`;
  doc.text(slopeDesc, col2X + 33, curY + 20);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text("Ubicación exacta:", col1X, curY + 26);
  doc.setFont("courier", "normal");
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`, col1X + 27, curY + 26);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text("Altura sobre el mar:", col2X, curY + 26);
  doc.setFont("courier", "normal");
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(`${data.elevationM} m`, col2X + 32, curY + 26);

  if (data.polygonMetrics) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text("Área medida en el mapa:", col1X, curY + 32);
    doc.setFont("courier", "bold");
    doc.setTextColor(cCyan[0], cCyan[1], cCyan[2]);
    doc.text(
      `${data.polygonMetrics.areaHa.toFixed(2)} ha · Perímetro ${Math.round(data.polygonMetrics.perimeterM)} m`,
      col1X + 38,
      curY + 32
    );
  }

  curY += b1H + 4;

  // 3. BLOQUE 2: EL AGUA Y EL CALOR EN TU TIERRA
  const b2H = 55;
  box(doc, margin, curY, contentWidth, b2H, [254, 247, 231], cCardBorder, "FD", 2);
  stripe(doc, margin, curY, 3, b2H, cAmberBright);
  sectionHeader(doc, margin + 6, curY, "02", "EL AGUA Y EL CALOR EN TU TIERRA (SATÉLITES NASA)", cAmber);

  const boxW = 41;
  const boxH = 21;
  const boxY = curY + 10;

  const eoVal = data.climate.eoMmDay ?? 4.5;
  const rainVal = data.climate.rain30dMm ?? 0;
  const soilPct = data.climate.soilMoistureM3 !== null ? Math.round(data.climate.soilMoistureM3 * 100) : 30;
  const tempMean = data.climate.tempAvgC ?? 20;
  const tempMin = data.climate.tempMinC ?? 15;
  const tempMax = data.climate.tempMaxC ?? 30;

  function statBox(
    x: number,
    label: string,
    value: string,
    valueColor: RGB,
    caption: string
  ) {
    box(doc, x, boxY, boxW, boxH, [248, 250, 252], cCardBorder, "FD", 1.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(label, x + 2.5, boxY + 5);
    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
    doc.text(value, x + 2.5, boxY + 13.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(caption, x + 2.5, boxY + 18);
  }

  statBox(margin + 6, "TEMPERATURA MEDIA", `${tempMean.toFixed(1)}°C`, cDark, `Mín ${tempMin.toFixed(0)}° a Máx ${tempMax.toFixed(0)}°`);
  const b2X = margin + 6 + boxW + 3.5;
  statBox(b2X, "LLUVIA (30 DÍAS)", `${rainVal.toFixed(1)} mm`, cCyan, rainVal < 10 ? "Casi nada de lluvia" : "Lluvia registrada");
  const b3X = b2X + boxW + 3.5;
  statBox(b3X, "HUMEDAD DEL SUELO", `${soilPct}%`, cGreen, soilPct < 25 ? "Tierra seca arriba" : "Humedad aceptable");
  const b4X = b3X + boxW + 3.5;
  statBox(b4X, "PÉRDIDA POR CALOR", `${eoVal.toFixed(1)} mm/d`, cAmber, `~${(eoVal * 30).toFixed(0)} mm al mes`);

  const calloutY = curY + 34;
  const netDeficit = (eoVal * 30) - rainVal;
  const isSevere = netDeficit > 60;

  box(
    doc,
    margin + 6,
    calloutY,
    contentWidth - 12,
    17,
    isSevere ? [254, 243, 199] : [240, 253, 244],
    isSevere ? cAmberBright : cGreenBright,
    "FD",
    1.5
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(isSevere ? cAmber[0] : cGreen[0], isSevere ? cAmber[1] : cGreen[1], isSevere ? cAmber[2] : cGreen[2]);
  doc.text(
    isSevere
      ? "ALERTA DE AGUA: TU TIERRA ESTÁ PERDIENDO MUCHA MÁS AGUA DE LA QUE LLUEVE"
      : "BALANCE DE AGUA: CONDICIONES HÍDRICAS MODERADAS EN ESTE PERIODO",
    margin + 10,
    calloutY + 5.5
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  const tipText = isSevere
    ? `El sol y el viento secan el suelo a un ritmo de ~${(eoVal * 30).toFixed(0)} mm al mes, mientras que solo cayeron ${rainVal.toFixed(1)} mm de lluvia. Consejo: Si riegas, hazlo al atardecer o usa mangueras de goteo para no perder agua en el aire.`
    : "La humedad del suelo se mantiene estable. Continúa con riego regular según la etapa de crecimiento de tu cultivo.";
  const wrappedTip = doc.splitTextToSize(tipText, contentWidth - 20);
  doc.text(wrappedTip, margin + 10, calloutY + 10.5);

  curY += b2H + 4;

  // 4. BLOQUE 3: MONOCULTIVO
  const b3H = 34;
  box(doc, margin, curY, contentWidth, b3H, [255, 241, 242], cRose, "FD", 2);
  stripe(doc, margin, curY, 3, b3H, [255, 107, 107]);
  sectionHeader(doc, margin + 6, curY, "03", "CUIDADO CON EL MONOCULTIVO", cRose);

  const problemSimpleMap: Record<CurrentCropType, { title: string; points: string[] }> = {
    cereal: {
      title: "Si sigues sembrando Maíz, Trigo o Sorgo una y otra vez en el mismo lote:",
      points: [
        "Agotamiento del suelo: El cereal saca los nutrientes pero no devuelve abono natural; gastarás más en fertilizantes.",
        "Plagas que se quedan a vivir: Las plagas y malezas de los cereales aumentan cada año si no cambias de cultivo.",
        "Pérdida de tierra fértil: La tierra queda desprotegida y la lluvia o el viento se llevan la mejor capa del suelo.",
      ],
    },
    tuber: {
      title: "Si sigues sembrando Papa u otros tubérculos campaña tras campaña:",
      points: [
        "Enfermedades y gusanillo en la tierra: Repetir papa acumula hongos y nemátodos en las raíces que dañan la cosecha.",
        "Desgaste físico: Remover la tierra en aporque y cosecha en laderas hace que la lluvia lave la tierra fértil.",
        "Costos más altos: Cada campaña necesitarás gastar más dinero en fumigación para mantener el mismo rendimiento.",
      ],
    },
    legume: {
      title: "Si siembras únicamente leguminosas (frijol, haba) sin alternar con otros cultivos:",
      points: [
        "Pudrición de raíz: Sembrar siempre lo mismo atrae hongos de humedad y pudrición en la base del tallo.",
        "Abono desaprovechado: El nitrógeno natural que deja el frijol se pierde si después no pones una planta que se lo coma.",
        "Poco rastrojo: Queda poca paja en el suelo para proteger la tierra del sol después de la cosecha.",
      ],
    },
    perennial: {
      title: "En huertos y frutales permanentes (NO se arrancan los árboles):",
      points: [
        "Tierra pelada entre hileras: Dejar el suelo descubierto entre los árboles hace que el sol evapore el agua muy rápido.",
        "Suelo pisoteado y duro: El paso constante compacta la tierra y el agua de riego no baja a las raíces profundas.",
        "Solución práctica: Siembra trébol o pasto bajo entre las hileras de árboles para mantener el suelo fresco y húmedo.",
      ],
    },
  };

  const prob = problemSimpleMap[data.currentCropType];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text(prob.title, margin + 6, curY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  prob.points.forEach((pt, idx) => {
    const wrappedPt = doc.splitTextToSize(`• ${pt}`, contentWidth - 14);
    doc.text(wrappedPt, margin + 6, curY + 17 + idx * 5.2);
  });

  curY += b3H + 4;

  // 5. BLOQUE 4: RECOMENDACIONES DE ROTACIÓN
  const b4H = 110;
  box(doc, margin, curY, contentWidth, b4H, [237, 252, 242], cCardBorder, "FD", 2);
  stripe(doc, margin, curY, 3, b4H, cGreenBright);
  sectionHeader(doc, margin + 6, curY, "04", "QUÉ TE CONVIENE SEMBRAR EN TU PRÓXIMA CAMPAÑA", cGreen);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text("Opciones analizadas por satélite que se adaptan a tu clima, ahorran agua y recuperan la fuerza de tu tierra:", margin + 6, curY + 11);

  const topCrops = data.topRotations.slice(0, 3);
  let cardY = curY + 14;

  topCrops.forEach((crop, idx) => {
    box(doc, margin + 6, cardY, contentWidth - 12, 19, [248, 250, 252], cCardBorder, "FD", 1.5);

    box(doc, margin + 8, cardY + 2.5, 6, 6, cCyanBright, cCyanBright, "F", 1);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(`${idx + 1}`, margin + 10, cardY + 6.8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text(`${crop.name}`, margin + 17, cardY + 6.8);
    const nameWidth = doc.getTextWidth(crop.name); // measured while still bold/9pt — must happen before the font switch below

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(`(${crop.scientificName})`, margin + 17 + nameWidth + 2, cardY + 6.8);

    // Lectura tipo "readout" en mono, sin pastilla — igual que el estado de
    // las tarjetas en la web, no un badge genérico de dashboard.
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(cGreen[0], cGreen[1], cGreen[2]);
    const scoreText = `[ ${crop.matchScore}% APTO ]`;
    doc.text(scoreText, contentWidth - 4 - doc.getTextWidth(scoreText), cardY + 6.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text("¿Por qué te conviene?", margin + 8, cardY + 12.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);

    const benefits = crop.category.toLowerCase().includes("leguminosa")
      ? `Aporta abono natural gratis al suelo (${crop.nitrogenFixation}) y corta las plagas del cereal o papa. Demanda de agua: ${crop.waterDemand}.`
      : crop.category.toLowerCase().includes("oleaginosa")
      ? `Muy rústico, aguanta el sol fuerte y sus semillas tienen buen precio de venta. Demanda de agua: ${crop.waterDemand}.`
      : `Raíces que aprovechan la humedad profunda y dejan buena paja para cubrir la tierra. Demanda de agua: ${crop.waterDemand}.`;

    const wrappedBenefit = doc.splitTextToSize(benefits, contentWidth - 52);
    doc.text(wrappedBenefit, margin + 42, cardY + 12.5);

    cardY += 21.5;
  });

  const tipsY = cardY + 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text("3 CONSEJOS DE ORO PARA EL MANEJO DE TU TIERRA HOY:", margin + 6, tipsY);

  const tipsList = [
    data.currentCropType === "perennial"
      ? "No dejes el suelo pelado entre los árboles: Siembra trébol o pasto bajo; frenarás la evaporación del agua hasta en un 35%."
      : "No repitas el mismo cultivo: Si vienes de maíz o papa, rota con leguminosas (frijol/caupí); ahorrarás dinero en abono comprado.",
    data.slopePct >= 8
      ? `Siembra en curvas de nivel: Al tener ${data.slopePct}% de pendiente, traza los surcos atravesados a la caída para que el agua no lave la tierra buena.`
      : "Deja paja o rastrojo sobre la tierra (mulch): Así el sol no cocinará el suelo ni evaporará el agua que le eches.",
    "Riega con sol bajo (al atardecer o noche): Regar a mediodía hace que el calor evapore casi la mitad del agua antes de que la planta la tome.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  tipsList.forEach((t, idx) => {
    const lineY = tipsY + 5 + idx * 5.2;
    checkIcon(doc, margin + 6.5, lineY - 1.4, cGreen);
    const wrappedT = doc.splitTextToSize(t, contentWidth - 18);
    doc.text(wrappedT, margin + 10.5, lineY);
  });

  // 6. PIE DE PÁGINA
  const footY = pageHeight - 12;
  doc.setDrawColor(cCardBorder[0], cCardBorder[1], cCardBorder[2]);
  doc.line(margin, footY - 2, pageWidth - margin, footY - 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text("AgroShift NASA · Herramienta de Ayuda para el Agricultor", margin, footY + 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text("Datos satelitales NASA POWER, Copernicus DEM y estándares FAO · Recomendamos confirmar siempre con un técnico local en campo.", margin, footY + 5.5);

  return doc;
}
