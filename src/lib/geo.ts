export interface LatLon {
  lat: number;
  lon: number;
}

export interface PolygonMetrics {
  areaHa: number;
  areaM2: number;
  perimeterM: number;
  centroid: LatLon;
}

const EARTH_RADIUS_M = 6371008.8;
const DEG_TO_RAD = Math.PI / 180;

function haversineMeters(a: LatLon, b: LatLon): number {
  const dLat = (b.lat - a.lat) * DEG_TO_RAD;
  const dLon = (b.lon - a.lon) * DEG_TO_RAD;
  const lat1 = a.lat * DEG_TO_RAD;
  const lat2 = b.lat * DEG_TO_RAD;

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Computes geodesic polygon area (Chamberlain & Duquette spherical excess),
 * closed perimeter length in meters, and polygon centroid.
 */
export function computePolygonMetrics(points: LatLon[]): PolygonMetrics | null {
  if (points.length === 0) return null;

  let perimeterM = 0;
  for (let i = 0; i < points.length - 1; i++) {
    perimeterM += haversineMeters(points[i], points[i + 1]);
  }
  if (points.length >= 3) {
    perimeterM += haversineMeters(points[points.length - 1], points[0]);
  }

  if (points.length < 3) {
    const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const avgLon = points.reduce((s, p) => s + p.lon, 0) / points.length;
    return {
      areaHa: 0,
      areaM2: 0,
      perimeterM: Math.round(perimeterM),
      centroid: {
        lat: Number(avgLat.toFixed(4)),
        lon: Number(avgLon.toFixed(4)),
      },
    };
  }

  // Spherical excess area in m^2
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const lon1 = p1.lon * DEG_TO_RAD;
    const lon2 = p2.lon * DEG_TO_RAD;
    const lat1 = p1.lat * DEG_TO_RAD;
    const lat2 = p2.lat * DEG_TO_RAD;
    total += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  const areaM2 = Math.abs((total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
  const areaHa = areaM2 / 10_000;

  // Area-weighted centroid (falls back to vertex average when nearly collinear)
  let signedArea2 = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const cross = p1.lon * p2.lat - p2.lon * p1.lat;
    signedArea2 += cross;
    cx += (p1.lon + p2.lon) * cross;
    cy += (p1.lat + p2.lat) * cross;
  }

  const centroid =
    Math.abs(signedArea2) > 1e-10
      ? {
          lat: Number((cy / (3 * signedArea2)).toFixed(4)),
          lon: Number((cx / (3 * signedArea2)).toFixed(4)),
        }
      : {
          lat: Number(
            (points.reduce((s, p) => s + p.lat, 0) / points.length).toFixed(4)
          ),
          lon: Number(
            (points.reduce((s, p) => s + p.lon, 0) / points.length).toFixed(4)
          ),
        };

  return {
    areaHa,
    areaM2,
    perimeterM: Math.round(perimeterM),
    centroid,
  };
}

export function formatHectares(areaHa: number): string {
  if (areaHa >= 100) return areaHa.toFixed(0);
  if (areaHa >= 10) return areaHa.toFixed(1);
  return areaHa.toFixed(2);
}

export function formatPerimeter(perimeterM: number): string {
  if (perimeterM >= 1000) return `${(perimeterM / 1000).toFixed(2)} km`;
  return `${perimeterM} m`;
}
