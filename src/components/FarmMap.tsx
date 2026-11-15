"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Layers } from "lucide-react";

interface FarmMapProps {
  lat: number;
  lon: number;
  label: string;
  onSelectCoords: (lat: number, lon: number) => void;
  targetZoom?: number;
  zoomTrigger?: number;
  satelliteLabel?: string;
  mapLabel?: string;
  hintText?: string;
}

export default function FarmMap({
  lat,
  lon,
  label,
  onSelectCoords,
  targetZoom,
  zoomTrigger = 0,
  satelliteLabel = "Satellite",
  mapLabel = "Map",
  hintText = "Click anywhere on the map to move your field",
}: FarmMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [satellite, setSatellite] = useState(true);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lon],
      zoom: 12,
      zoomControl: true,
    });

    const satLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Esri World Imagery",
        maxZoom: 18,
      }
    );
    satLayer.addTo(map);
    tileLayerRef.current = satLayer;

    const marker = L.circleMarker([lat, lon], {
      radius: 10,
      color: "#34d399",
      weight: 3,
      fillColor: "#10b981",
      fillOpacity: 0.45,
    }).addTo(map);
    marker.bindTooltip(label, { direction: "top", offset: [0, -8] });
    markerRef.current = marker;

    map.on("click", (e: L.LeafletMouseEvent) => {
      onSelectCoords(
        Number(e.latlng.lat.toFixed(4)),
        Number(e.latlng.lng.toFixed(4))
      );
    });

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      tileLayerRef.current = null;
    };
    // Solo inicializar una vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    marker.setLatLng([lat, lon]);
    marker.setTooltipContent(label);
    const nextZoom =
      zoomTrigger > 0 && targetZoom !== undefined
        ? targetZoom
        : Math.max(map.getZoom(), 9);
    map.flyTo([lat, lon], nextZoom, {
      duration: 0.9,
    });
  }, [lat, lon, label, targetZoom, zoomTrigger]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const nextLayer = satellite
      ? L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { attribution: "Esri World Imagery", maxZoom: 18 }
        )
      : L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          { attribution: "Esri World Street Map", maxZoom: 18 }
        );

    nextLayer.addTo(map);
    tileLayerRef.current = nextLayer;
  }, [satellite]);

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-line bg-panel sm:h-80">
      <div ref={containerRef} className="h-full w-full z-0" />

      {/* targeting reticle — decorative, never intercepts map clicks */}
      <div aria-hidden className="pointer-events-none absolute inset-3 z-[400] sm:inset-4">
        <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-amber/50" />
        <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-amber/50" />
        <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-amber/50" />
        <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-amber/50" />
      </div>

      <button
        type="button"
        onClick={() => setSatellite((s) => !s)}
        className="absolute right-3 top-3 z-[500] inline-flex items-center gap-1.5 rounded-lg border border-line bg-void/85 px-2.5 py-1.5 text-xs font-medium text-ink-muted backdrop-blur transition hover:-translate-y-0.5 hover:border-amber/60 hover:text-ink"
      >
        <Layers className="h-3.5 w-3.5 text-amber" />
        {satellite ? satelliteLabel : mapLabel}
      </button>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg border border-line bg-void/80 px-2.5 py-1 font-mono text-[11px] text-ink-muted backdrop-blur">
        {hintText}
      </div>
    </div>
  );
}
