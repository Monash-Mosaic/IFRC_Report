'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Heart, QuoteIcon } from 'lucide-react';

const COUNTRY_SOURCE_ID = 'country-boundaries';
const COUNTRY_SOURCE_LAYER = 'country_boundaries';
const COUNTRY_FILL_LAYER_ID = 'country-fills';
const COUNTRY_BORDER_LAYER_ID = 'country-borders';

export default function QuoteMap({ selectedTag, handleSelectionTag }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const hoveredFeatureIdRef = useRef(null);
  const selectedFeatureIdRef = useRef({
    current: 'GB',
  });
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'United Kingdom',
    iso: 'GB',
  });
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const selectedLabel = useMemo(() => {
    console.log(selectedCountry);
    if (!selectedCountry) return 'Click a country';
    return selectedCountry.name || selectedCountry.iso || 'Selected country';
  }, [selectedCountry]);

  useEffect(() => {
    if (!accessToken) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [15, 10],
      zoom: 1.15,
      attributionControl: false,
    });

    // ✅ Force flat world map (no globe)
    map.setProjection('mercator'); // or "equirectangular"

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

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
        map.getCanvas().style.cursor = '';
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

    map.on('load', () => {
      map.addSource(COUNTRY_SOURCE_ID, {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
        promoteId: 'iso_3166_1',
      });

      map.addLayer({
        id: COUNTRY_FILL_LAYER_ID,
        type: 'fill',
        source: COUNTRY_SOURCE_ID,
        'source-layer': COUNTRY_SOURCE_LAYER,
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#0F766E',
            ['boolean', ['feature-state', 'hover'], false],
            '#0EA5E9',
            '#14B8A6',
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            0.85,
            ['boolean', ['feature-state', 'hover'], false],
            0.55,
            0.18,
          ],
        },
      });

      map.addLayer({
        id: COUNTRY_BORDER_LAYER_ID,
        type: 'line',
        source: COUNTRY_SOURCE_ID,
        'source-layer': COUNTRY_SOURCE_LAYER,
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#0F766E',
            ['boolean', ['feature-state', 'hover'], false],
            '#0284C7',
            '#E2E8F0',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            1.2,
            ['boolean', ['feature-state', 'hover'], false],
            1.0,
            0.6,
          ],
        },
      });

      map.on('mousemove', COUNTRY_FILL_LAYER_ID, (e) => {
        map.getCanvas().style.cursor = 'pointer';

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

      map.on('mouseleave', COUNTRY_FILL_LAYER_ID, () => {
        clearHover();
      });

      map.on('click', COUNTRY_FILL_LAYER_ID, (e) => {
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
        console.log(selectedFeatureIdRef);
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

      map.on('click', (e) => {
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
  return (
    <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Map card */}
      <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Selected: <span className="font-semibold text-slate-900">{selectedLabel}</span>
          </div>
          {/* <div className="h-9 w-36 rounded-full bg-slate-800/80 text-white flex items-center justify-center gap-2 text-xs">
            <span className="opacity-90">Tools</span>
            <span className="h-4 w-px bg-white/20" />
            <span className="opacity-90">Legend</span>
          </div> */}
        </div>

        <div className="relative">
          <div ref={mapContainerRef} className="h-[360px] w-full" />
        </div>
      </section>

      {/* Quote card */}
      <section className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            <div className="text-red-500">
              <QuoteIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">UK</div>
              <div className="text-xs text-slate-500 mt-0.5">1 quote</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSelectionTag('regulation')}
            className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            aria-label="Save quote"
          >
            <Heart
              size={12}
              className={`
                    ${
                      selectedTag['regulation']
                        ? 'fill-red-500 text-red-500'
                        : 'text-stone-400 hover:text-red-400'
                    }
                  `}
            />
          </button>
        </div>

        <div className="p-5">
          <div className="border-l-4 border-red-500 pl-4">
            <p className="text-sm text-slate-700 italic leading-relaxed">
              “You know, there's a lot of kind of, I don't think the law has caught up with social
              media and being able to kind of hold people to account for the information that
              they've been putting up there. And I think, you know, sometimes it can be, you know,
              we've got a right to kind of free speech, you know. So there's a big, there's a
              conflict there, isn't there? To a certain extent, you know, he can say anything he
              likes, but it could be false, you know. And then there's the information that people
              have a right to know what the truth is. So I think there's a difficult balance to get
              between the laws and free speech. ”
            </p>
            <div className="mt-3 text-xs text-slate-500">
              INTL - Interview <span className="font-semibold text-slate-600">United Kingdom</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
