"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Layers, MapPin, Pentagon, Trash2, Undo2 } from "lucide-react";
import { formatHectares, type LatLon } from "@/lib/geo";

export type MapSelectionMode = "point" | "perimeter";

interface FarmMapProps {
  lat: number;
  lon: number;
  label: string;
  onSelectCoords: (lat: number, lon: number) => void;
  selectionMode: MapSelectionMode;
  onChangeSelectionMode: (mode: MapSelectionMode) => void;
  polygonPoints: LatLon[];
  onPolygonChange: (points: LatLon[]) => void;
  areaHa: number | null;
  targetZoom?: number;
  zoomTrigger?: number;
  satelliteLabel?: string;
  mapLabel?: string;
  hintText?: string;
  modePointLabel?: string;
  modePerimeterLabel?: string;
  perimeterHint?: string;
  perimeterUndoLabel?: string;
  perimeterClearLabel?: string;
  verticesLabel?: string;
}

export default function FarmMap({
  lat,
  lon,
  label,
  onSelectCoords,
  selectionMode,
  onChangeSelectionMode,
  polygonPoints,
  onPolygonChange,
  areaHa,
  targetZoom,
  zoomTrigger = 0,
  satelliteLabel = "Satellite",
  mapLabel = "Map",
  hintText = "Click anywhere on the map to move your field",
  modePointLabel = "Single point",
  modePerimeterLabel = "Perimeter (ha)",
  perimeterHint = "Click corners around your field to trace its perimeter (min. 3 points)",
  perimeterUndoLabel = "Undo",
  perimeterClearLabel = "Clear",
  verticesLabel,
}: FarmMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const polygonLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const lastZoomTriggerRef = useRef<number>(zoomTrigger);
  const [satellite, setSatellite] = useState(true);
  const [tileFallback, setTileFallback] = useState(false);

  const selectionModeRef = useRef(selectionMode);
  const polygonPointsRef = useRef(polygonPoints);
  const onSelectCoordsRef = useRef(onSelectCoords);
  const onPolygonChangeRef = useRef(onPolygonChange);

  useEffect(() => {
    selectionModeRef.current = selectionMode;
  }, [selectionMode]);

  useEffect(() => {
    polygonPointsRef.current = polygonPoints;
  }, [polygonPoints]);

  useEffect(() => {
    onSelectCoordsRef.current = onSelectCoords;
  }, [onSelectCoords]);

  useEffect(() => {
    onPolygonChangeRef.current = onPolygonChange;
  }, [onPolygonChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lon],
      zoom: 12,
      zoomControl: true,
    });

    L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

    const polyLayer = L.layerGroup().addTo(map);
    polygonLayerRef.current = polyLayer;

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
      if (selectionModeRef.current === "perimeter") {
        const vertex: LatLon = {
          lat: Number(e.latlng.lat.toFixed(6)),
          lon: Number(e.latlng.lng.toFixed(6)),
        };
        onPolygonChangeRef.current([...polygonPointsRef.current, vertex]);
        return;
      }

      onSelectCoordsRef.current(
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
      polygonLayerRef.current = null;
      tileLayerRef.current = null;
    };
    // Initialize map once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    marker.setLatLng([lat, lon]);
    marker.setTooltipContent(label);

    const triggerChanged = zoomTrigger !== lastZoomTriggerRef.current;
    if (triggerChanged) {
      lastZoomTriggerRef.current = zoomTrigger;
      const nextZoom =
        targetZoom !== undefined ? targetZoom : Math.max(map.getZoom(), 9);
      map.flyTo([lat, lon], nextZoom, { duration: 0.9 });
      return;
    }

    // In perimeter mode, avoid shifting camera while user clicks vertices around the field
    if (selectionMode === "point") {
      map.flyTo([lat, lon], Math.max(map.getZoom(), 9), { duration: 0.9 });
    }
  }, [lat, lon, label, targetZoom, zoomTrigger, selectionMode]);

  useEffect(() => {
    const marker = markerRef.current;
    const polyGroup = polygonLayerRef.current;
    if (!polyGroup || !marker) return;

    polyGroup.clearLayers();

    if (selectionMode === "perimeter") {
      marker.setStyle({
        opacity: polygonPoints.length >= 3 ? 0.65 : 0,
        fillOpacity: polygonPoints.length >= 3 ? 0.2 : 0,
        radius: 5,
      });

      const latLngs = polygonPoints.map(
        (p) => [p.lat, p.lon] as L.LatLngTuple
      );

      if (latLngs.length >= 3) {
        L.polygon(latLngs, {
          color: "#4fd1de",
          weight: 2.5,
          fillColor: "#4fd1de",
          fillOpacity: 0.24,
        }).addTo(polyGroup);
      } else if (latLngs.length === 2) {
        L.polyline(latLngs, {
          color: "#4fd1de",
          weight: 2.5,
          dashArray: "6, 6",
        }).addTo(polyGroup);
      }

      polygonPoints.forEach((p, idx) => {
        L.circleMarker([p.lat, p.lon], {
          radius: idx === 0 ? 6 : 5,
          color: idx === 0 ? "#f2a33d" : "#4fd1de",
          weight: 2.5,
          fillColor: idx === 0 ? "#f2a33d" : "#080b09",
          fillOpacity: 0.95,
        }).addTo(polyGroup);
      });
    } else {
      marker.setStyle({
        opacity: 1,
        fillOpacity: 0.45,
        radius: 10,
      });
    }
  }, [selectionMode, polygonPoints]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const useOsm = !satellite || tileFallback;
    const nextLayer = useOsm
      ? L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxNativeZoom: 19,
          maxZoom: 19,
        })
      : L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Esri World Imagery",
            maxNativeZoom: 17,
            maxZoom: 19,
          }
        );

    let errorCount = 0;
    if (!useOsm) {
      nextLayer.on("tileerror", () => {
        errorCount += 1;
        if (errorCount >= 4) {
          setTileFallback(true);
        }
      });
    }

    nextLayer.addTo(map);
    tileLayerRef.current = nextLayer;
  }, [satellite, tileFallback]);

  const activeHint =
    selectionMode === "perimeter" ? perimeterHint : hintText;

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl border border-line bg-void/70 p-1">
          <button
            type="button"
            onClick={() => onChangeSelectionMode("point")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              selectionMode === "point"
                ? "bg-panel-raised text-ink shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <MapPin className="h-3.5 w-3.5 text-amber" />
            {modePointLabel}
          </button>
          <button
            type="button"
            onClick={() => onChangeSelectionMode("perimeter")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              selectionMode === "perimeter"
                ? "bg-cyan/15 text-cyan shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <Pentagon className="h-3.5 w-3.5" />
            {modePerimeterLabel}
          </button>
        </div>

        {selectionMode === "perimeter" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-line bg-void/70 px-2.5 py-1 font-mono text-xs text-ink-muted">
              {verticesLabel ?? `${polygonPoints.length} pts`}
              {areaHa !== null && areaHa > 0 && (
                <span className="ml-2 font-semibold text-cyan">
                  · {formatHectares(areaHa)} ha
                </span>
              )}
            </span>
            <button
              type="button"
              disabled={polygonPoints.length === 0}
              onClick={() => onPolygonChange(polygonPoints.slice(0, -1))}
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-void/70 px-2.5 py-1 text-xs font-medium text-ink-muted transition hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Undo2 className="h-3.5 w-3.5" />
              {perimeterUndoLabel}
            </button>
            <button
              type="button"
              disabled={polygonPoints.length === 0}
              onClick={() => onPolygonChange([])}
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-void/70 px-2.5 py-1 text-xs font-medium text-ink-muted transition hover:border-rose/50 hover:text-rose disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {perimeterClearLabel}
            </button>
          </div>
        )}
      </div>

      <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-line bg-panel sm:h-80">
        <div
          ref={containerRef}
          className={`h-full w-full z-0 ${
            selectionMode === "perimeter" ? "leaflet-perimeter-mode" : ""
          }`}
        />

        {/* targeting reticle — decorative, never intercepts map clicks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-3 z-[400] sm:inset-4"
        >
          <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-amber/50" />
          <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-amber/50" />
          <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-amber/50" />
          <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-amber/50" />
        </div>

        <button
          type="button"
          onClick={() => {
            setTileFallback(false);
            setSatellite((s) => !s);
          }}
          className="absolute right-3 top-3 z-[500] inline-flex items-center gap-1.5 rounded-lg border border-line bg-void/85 px-2.5 py-1.5 text-xs font-medium text-ink-muted backdrop-blur transition hover:-translate-y-0.5 hover:border-amber/60 hover:text-ink"
        >
          <Layers className="h-3.5 w-3.5 text-amber" />
          {satellite ? satelliteLabel : mapLabel}
        </button>
      </div>

      <p className="font-mono text-[11px] text-ink-faint">{activeHint}</p>
    </div>
  );
}
