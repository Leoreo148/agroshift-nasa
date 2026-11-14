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

export interface HistoryYear {
  year: number;
  tempAvgC: number;
  rainMmYear: number;
  soilWetness: number;
}

export interface Forecast7d {
  source: "Meteomatics";
  minTempC: number;
  maxTempC: number;
  totalRainMm: number;
  maxWindMs: number | null;
  days: Array<{
    date: string;
    tempC: number;
    rainMm: number;
  }>;
}

async function fetchMeteomaticsForecast(
  lat: number,
  lon: number
): Promise<Forecast7d | null> {
  const user = process.env.METEOMATICS_USER;
  const pass = process.env.METEOMATICS_PASS;
  if (!user || !pass) return null;

  const start = new Date();
  start.setUTCHours(12, 0, 0, 0);
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  const startIso = start.toISOString().slice(0, 19) + "Z";
  const endIso = end.toISOString().slice(0, 19) + "Z";

  const authHeader =
    "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
  const coord = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const url = `https://api.meteomatics.com/${startIso}--${endIso}:P1D/t_2m:C,precip_24h:mm,wind_speed_10m:ms/${coord}/json`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: authHeader },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const json = await res.json();
    const series: Array<{
      parameter: string;
      coordinates?: Array<{
        dates?: Array<{ date: string; value: number }>;
      }>;
    }> = json?.data ?? [];

    const byParam = new Map<string, Array<{ date: string; value: number }>>();
    for (const item of series) {
      const dates = item.coordinates?.[0]?.dates;
      if (dates) byParam.set(item.parameter, dates);
    }

    const temps = byParam.get("t_2m:C") ?? [];
    const rains = byParam.get("precip_24h:mm") ?? [];
    const winds = byParam.get("wind_speed_10m:ms") ?? [];
    if (temps.length === 0) return null;

    const days = temps.map((t, idx) => ({
      date: t.date.slice(0, 10),
      tempC: Number(t.value.toFixed(1)),
      rainMm: Number((rains[idx]?.value ?? 0).toFixed(1)),
    }));

    const tempVals = days.map((d) => d.tempC);
    const totalRainMm = Number(
      days.reduce((acc, d) => acc + d.rainMm, 0).toFixed(1)
    );
    const windVals = winds.map((w) => w.value).filter((v) => Number.isFinite(v));

    return {
      source: "Meteomatics",
      minTempC: Math.min(...tempVals),
      maxTempC: Math.max(...tempVals),
      totalRainMm,
      maxWindMs:
        windVals.length > 0
          ? Number(Math.max(...windVals).toFixed(1))
          : null,
      days,
    };
  } catch {
    return null;
  }
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

  const historyUrl =
    `https://power.larc.nasa.gov/api/temporal/monthly/point` +
    `?parameters=T2M,PRECTOTCORR,GWETTOP` +
    `&community=AG&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}` +
    `&start=2021&end=2025&format=JSON`;

  try {
    const [nasaRes, elevRes, soilRes, forecastRes, historyRes] =
      await Promise.allSettled([
        fetch(nasaUrl, { next: { revalidate: 3600 } }),
        fetch(elevUrl, { next: { revalidate: 86400 } }),
        fetch(soilUrl, { next: { revalidate: 3600 } }),
        fetchMeteomaticsForecast(lat, lon),
        fetch(historyUrl, { next: { revalidate: 86400 } }),
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

    const history5y: HistoryYear[] = [];
    if (historyRes.status === "fulfilled" && historyRes.value.ok) {
      const hJson = await historyRes.value.json();
      const hp = hJson?.properties?.parameter ?? {};
      const readYearVal = (
        paramObj: Record<string, number> | undefined,
        yr: number
      ): number | null => {
        if (!paramObj) return null;
        const annual = paramObj[`${yr}13`];
        if (typeof annual === "number" && annual > -900) return annual;
        const months: number[] = [];
        for (let m = 1; m <= 12; m++) {
          const val = paramObj[`${yr}${String(m).padStart(2, "0")}`];
          if (typeof val === "number" && val > -900) months.push(val);
        }
        if (months.length === 0) return null;
        return months.reduce((a, b) => a + b, 0) / months.length;
      };

      for (const yr of [2021, 2022, 2023, 2024, 2025]) {
        const t = readYearVal(hp.T2M, yr);
        const p = readYearVal(hp.PRECTOTCORR, yr);
        const w = readYearVal(hp.GWETTOP, yr);
        if (t !== null && p !== null && w !== null) {
          history5y.push({
            year: yr,
            tempAvgC: Number(t.toFixed(1)),
            rainMmYear: Math.round(p * 365),
            soilWetness: Number(w.toFixed(2)),
          });
        }
      }
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
      forecast:
        forecastRes.status === "fulfilled" ? forecastRes.value : null,
      history5y,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo conectar con NASA POWER", detail: String(err) },
      { status: 502 }
    );
  }
}
