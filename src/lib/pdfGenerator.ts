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

function cleanText(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim();
}

function truncateText(str: string, maxLen: number): string {
  const clean = cleanText(str);
  return clean.length > maxLen ? clean.slice(0, maxLen - 1) + "…" : clean;
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

  // Professional high-contrast palette
  const cNavy = [15, 23, 42] as const; // slate-900
  const cCardBorder = [203, 213, 225] as const; // slate-300
  const cAmber = [180, 83, 9] as const; // amber-700
  const cCyan = [3, 105, 161] as const; // sky-700
  const cGreen = [21, 128, 61] as const; // green-700
  const cRose = [190, 18, 60] as const; // rose-700
  const cDark = [15, 23, 42] as const; // dark text
  const cMuted = [71, 85, 105] as const; // slate-600

  // 1. ENCABEZADO PRINCIPAL (Estilo Ficha Oficial NASA / AgroShift)
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.rect(0, 0, pageWidth, 26, "F");

  // Barra de acento dorada
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 25, pageWidth, 1.2, "F");

  // Título y Subtítulo en letras grandes y legibles
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("AGROSHIFT NASA · GUÍA PRÁCTICA DE TU PARCELA", margin, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text("¿Cómo está tu tierra hoy y qué te conviene sembrar? · Datos Satelitales NASA", margin, 18);

  // Fecha y Coordenadas a la derecha
  const now = new Date();
  const dateStr = `${now.toLocaleDateString("es-ES")} · ${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")} UTC`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(245, 158, 11);
  doc.text(dateStr, pageWidth - margin - 45, 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Coords: ${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`, pageWidth - margin - 45, 18);

  let curY = 32;

  // 2. BLOQUE 1: DATOS CLAROS DE TU PARCELA
  const b1H = data.polygonMetrics ? 36 : 29;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(cCardBorder[0], cCardBorder[1], cCardBorder[2]);
  doc.roundedRect(margin, curY, contentWidth, b1H, 2, 2, "FD");

  // Franja decorativa vertical
  doc.setFillColor(cCyan[0], cCyan[1], cCyan[2]);
  doc.rect(margin, curY, 3, b1H, "F");

  doc.setTextColor(cCyan[0], cCyan[1], cCyan[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("1. DATOS DE TU PARCELA Y UBICACIÓN", margin + 6, curY + 6);

  // Dos columnas amplias y sin superposición
  const col1X = margin + 6;
  const col2X = margin + 94;

  doc.setFontSize(8.5);

  // Fila 1
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

  // Fila 2
  doc.setFont("helvetica", "bold");
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text("Cultivo actual:", col1X, curY + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(cAmber[0], cAmber[1], cAmber[2]);
  doc.text(truncateText(cleanText(data.currentCropLabel), 28), col1X + 22, curY + 20);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text("Pendiente del suelo:", col2X, curY + 20);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  const slopeDesc = data.slopePct >= 12 ? `~${data.slopePct}% (Inclinada)` : data.slopePct >= 6 ? `~${data.slopePct}% (Bajada suave)` : `~${data.slopePct}% (Plano)`;
  doc.text(slopeDesc, col2X + 33, curY + 20);

  // Fila 3
  doc.setFont("helvetica", "bold");
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text("Ubicación exacta:", col1X, curY + 26);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(`Latitud ${data.lat.toFixed(4)} · Longitud ${data.lon.toFixed(4)}`, col1X + 27, curY + 26);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text("Altura sobre el mar:", col2X, curY + 26);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(`${data.elevationM} metros`, col2X + 32, curY + 26);

  if (data.polygonMetrics) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text("Área medida en el mapa:", col1X, curY + 32);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(
      `${data.polygonMetrics.areaHa.toFixed(2)} hectáreas · Perímetro ${Math.round(data.polygonMetrics.perimeterM)} m`,
      col1X + 38,
      curY + 32
    );
  }

  curY += b1H + 4;

  // 3. BLOQUE 2: EL AGUA Y EL CALOR EN TU TIERRA (DATOS FÁCILES DE ENTENDER)
  const b2H = 55;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(cCardBorder[0], cCardBorder[1], cCardBorder[2]);
  doc.roundedRect(margin, curY, contentWidth, b2H, 2, 2, "FD");

  doc.setFillColor(cAmber[0], cAmber[1], cAmber[2]);
  doc.rect(margin, curY, 3, b2H, "F");

  doc.setTextColor(cAmber[0], cAmber[1], cAmber[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("2. EL AGUA Y EL CALOR EN TU TIERRA (MEDIDO POR SATÉLITES NASA)", margin + 6, curY + 6);

  // 4 Cajas grandes y separadas (41mm de ancho cada una)
  const boxW = 41;
  const boxH = 21;
  const boxY = curY + 10;

  const eoVal = data.climate.eoMmDay ?? 4.5;
  const rainVal = data.climate.rain30dMm ?? 0;
  const soilPct = data.climate.soilMoistureM3 !== null ? Math.round(data.climate.soilMoistureM3 * 100) : 30;
  const tempMean = data.climate.tempAvgC ?? 20;
  const tempMin = data.climate.tempMinC ?? 15;
  const tempMax = data.climate.tempMaxC ?? 30;

  // Caja 1: Calor
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(cCardBorder[0], cCardBorder[1], cCardBorder[2]);
  doc.roundedRect(margin + 6, boxY, boxW, boxH, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text("TEMPERATURA MEDIA", margin + 8, boxY + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text(`${tempMean.toFixed(1)}°C`, margin + 8, boxY + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(`Mín ${tempMin.toFixed(0)}° a Máx ${tempMax.toFixed(0)}°`, margin + 8, boxY + 18);

  // Caja 2: Lluvia
  const b2X = margin + 6 + boxW + 3.5;
  doc.roundedRect(b2X, boxY, boxW, boxH, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text("LLUVIA (30 DÍAS)", b2X + 2, boxY + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(cCyan[0], cCyan[1], cCyan[2]);
  doc.text(`${rainVal.toFixed(1)} mm`, b2X + 2, boxY + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(rainVal < 10 ? "Casi nada de lluvia" : "Lluvia registrada", b2X + 2, boxY + 18);

  // Caja 3: Humedad en la tierra
  const b3X = b2X + boxW + 3.5;
  doc.roundedRect(b3X, boxY, boxW, boxH, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text("HUMEDAD DEL SUELO", b3X + 2, boxY + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(cGreen[0], cGreen[1], cGreen[2]);
  doc.text(`${soilPct}%`, b3X + 2, boxY + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(soilPct < 25 ? "Tierra seca arriba" : "Humedad aceptable", b3X + 2, boxY + 18);

  // Caja 4: El sol seca la tierra
  const b4X = b3X + boxW + 3.5;
  doc.roundedRect(b4X, boxY, boxW, boxH, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text("PÉRDIDA POR CALOR", b4X + 2, boxY + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(cAmber[0], cAmber[1], cAmber[2]);
  doc.text(`${eoVal.toFixed(1)} mm/d`, b4X + 2, boxY + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(`~${(eoVal * 30).toFixed(0)} mm al mes`, b4X + 2, boxY + 18);

  // Tarjeta explicativa clara debajo de las 4 cajas (SIN NINGUNA SUPERPOSICIÓN)
  const calloutY = curY + 34;
  const netDeficit = (eoVal * 30) - rainVal;
  const isSevere = netDeficit > 60;

  doc.setFillColor(isSevere ? 254 : 240, isSevere ? 243 : 253, isSevere ? 199 : 244);
  doc.setDrawColor(isSevere ? 245 : 16, isSevere ? 158 : 185, isSevere ? 11 : 129);
  doc.roundedRect(margin + 6, calloutY, contentWidth - 12, 17, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(isSevere ? cAmber[0] : cGreen[0], isSevere ? cAmber[1] : cGreen[1], isSevere ? cAmber[2] : cGreen[2]);
  doc.text(
    isSevere
      ? `ALERTA DE AGUA: TU TIERRA ESTÁ PERDIENDO MUCHA MÁS AGUA DE LA QUE LLUEVE`
      : `BALANCE DE AGUA: CONDICIONES HÍDRICAS MODERADAS EN ESTE PERIODO`,
    margin + 10,
    calloutY + 5.5
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  const tipText = isSevere
    ? `El sol y el viento secan el suelo a un ritmo de ~${(eoVal * 30).toFixed(0)} mm al mes, mientras que solo cayeron ${rainVal.toFixed(1)} mm de lluvia. Consejo: Si riegas, hazlo al atardecer o usa mangueras de goteo para no perder agua en el aire.`
    : `La humedad del suelo se mantiene estable. Continúa con riego regular según la etapa de crecimiento de tu cultivo.`;
  const wrappedTip = doc.splitTextToSize(tipText, contentWidth - 20);
  doc.text(wrappedTip, margin + 10, calloutY + 10.5);

  curY += b2H + 4;

  // 4. BLOQUE 3: ¿QUÉ LE PASA A TU TIERRA SI REPITES EL MISMO CULTIVO?
  const b3H = 34;
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(244, 63, 94);
  doc.roundedRect(margin, curY, contentWidth, b3H, 2, 2, "FD");

  doc.setFillColor(cRose[0], cRose[1], cRose[2]);
  doc.rect(margin, curY, 3, b3H, "F");

  doc.setTextColor(cRose[0], cRose[1], cRose[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("3. CUIDADO CON EL MONOCULTIVO: ¿QUÉ LE PASA A TU TIERRA SI REPITES SIEMPRE LO MISMO?", margin + 6, curY + 6);

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

  // 5. BLOQUE 4: QUÉ PLANTAS TE CONVIENE SEMBRAR Y CÓMO CUIDAR TU SUELO
  const b4H = 110;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(cCardBorder[0], cCardBorder[1], cCardBorder[2]);
  doc.roundedRect(margin, curY, contentWidth, b4H, 2, 2, "FD");

  doc.setFillColor(cGreen[0], cGreen[1], cGreen[2]);
  doc.rect(margin, curY, 3, b4H, "F");

  doc.setTextColor(cGreen[0], cGreen[1], cGreen[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("4. ¿QUÉ PLANTAS TE CONVIENE SEMBRAR EN TU PRÓXIMA CAMPAÑA?", margin + 6, curY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text("Opciones analizadas por satélite que se adaptan a tu clima, ahorran agua y recuperan la fuerza de tu tierra:", margin + 6, curY + 11);

  // Tarjetas individuales de recomendación (NO tabla apretada, para que NO haya choques)
  const topCrops = data.topRotations.slice(0, 3);
  let cardY = curY + 14;

  topCrops.forEach((crop, idx) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin + 6, cardY, contentWidth - 12, 19, 1.5, 1.5, "FD");

    // Badge número
    doc.setFillColor(cCyan[0], cCyan[1], cCyan[2]);
    doc.roundedRect(margin + 8, cardY + 2.5, 6, 6, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(`${idx + 1}`, margin + 10, cardY + 6.8);

    // Nombre del cultivo y ajuste
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text(`${crop.name}`, margin + 17, cardY + 6.8);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(`(${crop.scientificName})`, margin + 17 + doc.getTextWidth(crop.name) + 2, cardY + 6.8);

    // Badge porcentaje de ajuste
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(contentWidth - 28, cardY + 2.5, 20, 5.5, 1, 1, "F");
    doc.setTextColor(cGreen[0], cGreen[1], cGreen[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(`${crop.matchScore}% Apto`, contentWidth - 25, cardY + 6.5);

    // Beneficios concretos y directos para el agricultor
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

  // Consejos prácticos inmediatos para el agricultor
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
    const wrappedT = doc.splitTextToSize(`✓ ${t}`, contentWidth - 14);
    doc.text(wrappedT, margin + 6, tipsY + 5 + idx * 5.2);
  });

  // 6. PIE DE PÁGINA LIMPIO Y DE CONFIANZA
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
