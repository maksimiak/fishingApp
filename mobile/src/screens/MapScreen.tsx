import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Alert, Keyboard, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme, shadows, fonts } from '../theme/colors';
import {
  makeAdHocWaterBodyId,
  resolveWaterBody,
  type WaterTileProps,
} from '../data/waterbodies';
import type { WaterBody } from '../data/types';
import { SPECIES } from '../data/species';
import { getStatus, daysUntil, isInClosedSeason } from '../data/rules';
import {
  LithuaniaMapReal,
  type LithuaniaMapRealHandle,
  type UetkTapInfo,
} from '../components/LithuaniaMapReal';
import { StatusChip } from '../components/StatusChip';
import { IconChevron, IconSearch, IconLocation, IconX, IconLayers } from '../components/Icons';
import { searchUetk, type UetkRecord } from '../data/uetkIndex';
import type { CopyDict } from '../data/copy';

const MONTH_ABB_LT = ['SAUS', 'VAS', 'KOV', 'BAL', 'GEG', 'BIRŽ', 'LIEP', 'RUGP', 'RUGS', 'SPAL', 'LAPKR', 'GRUOD'];
const MONTH_ABB_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function fmtEyebrow(date: Date, lang: 'lt' | 'en'): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const abb = lang === 'lt' ? MONTH_ABB_LT[date.getMonth()] : MONTH_ABB_EN[date.getMonth()];
  return `${y}-${m}-${d} · ${abb}.`;
}

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
    if (wb.avgDepthM != null) params.avg_depth_m = String(wb.avgDepthM);
    if (wb.maxDepthM != null) params.max_depth_m = String(wb.maxDepthM);
    if (wb.shorelineKm != null) params.shoreline_km = String(wb.shorelineKm);
    if (wb.leased != null) params.leased = wb.leased ? '1' : '0';
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
    avgDepthM: 'avgDepthM' in rec ? rec.avgDepthM : undefined,
    maxDepthM: 'maxDepthM' in rec ? rec.maxDepthM : undefined,
    shorelineKm: 'shorelineKm' in rec ? rec.shorelineKm : undefined,
  };
  const id = makeAdHocWaterBodyId(props);
  const wb = resolveWaterBody(id, props);
  return wb!;
}


