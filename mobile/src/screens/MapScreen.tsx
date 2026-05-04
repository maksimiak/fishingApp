import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
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
  const [searchFocused, setSearchFocused] = useState(false);
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
            setSearchFocused(false);
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

  const SearchBarBackground = Platform.OS === 'ios' ? BlurView : View;
  const searchBarBgProps = Platform.OS === 'ios' 
    ? { intensity: 60, tint: 'light' as const }
    : {};

  return (
    <View style={s.root}>
      {/* Floating Header */}
      <View style={s.header}>
        <View style={s.headerContent}>
          <Text style={s.eyebrow}>{fmtFullDate(date, lang)}</Text>
          <Text style={s.title}>{lang === 'lt' ? 'Lietuvos vandenys' : 'Lithuanian waters'}</Text>
        </View>
      </View>

      {/* Floating Search Bar */}
      <View style={s.searchWrap}>
        <SearchBarBackground 
          {...searchBarBgProps}
          style={[
            s.searchBar,
            searchFocused && s.searchBarFocused,
            Platform.OS !== 'ios' && s.searchBarAndroid,
          ]}
        >
          <IconSearch color={searchFocused ? theme.accent : theme.inkSubtle} size={18} />
          <TextInput
            placeholder={t.search}
            placeholderTextColor={theme.inkSubtle}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={s.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable 
              onPress={() => setQuery('')} 
              hitSlop={12}
              style={s.clearButton}
            >
              <IconX color={theme.inkMuted} size={14} />
            </Pressable>
          )}
        </SearchBarBackground>
      </View>

      {/* Search Results Dropdown */}
      {query.length > 0 && (
        <View style={s.searchResults}>
          {searchHits.map((hit, i) => (
            <Pressable
              key={`${hit.id}-${i}`}
              onPress={hit.pick}
              style={({ pressed }) => [
                s.searchRow,
                { borderBottomWidth: i < searchHits.length - 1 ? 1 : 0 },
                pressed && s.searchRowPressed,
              ]}
            >
              <View style={s.dot} />
              <View style={s.searchRowContent}>
                <Text style={s.searchName} numberOfLines={1}>{hit.name}</Text>
                <Text style={s.searchRegion} numberOfLines={1}>{hit.subtitle}</Text>
              </View>
              <IconChevron color={theme.inkSubtle} size={12} />
            </Pressable>
          ))}
          {searchHits.length === 0 && (
            <View style={s.noResults}>
              <Text style={s.noResultsText}>
                {lang === 'lt' ? 'Nieko nerasta' : 'No results'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Map Container */}
      <View style={s.mapWrap}>
        <LithuaniaMapReal
          onSelectUetk={(info) => {
            if (!info) return;
            setSelected(uetkToWaterBody(info));
          }}
          mapHandleRef={mapHandleRef}
        />
      </View>

      {/* Selected Water Body Card */}
      {selected && status && (
        <Pressable 
          style={({ pressed }) => [s.selectedCard, pressed && s.selectedCardPressed]} 
          onPress={openDetail}
        >
          <View style={s.selectedIconBox}>
            <IconLocation color={theme.accent} size={22} />
          </View>
          <View style={s.selectedContent}>
            <Text style={s.selectedName} numberOfLines={1}>
              {(lang === 'lt' ? selected.nameLt : selected.nameEn) || hintForType(selected.type, t)}
            </Text>
            <Text style={s.selectedRegion} numberOfLines={1}>
              {(lang === 'lt' ? selected.region.lt : selected.region.en) || hintForType(selected.type, t)}
            </Text>
            <View style={s.statusRow}>
              <StatusChip status={status.status} size="sm" />
            </View>
          </View>
          <View style={s.chevronWrap}>
            <IconChevron color={theme.inkMuted} size={14} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: theme.bg,
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 12,
  },
  headerContent: {
    gap: 2,
  },
  eyebrow: { 
    fontSize: 12, 
    color: theme.accent, 
    letterSpacing: 0.5, 
    textTransform: 'uppercase', 
    fontWeight: '600',
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: theme.ink, 
    letterSpacing: -0.5,
  },
  searchWrap: { 
    paddingHorizontal: 20, 
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchBarAndroid: {
    backgroundColor: theme.surface,
  },
  searchBarFocused: {
    borderColor: theme.accent,
    borderWidth: 1.5,
  },
  searchInput: { 
    flex: 1, 
    color: theme.ink, 
    fontSize: 15, 
    padding: 0,
    fontWeight: '400',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResults: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    borderBottomColor: theme.borderLight,
  },
  searchRowPressed: {
    backgroundColor: theme.surfaceAlt,
  },
  searchRowContent: {
    flex: 1,
    gap: 2,
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: theme.accent,
  },
  searchName: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: theme.ink,
  },
  searchRegion: { 
    fontSize: 12, 
    color: theme.inkMuted,
  },
  noResults: {
    paddingVertical: 20,
    paddingHorizontal: 14,
  },
  noResultsText: {
    color: theme.inkMuted,
    textAlign: 'center',
    fontSize: 14,
  },
  mapWrap: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    minHeight: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  selectedCard: {
    margin: 20,
    marginTop: 16,
    marginBottom: 120, // Space for floating tab bar
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  selectedCardPressed: {
    backgroundColor: theme.surfaceAlt,
    transform: [{ scale: 0.98 }],
  },
  selectedIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedContent: {
    flex: 1,
    gap: 2,
  },
  selectedName: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: theme.ink,
    letterSpacing: -0.2,
  },
  selectedRegion: { 
    fontSize: 13, 
    color: theme.inkMuted,
  },
  statusRow: {
    marginTop: 8,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
