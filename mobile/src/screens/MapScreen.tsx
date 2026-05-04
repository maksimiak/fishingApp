import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme } from '../theme/colors';
import {
  makeAdHocWaterBodyId,
  resolveWaterBody,
  type WaterTileProps,
} from '../data/waterbodies';
import type { WaterBody } from '../data/types';
import { getStatus, fmtFullDate } from '../data/rules';
import {
  LithuaniaMapReal,
  type LithuaniaMapRealHandle,
  type UetkTapInfo,
} from '../components/LithuaniaMapReal';
import { StatusChip } from '../components/StatusChip';
import { IconChevron, IconSearch, IconLocation, IconX } from '../components/Icons';
import { searchUetk, type UetkRecord } from '../data/uetkIndex';
import type { CopyDict } from '../data/copy';

function hintForType(type: WaterBody['type'], t: CopyDict): string {
  if (type === 'river') return t.hintRiver;
  if (type === 'reservoir') return t.hintReservoir;
  if (type === 'lagoon') return t.hintLagoon;
  return t.hintLake;
}

function buildNavParams(wb: WaterBody): Record<string, string> {
  const params: Record<string, string> = { id: wb.id };
  if (wb.curated === false) {
    if (wb.nameLt) params.name_lt = wb.nameLt;
    if (wb.nameEn) params.name_en = wb.nameEn;
    if (wb.nameLt || wb.nameEn) params.name = wb.nameLt || wb.nameEn;
    params.cls = wb.type;
    if (wb.lat) params.lat = String(wb.lat);
    if (wb.lng) params.lng = String(wb.lng);
    if (wb.area > 0) params.area = String(wb.area);
    if (wb.id.startsWith('uetk:')) params.kadastro_id = wb.id.slice(5);
    else if (wb.id.startsWith('osm:')) params.osm_id = wb.id.slice(4);
  }
  return params;
}

function uetkToWaterBody(rec: UetkRecord | UetkTapInfo): WaterBody {
  const props: WaterTileProps = {
    name: rec.name,
    name_lt: rec.name,
    name_en: rec.name,
    class: rec.kind === 'river' ? 'river' : rec.kind === 'lagoon' ? 'lagoon' : rec.kind === 'reservoir' ? 'reservoir' : 'lake',
    kadastro_id: 'kadastroId' in rec ? rec.kadastroId : rec.id,
    lat: rec.lat,
    lng: rec.lng,
    area: rec.area ?? undefined,
  };
  const id = makeAdHocWaterBodyId(props);
  const wb = resolveWaterBody(id, props);
  return wb!;
}

export function MapScreen() {
  const { t, lang, date } = useApp();
  const router = useRouter();
  const [selected, setSelected] = useState<WaterBody | null>(null);
  const [query, setQuery] = useState('');
  const mapHandleRef = useRef<LithuaniaMapRealHandle | null>(null);

  const status = selected ? getStatus(selected, date) : null;

  const searchHits = useMemo<{ id: string; name: string; subtitle: string; pick: () => void }[]>(() => {
    const q = query.trim();
    if (q.length === 0) return [];
    const out: { id: string; name: string; subtitle: string; pick: () => void }[] = [];
    if (q.length >= 2) {
      for (const rec of searchUetk(q, 8)) {
        out.push({
          id: rec.id,
          name: rec.name,
          subtitle: hintForType(rec.kind === 'river' ? 'river' : 'lake', t),
          pick: () => {
            const wb = uetkToWaterBody(rec);
            setSelected(wb);
            mapHandleRef.current?.flyTo(rec.lng, rec.lat, rec.kind === 'river' ? 10 : 11.5);
            setQuery('');
          },
        });
      }
    }
    return out;
  }, [query, lang, t]);

  const openDetail = () => {
    if (!selected) return;
    const { id, ...rest } = buildNavParams(selected);
    router.push({ pathname: '/waterbody/[id]', params: { id, ...rest } });
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.eyebrow}>{fmtFullDate(date, lang)}</Text>
        <Text style={s.title}>{lang === 'lt' ? 'Lietuvos vandenys' : 'Lithuanian waters'}</Text>
      </View>

      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <IconSearch color={theme.inkSubtle} size={18} />
          <TextInput
            placeholder={t.search}
            placeholderTextColor={theme.inkSubtle}
            value={query}
            onChangeText={setQuery}
            style={s.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <IconX color={theme.inkSubtle} size={16} />
            </Pressable>
          )}
        </View>
      </View>

      {query.length > 0 && (
        <View style={s.searchResults}>
          {searchHits.map((hit, i) => (
            <Pressable
              key={`${hit.id}-${i}`}
              onPress={hit.pick}
              style={[s.searchRow, { borderBottomWidth: i < searchHits.length - 1 ? 1 : 0 }]}
            >
              <View style={s.dot} />
              <View style={{ flex: 1 }}>
                <Text style={s.searchName} numberOfLines={1}>{hit.name}</Text>
                <Text style={s.searchRegion} numberOfLines={1}>{hit.subtitle}</Text>
              </View>
              <IconChevron color={theme.inkSubtle} size={14} />
            </Pressable>
          ))}
          {searchHits.length === 0 && (
            <View style={{ padding: 14 }}>
              <Text style={{ color: theme.inkSubtle, textAlign: 'center', fontSize: 13 }}>
                {lang === 'lt' ? 'Nieko nerasta' : 'No results'}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={s.mapWrap}>
        <LithuaniaMapReal
          onSelectUetk={(info) => {
            if (!info) return;
            setSelected(uetkToWaterBody(info));
          }}
          mapHandleRef={mapHandleRef}
        />
      </View>

      {selected && status && (
        <Pressable style={s.selectedCard} onPress={openDetail}>
          <View style={s.selectedIconBox}>
            <IconLocation color={theme.accent} size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.selectedName} numberOfLines={1}>
              {(lang === 'lt' ? selected.nameLt : selected.nameEn) || hintForType(selected.type, t)}
            </Text>
            <Text style={s.selectedRegion} numberOfLines={1}>
              {(lang === 'lt' ? selected.region.lt : selected.region.en) || hintForType(selected.type, t)}
            </Text>
            <View style={{ marginTop: 6 }}>
              <StatusChip status={status.status} size="sm" />
            </View>
          </View>
          <IconChevron color={theme.inkSubtle} size={14} />
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  eyebrow: { fontSize: 11, color: theme.inkSubtle, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', color: theme.ink, marginTop: 2 },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.card,
    borderColor: theme.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchInput: { flex: 1, color: theme.ink, fontSize: 14, padding: 0 },
  searchResults: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    borderBottomColor: theme.divider,
  },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: theme.accent },
  searchName: { fontSize: 14, fontWeight: '500', color: theme.ink },
  searchRegion: { fontSize: 11, color: theme.inkSubtle },
  mapWrap: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.cardBorder,
    backgroundColor: theme.card,
    minHeight: 280,
  },
  selectedCard: {
    margin: 12,
    marginTop: 10,
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedName: { fontSize: 15, fontWeight: '600', color: theme.ink },
  selectedRegion: { fontSize: 11, color: theme.inkSubtle, marginTop: 1 },
});
