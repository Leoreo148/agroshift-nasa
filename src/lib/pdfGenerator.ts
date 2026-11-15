import { jsPDF } from "jspdf";
import type { ClimateMetrics, Trend5ySummary } from "@/lib/diagnostics";
import type { Lang } from "@/lib/i18n";
import type { CurrentCropType, FarmerPriority } from "@/lib/rotations";
import type { NdviTrend } from "@/lib/providers/modisNdvi";

export interface DossierData {
  parcelName: string;
  lat: number;
  lon: number;
  agroZoneLabel: string;
  elevationM: number;
  slopePct: number;
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

export function generateParcelPdf(data: DossierData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors based on AgroShift design system
  const cDark = [10, 15, 20] as const; // void dark background
  const cHeader = [15, 23, 42] as const; // slate-900
  const cCardBg = [245, 247, 250] as const; // light panel for printable readability
  const cAmber = [217, 119, 6] as const; // amber-600
  const cCyan = [8, 145, 178] as const; // cyan-600
  const cGreen = [22, 101, 52] as const; // green-800
  const cTextDark = [15, 23, 42] as const;
  const cTextMuted = [100, 116, 139] as const;
  const cLine = [203, 213, 225] as const;

  // Header Banner
  doc.setFillColor(cHeader[0], cHeader[1], cHeader[2]);
  doc.rect(0, 0, pageWidth, 26, "F");

  // Accent Line under header
  doc.setFillColor(cAmber[0], cAmber[1], cAmber[2]);
  doc.rect(0, 25, pageWidth, 1.2, "F");

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("AGROSHIFT NASA · FICHA TÉCNICA DE PARCELA Y SUELO", margin, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(
    "NASA Space Apps Challenge 2026 · Telemetría NASA POWER, Copernicus DEM y MODIS NDVI",
    margin,
    17
  );

  const dateStr = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(245, 158, 11);
  doc.text(`REG: ${dateStr}`, pageWidth - margin - 52, 11);

  let y = 33;

  // Section 1: Identificación y Perfil Geográfico
  doc.setFillColor(cCardBg[0], cCardBg[1], cCardBg[2]);
  doc.setDrawColor(cLine[0], cLine[1], cLine[2]);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, "FD");

  doc.setTextColor(cCyan[0], cCyan[1], cCyan[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("1. IDENTIFICACIÓN DE LA PARCELA Y PERFIL TOPOGRÁFICO", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(cTextDark[0], cTextDark[1], cTextDark[2]);

  const col1 = margin + 4;
  const col2 = margin + 65;
  const col3 = margin + 125;

  doc.text(`Parcela: ${data.parcelName.slice(0, 32)}`, col1, y + 13);
  doc.text(`Coordenadas: Lat ${data.lat.toFixed(4)}, Lon ${data.lon.toFixed(4)}`, col1, y + 19);
  doc.text(`Zona Agroclimática: ${data.agroZoneLabel}`, col1, y + 25);
  doc.text(`Cultivo Actual: ${data.currentCropLabel}`, col1, y + 31);

  doc.text(`Elevación SRTM: ${data.elevationM} m s.n.m.`, col2, y + 13);
  doc.text(`Pendiente del Terreno: ~${data.slopePct}%`, col2, y + 19);
  doc.text(
    `Riesgo de Erosión: ${data.slopePct >= 12 ? "ALTO (Escorrentía)" : data.slopePct >= 6 ? "MODERADO" : "BAJO"}`,
    col2,
    y + 25
  );
  doc.text(`Prioridad Seleccionada: ${data.priority.toUpperCase()}`, col2, y + 31);

  const ndviVal = data.ndvi ? data.ndvi.current.toFixed(2) : "N/D";
  const ndviVigor =
    data.ndvi && data.ndvi.current < 0.25
      ? "Suelo Desnudo / Estrés"
      : data.ndvi && data.ndvi.current < 0.45
      ? "Vigor Moderado"
      : "Vigor Denso Activo";
  doc.text(`MODIS NDVI (250m): ${ndviVal}`, col3, y + 13);
  doc.text(`Estado Cobertura: ${ndviVigor}`, col3, y + 19);
  doc.text(`Satélite: Terra/Aqua MOD13Q1`, col3, y + 25);
  doc.text(`Fuente: NASA / ORNL DAAC`, col3, y + 31);

  y += 42;

  // Section 2: Diagnóstico del Agua y Balance Hídrico del Suelo
  doc.setFillColor(cCardBg[0], cCardBg[1], cCardBg[2]);
  doc.roundedRect(margin, y, contentWidth, 48, 2, 2, "FD");

  doc.setTextColor(cCyan[0], cCyan[1], cCyan[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("2. DIAGNÓSTICO HÍDRICO DEL SUELO Y EVAPORACIÓN (NASA POWER / RELASPO)", margin + 4, y + 6);

  const tAvg = data.climate.tempAvgC !== null ? `${data.climate.tempAvgC}°C` : "N/D";
  const tMin = data.climate.tempMinC !== null ? `${data.climate.tempMinC}°C` : "N/D";
  const tMax = data.climate.tempMaxC !== null ? `${data.climate.tempMaxC}°C` : "N/D";
  const rain = data.climate.rain30dMm !== null ? `${data.climate.rain30dMm} mm` : "0 mm";
  const eo = data.climate.eoMmDay !== null ? `${data.climate.eoMmDay} mm/día` : "4.5 mm/día";
  const rh = data.climate.humidityPct !== null ? `${data.climate.humidityPct}%` : "N/D";
  const soilTop = data.climate.soilMoistureM3 !== null ? `${Math.round(data.climate.soilMoistureM3 * 100)}%` : "N/D";

  // Compute estimated balance
  const eoMonthly = (data.climate.eoMmDay ?? 4.5) * 30;
  const rainNum = data.climate.rain30dMm ?? 0;
  const waterDeficit = rainNum - eoMonthly;
  const waterBalanceLabel =
    waterDeficit < -70
      ? "DÉFICIT HÍDRICO SEVERO (Riego imprescindible)"
      : waterDeficit < -20
      ? "DÉFICIT MODERADO (Monitorear estrés estival)"
      : "RÉGIMEN HÍDRICO ESTABLE / HÚMEDO";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(cTextDark[0], cTextDark[1], cTextDark[2]);

  doc.text(`• Temperatura Media (30d): ${tAvg} (Mín: ${tMin} · Máx: ${tMax})`, col1, y + 13);
  doc.text(`• Evaporación Penman (Eo 1948): ${eo} (~${eoMonthly.toFixed(0)} mm/mes)`, col1, y + 19);
  doc.text(`• Lluvia Acumulada (30d): ${rain}`, col1, y + 25);
  doc.text(`• Humedad Relativa del Aire: ${rh}`, col1, y + 31);
  doc.text(`• Humedad en Superficie (GWETTOP 0-5cm): ${soilTop}`, col1, y + 37);

  doc.setFillColor(254, 243, 199); // amber-100 highlight
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(col2 - 2, y + 11, contentWidth - 62, 30, 1.5, 1.5, "FD");

  doc.setTextColor(cAmber[0], cAmber[1], cAmber[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("BALANCE HÍDRICO Y ESTADO DE LA RIZÓSFERA:", col2 + 2, y + 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(cTextDark[0], cTextDark[1], cTextDark[2]);
  doc.text(`• Situación: ${waterBalanceLabel}`, col2 + 2, y + 23);
  doc.text(`• Déficit evaporativo estimado: ${Math.abs(waterDeficit).toFixed(0)} mm/mes`, col2 + 2, y + 29);
  doc.text(
    `• Riesgo Térmico / Heladas: ${data.climate.tempMinC !== null && data.climate.tempMinC < 2 ? "SÍ (Precaución en brotes)" : "Bajo o Nulo"}`,
    col2 + 2,
    y + 35
  );

  y += 52;

  // Section 3: Diagnóstico del Problema en el Suelo Actual
  doc.setFillColor(cCardBg[0], cCardBg[1], cCardBg[2]);
  doc.roundedRect(margin, y, contentWidth, 36, 2, 2, "FD");

  doc.setTextColor(190, 18, 60); // rose-700
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("3. DIAGNÓSTICO Y CONDICIÓN ACTUAL DEL SUELO", margin + 4, y + 6);

  const problemDescriptions: Record<CurrentCropType, { title: string; lines: string[] }> = {
    cereal: {
      title: "Impacto por Monocultivo de Cereal Continuo (Maíz/Trigo/Arroz)",
      lines: [
        "Agotamiento acelerado de Nitrógeno: Los cereales consumen 0 kg N biológico y dependen 100% de fertilizante sintético.",
        "Exposición a erosión hídrica: Factor de cultivo C elevado (C ≈ 0.38 RUSLE) con pérdida de suelo superficial.",
        "Proliferación de malezas y plagas radiculares específicas de gramíneas.",
      ],
    },
    tuber: {
      title: "Impacto por Monocultivo de Papa o Tubérculos",
      lines: [
        "Desgaste físico y remoción mecánica intensa en aporque y cosecha, acelerando el lavado de suelo en pendiente.",
        "Presión sanitaria acumulativa: Incremento de inóculo de nemátodos quiste (Globodera) y Rhizoctonia.",
        "Suelo vulnerable a costra superficial y compactación en el horizonte B.",
      ],
    },
    legume: {
      title: "Impacto por Monocultivo de Leguminosas sin Alternancia",
      lines: [
        "Riesgo de marchitez vascular por hongos patógenos de suelo (Fusarium oxysporum / Macrophomina).",
        "Nitrógeno fijado infrautilizado: Sin un cereal siguiente, gran parte del N orgánico se pierde por lixiviación.",
        "Escasa biomasa protectora de rastrojo contra el impacto directo de gotas de lluvia.",
      ],
    },
    perennial: {
      title: "Impacto en Frutales Permanentes: Calles Desnudas",
      lines: [
        "Evaporación descontrolada en calles de paso (alta demanda Penman Eo con pérdida directa de agua de suelo).",
        "Erosión y compactación por maquinaria o pisoteo en las entre-hileras del huerto.",
        "Baja actividad biológica y pérdida de microorganismos fijadores entre árboles.",
      ],
    },
  };

  const activeProb = problemDescriptions[data.currentCropType];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(cTextDark[0], cTextDark[1], cTextDark[2]);
  doc.text(activeProb.title, margin + 4, y + 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(cTextMuted[0], cTextMuted[1], cTextMuted[2]);
  activeProb.lines.forEach((line, idx) => {
    doc.text(`• ${line}`, margin + 4, y + 19 + idx * 5.5);
  });

  y += 40;

  // Section 4: Recomendaciones de Manejo para la Tierra y Rotaciones
  doc.setFillColor(cCardBg[0], cCardBg[1], cCardBg[2]);
  doc.roundedRect(margin, y, contentWidth, 70, 2, 2, "FD");

  doc.setTextColor(cGreen[0], cGreen[1], cGreen[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("4. PLAN RECOMENDADO DE REGENERACIÓN Y MANEJO DEL SUELO", margin + 4, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(cTextDark[0], cTextDark[1], cTextDark[2]);
  doc.text("A) Medidas de Manejo Inmediato para esta Parcela:", margin + 4, y + 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(cTextDark[0], cTextDark[1], cTextDark[2]);

  const isPerennial = data.currentCropType === "perennial";
  const step1 = isPerennial
    ? "Mantener el huerto frutal y sembrar mezclas de leguminosas bajas (trébol/vicia) en las calles para frenar evaporación."
    : "Interrumpir el ciclo del monocultivo actual alternando la próxima campaña con una leguminosa o abono verde.";
  const step2 =
    data.slopePct >= 8
      ? `Terreno en pendiente (~${data.slopePct}%): Trazar surcos en curvas de nivel e incorporar zanjas de infiltración vivas.`
      : "Terreno plano a moderado: Mantener cobertura vegetal o rastrojo (mulch) de mínimo 30% para amortiguar radiación solar.";
  const step3 =
    waterDeficit < -40
      ? "Instalar riego presurizado localizado (goteo) programado en turnos crepusculares para reducir pérdidas por evaporación Penman."
      : "Manejar drenaje superficial para evitar anegamientos temporales en raíces en periodos de lluvia concentrada.";

  doc.text(`1. ${step1}`, margin + 4, y + 19);
  doc.text(`2. ${step2}`, margin + 4, y + 25);
  doc.text(`3. ${step3}`, margin + 4, y + 31);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("B) Cultivos Óptimos Científicamente Recomendados para Rotación:", margin + 4, y + 39);

  // Table header
  const tableY = y + 43;
  doc.setFillColor(226, 232, 240);
  doc.rect(margin + 4, tableY, contentWidth - 8, 5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(cTextDark[0], cTextDark[1], cTextDark[2]);
  doc.text("Cultivo / Especie", margin + 6, tableY + 3.5);
  doc.text("Categoría", margin + 62, tableY + 3.5);
  doc.text("Ajuste", margin + 100, tableY + 3.5);
  doc.text("Agua FAO-56", margin + 120, tableY + 3.5);
  doc.text("Aporte Nitrógeno (BNF)", margin + 150, tableY + 3.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  data.topRotations.slice(0, 3).forEach((crop, idx) => {
    const rowY = tableY + 5.5 + idx * 5.2;
    doc.text(`${crop.name} (${crop.scientificName})`, margin + 6, rowY + 3.5);
    doc.text(crop.category, margin + 62, rowY + 3.5);
    doc.text(`${crop.matchScore}%`, margin + 100, rowY + 3.5);
    doc.text(crop.waterDemand, margin + 120, rowY + 3.5);
    doc.text(crop.nitrogenFixation, margin + 150, rowY + 3.5);
  });

  // Footer / Citations
  const footerY = pageHeight - 16;
  doc.setDrawColor(cLine[0], cLine[1], cLine[2]);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(cTextMuted[0], cTextMuted[1], cTextMuted[2]);
  doc.text(
    "Metodología & Respaldos Científicos: Penman (1948) Proc. R. Soc. Lond. A 193 · FAO-56 Evapotranspiration (Allen et al. 1998) · USDA RUSLE (Renard et al. 1997)",
    margin,
    footerY + 2
  );
  doc.text(
    "Aviso Legal: Documento técnico de soporte de decisión agronómica. Los datos satelitales son orientativos y deben validarse con análisis de suelo en campo.",
    margin,
    footerY + 6
  );
  doc.text("Generado por AgroShift NASA · Plataforma de Transición Agrícola Satelital", margin, footerY + 10);

  return doc;
}
