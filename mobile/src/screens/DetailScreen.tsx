import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Image } from 'react-native';
import { LakeDepthMap } from '../components/LakeDepthMap';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme, fonts } from '../theme/colors';
import { SPECIES } from '../data/species';
import { getStatus, getEffectiveSpeciesRule, getForecast, monthDays, fmtDate } from '../data/rules';
import { StatusChip } from '../components/StatusChip';
import { FishIcon } from '../components/FishIcon';
import type { WaterBody } from '../data/types';
import { BOAT_SPOTS } from '../data/boatSpots';
import { STOCKING } from '../data/stocking';
import BATHY_IDS from '../data/bathymetry-ids.json';
import { FISH_IMAGES } from '../data/fishImages';
import {
  IconBack,
  IconBookmark,
  IconBookmarkFill,
  IconShare,
  IconCheck,
  IconX,
  IconChevron,
  IconThermo,
  IconWind,
  IconCalendar,
} from '../components/Icons';

const BATHY_SET = new Set<string>(BATHY_IDS as string[]);

// Maps Lithuanian stocking fish names → species IDs used in this app
const STOCKING_NAME_TO_SPECIES: Record<string, string> = {
  lydekos: 'pike',
  sterkai: 'zander',
  lynai: 'tench',
  karpiai: 'carp',
  unguriai: 'eel',
  'vėgėlės': 'burbot',
  'šamai': 'catfish',
  'lašišos': 'salmon',
  'šlakiai': 'sea-trout',
  'margieji upėtakiai': 'trout',
  sykai: 'whitefish',
};

function speciesFromStocking(kadastroId: string): string[] {
  const entry = STOCKING[kadastroId];
  if (!entry) return [];
  const ids = new Set<string>();
  Object.values(entry.byYear).forEach((fishList) =>
    fishList.forEach((f) => {
      const id = STOCKING_NAME_TO_SPECIES[f.fish];
      if (id) ids.add(id);
    }),
  );
  return [...ids];
}

type Tab = 'biting' | 'rules' | 'info' | 'weather' | 'depth';

interface DetailScreenProps {
  id: string;
  waterbody?: WaterBody | null;
}

