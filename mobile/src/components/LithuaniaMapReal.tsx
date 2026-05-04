import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Map, Camera, GeoJSONSource, Layer, type MapRef, type CameraRef, type PressEventWithFeatures } from '@maplibre/maplibre-react-native';
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

const WATER_BLUE = '#2b6cb0';
const WATER_BLUE_DARK = '#1a4f87';
const NAME_COLOR = '#1a4f87';
const SELECTED_RING = '#ffffff';

export interface UetkTapInfo {
  id: string;            // 'uetk:<kadastro_id>'
  kadastroId: string;
  name: string;
  kind: 'lake' | 'reservoir' | 'lagoon' | 'pond' | 'river';
  lng: number;
  lat: number;
  area?: number | null;  // area_ha for lakes, length_km for rivers
}

export interface LithuaniaMapRealHandle {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
}

interface Props {
  onSelectUetk?: (info: UetkTapInfo | null) => void;
  mapHandleRef?: React.RefObject<LithuaniaMapRealHandle | null>;
}

const UETK_LAKES = uetkLakesGeoJson as unknown as GeoJSON.FeatureCollection;
const UETK_RIVERS = uetkRiversGeoJson as unknown as GeoJSON.FeatureCollection;

function uetkTapInfo(feature: GeoJSON.Feature): UetkTapInfo | null {
  const p = feature.properties as
    | { id?: string; name?: string; kind?: string; lng?: number; lat?: number; area_ha?: number; length_km?: number }
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
  };
}

export function LithuaniaMapReal({ onSelectUetk, mapHandleRef }: Props) {
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
        <GeoJSONSource id="uetk-rivers" data={UETK_RIVERS} onPress={handleUetkPress}>
          <Layer
            id="uetk-rivers-line"
            type="line"
            paint={{
              'line-color': WATER_BLUE,
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
              'text-halo-color': '#ffffff',
              'text-halo-width': 1.4,
            }}
          />
        </GeoJSONSource>

        {/* UETK lakes — bold blue fill + darker outline. */}
        <GeoJSONSource id="uetk-lakes" data={UETK_LAKES} onPress={handleUetkPress}>
          <Layer
            id="uetk-lakes-fill"
            type="fill"
            paint={{
              'fill-color': WATER_BLUE,
              'fill-opacity': 0.85,
            }}
          />
          <Layer
            id="uetk-lakes-outline"
            type="line"
            paint={{
              'line-color': WATER_BLUE_DARK,
              'line-width': 1.2,
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
        </GeoJSONSource>

      </Map>
    </View>
  );
}
