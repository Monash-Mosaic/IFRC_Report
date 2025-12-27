"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef, useState } from "react";

const COUNTRY_SOURCE_ID = "country-boundaries";
const COUNTRY_SOURCE_LAYER = "country_boundaries";
const COUNTRY_FILL_LAYER_ID = "country-fills";
const COUNTRY_BORDER_LAYER_ID = "country-borders";

function HeartIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21s-7.5-4.7-9.7-9.2C.6 8.1 2.7 4.7 6.3 4.2c1.8-.2 3.6.7 4.7 2 1.1-1.3 2.9-2.2 4.7-2 3.6.5 5.7 3.9 4 7.6C19.5 16.3 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function QuoteIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M10.5 11.5c0 4-2.2 7-6.5 7v-2c2.3 0 3.7-1.1 4.2-3H4V6h6.5v5.5ZM21 11.5c0 4-2.2 7-6.5 7v-2c2.3 0 3.7-1.1 4.2-3H14.5V6H21v5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FilterChip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1 rounded-full text-xs border transition",
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
      ].join(" ")}
      type="button"
    >
      {children}
    </button>
  );
}

function ProgressRow({ rank, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-600 text-white text-xs font-semibold">
        {rank}
      </div>

      <div className="flex-1">
        <div className="text-sm text-slate-900">{label}</div>
        <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-2 rounded-full bg-teal-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
      </div>

      <div className="w-14 text-right text-xs text-slate-500">{value.toFixed(1)}%</div>

      <button
        type="button"
        className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50"
        aria-label="Save insight"
      >
        <HeartIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function EngagementPage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const hoveredFeatureIdRef = useRef(null);
  const selectedFeatureIdRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState("Psychological");
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
      zoom: 1.15,
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
            "#0F766E",
            ["boolean", ["feature-state", "hover"], false],
            "#0EA5E9",
            "#14B8A6",
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            0.85,
            ["boolean", ["feature-state", "hover"], false],
            0.55,
            0.18,
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
            "#0F766E",
            ["boolean", ["feature-state", "hover"], false],
            "#0284C7",
            "#E2E8F0",
          ],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            1.2,
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
        const prevHover = hoveredFeatureIdRef.current;
        if (prevHover != null) {
          map.setFeatureState(
            { source: COUNTRY_SOURCE_ID, sourceLayer: COUNTRY_SOURCE_LAYER, id: prevHover },
            { hover: false }
          );
        }
        const prevSelected = selectedFeatureIdRef.current;
        if (prevSelected != null) {
          map.setFeatureState(
            { source: COUNTRY_SOURCE_ID, sourceLayer: COUNTRY_SOURCE_LAYER, id: prevSelected },
            { selected: false }
          );
        }
      } catch {}

      mapRef.current = null;
      hoveredFeatureIdRef.current = null;
      selectedFeatureIdRef.current = null;
      map.remove();
    };
  }, [accessToken]);

  const topInsights = [
    { rank: 3, label: "Clear, coherent and transparent communications", value: 55.5 },
    { rank: 4, label: "Trusted messengers from within the community", value: 55.5 },
    { rank: 5, label: "Proximity and presence of aid providers", value: 42.1 },
  ];

  const filters = ["Psychological", "Social", "Digital", "Financial", "Reputation"];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <span className="inline-flex h-7 w-7 rounded-md bg-slate-100 items-center justify-center text-slate-600">
                    ≡
                  </span>
                  Reading List
                </div>

                <div className="mt-4 text-xs text-slate-500">Filter by category:</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {filters.map((f) => (
                    <FilterChip key={f} active={activeFilter === f} onClick={() => setActiveFilter(f)}>
                      {f}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div className="p-5">
                <div className="text-sm text-slate-500 leading-relaxed">
                  Click on the hearts to add insights as your favorite and build a customized Report reading List
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="col-span-12 lg:col-span-9">
            {/* Top header */}
            <div className="flex items-start justify-between gap-6 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-red-600">
                    +
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-slate-900">IFRC</div>
                    <div className="text-xs text-slate-500">Harmful information</div>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs text-slate-700 font-semibold leading-tight">
                <div>World</div>
                <div>Disasters</div>
                <div>Report</div>
                <div className="text-slate-500">2026</div>
              </div>
            </div>

            {/* Top ranked insights card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-900">Top insights</div>
              </div>
              <div className="px-6">
                {topInsights.map((row) => (
                  <ProgressRow key={row.rank} rank={row.rank} label={row.label} value={row.value} />
                ))}
              </div>
            </div>

            {/* Section title */}
            <div className="mt-8 mb-3">
              <div className="text-base font-semibold text-slate-900">
                Community Researchers interview quotes and analysis insights
              </div>
            </div>

            {/* Map + Quote cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map card */}
              <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Selected: <span className="font-semibold text-slate-900">{selectedLabel}</span>
                  </div>
                  <div className="h-9 w-36 rounded-full bg-slate-800/80 text-white flex items-center justify-center gap-2 text-xs">
                    <span className="opacity-90">Tools</span>
                    <span className="h-4 w-px bg-white/20" />
                    <span className="opacity-90">Legend</span>
                  </div>
                </div>

                <div className="relative">
                  <div ref={mapContainerRef} className="h-[360px] w-full" />
                </div>
              </section>

              {/* Quote card */}
              <section className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2">
                    <div className="text-teal-600">
                      <QuoteIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Uganda</div>
                      <div className="text-xs text-slate-500 mt-0.5">1 quote</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                    aria-label="Save quote"
                  >
                    <HeartIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5">
                  <div className="border-l-4 border-teal-600 pl-4">
                    <p className="text-sm text-slate-700 italic leading-relaxed">
                      “usually false information runs faster than the real information. Now, the false information in most cases
                      even reaches different places where the truth barely reaches.”
                    </p>
                    <div className="mt-3 text-xs text-slate-500">
                      community member, <span className="font-semibold text-slate-600">UGANDA</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Bottom section label like in mock */}
            <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-5 flex items-center gap-2 text-slate-700">
                <span className="text-teal-600">
                  <QuoteIcon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold">Community Researchers insights</span>
              </div>
              <div className="h-28" />
            </div>
          </main>
        </div>

        {/* Floating buttons (bottom-right) */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3">
          <button
            type="button"
            className="h-14 w-14 rounded-full bg-slate-700/70 text-white shadow-lg backdrop-blur flex items-center justify-center hover:bg-slate-700"
            aria-label="Zoom"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm9 3-5.1-5.1"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path d="M10.5 8v5M8 10.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            className="h-14 w-14 rounded-full bg-slate-700/70 text-white shadow-lg backdrop-blur flex items-center justify-center hover:bg-slate-700"
            aria-label="Fullscreen"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path
                d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Token missing overlay */}
        {!accessToken && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-xl border border-slate-200 shadow-lg p-6">
              <div className="text-lg font-semibold text-slate-900">Mapbox access token missing</div>
              <p className="text-slate-600 mt-2 text-sm">
                Add <code className="font-mono">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to{" "}
                <code className="font-mono">.env.local</code> and restart <code className="font-mono">npm run dev</code>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
