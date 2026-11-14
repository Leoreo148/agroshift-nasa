import { NextRequest, NextResponse } from "next/server";

function formatDateYYYYMMDD(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function avgValid(obj: Record<string, number> | undefined): number | null {
  if (!obj) return null;
  const vals = Object.values(obj).filter((v) => typeof v === "number" && v > -900);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function sumValid(obj: Record<string, number> | undefined): number | null {
  if (!obj) return null;
  const vals = Object.values(obj).filter((v) => typeof v === "number" && v > -900);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0);
}

export async function GET(req: NextRequest) {
  const latStr = req.nextUrl.searchParams.get("lat");
  const lonStr = req.nextUrl.searchParams.get("lon");

  const lat = Number(latStr);
  const lon = Number(lonStr);

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Coordenadas inválidas" }, { status: 400 });
  }

  // NASA POWER suele tener un desfase de 2-5 días en datos recientes: consultamos una ventana de 35 días hasta hace 3 días
  const endDate = new Date(Date.now() - 3 * 86400 * 1000);
  const startDate = new Date(endDate.getTime() - 30 * 86400 * 1000);

  const nasaUrl =
    `https://power.larc.nasa.gov/api/temporal/daily/point` +
    `?parameters=T2M,T2M_MAX,T2M_MIN,RH2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN` +
    `&community=AG` +
    `&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}` +
    `&start=${formatDateYYYYMMDD(startDate)}&end=${formatDateYYYYMMDD(endDate)}` +
    `&format=JSON`;

  try {
    const res = await fetch(nasaUrl, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `NASA POWER respondió ${res.status}` },
        { status: 502 }
      );
    }

    const json = await res.json();
    const params = json?.properties?.parameter ?? {};

    const tempAvg = avgValid(params.T2M);
    const tempMaxAvg = avgValid(params.T2M_MAX);
    const tempMinAvg = avgValid(params.T2M_MIN);
    const humidityAvg = avgValid(params.RH2M);
    const rainTotalMm = sumValid(params.PRECTOTCORR);
    const solarAvg = avgValid(params.ALLSKY_SFC_SW_DWN);

    return NextResponse.json({
      source: "NASA POWER (AG)",
      lat: Number(lat.toFixed(4)),
      lon: Number(lon.toFixed(4)),
      period: {
        start: formatDateYYYYMMDD(startDate),
        end: formatDateYYYYMMDD(endDate),
      },
      summary: {
        tempAvgC: tempAvg !== null ? Number(tempAvg.toFixed(1)) : null,
        tempMaxC: tempMaxAvg !== null ? Number(tempMaxAvg.toFixed(1)) : null,
        tempMinC: tempMinAvg !== null ? Number(tempMinAvg.toFixed(1)) : null,
        humidityPct: humidityAvg !== null ? Math.round(humidityAvg) : null,
        rain30dMm: rainTotalMm !== null ? Number(rainTotalMm.toFixed(1)) : null,
        solarKwhM2Day: solarAvg !== null ? Number(solarAvg.toFixed(2)) : null,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo conectar con NASA POWER", detail: String(err) },
      { status: 502 }
    );
  }
}
