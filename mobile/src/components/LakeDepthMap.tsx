import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Modal, Dimensions } from 'react-native';
import { Map, Camera, GeoJSONSource, Layer, type CameraRef } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { theme } from '../theme/colors';
import { IconLocation, IconExpand, IconX } from './Icons';

const MAPTILER_KEY =
  (Constants.expoConfig?.extra as { maptilerKey?: string } | undefined)?.maptilerKey ?? '';
const MAP_STYLE = `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`;

interface BathyEntry {
  b: [number, number, number, number];  // [minLng, minLat, maxLng, maxLat]
  m: number;                             // maxDepth
  z: [number, string, unknown[]][];     // [depth, geomType, coordinates]
  p: [number, number, number][];        // [[depth, lng, lat], ...]
}

let _cache: Record<string, BathyEntry> | null = null;
function getBathy(): Record<string, BathyEntry> {
  if (!_cache) _cache = require('../data/bathymetry.json') as Record<string, BathyEntry>;
  return _cache;
}

// Emerald ramp: #c1ecda (0m) → #6cf8bb (mid) → #006c49 (deep)
function depthColor(depth: number, maxDepth: number): string {
  const t = maxDepth > 0 ? Math.min(depth / maxDepth, 1) : 0;
  if (t < 0.5) {
    const u = t * 2;
    const r = Math.round(193 + (108 - 193) * u);
    const g = Math.round(236 + (248 - 236) * u);
    const b = Math.round(218 + (187 - 218) * u);
    return `rgb(${r},${g},${b})`;
  } else {
    const u = (t - 0.5) * 2;
    const r = Math.round(108 + (0 - 108) * u);
    const g = Math.round(248 + (108 - 248) * u);
    const b = Math.round(187 + (73 - 187) * u);
    return `rgb(${r},${g},${b})`;
  }
}

interface CoreProps {
  entry: BathyEntry;
  lang: 'lt' | 'en';
  flex?: boolean;
  height?: number;
  topRightBtn: React.ReactNode;
}

function inLakeBounds(
  loc: { lng: number; lat: number },
  minLng: number, minLat: number, maxLng: number, maxLat: number,
): boolean {
  return loc.lng >= minLng && loc.lng <= maxLng && loc.lat >= minLat && loc.lat <= maxLat;
}

