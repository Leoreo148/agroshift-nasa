import { NextRequest, NextResponse } from "next/server";
import { fetchNdviTrend } from "@/lib/providers/modisNdvi";

// ORNL's MODIS subset service is slow and unreliable (observed 10-40s+ and
// occasional 503/504s). It must not share a request budget with the fast
// NASA POWER data the rest of the page depends on, so it gets its own route.
export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json({ error: "Coordenadas inválidas" }, { status: 400 });
  }

  const ndvi = await fetchNdviTrend(lat, lon);
  return NextResponse.json({ ndvi });
}
