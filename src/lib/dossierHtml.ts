import type { DossierData } from "@/lib/pdfGenerator";
import type { CurrentCropType } from "@/lib/rotations";

// Same brand hues as the web app. "Bright" = exact web hex, used on dark
// surfaces or as flat tint/stripe fills. The darker pair is for colored TEXT
// on the light paper background (the bright web shades are calibrated for
// light text on dark panels, not text-on-white).
const C = {
  dark: "#0F172A",
  muted: "#475569",
  border: "#CBD5E1",
  panel: "#0F1613",
  amberBright: "#F2A33D",
  cyanBright: "#4FD1DE",
  greenBright: "#5FD98A",
  roseBright: "#FF6B6B",
  indigoBright: "#6366F1",
  amber: "#8F550A",
  cyan: "#187781",
  green: "#1D7C3F",
  rose: "#990000",
  indigo: "#0D0F8C",
  bgCyan: "#ECFAFB",
  bgAmber: "#FEF7E7",
  bgRose: "#FFF1F2",
  bgGreen: "#EDFCF2",
  bgIndigo: "#E4E4FC",
};

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_BODY = "var(--font-body), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";

function esc(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .split("")
    .filter((ch) => ch.charCodeAt(0) >= 32)
    .join("")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageShell(inner: string): string {
  return `<div style="width:210mm;min-height:297mm;box-sizing:border-box;background:#ffffff;font-family:${FONT_BODY};color:${C.dark};display:flex;flex-direction:column;">${inner}</div>`;
}

function header(subtitle: string, lat: number, lon: number): string {
  const now = new Date();
  const dateStr = `${now.toLocaleDateString("es-ES")} ${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")} UTC`;
  return `
  <div style="background:${C.panel};padding:7mm 14mm;display:flex;align-items:center;justify-content:space-between;border-bottom:1.2mm solid ${C.amberBright};">
    <div style="display:flex;align-items:center;gap:4mm;">
      <div style="position:relative;width:8mm;height:8mm;flex:none;">
        <div style="position:absolute;inset:0;border:0.35mm dashed ${C.amberBright};border-radius:50%;"></div>
        <div style="position:absolute;top:0;left:50%;transform:translate(-50%,-50%);width:1.4mm;height:1.4mm;border-radius:50%;background:${C.amberBright};"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:2.6mm;height:2.6mm;border-radius:50%;background:${C.greenBright};"></div>
      </div>
      <div>
        <div style="font-family:${FONT_DISPLAY};font-weight:700;font-size:13pt;color:#EFF4EC;letter-spacing:0.02em;">AGROSHIFT NASA · GUÍA PRÁCTICA DE TU PARCELA</div>
        <div style="font-family:${FONT_BODY};font-size:8.5pt;color:#B4C4BC;margin-top:1mm;">${esc(subtitle)}</div>
      </div>
    </div>
    <div style="text-align:right;flex:none;">
      <div style="font-family:${FONT_MONO};font-weight:700;font-size:8pt;color:${C.amberBright};">${dateStr}</div>
      <div style="font-family:${FONT_MONO};font-size:7.5pt;color:#CBD5E1;margin-top:1mm;">${lat.toFixed(4)}, ${lon.toFixed(4)}</div>
    </div>
  </div>`;
}

function footer(): string {
  return `
  <div style="margin-top:auto;padding:4mm 14mm 6mm;border-top:0.2mm solid ${C.border};">
    <div style="font-family:${FONT_BODY};font-weight:700;font-size:7pt;color:${C.muted};">AgroShift NASA · Herramienta de Ayuda para el Agricultor</div>
    <div style="font-family:${FONT_BODY};font-size:6.5pt;color:${C.muted};margin-top:0.8mm;">Datos satelitales NASA POWER, Copernicus DEM y estándares FAO · Recomendamos confirmar siempre con un técnico local en campo.</div>
  </div>`;
}

function sectionHeader(num: string, title: string, color: string, badge?: string): string {
  return `
  <div style="display:flex;align-items:baseline;justify-content:space-between;gap:3mm;margin-bottom:3mm;">
    <div style="display:flex;align-items:baseline;gap:3mm;min-width:0;">
      <span style="font-family:${FONT_DISPLAY};font-weight:700;font-size:20pt;color:#DDE2E6;line-height:1;flex:none;">${num}</span>
      <span style="font-family:${FONT_DISPLAY};font-weight:700;font-size:9.5pt;color:${color};letter-spacing:0.03em;">${esc(title)}</span>
    </div>
    ${badge ? `<span style="font-family:${FONT_MONO};font-weight:700;font-size:7pt;color:${color};flex:none;white-space:nowrap;">${esc(badge)}</span>` : ""}
  </div>`;
}

function block(x: { num: string; title: string; accent: string; stripe: string; bg: string; border?: string; badge?: string; body: string }): string {
  return `
  <div style="margin:0 14mm 4mm;border:0.25mm solid ${x.border ?? C.border};border-radius:2mm;background:${x.bg};overflow:hidden;display:flex;">
    <div style="width:1.2mm;background:${x.stripe};flex:none;"></div>
    <div style="padding:4mm 5mm;flex:1;min-width:0;">
      ${sectionHeader(x.num, x.title, x.accent, x.badge)}
      ${x.body}
    </div>
  </div>`;
}

function fieldRow(label: string, value: string, valueColor = C.muted, mono = false): string {
  return `
  <div style="display:flex;gap:2mm;font-size:8.5pt;margin-bottom:1.8mm;">
    <span style="font-family:${FONT_BODY};font-weight:700;color:${C.dark};flex:none;">${esc(label)}</span>
    <span style="font-family:${mono ? FONT_MONO : FONT_BODY};color:${valueColor};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(value)}</span>
  </div>`;
}

function statBox(label: string, value: string, valueColor: string, caption: string): string {
  return `
  <div style="flex:1;border:0.25mm solid ${C.border};border-radius:1.5mm;background:#F8FAFC;padding:2.5mm;min-width:0;">
    <div style="font-family:${FONT_BODY};font-weight:700;font-size:7pt;color:${C.muted};">${esc(label)}</div>
    <div style="font-family:${FONT_MONO};font-weight:700;font-size:13pt;color:${valueColor};margin:1mm 0;">${esc(value)}</div>
    <div style="font-family:${FONT_BODY};font-size:6.8pt;color:${C.muted};">${esc(caption)}</div>
  </div>`;
}

const PROBLEM_MAP: Record<CurrentCropType, { title: string; points: string[] }> = {
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

function checkIcon(color: string): string {
  return `<span style="display:inline-block;width:3mm;height:3mm;flex:none;position:relative;">
    <svg width="100%" height="100%" viewBox="0 0 10 10"><path d="M1 5.5 L4 8.5 L9 1.5" stroke="${color}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </span>`;
}

export function buildDossierPage1Html(data: DossierData): string {
  const slopeDesc =
    data.slopePct >= 12
      ? `~${data.slopePct}% (Inclinada)`
      : data.slopePct >= 6
        ? `~${data.slopePct}% (Bajada suave)`
        : `~${data.slopePct}% (Plano)`;

  const eoVal = data.climate.eoMmDay ?? 4.5;
  const rainVal = data.climate.rain30dMm ?? 0;
  const soilPct = data.climate.soilMoistureM3 !== null ? Math.round(data.climate.soilMoistureM3 * 100) : 30;
  const tempMean = data.climate.tempAvgC ?? 20;
  const tempMin = data.climate.tempMinC ?? 15;
  const tempMax = data.climate.tempMaxC ?? 30;
  const isSevere = eoVal * 30 - rainVal > 60;

  const block1Body = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 6mm;">
      ${fieldRow("Tu Parcela:", data.parcelName)}
      ${fieldRow("Clima del lugar:", data.agroZoneLabel)}
      ${fieldRow("Cultivo actual:", data.currentCropLabel, C.amber)}
      ${fieldRow("Pendiente del suelo:", slopeDesc, C.muted, true)}
      ${fieldRow("Ubicación exacta:", `${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`, C.muted, true)}
      ${fieldRow("Altura sobre el mar:", `${data.elevationM} m`, C.muted, true)}
    </div>
    ${data.polygonMetrics ? `<div style="grid-column:1/-1;margin-top:1mm;">${fieldRow("Área medida en el mapa:", `${data.polygonMetrics.areaHa.toFixed(2)} ha · Perímetro ${Math.round(data.polygonMetrics.perimeterM)} m`, C.cyan, true)}</div>` : ""}`;

  const tipText = isSevere
    ? `El sol y el viento secan el suelo a un ritmo de ~${(eoVal * 30).toFixed(0)} mm al mes, mientras que solo cayeron ${rainVal.toFixed(1)} mm de lluvia. Consejo: Si riegas, hazlo al atardecer o usa mangueras de goteo para no perder agua en el aire.`
    : "La humedad del suelo se mantiene estable. Continúa con riego regular según la etapa de crecimiento de tu cultivo.";

  const block2Body = `
    <div style="display:flex;gap:2.5mm;margin-bottom:3mm;">
      ${statBox("TEMPERATURA MEDIA", `${tempMean.toFixed(1)}°C`, C.dark, `Mín ${tempMin.toFixed(0)}° a Máx ${tempMax.toFixed(0)}°`)}
      ${statBox("LLUVIA (30 DÍAS)", `${rainVal.toFixed(1)} mm`, C.cyan, rainVal < 10 ? "Casi nada de lluvia" : "Lluvia registrada")}
      ${statBox("HUMEDAD DEL SUELO", `${soilPct}%`, C.green, soilPct < 25 ? "Tierra seca arriba" : "Humedad aceptable")}
      ${statBox("PÉRDIDA POR CALOR", `${eoVal.toFixed(1)} mm/d`, C.amber, `~${(eoVal * 30).toFixed(0)} mm al mes`)}
    </div>
    <div style="border:0.25mm solid ${isSevere ? C.amberBright : C.greenBright};background:${isSevere ? "#FEF3C7" : "#F0FDF4"};border-radius:1.5mm;padding:3mm 4mm;">
      <div style="font-family:${FONT_BODY};font-weight:700;font-size:8pt;color:${isSevere ? C.amber : C.green};">${isSevere ? "ALERTA DE AGUA: TU TIERRA ESTÁ PERDIENDO MUCHA MÁS AGUA DE LA QUE LLUEVE" : "BALANCE DE AGUA: CONDICIONES HÍDRICAS MODERADAS EN ESTE PERIODO"}</div>
      <div style="font-family:${FONT_BODY};font-size:7.5pt;color:${C.dark};margin-top:1.5mm;line-height:1.4;">${esc(tipText)}</div>
    </div>`;

  const prob = PROBLEM_MAP[data.currentCropType];
  const block3Body = `
    <div style="font-family:${FONT_BODY};font-weight:700;font-size:8pt;color:${C.dark};margin-bottom:2mm;">${esc(prob.title)}</div>
    <ul style="margin:0;padding:0;list-style:none;">
      ${prob.points
        .map(
          (pt) =>
            `<li style="font-family:${FONT_BODY};font-size:7.5pt;color:${C.dark};line-height:1.5;margin-bottom:1.6mm;padding-left:3.5mm;position:relative;"><span style="position:absolute;left:0;">•</span>${esc(pt)}</li>`
        )
        .join("")}
    </ul>`;

  const topCrops = data.topRotations.slice(0, 3);
  const cropCards = topCrops
    .map((crop, idx) => {
      const benefits = crop.category.toLowerCase().includes("leguminosa")
        ? `Aporta abono natural gratis al suelo (${crop.nitrogenFixation}) y corta las plagas del cereal o papa. Demanda de agua: ${crop.waterDemand}.`
        : crop.category.toLowerCase().includes("oleaginosa")
          ? `Muy rústico, aguanta el sol fuerte y sus semillas tienen buen precio de venta. Demanda de agua: ${crop.waterDemand}.`
          : `Raíces que aprovechan la humedad profunda y dejan buena paja para cubrir la tierra. Demanda de agua: ${crop.waterDemand}.`;
      return `
      <div style="border:0.25mm solid ${C.border};background:#F8FAFC;border-radius:1.5mm;padding:2.5mm 3.5mm;margin-bottom:2.5mm;">
        <div style="display:flex;align-items:center;gap:2.5mm;margin-bottom:1.5mm;">
          <span style="flex:none;width:5mm;height:5mm;border-radius:1mm;background:${C.cyanBright};color:#fff;font-family:${FONT_BODY};font-weight:700;font-size:7.5pt;display:flex;align-items:center;justify-content:center;">${idx + 1}</span>
          <span style="font-family:${FONT_DISPLAY};font-weight:700;font-size:9pt;color:${C.dark};">${esc(crop.name)}</span>
          <span style="font-family:${FONT_BODY};font-style:italic;font-size:7.5pt;color:${C.muted};">(${esc(crop.scientificName)})</span>
          <span style="margin-left:auto;font-family:${FONT_MONO};font-weight:700;font-size:8pt;color:${C.green};white-space:nowrap;">[ ${crop.matchScore}% APTO ]</span>
        </div>
        <div style="display:flex;gap:2mm;font-size:7.5pt;">
          <span style="font-family:${FONT_BODY};font-weight:700;color:${C.dark};flex:none;">¿Por qué te conviene?</span>
          <span style="font-family:${FONT_BODY};color:${C.muted};line-height:1.4;">${esc(benefits)}</span>
        </div>
      </div>`;
    })
    .join("");

  const tipsList = [
    data.currentCropType === "perennial"
      ? "No dejes el suelo pelado entre los árboles: Siembra trébol o pasto bajo; frenarás la evaporación del agua hasta en un 35%."
      : "No repitas el mismo cultivo: Si vienes de maíz o papa, rota con leguminosas (frijol/caupí); ahorrarás dinero en abono comprado.",
    data.slopePct >= 8
      ? `Siembra en curvas de nivel: Al tener ${data.slopePct}% de pendiente, traza los surcos atravesados a la caída para que el agua no lave la tierra buena.`
      : "Deja paja o rastrojo sobre la tierra (mulch): Así el sol no cocinará el suelo ni evaporará el agua que le eches.",
    "Riega con sol bajo (al atardecer o noche): Regar a mediodía hace que el calor evapore casi la mitad del agua antes de que la planta la tome.",
  ];

  const block4Body = `
    <div style="font-family:${FONT_BODY};font-size:8pt;color:${C.muted};margin-bottom:3mm;">Opciones analizadas por satélite que se adaptan a tu clima, ahorran agua y recuperan la fuerza de tu tierra:</div>
    ${cropCards}
    <div style="font-family:${FONT_BODY};font-weight:700;font-size:8.5pt;color:${C.dark};margin:3mm 0 2mm;">3 CONSEJOS DE ORO PARA EL MANEJO DE TU TIERRA HOY:</div>
    <ul style="margin:0;padding:0;list-style:none;">
      ${tipsList
        .map(
          (t) =>
            `<li style="display:flex;gap:2mm;font-family:${FONT_BODY};font-size:7.5pt;color:${C.dark};line-height:1.5;margin-bottom:1.8mm;align-items:flex-start;">${checkIcon(C.green)}<span>${esc(t)}</span></li>`
        )
        .join("")}
    </ul>`;

  return pageShell(`
    ${header("¿Cómo está tu tierra hoy y qué te conviene sembrar? · Datos Satelitales NASA", data.lat, data.lon)}
    <div style="padding-top:5mm;">
      ${block({ num: "01", title: "DATOS DE TU PARCELA Y UBICACIÓN", accent: C.cyan, stripe: C.cyanBright, bg: C.bgCyan, body: block1Body })}
      ${block({ num: "02", title: "EL AGUA Y EL CALOR EN TU TIERRA (SATÉLITES NASA)", accent: C.amber, stripe: C.amberBright, bg: C.bgAmber, body: block2Body })}
      ${block({ num: "03", title: "CUIDADO CON EL MONOCULTIVO", accent: C.rose, stripe: C.roseBright, bg: C.bgRose, border: "#FDA4AF", body: block3Body })}
      ${block({ num: "04", title: "QUÉ TE CONVIENE SEMBRAR EN TU PRÓXIMA CAMPAÑA", accent: C.green, stripe: C.greenBright, bg: C.bgGreen, body: block4Body })}
    </div>
    ${footer()}
  `);
}

export function buildDossierPage2Html(data: DossierData): string {
  const ai = data.aiPlan;
  if (!ai) return "";

  const sourceLabel = ai.source === "gemini-2.5-flash" ? "[ GEMINI 2.5 FLASH ]" : "[ MOTOR DETERMINISTA FAO ]";

  const block5Body = `
    <div style="font-family:${FONT_BODY};font-size:8pt;color:${C.dark};line-height:1.5;margin-bottom:3mm;">${esc(ai.diagnosisSummary)}</div>
    <ol style="margin:0 0 3mm;padding:0;list-style:none;">
      ${ai.actionSteps
        .map(
          (s, idx) =>
            `<li style="display:flex;gap:2.5mm;font-family:${FONT_BODY};font-size:7.5pt;color:${C.muted};line-height:1.5;margin-bottom:2mm;"><span style="font-weight:700;color:${C.indigo};flex:none;">${idx + 1}.</span><span>${esc(s)}</span></li>`
        )
        .join("")}
    </ol>
    <div style="border-top:0.2mm dashed ${C.border};padding-top:2.5mm;">
      <div style="font-family:${FONT_BODY};font-weight:700;font-size:7.5pt;color:${C.amber};">Verificar en campo:</div>
      <div style="font-family:${FONT_BODY};font-size:7.5pt;color:${C.dark};line-height:1.5;margin-top:1mm;">${esc(ai.localCheck)}</div>
    </div>`;

  return pageShell(`
    <div style="margin:0 14mm;padding:7mm 0 3mm;border-bottom:0.2mm solid ${C.border};">
      <div style="font-family:${FONT_BODY};font-size:8.5pt;color:${C.muted};">AGROSHIFT NASA · GUÍA PRÁCTICA DE TU PARCELA (continuación)</div>
    </div>
    <div style="padding-top:5mm;">
      ${block({ num: "05", title: "ASESOR IA: PLAN DE ACCIÓN PARA TU PARCELA", accent: C.indigo, stripe: C.indigoBright, bg: C.bgIndigo, badge: sourceLabel, body: block5Body })}
    </div>
    ${footer()}
  `);
}
