import { NextRequest, NextResponse } from "next/server";

export interface GeoResult {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  admin1: string | null;
  lat: number;
  lon: number;
  kind: "country" | "region" | "place";
  recommendedZoom: number;
}

function classifyFeature(featureCode?: string): {
  kind: "country" | "region" | "place";
  recommendedZoom: number;
} {
  if (!featureCode) return { kind: "place", recommendedZoom: 11 };
  if (featureCode.startsWith("PCL")) return { kind: "country", recommendedZoom: 5 };
  if (featureCode.startsWith("ADM1") || featureCode.startsWith("ADM2")) {
    return { kind: "region", recommendedZoom: 8 };
  }
  return { kind: "place", recommendedZoom: 11 };
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const langParam = (req.nextUrl.searchParams.get("lang") ?? "en").slice(0, 2);
  const lang = ["en", "es", "fr", "pt"].includes(langParam) ? langParam : "en";

  if (q.length < 2) {
    return NextResponse.json({ results: [] satisfies GeoResult[] });
  }

  try {
    const url =
      `https://geocoding-api.open-meteo.com/v1/search` +
      `?name=${encodeURIComponent(q)}&count=7&language=${lang}&format=json`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(4500),
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] satisfies GeoResult[] });
    }

    const json = await res.json();
    const raw: Array<{
      id: number;
      name: string;
      country?: string;
      country_code?: string;
      admin1?: string;
      latitude: number;
      longitude: number;
      feature_code?: string;
    }> = json?.results ?? [];

    const results: GeoResult[] = raw.map((item) => {
      const { kind, recommendedZoom } = classifyFeature(item.feature_code);
      return {
        id: item.id,
        name: item.name,
        country: item.country ?? item.name,
        countryCode: item.country_code ?? "",
        admin1: item.admin1 ?? null,
        lat: Number(item.latitude.toFixed(4)),
        lon: Number(item.longitude.toFixed(4)),
        kind,
        recommendedZoom,
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] satisfies GeoResult[] });
  }
}