export function DetailScreen({ id, waterbody: passedWb }: DetailScreenProps) {
  const { t, lang, date, isSaved, toggleSave } = useApp();
  const router = useRouter();
  const baseWb = passedWb ?? null;
  const [tab, setTab] = useState<Tab>('biting');

  const waterbody = useMemo<WaterBody | null>(() => {
    if (!baseWb) return null;
    const kadastroId = baseWb.kadastroId ?? (baseWb.id.startsWith('uetk:') ? baseWb.id.slice(5) : null);
    const stockingSpecies = kadastroId ? speciesFromStocking(kadastroId) : [];
    return { ...baseWb, species: stockingSpecies };
  }, [baseWb]);

  if (!waterbody) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.ink }}>{t.notFound}</Text>
      </View>
    );
  }

  const status = getStatus(waterbody, date);
  const saved = isSaved(waterbody.id);
  const kadastroId = waterbody.id.startsWith('uetk:') ? waterbody.id.slice(5) : null;
  const hasBathy = kadastroId != null && BATHY_SET.has(kadastroId);
  const name = lang === 'lt' ? waterbody.nameLt : waterbody.nameEn;
  const rawRegion = lang === 'lt' ? waterbody.region.lt : waterbody.region.en;
  const region = rawRegion || (lang === 'lt' ? 'Lietuva' : 'Lithuania');
  const typeLabel =
    waterbody.type === 'lake'
      ? lang === 'lt' ? 'Ežeras' : 'Lake'
      : waterbody.type === 'river'
      ? lang === 'lt' ? 'Upė' : 'River'
      : waterbody.type === 'reservoir'
      ? lang === 'lt' ? 'Tvenkinys' : 'Reservoir'
      : lang === 'lt' ? 'Marios' : 'Lagoon';

  return (
    <View style={s.root}>
      {/* Top bar */}
      <View style={s.topbar}>
        <Pressable onPress={() => router.back()} style={s.iconBtn} hitSlop={6}>
          <IconBack color={theme.primary} size={20} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Pressable
            onPress={() => toggleSave(waterbody.id)}
            style={[s.iconBtn, saved && { backgroundColor: theme.accent }]}
            hitSlop={6}
          >
            {saved ? (
              <IconBookmarkFill color={theme.accentInk} size={20} />
            ) : (
              <IconBookmark color={theme.ink} size={20} />
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 16 }}>
          <Text style={s.eyebrow}>
            {region ? `${typeLabel} · ${region}` : typeLabel}
          </Text>
          <Text style={s.bigTitle}>
            {name || (lang === 'lt' ? 'Vandens telkinys' : 'Water body')}
          </Text>
          <View style={{ marginTop: 12 }}>
            <StatusChip status={status.status} size="lg" />
          </View>
        </View>


        {/* Tabs */}
        <View style={s.tabs}>
          {(
            [
              { id: 'biting' as Tab, label: t.tabBiting },
              { id: 'rules' as Tab, label: t.rules },
              { id: 'info' as Tab, label: t.tabInfo },
              { id: 'weather' as Tab, label: t.weather },
              ...(hasBathy ? [{ id: 'depth' as Tab, label: lang === 'lt' ? 'Gyliai' : 'Depths' }] : []),
            ]
          ).map((tb) => {
            const on = tab === tb.id;
            return (
              <Pressable
                key={tb.id}
                onPress={() => setTab(tb.id)}
                style={[s.tabBtn, on && { backgroundColor: theme.primary }]}
              >
                <Text style={[s.tabLabel, { color: on ? theme.card : theme.inkMuted }]}>{tb.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ padding: 12 }}>
          {tab === 'biting' && <BitingTab waterbody={waterbody} />}
          {tab === 'rules' && <RulesTab waterbody={waterbody} />}
          {tab === 'info' && <InfoTab waterbody={waterbody} typeLabel={typeLabel} />}
          {tab === 'weather' && <WeatherTab waterbodyId={waterbody.id} lat={waterbody.lat} lng={waterbody.lng} />}
          {tab === 'depth' && (
            <DepthTab waterbody={waterbody} lang={lang} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function BitingTab({ waterbody }: { waterbody: WaterBody }) {
  const { t, lang, date } = useApp();
  const router = useRouter();
  return (
    <View style={{ gap: 8 }}>
      <View style={{ paddingHorizontal: 2, paddingBottom: 4 }}>
        <Text style={s.sectionEyebrow}>{t.expectedSpecies}</Text>
      </View>
      {waterbody.species.length === 0 && (
        <View style={[s.speciesCard, { justifyContent: 'center' }]}>
          <Text style={{ fontSize: 13, color: theme.inkSubtle, textAlign: 'center', lineHeight: 20 }}>
            {lang === 'lt'
              ? 'Šiuo metu nėra informacijos apie tai, kokios žuvys čia galima sugauti.'
              : 'Currently there is no info on what you can catch here.'}
          </Text>
        </View>
      )}
      {waterbody.species.map((id) => {
        const sp = SPECIES.find((s) => s.id === id)!;
        const eff = getEffectiveSpeciesRule(id, waterbody.id, date);
        const open = eff.status === 'open';
        const minSize = eff.minSizeCm ?? sp.minSize;
        const bag = eff.dailyBagLimit !== null ? eff.dailyBagLimit : sp.bagLimit;
        return (
          <Pressable key={id} onPress={() => router.push(`/species/${id}`)} style={s.speciesCard}>
            <View style={[s.speciesThumb, FISH_IMAGES[id] ? { backgroundColor: theme.card } : null]}>
              {FISH_IMAGES[id] ? (
                <Image source={FISH_IMAGES[id]} style={{ width: 72, height: 44 }} resizeMode="contain" />
              ) : (
                <FishIcon species={sp} size={30} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.ink }}>
                  {lang === 'lt' ? sp.nameLt : sp.nameEn}
                </Text>
                <Text style={{ fontSize: 10, color: theme.inkSubtle, fontStyle: 'italic' }}>{sp.latin}</Text>
              </View>
              <Text style={{ fontSize: 11, color: theme.inkSubtle, marginTop: 2 }}>
                {lang === 'lt' ? sp.habitat.lt : sp.habitat.en}
              </Text>
              <Text style={{ fontSize: 11, color: theme.inkMuted, marginTop: 1 }}>
                {lang === 'lt' ? sp.bestBait.lt : sp.bestBait.en} · {lang === 'lt' ? sp.bestTime.lt : sp.bestTime.en}
              </Text>
              <Text style={{ fontSize: 11, color: theme.inkSubtle, marginTop: 2 }}>
                {t.minSize}: {minSize && minSize > 0 ? `${minSize} cm` : '—'} · {t.bagLimit}: {bag ?? t.noLimit}
              </Text>
            </View>
            <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: open ? theme.success : theme.danger }} />
          </Pressable>
        );
      })}
    </View>
  );
}

function RulesTab({ waterbody }: { waterbody: WaterBody }) {
  const { t, lang, date } = useApp();
  const router = useRouter();
  return (
    <View style={{ gap: 10 }}>
      {waterbody.species.map((id) => {
        const sp = SPECIES.find((s) => s.id === id)!;
        const eff = getEffectiveSpeciesRule(id, waterbody.id, date);
        const open = eff.status === 'open';
        const minSize = eff.minSizeCm ?? sp.minSize;
        const bag = eff.dailyBagLimit !== null ? eff.dailyBagLimit : sp.bagLimit;
        return (
          <Pressable key={id} onPress={() => router.push(`/species/${id}`)} style={s.speciesRow}>
            <View style={{ width: 44, height: 30, alignItems: 'center', justifyContent: 'center' }}>
              <FishIcon species={sp} size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.speciesName}>{lang === 'lt' ? sp.nameLt : sp.nameEn}</Text>
              <Text style={s.speciesMeta}>
                {t.minSize}: {minSize && minSize > 0 ? `${minSize} cm` : '—'} · {t.bagLimit}: {bag ?? t.noLimit}
              </Text>
            </View>
            <View style={[s.yesNo, { backgroundColor: open ? theme.successSoft : theme.dangerSoft }]}>
              {open ? <IconCheck color={theme.success} size={14} /> : <IconX color={theme.danger} size={14} />}
              <Text style={{ color: open ? theme.success : theme.danger, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                {open ? t.yes : t.no}
              </Text>
            </View>
          </Pressable>
        );
      })}

      {/* Season calendar */}
      <View style={{ marginTop: 4 }}>
        <Text style={[s.sectionEyebrow, { marginBottom: 8, paddingHorizontal: 2 }]}>{t.seasons}</Text>
        <CalendarView waterbody={waterbody} />
      </View>
    </View>
  );
}

function CalendarView({ waterbody }: { waterbody: WaterBody }) {
  const { t, lang, date, setDate } = useApp();
  const [viewMonth, setViewMonth] = useState(new Date(date.getFullYear(), date.getMonth(), 1));
  const cells = monthDays(viewMonth.getFullYear(), viewMonth.getMonth());
  const dayHeaders = lang === 'lt' ? ['P', 'A', 'T', 'K', 'Pn', 'Š', 'S'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const title =
    (lang === 'lt'
      ? ['sausis', 'vasaris', 'kovas', 'balandis', 'gegužė', 'birželis', 'liepa', 'rugpjūtis', 'rugsėjis', 'spalis', 'lapkritis', 'gruodis'][viewMonth.getMonth()]
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][viewMonth.getMonth()]) +
    ' ' +
    viewMonth.getFullYear();
  const go = (delta: number) => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));

  return (
    <View style={s.calendarBox}>
      <View style={s.calendarNav}>
        <Pressable onPress={() => go(-1)} style={{ padding: 6, transform: [{ rotate: '180deg' }] }}>
          <IconChevron color={theme.inkMuted} size={14} />
        </Pressable>
        <Text style={s.calendarTitle}>{title}</Text>
        <Pressable onPress={() => go(1)} style={{ padding: 6 }}>
          <IconChevron color={theme.inkMuted} size={14} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {dayHeaders.map((d, i) => (
          <View key={i} style={{ flex: 1, padding: 4 }}>
            <Text style={{ textAlign: 'center', fontSize: 10, color: theme.inkSubtle, fontWeight: '600' }}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={{ width: '14.28%', aspectRatio: 1 }} />;
          const st = getStatus(waterbody, d).status;
          const bg = st === 'open' ? theme.successSoft : theme.warningSoft;
          const fg = st === 'open' ? theme.success : theme.warning;
          const isSelected = d.toDateString() === date.toDateString();
          return (
            <View key={i} style={{ width: '14.28%', aspectRatio: 1, padding: 1.5 }}>
              <Pressable
                onPress={() => setDate(new Date(d))}
                style={{
                  flex: 1,
                  backgroundColor: bg,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? theme.ink : 'transparent',
                }}
              >
                <Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{d.getDate()}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        {[
          { c: theme.success, l: t.canFish },
          { c: theme.warning, l: t.partial },
        ].map((x, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 7, height: 7, backgroundColor: x.c, borderRadius: 2 }} />
            <Text style={{ fontSize: 10, color: theme.inkMuted }}>{x.l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DepthTab({ waterbody, lang }: { waterbody: WaterBody; lang: 'lt' | 'en' }) {
  const id = waterbody.id.startsWith('uetk:') ? waterbody.id.slice(5) : '';
  return (
    <View style={{ gap: 10 }}>
      <LakeDepthMap kadastroId={id} lang={lang} height={340} />
      <Text style={{ fontSize: 11, color: theme.inkSubtle, textAlign: 'center' }}>
        {lang === 'lt' ? 'Šaltinis: Aplinkos agentūra (AAD)' : 'Source: Environmental Agency (AAD)'}
      </Text>
    </View>
  );
}

function fmtN(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('lt-LT');
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function InfoTab({ waterbody, typeLabel }: { waterbody: WaterBody; typeLabel: string }) {
  const { t, lang } = useApp();
  const [stockingOpen, setStockingOpen] = useState(false);
  const lt = lang === 'lt';
  const regionText = lt ? waterbody.region.lt : waterbody.region.en;
  const kadastroId = waterbody.id.startsWith('uetk:') ? waterbody.id.slice(5) : null;
  const stockingEntry = kadastroId ? (STOCKING[kadastroId] ?? null) : null;
  const isRiver = waterbody.type === 'river';

  const boatSpots = kadastroId
    ? BOAT_SPOTS.filter((spot) => spot.uetkId === kadastroId)
    : [];

  // Measure tiles
  const measures: { value: string; unit: string; label: string }[] = [];
  if (waterbody.area > 0)
    measures.push({ value: String(waterbody.area), unit: isRiver ? 'km' : 'ha', label: lt ? (isRiver ? 'Ilgis' : 'Plotas') : (isRiver ? 'Length' : 'Area') });
  if (!isRiver && waterbody.avgDepthM != null)
    measures.push({ value: String(waterbody.avgDepthM), unit: 'm', label: lt ? 'Vid. gylis' : 'Avg depth' });
  if (!isRiver && waterbody.maxDepthM != null)
    measures.push({ value: String(waterbody.maxDepthM), unit: 'm', label: lt ? 'Max. gylis' : 'Max depth' });
  if (!isRiver && waterbody.shorelineKm != null)
    measures.push({ value: String(waterbody.shorelineKm), unit: 'km', label: lt ? 'Pakrantė' : 'Shoreline' });

  // Identity rows
  const identityRows: { label: string; value: string; mono?: boolean }[] = [
    { label: lt ? 'Tipas' : 'Type', value: typeLabel },
    ...(regionText ? [{ label: lt ? 'Regionas' : 'Region', value: regionText }] : []),
    ...(kadastroId ? [{ label: 'UETK ID', value: kadastroId, mono: true }] : []),
  ];

  // Permit card
  const permitLeased = waterbody.leased;
  const permitBg = permitLeased === true ? theme.warningSoft : permitLeased === false ? theme.openBg : theme.surfaceAlt;
  const permitDotColor = permitLeased === true ? theme.warning : permitLeased === false ? theme.open : theme.outline;
  const permitBadgeLabel = permitLeased === true
    ? (lt ? 'NUOMOJAMAS TELKINYS' : 'LEASED WATERS')
    : permitLeased === false
    ? (lt ? 'VALSTYBINĖ ŽŪKLĖ' : 'PUBLIC FISHING')
    : (lt ? 'STATUSAS NEŽINOMAS' : 'UNKNOWN STATUS');
  const permitBodyText = permitLeased === true ? t.permitLeased : permitLeased === false ? t.permitPublic : '—';

  // Stocking bar chart
  const stockingBars: { year: string; height: number }[] = [];
  let latestYear: string | null = null;
  let latestFish: { fish: string; count: number }[] = [];
  if (stockingEntry) {
    const byYear = Object.entries(stockingEntry.byYear).sort(([a], [b]) => Number(a) - Number(b)).slice(-7);
    const totals = byYear.map(([year, fish]) => ({ year, total: fish.reduce((sum, f) => sum + f.count, 0) }));
    const maxTotal = Math.max(...totals.map((e) => e.total), 1);
    totals.forEach((e) => stockingBars.push({ year: e.year, height: Math.max(4, Math.round((e.total / maxTotal) * 44)) }));
    latestYear = Object.keys(stockingEntry.byYear).sort().reverse()[0] ?? null;
    latestFish = latestYear ? (stockingEntry.byYear[latestYear] ?? []) : [];
  }

  return (
    <View style={{ gap: 12 }}>
      {/* Measure tiles */}
      {measures.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {measures.map((m, i) => (
            <View key={i} style={s.measureTile}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={s.measureVal}>{m.value}</Text>
                <Text style={s.measureUnit}>{m.unit}</Text>
              </View>
              <Text style={s.measureLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Identity card */}
      <View style={s.infoCard}>
        {identityRows.map((row, i) => (
          <View
            key={i}
            style={[s.infoCardRow, i < identityRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider }]}
          >
            <Text style={s.infoCardLabel}>{row.label}</Text>
            <Text style={[s.infoCardValue, row.mono && { fontVariant: ['tabular-nums'] }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Permit card */}
      <View style={[s.permitCard, { backgroundColor: permitBg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: permitDotColor }} />
          <Text style={[s.permitCardLabel, { color: permitDotColor }]}>{permitBadgeLabel}</Text>
        </View>
        <Text style={s.permitCardText}>{permitBodyText}</Text>
      </View>

      {/* Boat launch */}
      <View style={{ gap: 8 }}>
        <Text style={s.sectionEyebrowNew}>{lt ? 'VALČIŲ NULEIDIMO VIETOS' : 'BOAT LAUNCH SPOTS'}</Text>
        {boatSpots.length > 0 ? (
          <View style={s.infoCard}>
            {boatSpots.map((spot, i) => (
              <Pressable
                key={spot.name}
                onPress={() => Linking.openURL(`https://maps.google.com/?q=${spot.lat},${spot.lng}`)}
                style={[s.infoCardRow, i < boatSpots.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.infoCardValue}>{spot.name}</Text>
                  <Text style={s.monoSmall}>{spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}</Text>
                </View>
                <Text style={{ fontSize: 16, color: theme.open }}>↗</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={s.dashedCard}>
            <Text style={s.infoCardValue}>{lt ? 'Registruotų vietų nėra' : 'No registered spots'}</Text>
            <Text style={[s.infoCardLabel, { marginTop: 3 }]}>{lt ? 'Šiam telkiniui AAD sąraše nėra įrengtų valčių nuleidimo vietų.' : 'No boat launch spots registered for this water body.'}</Text>
          </View>
        )}
      </View>

      {/* Stocking */}
      <View style={{ gap: 8 }}>
        <Text style={s.sectionEyebrowNew}>{lt ? 'ĮŽUVINIMAS' : 'STOCKING'}</Text>
        {stockingEntry ? (
          <View style={s.infoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              <View>
                <Text style={s.measureVal}>{fmtN(stockingEntry.total)}</Text>
                <Text style={[s.measureLabel, { marginTop: 3 }]}>{lt ? 'Iš viso įleista, vnt.' : 'Total stocked, pcs'}</Text>
              </View>
              <View style={s.stockingYearsBadge}>
                <Text style={s.stockingYearsBadgeText}>
                  {Object.keys(stockingEntry.byYear).sort()[0]}–{Object.keys(stockingEntry.byYear).sort().reverse()[0]}
                </Text>
              </View>
            </View>

            {stockingBars.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 14, alignItems: 'flex-end', height: 56 }}>
                {stockingBars.map((bar) => (
                  <View key={bar.year} style={{ flex: 1, alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                    <View style={{ width: '100%', height: bar.height, borderRadius: 3, backgroundColor: theme.primaryFixed }} />
                    <Text style={s.barLabel}>{bar.year.slice(-2)}</Text>
                  </View>
                ))}
              </View>
            )}

            {latestYear && (
              <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: theme.divider, paddingTop: 12 }}>
                <Text style={s.monoSmall}>{latestYear} · {lt ? 'NAUJAUSI ĮRAŠAI' : 'LATEST'}</Text>
                {latestFish.map((f, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 10 }}>
                    <Text style={s.infoCardValue}>{cap(f.fish)}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.ink }}>{fmtN(f.count)}</Text>
                  </View>
                ))}
              </View>
            )}

            <Pressable style={s.stockingToggleBtn} onPress={() => setStockingOpen((o) => !o)}>
              <Text style={s.stockingToggleLabel}>
                {stockingOpen ? (lt ? 'Rodyti mažiau' : 'Show less') : (lt ? 'Rodyti visus metus' : 'Show all years')}
              </Text>
            </Pressable>

            {stockingOpen && (
              <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: theme.divider, paddingTop: 12, gap: 12 }}>
                {Object.entries(stockingEntry.byYear)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .filter(([year]) => year !== latestYear)
                  .map(([year, fish]) => (
                    <View key={year}>
                      <Text style={s.monoSmall}>{year}</Text>
                      {fish.map((f, i) => (
                        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
                          <Text style={s.infoCardLabel}>{cap(f.fish)}</Text>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.ink }}>{fmtN(f.count)}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
              </View>
            )}
          </View>
        ) : (
          <View style={s.dashedCard}>
            <Text style={s.infoCardValue}>{lt ? 'Duomenų nėra' : 'No data'}</Text>
            <Text style={[s.infoCardLabel, { marginTop: 3 }]}>{lt ? 'Šis telkinys nėra valstybės įžuvinamų telkinių sąraše (2019–2026).' : 'This water body is not in the state stocking register (2019–2026).'}</Text>
          </View>
        )}
      </View>

      {/* More info button */}
      <Pressable
        style={s.moreInfoBtnNew}
        onPress={() => Linking.openURL(`https://lt.wikipedia.org/w/index.php?search=${encodeURIComponent(waterbody.nameLt)}`)}
      >
        <Text style={s.moreInfoTextNew}>{t.moreInfo} →</Text>
      </Pressable>

      <Text style={s.sourcesLine}>Šaltiniai: UETK · AAD įžuvinimo registras</Text>
    </View>
  );
}

interface OpenMeteoData {
  waterTemp: number;
  wind: number;
  pressure: number;
}

function WeatherTab({ waterbodyId, lat, lng }: { waterbodyId: string; lat: number; lng: number }) {
  const { t, date } = useApp();
  const forecast = getForecast(waterbodyId, date);
  const [real, setReal] = useState<OpenMeteoData | null>(null);

  useEffect(() => {
    if (!lat || !lng) return;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=soil_temperature_0cm,wind_speed_10m,surface_pressure` +
      `&wind_speed_unit=ms&timezone=Europe%2FVilnius`;
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const c = json?.current;
        if (!c) return;
        setReal({
          waterTemp: typeof c.soil_temperature_0cm === 'number' ? Math.round(c.soil_temperature_0cm * 10) / 10 : forecast.waterTemp,
          wind: typeof c.wind_speed_10m === 'number' ? Math.round(c.wind_speed_10m * 10) / 10 : forecast.wind,
          pressure: typeof c.surface_pressure === 'number' ? Math.round(c.surface_pressure) : forecast.pressure,
        });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  const waterTemp = real?.waterTemp ?? forecast.waterTemp;
  const wind = real?.wind ?? forecast.wind;
  const pressure = real?.pressure ?? forecast.pressure;

  const labels: Record<string, string> = {
    excellent: t.excellent,
    good: t.good,
    fair: t.fair,
    poor: t.poor,
  };
  const biteColor = [theme.danger, theme.warning, theme.success, theme.success][forecast.biteScore];
  return (
    <View style={{ gap: 10 }}>
      <View style={s.biteHero}>
        <Text style={s.sectionEyebrow}>{t.biteIndex}</Text>
        <Text style={{ fontSize: 32, fontWeight: '700', color: biteColor, marginTop: 6 }}>
          {labels[forecast.biteLabel]}
        </Text>
        <View style={{ flexDirection: 'row', gap: 5, marginTop: 10 }}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: i <= forecast.biteScore ? biteColor : theme.surfaceAlt,
              }}
            />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[
          { Ico: IconThermo, label: t.waterTemp, value: `${waterTemp}°C` },
          { Ico: IconWind, label: t.wind, value: `${wind} m/s` },
          { Ico: IconCalendar, label: t.pressure, value: `${pressure} hPa` },
          { Ico: null, label: t.moonPhase, value: forecast.moon, emoji: true },
        ].map((m, i) => (
          <View key={i} style={s.metricBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {m.Ico ? <m.Ico color={theme.inkMuted} size={16} /> : null}
              <Text style={{ fontSize: 11, color: theme.inkSubtle, fontWeight: '500' }}>{m.label}</Text>
            </View>
            <Text style={{ fontSize: m.emoji ? 22 : 18, fontWeight: '600', color: theme.ink, marginTop: 4 }}>
              {m.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  topbar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    shadowColor: '#0f382c',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eyebrow: {
    fontSize: 11,
    color: theme.inkMuted,
    fontWeight: '500',
    fontFamily: fonts.mono,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  bigTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.ink,
    letterSpacing: -0.7,
    lineHeight: 34,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: theme.surfaceAlt,
  },
  tabLabel: { fontSize: 12, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.inkTertiary },
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
  speciesName: { fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink },
  speciesMeta: { fontSize: 11, color: theme.inkSubtle, marginTop: 2 },
  yesNo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  generalBox: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
  sectionEyebrow: {
    fontSize: 11,
    color: theme.inkSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    fontFamily: fonts.sansSemiBold,
    marginBottom: 8,
  },
  calendarBox: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 14,
    padding: 14,
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarTitle: { fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink, textTransform: 'capitalize' },
  speciesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
  speciesThumb: {
    width: 72,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoRowColumn: {
    flexDirection: 'column',
    paddingVertical: 8,
  },
  infoLabel: { fontSize: 13, fontFamily: fonts.sans, color: theme.inkSubtle },
  infoValue: { fontSize: 13, color: theme.ink, fontWeight: '500', fontFamily: fonts.sansMedium },
  stockingYear: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  stockingFishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  stockingFishName: { fontSize: 13, color: theme.ink },
  stockingFishCount: { fontSize: 13, color: theme.ink, fontWeight: '500' },
  boatSpotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  boatSpotText: { fontSize: 13, color: theme.ink, flex: 1, marginRight: 8 },
  moreInfoBtn: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  moreInfoText: { color: theme.accentInk, fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold },

  // InfoTab redesign
  measureTile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    padding: 13,
  },
  measureVal: { fontSize: 26, fontWeight: '700', fontFamily: fonts.sansBold, color: theme.ink, lineHeight: 30, letterSpacing: -0.52 },
  measureUnit: { fontSize: 13, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.inkTertiary },
  measureLabel: { fontSize: 11, fontWeight: '700', fontFamily: fonts.sansBold, color: theme.inkMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 3 },
  infoCard: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  infoCardLabel: { fontSize: 13, fontWeight: '500', fontFamily: fonts.sansMedium, color: theme.inkSubtle },
  infoCardValue: { fontSize: 13, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink, textAlign: 'right', flex: 1 },
  permitCard: {
    borderRadius: 12,
    padding: 14,
    paddingHorizontal: 16,
  },
  permitCardLabel: { fontSize: 11, fontWeight: '700', fontFamily: fonts.sansBold, letterSpacing: 0.6, textTransform: 'uppercase' },
  permitCardText: { fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink, marginTop: 6, lineHeight: 20, letterSpacing: -0.14 },
  sectionEyebrowNew: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  dashedCard: {
    borderWidth: 1,
    borderColor: 'rgba(15,56,44,0.22)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 15,
    paddingHorizontal: 16,
    backgroundColor: theme.surfaceAlt,
  },
  monoSmall: { fontSize: 11, fontWeight: '500', fontFamily: fonts.mono, color: theme.inkTertiary, letterSpacing: 0.44 },
  barLabel: { fontSize: 10, fontWeight: '500', color: theme.inkSubtle },
  stockingYearsBadge: { backgroundColor: theme.openBg, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  stockingYearsBadgeText: { fontSize: 12, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.open },
  stockingToggleBtn: {
    marginTop: 14,
    height: 40,
    backgroundColor: theme.surfaceAlt,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockingToggleLabel: { fontSize: 13, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.primary, letterSpacing: -0.13 },
  moreInfoBtnNew: {
    height: 48,
    backgroundColor: theme.primary,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreInfoTextNew: { color: '#ffffff', fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, letterSpacing: -0.14 },
  sourcesLine: { fontSize: 11, fontWeight: '500', fontFamily: fonts.mono, color: theme.outline, textAlign: 'center', letterSpacing: 0.44 },
  biteHero: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 14,
    padding: 16,
  },
  metricBox: {
    width: '48%',
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
});
