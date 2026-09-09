import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useApp } from '../state/AppState';
import { Map, Camera, GeoJSONSource, Layer, Marker, type MapRef, type CameraRef, type PressEventWithFeatures, type PressEvent } from '@maplibre/maplibre-react-native';
import type { NativeSyntheticEvent } from 'react-native';
import Constants from 'expo-constants';
import { LITHUANIA_BOUNDS } from '../data/waterbodies';
import uetkLakesGeoJson from '../data/uetk-lakes.geojson.json';
import uetkRiversGeoJson from '../data/uetk-rivers.geojson.json';

const MAPTILER_KEY = (Constants.expoConfig?.extra as { maptilerKey?: string } | undefined)?.maptilerKey ?? '';
// basic-v2 gives a clean light-gray base. UETK water rendered on top is the
// primary water layer; we don't try to hide MapTiler's water — it sits beneath
// the UETK fill so it doesn't show through.
const MAP_STYLE_URL = `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`;

const WATER_FILL = '#c1ecda';
const WATER_STROKE = '#79a292';
const NAME_COLOR = '#006c49';
const SELECTED_RING = '#0f382c';

export interface UetkTapInfo {
  id: string;            // 'uetk:<kadastro_id>'
  kadastroId: string;
  name: string;
  kind: 'lake' | 'reservoir' | 'lagoon' | 'pond' | 'river';
  lng: number;
  lat: number;
  area?: number | null;  // area_ha for lakes, length_km for rivers
  avgDepthM?: number | null;
  maxDepthM?: number | null;
  shorelineKm?: number | null;
}

export interface LithuaniaMapRealHandle {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
}

interface Props {
  onSelectUetk?: (info: UetkTapInfo | null) => void;
  onMapLongPress?: (lng: number, lat: number) => void;
  mapHandleRef?: React.RefObject<LithuaniaMapRealHandle | null>;
  userLocation?: { lng: number; lat: number } | null;
  pinCoord?: { lng: number; lat: number } | null;
  showWater?: boolean;
}

const UETK_LAKES = uetkLakesGeoJson as unknown as GeoJSON.FeatureCollection;
const UETK_RIVERS = uetkRiversGeoJson as unknown as GeoJSON.FeatureCollection;

function uetkTapInfo(feature: GeoJSON.Feature): UetkTapInfo | null {
  const p = feature.properties as
    | { id?: string; name?: string; kind?: string; lng?: number; lat?: number; area_ha?: number; length_km?: number; avg_depth_m?: number; max_depth_m?: number; shoreline_km?: number }
    | null;
  if (!p?.id) return null;
  const kind = (['lake', 'reservoir', 'lagoon', 'pond', 'river'] as const).includes(
    p.kind as 'lake',
  )
    ? (p.kind as UetkTapInfo['kind'])
    : 'lake';
  return {
    id: `uetk:${p.id}`,
    kadastroId: p.id,
    name: p.name ?? '',
    kind,
    lng: typeof p.lng === 'number' ? p.lng : 0,
    lat: typeof p.lat === 'number' ? p.lat : 0,
    area: typeof p.area_ha === 'number' ? p.area_ha : typeof p.length_km === 'number' ? p.length_km : null,
    avgDepthM: typeof p.avg_depth_m === 'number' ? p.avg_depth_m : null,
    maxDepthM: typeof p.max_depth_m === 'number' ? p.max_depth_m : null,
    shorelineKm: typeof p.shoreline_km === 'number' ? p.shoreline_km : null,
  };
}