function DepthMapCore({ entry, lang, flex, height, topRightBtn }: CoreProps) {
  const cameraRef = useRef<CameraRef>(null);
  const [userLoc, setUserLoc] = useState<{ lng: number; lat: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const [minLng, minLat, maxLng, maxLat] = entry.b;

  // Padding so user can't pan away from the lake
  const lngPad = (maxLng - minLng) * 0.4;
  const latPad = (maxLat - minLat) * 0.4;
  const maxBounds: [number, number, number, number] = [
    minLng - lngPad, minLat - latPad, maxLng + lngPad, maxLat + latPad,
  ];

  // Minimum zoom: lake bbox just fills the viewport (Mercator-aware, with 1 level of slack).
  // In compact mode use the actual container height, not the full device screen.
  const minZoom = useMemo(() => {
    const { width: screenW } = Dimensions.get('window');
    const containerH = flex ? Dimensions.get('window').height : (height ?? Dimensions.get('window').height);
    const lngSpan = maxLng - minLng;
    const latSpan = maxLat - minLat;
    const midLat = (minLat + maxLat) / 2;
    const latCos = Math.cos(midLat * Math.PI / 180);
    const zoomW = Math.log2((screenW * 360) / (256 * lngSpan));
    const zoomH = Math.log2((containerH * 360 * latCos) / (256 * latSpan));
    return Math.min(zoomW, zoomH) - 1;
  }, [minLng, minLat, maxLng, maxLat, flex, height]);

  const locate = async () => {
    if (locating) return;
    if (userLoc) {
      if (inLakeBounds(userLoc, minLng, minLat, maxLng, maxLat)) {
        cameraRef.current?.flyTo({ center: [userLoc.lng, userLoc.lat], zoom: 14, duration: 800 });
      }
      return;
    }
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          lang === 'lt' ? 'Reikalingas leidimas' : 'Permission needed',
          lang === 'lt'
            ? 'Leiskite naudoti vietą nustatymuose.'
            : 'Allow location access in Settings.',
        );
        return;
      }
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        const loc = { lng: last.coords.longitude, lat: last.coords.latitude };
        setUserLoc(loc);
        if (inLakeBounds(loc, minLng, minLat, maxLng, maxLat)) {
          cameraRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 14, duration: 800 });
        }
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const loc = { lng: pos.coords.longitude, lat: pos.coords.latitude };
      setUserLoc(loc);
      if (inLakeBounds(loc, minLng, minLat, maxLng, maxLat)) {
        cameraRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 14, duration: 800 });
      }
    } finally {
      setLocating(false);
    }
  };

  const depthFC = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: entry.z.map(([depth, geomType, coordinates]) => ({
        type: 'Feature',
        properties: { depth },
        geometry: { type: geomType, coordinates } as GeoJSON.Geometry,
      })),
    }),
    [entry],
  );

  const labelFC = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: (entry.p ?? []).map(([depth, lng, lat]) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] } as GeoJSON.Geometry,
        properties: { d: depth },
      })),
    }),
    [entry],
  );

  const userLocFC = useMemo<GeoJSON.FeatureCollection | null>(
    () =>
      userLoc
        ? {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [userLoc.lng, userLoc.lat] },
              properties: {},
            }],
          }
        : null,
    [userLoc],
  );

  const fillColorExpr = [
    'interpolate', ['linear'], ['get', 'depth'],
    0,       depthColor(0, entry.m),
    entry.m, depthColor(entry.m, entry.m),
  ] as unknown as string;

  const legendTicks = [0, 0.33, 0.66, 1].map((t) =>
    Math.round(entry.m * t * 10) / 10,
  );

  const containerStyle = flex ? s.coreFlex : [s.coreFixed, { height }];

  return (
    <View style={containerStyle}>
      <Map
        mapStyle={MAP_STYLE}
        style={{ flex: 1 }}
        attributionPosition={{ bottom: 4, right: 4 }}
        logoPosition={{ bottom: 4, left: 4 }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            bounds: [minLng, minLat, maxLng, maxLat],
            padding: { top: 32, right: 32, bottom: 32, left: 32 },
          }}
          maxBounds={maxBounds}
          minZoom={minZoom}
        />

        <GeoJSONSource id="lake-depth" data={depthFC as unknown as GeoJSON.FeatureCollection}>
          <Layer
            id="lake-depth-fill"
            type="fill"
            paint={{ 'fill-color': fillColorExpr, 'fill-opacity': 0.92 }}
          />
          <Layer
            id="lake-depth-line"
            type="line"
            paint={{ 'line-color': 'rgba(255,255,255,0.55)', 'line-width': 0.8 }}
          />
        </GeoJSONSource>

        <GeoJSONSource id="depth-labels" data={labelFC as unknown as GeoJSON.FeatureCollection}>
          <Layer
            id="depth-labels-text"
            type="symbol"
            layout={{
              'text-field': ['concat', ['to-string', ['get', 'd']], ' m'] as unknown as string,
              'text-size': 11,
              'text-font': ['Noto Sans Bold'],
              'text-anchor': 'center',
              'text-allow-overlap': false,
            }}
            paint={{
              'text-color': '#1e3a8a',
              'text-halo-color': 'rgba(255,255,255,0.85)',
              'text-halo-width': 1.5,
            }}
          />
        </GeoJSONSource>

        {userLocFC && (
          <GeoJSONSource id="depth-user-loc" data={userLocFC as unknown as GeoJSON.FeatureCollection}>
            <Layer
              id="depth-user-halo"
              type="circle"
              paint={{ 'circle-radius': 14, 'circle-color': '#3b82f6', 'circle-opacity': 0.18 }}
            />
            <Layer
              id="depth-user-ring"
              type="circle"
              paint={{ 'circle-radius': 9, 'circle-color': '#ffffff', 'circle-opacity': 1 }}
            />
            <Layer
              id="depth-user-dot"
              type="circle"
              paint={{ 'circle-radius': 6, 'circle-color': '#3b82f6', 'circle-opacity': 1 }}
            />
          </GeoJSONSource>
        )}
      </Map>

      {/* Depth legend — top-left */}
      <View style={s.legend} pointerEvents="none">
        <Text style={s.legendTitle}>{lang === 'lt' ? 'Gylis' : 'Depth'}</Text>
        {legendTicks.map((d) => (
          <View key={d} style={s.legendRow}>
            <View style={[s.legendSwatch, { backgroundColor: depthColor(d, entry.m) }]} />
            <Text style={s.legendText}>{d} m</Text>
          </View>
        ))}
      </View>

      {/* Expand / close — top-right */}
      {topRightBtn}

      {/* Locate me — bottom-right */}
      <Pressable
        style={[s.locateBtn, locating && { opacity: 0.6 }]}
        onPress={locate}
        hitSlop={8}
      >
        <IconLocation color={userLoc ? '#3b82f6' : theme.ink} size={16} />
      </Pressable>
    </View>
  );
}

interface Props {
  kadastroId: string;
  lang: 'lt' | 'en';
  height?: number;
}

export function LakeDepthMap({ kadastroId, lang, height = 320 }: Props) {
  const entry = useMemo(() => getBathy()[kadastroId] ?? null, [kadastroId]);
  const [fullScreen, setFullScreen] = useState(false);

  if (!entry) {
    return (
      <View style={[s.empty, { height }]}>
        <Text style={s.emptyText}>
          {lang === 'lt' ? 'Gylio duomenų nėra' : 'No depth data available'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={[s.root, { height }]}>
        <DepthMapCore
          entry={entry}
          lang={lang}
          height={height}
          topRightBtn={
            <Pressable style={s.expandBtn} onPress={() => setFullScreen(true)} hitSlop={8}>
              <IconExpand color={theme.ink} size={16} />
            </Pressable>
          }
        />
      </View>

      {fullScreen && (
        <Modal
          visible={true}
          animationType="slide"
          onRequestClose={() => setFullScreen(false)}
          statusBarTranslucent
        >
          <View style={s.fullScreenRoot}>
            <DepthMapCore
              entry={entry}
              lang={lang}
              flex
              topRightBtn={
                <Pressable style={s.expandBtn} onPress={() => setFullScreen(false)} hitSlop={8}>
                  <IconX color={theme.ink} size={16} />
                </Pressable>
              }
            />
          </View>
        </Modal>
      )}
    </>
  );
}

const s = StyleSheet.create({
  root: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  fullScreenRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  coreFlex: { flex: 1 },
  coreFixed: {},
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  emptyText: { fontSize: 13, color: theme.inkSubtle },
  legend: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 8,
    padding: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.inkSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: { width: 12, height: 12, borderRadius: 2 },
  legendText: { fontSize: 11, color: theme.ink, fontWeight: '500' },
  expandBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: theme.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  locateBtn: {
    position: 'absolute',
    bottom: 36,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: theme.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
