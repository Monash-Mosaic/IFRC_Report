'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, QuoteIcon } from 'lucide-react';

// --- Constants ---
const COUNTRY_SOURCE_ID = 'country-boundaries';
const COUNTRY_SOURCE_LAYER = 'country_boundaries';
const COUNTRY_FILL_LAYER_ID = 'country-fills';
const COUNTRY_BORDER_LAYER_ID = 'country-borders';

const DOTS_SOURCE_ID = 'dots-source';
const DOTS_CIRCLE_LAYER_ID = 'dots-circle';
const DOTS_TEXT_LAYER_ID = 'dots-text';

// Coordinate Mapping (ensure these match your CSV names exactly)
const COUNTRY_COORDINATES = {
  CHINA: { lat: 35.8617, lng: 104.1954 },
  CAMEROON: { lat: 7.3697, lng: 12.3547 },
  ZAMBIA: { lat: -13.1339, lng: 27.8493 },
  UGANDA: { lat: 1.3733, lng: 32.2903 },
  UK: { lat: 55.3781, lng: -3.436 },
  KENYA: { lat: -0.0236, lng: 37.9062 },
  BOLIVIA: { lat: -16.2902, lng: -63.5887 },
  QATAR: { lat: 25.3548, lng: 51.1839 },
  'SRI LANKA': { lat: 7.8731, lng: 80.7718 },
  MADAGASCAR: { lat: -18.7669, lng: 46.8691 },
};

export default function QuoteMap({ selectedTag, handleSelectionTag }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const hoveredFeatureIdRef = useRef(null);
  const selectedFeatureIdRef = useRef({ current: 'GB' });

  // Track if map is fully loaded
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState({
    name: 'United Kingdom',
    iso: 'GB',
  });

  const [dotsData, setDotsData] = useState({
    type: 'FeatureCollection',
    features: [],
  });

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const selectedLabel = useMemo(() => {
    console.log(selectedCountry);
    if (!selectedCountry) return 'Click a country';
    return selectedCountry.name || selectedCountry.iso || 'Selected country';
  }, [selectedCountry]);

  // --- 1. Fetch Data ---
  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const response = await fetch('/data/countries.csv');
        if (!response.ok) throw new Error(`CSV not found: ${response.statusText}`);
        const text = await response.text();

        const lines = text.split('\n').filter((line) => line.trim() !== '');
        const dataLines = lines.slice(1);

        const counts = {};
        dataLines.forEach((line) => {
          const parts = line.split(',');
          if (parts.length >= 2) {
            const countryName = parts[1].trim().toUpperCase();
            counts[countryName] = (counts[countryName] || 0) + 1;
          }
        });

        const features = Object.entries(counts)
          .map(([country, count]) => {
            const coords = COUNTRY_COORDINATES[country];
            if (!coords) return null;
            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [coords.lng, coords.lat],
              },
              properties: { country, count },
            };
          })
          .filter(Boolean);

        console.log('Processed Map Data:', features); // Debugging: Check console to see if this prints
        setDotsData({ type: 'FeatureCollection', features });
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };

    fetchCSV();
  }, []);

  // --- 2. Initialize Map ---
  useEffect(() => {
    if (!accessToken || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [15, 10],
      zoom: 1.15,
      attributionControl: false,
    });

    map.setProjection('mercator');
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
      // Boundaries Source
      map.addSource(COUNTRY_SOURCE_ID, {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
        promoteId: 'iso_3166_1',
      });

      // Fill Layer
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

      // Border Layer
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

      // --- DOTS LAYERS ---
      // Initialize with empty data to avoid closure issues
      map.addSource(DOTS_SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: DOTS_CIRCLE_LAYER_ID,
        type: 'circle',
        source: DOTS_SOURCE_ID,
        paint: {
          'circle-radius': 14,
          'circle-color': '#ee2435',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      map.addLayer({
        id: DOTS_TEXT_LAYER_ID,
        type: 'symbol',
        source: DOTS_SOURCE_ID,
        layout: {
          'text-field': ['get', 'count'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Interaction Logic (Same as before)
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

      // Mark map as loaded so we can inject data
      setIsMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  // --- 3. Inject Data Logic ---
  // This runs whenever dotsData changes OR when the map finishes loading
  useEffect(() => {
    if (isMapLoaded && mapRef.current && mapRef.current.getSource(DOTS_SOURCE_ID)) {
        console.log('Injecting data into map:', dotsData);
        mapRef.current.getSource(DOTS_SOURCE_ID).setData(dotsData);
    }
  }, [dotsData, isMapLoaded]);

  return (
    <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Selected: <span className="font-semibold text-slate-900">{selectedLabel}</span>
          </div>
        </div>
        <div className="relative">
          <div ref={mapContainerRef} className="h-[360px] w-full" />
        </div>
      </section>

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
          >
            <Heart
              size={12}
              className={`${
                selectedTag['regulation']
                  ? 'fill-red-500 text-red-500'
                  : 'text-stone-400 hover:text-red-400'
              }`}
            />
          </button>
        </div>
        <div className="p-5">
          <div className="border-l-4 border-red-500 pl-4">
            <p className="text-sm text-slate-700 italic leading-relaxed">
              “You know, there's a lot of kind of, I don't think the law has caught up with social
              media...”
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
