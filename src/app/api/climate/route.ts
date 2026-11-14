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

  // NASA POWER suele tener un desfase de 2-5 días en datos recientes
  const endDate = new Date(Date.now() - 3 * 86400 * 1000);
  const startDate = new Date(endDate.getTime() - 30 * 86400 * 1000);

  const nasaUrl =
    `https://power.larc.nasa.gov/api/temporal/daily/point` +
    `?parameters=T2M,T2M_MAX,T2M_MIN,RH2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN,WS2M` +
    `&community=AG` +
    `&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}` +
    `&start=${formatDateYYYYMMDD(startDate)}&end=${formatDateYYYYMMDD(endDate)}` +
    `&format=JSON`;

  // Muestreo en cruz (~110 m) para estimar elevación y pendiente real del terreno
  const delta = 0.001;
  const elevUrl =
    `https://api.open-meteo.com/v1/elevation` +
    `?latitude=${lat.toFixed(4)},${(lat + delta).toFixed(4)},${lat.toFixed(4) === (lat - delta).toFixed(4) ? lat.toFixed(4) : (lat - delta).toFixed(4)},${lat.toFixed(4)},${lat.toFixed(4)}` +
    `&longitude=${lon.toFixed(4)},${lon.toFixed(4)},${lon.toFixed(4)},${(lon + delta).toFixed(4)},${(lon - delta).toFixed(4)}`;

  const soilUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&hourly=soil_moisture_0_to_7cm&forecast_days=1&timezone=auto`;

  try {
    const [nasaRes, elevRes, soilRes] = await Promise.allSettled([
      fetch(nasaUrl, { next: { revalidate: 3600 } }),
      fetch(elevUrl, { next: { revalidate: 86400 } }),
      fetch(soilUrl, { next: { revalidate: 3600 } }),
    ]);

    if (nasaRes.status !== "fulfilled" || !nasaRes.value.ok) {
      const code = nasaRes.status === "fulfilled" ? nasaRes.value.status : "red";
      return NextResponse.json(
        { error: `NASA POWER respondió ${code}` },
        { status: 502 }
      );
    }

    const json = await nasaRes.value.json();
    const params = json?.properties?.parameter ?? {};

    const tempAvg = avgValid(params.T2M);
    const tempMaxAvg = avgValid(params.T2M_MAX);
    const tempMinAvg = avgValid(params.T2M_MIN);
    const humidityAvg = avgValid(params.RH2M);
    const rainTotalMm = sumValid(params.PRECTOTCORR);
    const solarAvg = avgValid(params.ALLSKY_SFC_SW_DWN);
    const windAvg = avgValid(params.WS2M);

    let elevationM: number | null = null;
    let slopePct: number | null = null;
    if (elevRes.status === "fulfilled" && elevRes.value.ok) {
      const elevJson = await elevRes.value.json();
      const e: number[] = elevJson?.elevation ?? [];
      if (e.length >= 5 && e.every((v) => typeof v === "number")) {
        elevationM = Math.round(e[0]);
        // ~222 m entre puntos opuestos (2 * 0.001 grados)
        const distNS = 222;
        const distEW = Math.max(80, 222 * Math.cos((lat * Math.PI) / 180));
        const dzNS = (e[1] - e[2]) / distNS;
        const dzEW = (e[3] - e[4]) / distEW;
        slopePct = Number((Math.sqrt(dzNS * dzNS + dzEW * dzEW) * 100).toFixed(1));
      }
    }

    let soilMoistureM3: number | null = null;
    if (soilRes.status === "fulfilled" && soilRes.value.ok) {
      const soilJson = await soilRes.value.json();
      const smArr: number[] = soilJson?.hourly?.soil_moisture_0_to_7cm ?? [];
      const validSm = smArr.filter((v) => typeof v === "number");
      if (validSm.length > 0) {
        const smMean = validSm.reduce((a, b) => a + b, 0) / validSm.length;
        soilMoistureM3 = Number(smMean.toFixed(3));
      }
    }

    // Cálculo de Eo Penman (1948) en mm/día según formulación hidrológica RELASPO (Pinna Cabrejos, 1974)
    // Ref: Penman, H. L. (1948) Proc. R. Soc. Lond. A 193, 120-145; Pinna Cabrejos, J. (1974) RELASPO.
    let eoMmDay: number | null = null;
    if (tempAvg !== null && humidityAvg !== null && solarAvg !== null) {
      const u2 = windAvg ?? 2.0;
      const es = 0.6108 * Math.exp((17.27 * tempAvg) / (tempAvg + 237.3));
      const ea = es * (humidityAvg / 100);
      const deltaSv = (4098 * es) / Math.pow(tempAvg + 237.3, 2);
      const elev = elevationM ?? 50;
      const presKpa = 101.3 * Math.pow((293 - 0.0065 * elev) / 293, 5.26);
      const gamma = 0.000665 * presKpa;
      // Radiación neta aproximada (albedo agua/superficie húmeda 0.23 y onda larga neta empírica)
      const rnMj = Math.max(0, 0.77 * solarAvg - 2.4);
      const eaWind = 2.6 * (1 + 0.54 * u2) * Math.max(0, es - ea);
      eoMmDay = Number(
        ((deltaSv * (rnMj / 2.45) + gamma * eaWind) / (deltaSv + gamma)).toFixed(2)
      );
    }

    return NextResponse.json({
      source: "NASA POWER (AG) + DEM/SM",
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
        solarMjM2Day: solarAvg !== null ? Number(solarAvg.toFixed(2)) : null,
        elevationM,
        slopePct,
        soilMoistureM3,
        eoMmDay,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo conectar con NASA POWER", detail: String(err) },
      { status: 502 }
    );
  }
}
