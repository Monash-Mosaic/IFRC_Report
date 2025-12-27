"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef, useState } from "react";

const COUNTRY_SOURCE_ID = "country-boundaries";
const COUNTRY_SOURCE_LAYER = "country_boundaries";
const COUNTRY_FILL_LAYER_ID = "country-fills";
const COUNTRY_BORDER_LAYER_ID = "country-borders";

export default function EngagementPage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const hoveredFeatureIdRef = useRef(null);
  const selectedFeatureIdRef = useRef(null);

  const [selectedCountry, setSelectedCountry] = useState(null);

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const selectedLabel = useMemo(() => {
    if (!selectedCountry) return "Click a country";
    return selectedCountry.name || selectedCountry.iso || "Selected country";
  }, [selectedCountry]);

  useEffect(() => {
    if (!accessToken) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [15, 10],
      zoom: 1.2,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    const clearHover = () => {
      const prevHover = hoveredFeatureIdRef.current;
      if (prevHover != null) {
        try {
          map.setFeatureState(
            { source: COUNTRY_SOURCE_ID, sourceLayer: COUNTRY_SOURCE_LAYER, id: prevHover },
            { hover: false }
          );
        } catch {}
        hoveredFeatureIdRef.current = null;
      }
      try {
        map.getCanvas().style.cursor = "";
      } catch {}
    };

    const clearSelection = () => {
      const prevSelected = selectedFeatureIdRef.current;
      if (prevSelected != null) {
        try {
          map.setFeatureState(
            { source: COUNTRY_SOURCE_ID, sourceLayer: COUNTRY_SOURCE_LAYER, id: prevSelected },
            { selected: false }
          );
        } catch {}
        selectedFeatureIdRef.current = null;
      }
      setSelectedCountry(null);
    };

    map.on("load", () => {
      map.addSource(COUNTRY_SOURCE_ID, {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
        promoteId: "iso_3166_1",
      });

      map.addLayer({
        id: COUNTRY_FILL_LAYER_ID,
        type: "fill",
        source: COUNTRY_SOURCE_ID,
        "source-layer": COUNTRY_SOURCE_LAYER,
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#E11D48",
            ["boolean", ["feature-state", "hover"], false],
            "#0EA5E9",
            "#14B8A6",
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            0.8,
            ["boolean", ["feature-state", "hover"], false],
            0.55,
            0.35,
          ],
        },
      });

      map.addLayer({
        id: COUNTRY_BORDER_LAYER_ID,
        type: "line",
        source: COUNTRY_SOURCE_ID,
        "source-layer": COUNTRY_SOURCE_LAYER,
        paint: {
          "line-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#BE123C",
            ["boolean", ["feature-state", "hover"], false],
            "#0284C7",
            "#94A3B8",
          ],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            1.4,
            ["boolean", ["feature-state", "hover"], false],
            1.0,
            0.6,
          ],
        },
      });

      map.on("mousemove", COUNTRY_FILL_LAYER_ID, (e) => {
        map.getCanvas().style.cursor = "pointer";

        const feature = e.features && e.features[0];
        const featureId = feature && feature.id;
        if (featureId == null) return;

        const prevHover = hoveredFeatureIdRef.current;
        if (prevHover === featureId) return;

        if (prevHover != null) {
          map.setFeatureState(
            { source: COUNTRY_SOURCE_ID, sourceLayer: COUNTRY_SOURCE_LAYER, id: prevHover },
            { hover: false }
          );
        }

        hoveredFeatureIdRef.current = featureId;
        map.setFeatureState(
          { source: COUNTRY_SOURCE_ID, sourceLayer: COUNTRY_SOURCE_LAYER, id: featureId },
          { hover: true }
        );
      });

      map.on("mouseleave", COUNTRY_FILL_LAYER_ID, () => {
        clearHover();
      });

      map.on("click", COUNTRY_FILL_LAYER_ID, (e) => {
        e.preventDefault();

        const feature = e.features && e.features[0];
        if (!feature) return;

        const featureId = feature.id;
        if (featureId == null) return;

        const prevSelected = selectedFeatureIdRef.current;
        if (prevSelected === featureId) {
          clearSelection();
          return;
        }

        if (prevSelected != null) {
          map.setFeatureState(
            { source: COUNTRY_SOURCE_ID, sourceLayer: COUNTRY_SOURCE_LAYER, id: prevSelected },
            { selected: false }
          );
        }

        selectedFeatureIdRef.current = featureId;
        map.setFeatureState(
          { source: COUNTRY_SOURCE_ID, sourceLayer: COUNTRY_SOURCE_LAYER, id: featureId },
          { selected: true }
        );

        const props = feature.properties || {};
        setSelectedCountry({
          name: props.name_en || props.name || null,
          iso: props.iso_3166_1 || props.iso_3166_1_alpha_3 || null,
        });
      });

      map.on("click", (e) => {
        if (e.defaultPrevented) return;
        const features = map.queryRenderedFeatures(e.point, { layers: [COUNTRY_FILL_LAYER_ID] });
        if (!features || features.length === 0) clearSelection();
      });
    });

    mapRef.current = map;

    return () => {
      try {
        clearHover();
        clearSelection();
      } catch {}
      mapRef.current = null;
      hoveredFeatureIdRef.current = null;
      selectedFeatureIdRef.current = null;
      map.remove();
    };
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Engagement</h1>
            <p className="text-gray-600 mt-1">Community engagement insights by country</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!accessToken ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900">Mapbox access token missing</h2>
            <p className="text-gray-600 mt-2">
              Set <code className="font-mono">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in{" "}
              <code className="font-mono">.env.local</code> and restart the dev server.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <aside className="lg:col-span-3 bg-white rounded-lg shadow-md p-4">
              <div className="text-sm font-semibold text-gray-900">Selected</div>
              <div className="mt-1 text-lg font-bold text-gray-900">{selectedLabel}</div>
              <div className="mt-4 text-sm text-gray-600">
                Hover to highlight. Click to select. Click again to unselect. Click empty space to clear.
              </div>
            </aside>

            <section className="lg:col-span-9 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-[520px] w-full" ref={mapContainerRef} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
