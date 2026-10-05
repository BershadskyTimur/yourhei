'use client';

import {
  LngLatBounds,
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { TYPE_ICON_PATHS } from '@/lib/institutions/icons';
import { INSTITUTION_TYPES, type MapInstitution } from '@/lib/institutions/types';

// OpenFreeMap: free, no key, OpenStreetMap data (attribution is shown by the map itself).
const STYLE_LIGHT = 'https://tiles.openfreemap.org/styles/positron';
const STYLE_DARK = 'https://tiles.openfreemap.org/styles/dark';

// The worker file is copied to public/ by scripts/copy-maplibre-worker.mjs.
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

const SOURCE = 'institutions';
const L_CLUSTER = 'inst-clusters';
const L_CLUSTER_COUNT = 'inst-cluster-count';
const L_POINTS = 'inst-points';
const L_SELECTED = 'inst-selected';

export interface FocusRequest {
  lat: number;
  lng: number;
  /** changes on every request so the same place can be focused twice */
  nonce: number;
}

interface Props {
  items: readonly MapInstitution[];
  selectedId: string | null;
  focus: FocusRequest | null;
  onSelect: (id: string | null) => void;
  label: string;
  onUnsupported: () => void;
}

function toGeoJSON(items: readonly MapInstitution[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: items.map((i) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [i.lng, i.lat] },
      properties: { id: i.id, type: i.type },
    })),
  };
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Draws one round dot (ring, type colour, white/dark icon) for the map. */
function drawDot(type: (typeof INSTITUTION_TYPES)[number]): ImageData {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fillStyle = token('--map-ring');
  ctx.fill();
  ctx.beginPath();
  ctx.arc(32, 32, 26, 0, Math.PI * 2);
  ctx.fillStyle = token(`--type-${type}`);
  ctx.fill();
  const scale = 1.15;
  ctx.translate(32 - 12 * scale, 32 - 12 * scale);
  ctx.scale(scale, scale);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = token(`--type-${type}-on`);
  ctx.stroke(new Path2D(TYPE_ICON_PATHS[type]));
  return ctx.getImageData(0, 0, size, size);
}