export function MapScreen() {
  const { t, lang, date } = useApp();
  const router = useRouter();
  const [selected, setSelected] = useState<WaterBody | null>(null);
  const [pinCoord, setPinCoord] = useState<{ lng: number; lat: number } | null>(null);
  const [query, setQuery] = useState('');

  const [userLocation, setUserLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [showWater, setShowWater] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showLongPressHint, setShowLongPressHint] = useState(false);
  const mapHandleRef = useRef<LithuaniaMapRealHandle | null>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('map_longpress_hinted').then((val) => {
      if (!val) setShowLongPressHint(true);
    });
  }, []);

  const dismissLongPressHint = () => {
    setShowLongPressHint(false);
    AsyncStorage.setItem('map_longpress_hinted', '1');
  };

  const status = selected ? getStatus(selected, date) : null;

  // Hero stats always use real today, not the calendar-selected date
  const heroStats = useMemo(() => {
    const today = new Date();
    const closedSpecies: string[] = [];
    let minDays = Infinity;
    let minSpeciesName = '';
    for (const sp of SPECIES) {
      const closed = isInClosedSeason(today, sp.closedSeason) ||
        (sp.closedSeason2 != null && isInClosedSeason(today, sp.closedSeason2));
      if (closed) {
        closedSpecies.push(lang === 'lt' ? sp.nameLt : sp.nameEn);
      } else if (sp.closedSeason) {
        const allWindows = sp.closedSeason2
          ? [sp.closedSeason, sp.closedSeason2]
          : [sp.closedSeason];
        const nearest = allWindows.reduce((best, w) =>
          daysUntil(today, w[0][0], w[0][1]) < daysUntil(today, best[0][0], best[0][1]) ? w : best
        );
        const [startM, startD] = nearest[0];
        const d = daysUntil(today, startM, startD);
        if (d < minDays) {
          minDays = d;
          minSpeciesName = (lang === 'lt' ? sp.nameLt : sp.nameEn).toUpperCase();
        }
      }
    }
    const openCount = SPECIES.length - closedSpecies.length;
    return { openCount, total: SPECIES.length, closedSpecies, minDays: minDays === Infinity ? null : minDays, minSpeciesName };
  }, [date, lang]);

  const locateMe = async () => {
    if (locating) return;
    if (userLocation) {
      mapHandleRef.current?.flyTo(userLocation.lng, userLocation.lat, 13);
      return;
    }
    setLocating(true);
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        Alert.alert(
          lang === 'lt' ? 'Reikalingas leidimas' : 'Permission needed',
          lang === 'lt'
            ? 'Leiskite programėlei naudoti jūsų vietą nustatymuose.'
            : 'Allow FisherMap to use your location in Settings.',
        );
        return;
      }
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        const loc = { lng: last.coords.longitude, lat: last.coords.latitude };
        setUserLocation(loc);
        mapHandleRef.current?.flyTo(loc.lng, loc.lat, 13);
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const loc = { lng: pos.coords.longitude, lat: pos.coords.latitude };
      setUserLocation(loc);
      mapHandleRef.current?.flyTo(loc.lng, loc.lat, 13);
    } finally {
      setLocating(false);
    }
  };

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


  const eyebrow = fmtEyebrow(new Date(), lang);
  const title = lang === 'lt' ? 'Lietuvos vandenys' : 'Lithuanian waters';

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>{eyebrow}</Text>
          <Text style={s.title}>{title}</Text>
        </View>
      </View>

      {/* Today hero */}
      <View style={s.heroWrap}>
        <View style={s.hero}>
          <View style={s.heroLeft}>
            <Text style={s.heroLabel}>
              {lang === 'lt' ? 'RŪŠYS ATVIROS ŠIANDIEN' : 'SPECIES OPEN TODAY'}
            </Text>
            <View style={s.heroStatRow}>
              <Text style={s.heroStat}>{heroStats.openCount}</Text>
              <Text style={s.heroStatSub}> / {heroStats.total} {lang === 'lt' ? 'rūšių' : 'species'}</Text>
            </View>
          </View>
          {heroStats.minDays !== null && (
            <>
              <View style={s.heroDivider} />
              <View style={s.heroRight}>
                <Text style={s.heroRightStat}>{heroStats.minDays}</Text>
                <Text style={s.heroLabel}>
                  {lang === 'lt' ? `DIENOS IKI\n${heroStats.minSpeciesName}` : `DAYS TO\n${heroStats.minSpeciesName}`}
                </Text>
              </View>
            </>
          )}
        </View>
        {heroStats.closedSpecies.length > 0 && (
          <Text style={s.heroFooter} numberOfLines={2}>
            {lang === 'lt' ? 'Draudžiama: ' : 'Closed: '}
            <Text style={{ fontWeight: '700', color: '#ffffff' }}>
              {heroStats.closedSpecies.slice(0, 3).join(', ')}
              {heroStats.closedSpecies.length > 3 ? ` +${heroStats.closedSpecies.length - 3}` : ''}
            </Text>
          </Text>
        )}
      </View>

      {/* Search */}
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
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <IconX color={theme.inkSubtle} size={16} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={[s.locateRoundel, locating && { opacity: 0.6 }]}
          onPress={locateMe}
          hitSlop={8}
        >
          <IconLocation color={userLocation ? '#3b82f6' : theme.primary} size={20} />
        </Pressable>
      </View>


      {/* Search results dropdown */}
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

      {/* Map panel */}
      <View style={s.mapWrap}>
        <LithuaniaMapReal
          onSelectUetk={(info) => {
            if (!info) return;
            setPinCoord(null);
            setSelected(uetkToWaterBody(info));
          }}
          onMapLongPress={(lng, lat) => {
            setSelected(null);
            setPinCoord({ lng, lat });
            dismissLongPressHint();
          }}
          mapHandleRef={mapHandleRef}
          userLocation={userLocation}
          pinCoord={pinCoord}
          showWater={showWater}
        />
        {keyboardVisible && (
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => Keyboard.dismiss()}
            accessible={false}
          />
        )}
        <Pressable
          style={[s.mapBtn, s.mapBtnLayers, showWater && s.mapBtnActive]}
          onPress={() => setShowWater((v) => !v)}
          hitSlop={8}
        >
          <IconLayers color={showWater ? theme.primary : theme.inkMuted} size={18} />
        </Pressable>
      </View>

      {/* Long-press hint */}
      {showLongPressHint && !pinCoord && !selected && (
        <View style={s.hintCard}>
          <Text style={s.hintIcon}>👆</Text>
          <Text style={s.hintText}>
            {lang === 'lt' ? 'Ilgai paspauskite žemėlapį, kad pridėtumėte žymeklį' : 'Long press the map to drop a pin'}
          </Text>
          <Pressable onPress={dismissLongPressHint} hitSlop={8} style={s.hintClose}>
            <IconX color={theme.inkSubtle} size={14} />
          </Pressable>
        </View>
      )}

      {/* Pin action sheet */}
      {pinCoord && !selected && (
        <View style={s.pinSheet}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={s.pinEyebrow}>{lang === 'lt' ? 'PAŽYMĖTA VIETA' : 'PINNED LOCATION'}</Text>
            <Pressable onPress={() => setPinCoord(null)} hitSlop={8} style={s.pinClose}>
              <IconX color={theme.inkMuted} size={14} />
            </Pressable>
          </View>
          <Text style={s.pinCoords}>
            {pinCoord.lat.toFixed(5)}°, {pinCoord.lng.toFixed(5)}°
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Pressable
              style={[s.pinBtn, { backgroundColor: theme.primary }]}
              onPress={() =>
                Linking.openURL(
                  `https://maps.google.com/?q=${pinCoord.lat.toFixed(5)},${pinCoord.lng.toFixed(5)}`,
                ).catch(() => {})
              }
            >
              <Text style={[s.pinBtnText, { color: '#fff' }]}>Google Maps</Text>
            </Pressable>
            <Pressable
              style={[s.pinBtn, { backgroundColor: theme.surfaceAlt, flex: 1 }]}
              onPress={() =>
                Clipboard.setStringAsync(`${pinCoord.lat.toFixed(5)}, ${pinCoord.lng.toFixed(5)}`)
              }
            >
              <Text style={[s.pinBtnText, { color: theme.ink }]}>{lang === 'lt' ? 'Kopijuoti' : 'Copy'}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Selected body sheet */}
      {selected && status && (
        <View style={s.sheet}>
          <View style={{ flex: 1 }}>
            <Text style={s.sheetName} numberOfLines={1}>
              {(lang === 'lt' ? selected.nameLt : selected.nameEn) || hintForType(selected.type, t)}
            </Text>
            <Text style={s.sheetMeta} numberOfLines={1}>
              {[
                selected.kadastroId,
                (lang === 'lt' ? selected.region?.lt : selected.region?.en),
                (lang === 'lt' ? (selected.type === 'river' ? 'UPĖS' : selected.type === 'lagoon' ? 'MARIOS' : selected.type === 'reservoir' ? 'TVENKINYS' : 'EŽERAS') : selected.type?.toUpperCase()),
              ].filter(Boolean).join(' · ')}
            </Text>
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <StatusChip status={status.status} size="sm" />
              {selected.area > 0 && (
                <Text style={s.sheetMetric}>
                  <Text style={s.sheetMetricVal}>{selected.area.toFixed(0)}</Text>
                  <Text style={s.sheetMetricLabel}> ha</Text>
                </Text>
              )}
            </View>
          </View>
          <Pressable style={s.openBtn} onPress={openDetail}>
            <Text style={s.openBtnText}>
              {lang === 'lt' ? 'Atidaryti' : 'Open'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.mono,
    color: theme.inkMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.ink,
    letterSpacing: -0.7,
    marginTop: 2,
    lineHeight: 34,
  },
  // Hero
  heroWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: theme.primary,
    borderRadius: 24,
    padding: 16,
    ...shadows.raised,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLeft: { flex: 1 },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.primaryLabel,
  },
  heroStatRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  heroStat: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.statGreen,
    letterSpacing: -0.64,
    lineHeight: 36,
  },
  heroStatSub: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    color: theme.primaryLabel,
    marginLeft: 2,
  },
  heroDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginHorizontal: 16,
  },
  heroRight: { alignItems: 'flex-end' },
  heroRightStat: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.statMint,
    lineHeight: 28,
  },
  heroFooter: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    color: theme.primaryFixed,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
  },

  // Search row
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    backgroundColor: theme.card,
    borderColor: theme.cardBorder,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  searchInput: { flex: 1, color: theme.ink, fontSize: 14, fontWeight: '500', fontFamily: fonts.sansMedium, padding: 0 },
  locateRoundel: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: theme.card,
    borderColor: theme.cardBorder,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },

  // Search results
  searchResults: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    borderBottomColor: theme.divider,
  },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: theme.primary },
  searchName: { fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink },
  searchRegion: { fontSize: 11, fontFamily: fonts.sans, color: theme.inkSubtle },

  // Map panel
  mapWrap: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.cardBorder,
    backgroundColor: theme.surfaceAlt,
    minHeight: 150,
  },
  mapBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  mapBtnLayers: { bottom: 10 },
  mapBtnActive: { borderColor: theme.primary, backgroundColor: theme.openBg },

  // Selected body sheet card
  sheet: {
    margin: 16,
    marginTop: 12,
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 16,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadows.raised,
  },
  sheetName: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.ink,
    letterSpacing: -0.44,
    lineHeight: 28,
  },
  sheetMeta: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.mono,
    color: theme.inkMuted,
    letterSpacing: 0.44,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  sheetMetric: { flexDirection: 'row', alignItems: 'baseline' },
  sheetMetricVal: { fontSize: 14, fontWeight: '700', fontFamily: fonts.sansBold, color: theme.ink },
  sheetMetricLabel: { fontSize: 12, fontFamily: fonts.sans, color: theme.inkMuted },
  openBtn: {
    height: 44,
    paddingHorizontal: 18,
    backgroundColor: theme.primary,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openBtnText: { fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: '#ffffff' },

  // Long-press hint
  hintCard: {
    margin: 16,
    marginTop: 12,
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...shadows.card,
  },
  hintIcon: { fontSize: 20, lineHeight: 26 },
  hintText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.sansMedium,
    color: theme.inkMuted,
    lineHeight: 18,
  },
  hintClose: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Pin action sheet
  pinSheet: {
    margin: 16,
    marginTop: 12,
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 16,
    ...shadows.raised,
  },
  pinEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: 0.66,
    color: theme.primary,
    textTransform: 'uppercase',
  },
  pinClose: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCoords: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.mono,
    color: theme.ink,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  pinBtn: {
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  pinBtnText: { fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold },
});
