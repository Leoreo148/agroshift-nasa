import { NextRequest, NextResponse } from "next/server";
import type { ClimateMetrics, Trend5ySummary } from "@/lib/diagnostics";
import type { Lang } from "@/lib/i18n";
import type { CurrentCropType, FarmerPriority } from "@/lib/rotations";
import type { NdviTrend } from "@/lib/providers/modisNdvi";

interface AdvisorRequest {
  lat: number;
  lon: number;
  agroZoneLabel: string;
  lang: Lang;
  priority: FarmerPriority;
  currentCropType: CurrentCropType;
  climate: ClimateMetrics;
  trend5y: Trend5ySummary | null;
  ndvi?: NdviTrend | null;
  topRotations: Array<{
    name: string;
    scientificName: string;
    matchScore: number;
    reason: string;
    pestBreakBenefit: string;
    tradeOff: string;
  }>;
}

export interface AdvisorResponse {
  source: "gemini-2.5-flash" | "deterministic-fallback";
  diagnosisSummary: string;
  actionSteps: string[];
  localCheck: string;
}

function buildDeterministicFallback(body: AdvisorRequest): AdvisorResponse {
  const best = body.topRotations[0];
  const eo = body.climate.eoMmDay ?? 4.5;
  const slope = body.climate.slopePct ?? 2;
  const isPerennial = body.currentCropType === "perennial";
  const ndviInfo = body.ndvi
    ? `MODIS NDVI: ${body.ndvi.current.toFixed(2)} (${body.ndvi.deltaPct > 0 ? "+" : ""}${body.ndvi.deltaPct}%)`
    : null;

  const copy: Record<Lang, Omit<AdvisorResponse, "source">> = {
    en: {
      diagnosisSummary: body.trend5y
        ? `${body.trend5y.badge} (${body.trend5y.explanation}) with reference evaporation Eo=${eo} mm/day${ndviInfo ? ` · ${ndviInfo}` : ""}.`
        : `Current Eo is ${eo} mm/day on a ~${slope}% slope in ${body.agroZoneLabel}${ndviInfo ? ` (${ndviInfo})` : ""}.`,
      actionSteps: [
        isPerennial
          ? `Keep your perennial orchard intact and establish ${best?.name ?? "a low cover mix"} between alleys to cut soil evaporation.`
          : `Transition next cycle from your ${body.currentCropType} plot toward ${best?.name ?? "the top legume/cover option"} (${best?.matchScore ?? 85}% fit).`,
        `Target biological nitrogen and residue protection first: ${best?.pestBreakBenefit ?? "breaks root pest cycles"}.`,
        `Plan around the main trade-off: ${best?.tradeOff ?? "confirm local moisture and seed availability"}.`,
      ],
      localCheck:
        "Verify topsoil texture, last 2 seasons' pest history, and actual irrigation/seed access before planting.",
    },
    es: {
      diagnosisSummary: body.trend5y
        ? `${body.trend5y.badge} (${body.trend5y.explanation}) con evaporación Eo=${eo} mm/día${ndviInfo ? ` · ${ndviInfo}` : ""}.`
        : `Evaporación Eo=${eo} mm/día en pendiente de ~${slope}% (${body.agroZoneLabel})${ndviInfo ? ` · ${ndviInfo}` : ""}.`,
      actionSteps: [
        isPerennial
          ? `Mantén tu cultivo permanente y siembra ${best?.name ?? "cobertura viva"} entre hileras para frenar evaporación y erosión.`
          : `Alterna la próxima campaña hacia ${best?.name ?? "la mejor opción recomendada"} (${best?.matchScore ?? 85}% de ajuste).`,
        `Aprovecha el beneficio agronómico principal: ${best?.pestBreakBenefit ?? "corta plagas del suelo"}.`,
        `Prevé la limitación clave: ${best?.tradeOff ?? "valida humedad y semilla local"}.`,
      ],
      localCheck:
        "Confirma en campo la textura del suelo, el historial de plagas de las últimas 2 campañas y disponibilidad real de agua/semilla.",
    },
    fr: {
      diagnosisSummary: body.trend5y
        ? `${body.trend5y.badge} (${body.trend5y.explanation}) avec Eo=${eo} mm/jour${ndviInfo ? ` · ${ndviInfo}` : ""}.`
        : `Évaporation Eo=${eo} mm/jour sur pente ~${slope}% (${body.agroZoneLabel})${ndviInfo ? ` · ${ndviInfo}` : ""}.`,
      actionSteps: [
        isPerennial
          ? `Conservez votre verger et implantez ${best?.name ?? "un couvert végétal"} entre les rangs.`
          : `Orientez la prochaine saison vers ${best?.name ?? "la meilleure rotation"} (score ${best?.matchScore ?? 85}%).`,
        `Effet sanitaire principal : ${best?.pestBreakBenefit ?? "rupture des cycles parasitaires"}.`,
        `Anticipez le compromis : ${best?.tradeOff ?? "vérifiez l'humidité et les semences"}.`,
      ],
      localCheck:
        "Vérifiez sur place la texture du sol, l'historique sanitaire des 2 dernières campagnes et l'accès aux semences.",
    },
    pt: {
      diagnosisSummary: body.trend5y
        ? `${body.trend5y.badge} (${body.trend5y.explanation}) com evaporação Eo=${eo} mm/dia${ndviInfo ? ` · ${ndviInfo}` : ""}.`
        : `Evaporação Eo=${eo} mm/dia em declive de ~${slope}% (${body.agroZoneLabel})${ndviInfo ? ` · ${ndviInfo}` : ""}.`,
      actionSteps: [
        isPerennial
          ? `Mantenha o pomar permanente e semeie ${best?.name ?? "cobertura viva"} nas entrelinhas.`
          : `Planeje a próxima safra com ${best?.name ?? "a opção mais bem avaliada"} (${best?.matchScore ?? 85}% de ajuste).`,
        `Ganho sanitário e de solo: ${best?.pestBreakBenefit ?? "quebra ciclos de pragas"}.`,
        `Atenção ao ponto crítico: ${best?.tradeOff ?? "confira umidade e sementes"}.`,
      ],
      localCheck:
        "Valide no campo a textura do solo, o histórico de pragas das últimas 2 safras e o acesso real à água e sementes.",
    },
  };

  return {
    source: "deterministic-fallback",
    ...copy[body.lang],
  };
}