export function LithuaniaMapReal({ onSelectUetk, onMapLongPress, mapHandleRef, userLocation, pinCoord, showWater = true }: Props) {
  const { t } = useApp();
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const [adHocSelectedKadastro, setAdHocSelectedKadastro] = useState<string | null>(null);

  useEffect(() => {
    if (!mapHandleRef) return;
    mapHandleRef.current = {
      flyTo: (lng, lat, zoom = 11) => {
        cameraRef.current?.flyTo({ center: [lng, lat], zoom, duration: 800 });
      },
    };
    return () => {
      if (mapHandleRef) mapHandleRef.current = null;
    };
  }, [mapHandleRef]);

  const handleLongPress = (e: NativeSyntheticEvent<PressEvent>) => {
    const [lng, lat] = e.nativeEvent.lngLat;
    onMapLongPress?.(lng, lat);
  };

  const handleUetkPress = (e: NativeSyntheticEvent<PressEventWithFeatures>) => {
    const feat = e.nativeEvent.features?.[0];
    if (!feat) return;
    const info = uetkTapInfo(feat);
    if (!info) return;
    setAdHocSelectedKadastro(info.kadastroId);
    onSelectUetk?.(info);
    e.stopPropagation?.();
  };

  const adHocSelectedFilter: ['==', ['get', string], string] = [
    '==',
    ['get', 'id'],
    adHocSelectedKadastro ?? '__none__',
  ];

  return (
    <View style={{ flex: 1 }}>
      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE_URL}
        style={{ flex: 1 }}
        attributionPosition={{ bottom: 8, right: 8 }}
        logoPosition={{ bottom: 8, left: 8 }}
        compassPosition={{ top: 8, right: 8 }}
        onLongPress={handleLongPress}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            bounds: [
              LITHUANIA_BOUNDS.sw.lng,
              LITHUANIA_BOUNDS.sw.lat,
              LITHUANIA_BOUNDS.ne.lng,
              LITHUANIA_BOUNDS.ne.lat,
            ],
            padding: { top: 24, right: 16, bottom: 24, left: 16 },
          }}
          minZoom={6.5}
          maxZoom={16}
          maxBounds={[
            LITHUANIA_BOUNDS.sw.lng - 0.05,
            LITHUANIA_BOUNDS.sw.lat - 0.05,
            LITHUANIA_BOUNDS.ne.lng + 0.05,
            LITHUANIA_BOUNDS.ne.lat + 0.05,
          ]}
        />

        {/* UETK rivers — bold blue line. Rendered first so lake fills sit on top. */}
        {showWater && <GeoJSONSource id="uetk-rivers" data={UETK_RIVERS} onPress={handleUetkPress}>
          <Layer
            id="uetk-rivers-line"
            type="line"
            paint={{
              'line-color': WATER_STROKE,
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                7, 0.5,
                10, 1.5,
                13, 3,
              ] as unknown as number,
              'line-opacity': 0.95,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            id="uetk-rivers-selected"
            type="line"
            filter={adHocSelectedFilter}
            paint={{
              'line-color': SELECTED_RING,
              'line-width': 5,
              'line-opacity': 0.95,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            id="uetk-rivers-label"
            type="symbol"
            minzoom={9}
            layout={{
              'symbol-placement': 'line',
              'text-field': ['get', 'name'] as unknown as string,
              'text-font': ['Noto Sans Italic'],
              'text-size': 11,
              'text-letter-spacing': 0.05,
            }}
            paint={{
              'text-color': NAME_COLOR,
              'text-halo-color': '#f3f4f1',
              'text-halo-width': 1.5,
            }}
          />
        </GeoJSONSource>}

        {/* UETK lakes — bold blue fill + darker outline. */}
        {showWater && <GeoJSONSource id="uetk-lakes" data={UETK_LAKES} onPress={handleUetkPress}>
          <Layer
            id="uetk-lakes-fill"
            type="fill"
            paint={{
              'fill-color': WATER_FILL,
              'fill-opacity': 0.9,
            }}
          />
          <Layer
            id="uetk-lakes-outline"
            type="line"
            paint={{
              'line-color': WATER_STROKE,
              'line-width': 2.5,
              'line-opacity': 0.95,
            }}
          />
          <Layer
            id="uetk-lakes-selected"
            type="line"
            filter={adHocSelectedFilter}
            paint={{
              'line-color': SELECTED_RING,
              'line-width': 3.5,
              'line-opacity': 1,
            }}
          />
          <Layer
            id="uetk-lakes-label"
            type="symbol"
            minzoom={8}
            layout={{
              'text-field': ['get', 'name'] as unknown as string,
              'text-font': ['Noto Sans Italic'],
              'text-size': 12,
              'text-anchor': 'center',
            }}
            paint={{
              'text-color': NAME_COLOR,
              'text-halo-color': '#ffffff',
              'text-halo-width': 1.6,
            }}
          />
        </GeoJSONSource>}

        {/* User location dot */}
        {userLocation && (
          <GeoJSONSource
            id="user-location"
            data={{
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [userLocation.lng, userLocation.lat] },
                properties: {},
              }],
            }}
          >
            <Layer
              id="user-location-halo"
              type="circle"
              paint={{
                'circle-radius': 14,
                'circle-color': '#3b82f6',
                'circle-opacity': 0.18,
              }}
            />
            <Layer
              id="user-location-ring"
              type="circle"
              paint={{
                'circle-radius': 9,
                'circle-color': '#ffffff',
                'circle-opacity': 1,
              }}
            />
            <Layer
              id="user-location-dot"
              type="circle"
              paint={{
                'circle-radius': 6,
                'circle-color': '#3b82f6',
                'circle-opacity': 1,
              }}
            />
          </GeoJSONSource>
        )}

        {/* Long-press pin marker */}
        {pinCoord && (
          <Marker
            id="long-press-pin"
            lngLat={[pinCoord.lng, pinCoord.lat]}
            anchor="bottom"
          >
            <View style={pin.wrap}>
              <View style={pin.head} />
              <View style={pin.tail} />
            </View>
          </Marker>
        )}

      </Map>
    </View>
  );
}

const PIN_COLOR = '#0f382c';
const pin = StyleSheet.create({
  wrap: { alignItems: 'center', width: 28 },
  head: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PIN_COLOR,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: PIN_COLOR,
    marginTop: -2,
  },
});
