import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DetailScreen } from '../../src/screens/DetailScreen';
import { resolveWaterBody, type WaterTileProps } from '../../src/data/waterbodies';
import { theme } from '../../src/theme/colors';

type Params = {
  id: string;
  name?: string;
  name_lt?: string;
  name_en?: string;
  cls?: string;
  osm_id?: string;
  kadastro_id?: string;
  lat?: string;
  lng?: string;
  area?: string;
};

function pickString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function pickNumber(v: string | string[] | undefined): number | undefined {
  const s = pickString(v);
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default function WaterBodyRoute() {
  const params = useLocalSearchParams<Params>();
  const id = pickString(params.id) ?? '';

  const tileProps: WaterTileProps | undefined =
    id.startsWith('uetk:') || id.startsWith('osm:') || id.startsWith('wb:')
      ? {
          name: pickString(params.name),
          name_lt: pickString(params.name_lt),
          name_en: pickString(params.name_en),
          class: pickString(params.cls),
          osm_id: pickString(params.osm_id),
          kadastro_id: pickString(params.kadastro_id),
          lat: pickNumber(params.lat),
          lng: pickNumber(params.lng),
          area: pickNumber(params.area),
        }
      : undefined;

  const waterbody = resolveWaterBody(id, tileProps);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <DetailScreen id={id} waterbody={waterbody} />
    </SafeAreaView>
  );
}