export async function POST(req: NextRequest) {
  let body: AdvisorRequest;
  try {
    body = (await req.json()) as AdvisorRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || !body.climate || !Array.isArray(body.topRotations)) {
    return NextResponse.json(
      { error: "Missing climate or topRotations payload" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(buildDeterministicFallback(body));
  }

  const langNames: Record<Lang, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    pt: "Portuguese",
  };

  const ndviSummary = body.ndvi
    ? {
        currentNdvi: body.ndvi.current,
        deltaPct64d: body.ndvi.deltaPct,
        vigorCategory:
          body.ndvi.current < 0.2
            ? "sparse/stressed or bare soil"
            : body.ndvi.current < 0.45
            ? "moderate canopy vigor"
            : "dense active green canopy",
      }
    : null;

  const prompt = [
    `You are an agronomic decision-support assistant for farmers.`,
    `Write strictly in ${langNames[body.lang]} using plain, respectful, non-technical language.`,
    `CRITICAL RULE: Use ONLY the exact NASA/DEM/FAO facts in the JSON below. Do NOT invent climate numbers, yields, or chemical dosages. Remind the farmer that local field inspection comes first.`,
    `Note: Eo is Penman (1948) open-surface evaporation (never call it ET0). If currentCropType is "perennial", NEVER advise uprooting the orchard; recommend inter-row living cover instead.`,
    ndviSummary
      ? `Satellite NDVI context: Ground diagnosis on satellite vegetation vigor (${ndviSummary.currentNdvi}, ${ndviSummary.vigorCategory}, ${ndviSummary.deltaPct64d}% change over 64d).`
      : `No NDVI satellite data available for this query.`,
    `Verified field data JSON:`,
    JSON.stringify({
      coords: [body.lat, body.lon],
      agroZone: body.agroZoneLabel,
      priority: body.priority,
      currentCropType: body.currentCropType,
      climate30d: body.climate,
      trend5y: body.trend5y,
      satelliteNdvi: ndviSummary,
      topRotations: body.topRotations.slice(0, 3),
    }),
    `Return JSON matching: {"diagnosisSummary": string (1 short sentence), "actionSteps": string[] (exactly 3 short practical steps), "localCheck": string (1 short field-verification tip)}.`,
  ].join("\n\n");

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(9500),
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 450,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errDetail = await res.text().catch(() => "");
      console.warn(
        `[ai-advisor] Gemini API request failed with status ${res.status}: ${errDetail.slice(0, 160)}`
      );
      return NextResponse.json(buildDeterministicFallback(body));
    }

    const data = await res.json();
    const rawText: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(buildDeterministicFallback(body));
    }

    const parsed = JSON.parse(rawText) as Partial<AdvisorResponse>;
    if (
      typeof parsed.diagnosisSummary === "string" &&
      Array.isArray(parsed.actionSteps) &&
      parsed.actionSteps.length >= 2 &&
      typeof parsed.localCheck === "string"
    ) {
      return NextResponse.json({
        source: "gemini-2.5-flash",
        diagnosisSummary: parsed.diagnosisSummary,
        actionSteps: parsed.actionSteps.slice(0, 3),
        localCheck: parsed.localCheck,
      } satisfies AdvisorResponse);
    }

    return NextResponse.json(buildDeterministicFallback(body));
  } catch (err) {
    console.warn("[ai-advisor] Error calling Gemini 2.5 Flash:", err);
    return NextResponse.json(buildDeterministicFallback(body));
  }
}