export function InstitutionMap({ items, selectedId, focus, onSelect, label, onUnsupported }: Props) {
  const t = useTranslations('Home.map');
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const styleUrlRef = useRef<string>('');
  const [ready, setReady] = useState(false);

  // Latest values for map callbacks (they are registered once, so they must not capture stale props).
  const itemsRef = useRef(items);
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  const onUnsupportedRef = useRef(onUnsupported);
  const labelsRef = useRef({
    zoomIn: t('zoomIn'),
    zoomOut: t('zoomOut'),
    toggle: t('toggleAttribution'),
    feedback: t('mapFeedback'),
  });
  useEffect(() => {
    itemsRef.current = items;
    selectedRef.current = selectedId;
    onSelectRef.current = onSelect;
    onUnsupportedRef.current = onUnsupported;
    labelsRef.current = {
      zoomIn: t('zoomIn'),
      zoomOut: t('zoomOut'),
      toggle: t('toggleAttribution'),
      feedback: t('mapFeedback'),
    };
  });

  // Create the map once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const styleUrl = dark ? STYLE_DARK : STYLE_LIGHT;
    styleUrlRef.current = styleUrl;

    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container,
        style: styleUrl,
        center: [55, 44],
        zoom: 3,
        minZoom: 1.5,
        maxZoom: 17,
        attributionControl: { compact: true },
        locale: {
          'NavigationControl.ZoomIn': labelsRef.current.zoomIn,
          'NavigationControl.ZoomOut': labelsRef.current.zoomOut,
          'AttributionControl.ToggleAttribution': labelsRef.current.toggle,
          'AttributionControl.MapFeedback': labelsRef.current.feedback,
        },
      });
    } catch {
      // No WebGL in this browser.
      onUnsupportedRef.current();
      return;
    }
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');

    // Fit the view to all points once.
    if (itemsRef.current.length > 0) {
      const b = new LngLatBounds();
      for (const i of itemsRef.current) b.extend([i.lng, i.lat]);
      map.fitBounds(b, { padding: 48, maxZoom: 7, animate: false });
    }

    // (Re)adds icons, data and layers. A style change wipes them, so this runs on every style load.
    const setup = () => {
      for (const type of INSTITUTION_TYPES) {
        const id = `inst-${type}`;
        if (!map.hasImage(id)) map.addImage(id, drawDot(type), { pixelRatio: 2 });
      }
      if (!map.getSource(SOURCE)) {
        map.addSource(SOURCE, {
          type: 'geojson',
          data: toGeoJSON(itemsRef.current),
          cluster: true,
          clusterRadius: 48,
          clusterMaxZoom: 11,
        });
      }
      const ring = token('--map-ring');
      map.addLayer({
        id: L_CLUSTER,
        type: 'circle',
        source: SOURCE,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': token('--cluster'),
          'circle-radius': ['step', ['get', 'point_count'], 17, 5, 21, 15, 26],
          'circle-stroke-width': 3,
          'circle-stroke-color': ring,
        },
      });
      map.addLayer({
        id: L_CLUSTER_COUNT,
        type: 'symbol',
        source: SOURCE,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 14,
          'text-allow-overlap': true,
        },
        paint: { 'text-color': token('--on-cluster') },
      });
      map.addLayer({
        id: L_SELECTED,
        type: 'circle',
        source: SOURCE,
        filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'id'], selectedRef.current ?? '']],
        paint: {
          'circle-radius': 23,
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-width': 4,
          'circle-stroke-color': token('--focus'),
        },
      });
      map.addLayer({
        id: L_POINTS,
        type: 'symbol',
        source: SOURCE,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': ['concat', 'inst-', ['get', 'type']],
          'icon-size': 1,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    };
    map.on('style.load', setup);
    map.on('load', () => setReady(true));

    map.on('click', L_CLUSTER, async (e) => {
      const feature = map.queryRenderedFeatures(e.point, { layers: [L_CLUSTER] })[0];
      if (!feature) return;
      const source = map.getSource(SOURCE) as GeoJSONSource;
      const zoom = await source.getClusterExpansionZoom(feature.properties.cluster_id as number);
      const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
      map.easeTo({ center: [lng, lat], zoom: zoom + 0.5 });
    });
    map.on('click', L_POINTS, (e) => {
      const id = e.features?.[0]?.properties?.id as string | undefined;
      if (id) onSelectRef.current(id);
    });
    // Click on empty map closes the card.
    map.on('click', (e) => {
      const hit = map.queryRenderedFeatures(e.point, { layers: [L_POINTS, L_CLUSTER] });
      if (hit.length === 0) onSelectRef.current(null);
    });
    for (const layer of [L_CLUSTER, L_POINTS]) {
      map.on('mouseenter', layer, () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', layer, () => (map.getCanvas().style.cursor = ''));
    }

    return () => {
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  // Theme switch: load the other map style (setup re-adds the layers).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !resolvedTheme) return;
    const next = resolvedTheme === 'dark' ? STYLE_DARK : STYLE_LIGHT;
    if (next === styleUrlRef.current) return;
    styleUrlRef.current = next;
    map.setStyle(next);
  }, [resolvedTheme]);

  // Filters / search changed: update the points.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource(SOURCE) as GeoJSONSource | undefined)?.setData(toGeoJSON(items));
  }, [items, ready]);

  // Selection changed: move the highlight ring.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer(L_SELECTED)) return;
    map.setFilter(L_SELECTED, [
      'all',
      ['!', ['has', 'point_count']],
      ['==', ['get', 'id'], selectedId ?? ''],
    ]);
  }, [selectedId, ready]);

  // Search result chosen: fly there.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.flyTo({ center: [focus.lng, focus.lat], zoom: Math.max(map.getZoom(), 12), essential: true });
  }, [focus]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={label}
      data-map-ready={ready ? 'true' : 'false'}
      className="h-full w-full"
    />
  );
}
