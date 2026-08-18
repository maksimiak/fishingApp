import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Image } from 'react-native';
import { LakeDepthMap } from '../components/LakeDepthMap';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme } from '../theme/colors';
import { SPECIES } from '../data/species';
import { getStatus, getEffectiveSpeciesRule, getForecast, monthDays, fmtDate } from '../data/rules';
import { StatusChip } from '../components/StatusChip';
import { FishIcon } from '../components/FishIcon';
import type { WaterBody } from '../data/types';
import { BOAT_SPOTS } from '../data/boatSpots';
import { STOCKING } from '../data/stocking';
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
  const name = lang === 'lt' ? waterbody.nameLt : waterbody.nameEn;
  const rawRegion = lang === 'lt' ? waterbody.region.lt : waterbody.region.en;
  const region = rawRegion || (lang === 'lt' ? 'Lietuva' : 'Lithuania');
  const note = waterbody.note ? (lang === 'lt' ? waterbody.note.lt : waterbody.note.en) : null;
  const headerTint =
    status.status === 'open' ? theme.successSoft : status.status === 'closed' ? theme.dangerSoft : theme.warningSoft;

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
          <IconBack color={theme.ink} size={20} />
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

        {/* Status panel */}
        <View style={{ paddingHorizontal: 12 }}>
          <View style={[s.statusPanel, { backgroundColor: headerTint }]}>
            <Text style={s.statusDate}>
              {t.today} · {fmtDate(date, lang)}
            </Text>
            <Text style={s.statusHeadline}>
              {status.status === 'open' &&
                (lang === 'lt'
                  ? `Šiandien galite žvejoti ${status.openSpecies.length} rūšis.`
                  : `${status.openSpecies.length} species open for fishing today.`)}
              {status.status === 'partial' &&
                (lang === 'lt'
                  ? `${status.openSpecies.length} rūšys leidžiamos, ${status.closedSpecies.length} – draudžiamos.`
                  : `${status.openSpecies.length} species allowed, ${status.closedSpecies.length} restricted.`)}
              {status.status === 'closed' &&
                (lang === 'lt' ? 'Visos rūšys šiuo metu saugomos.' : 'All species currently protected.')}
            </Text>
            {(status.reasonLt || status.reasonEn) && (
              <Text style={s.statusReason}>
                {t.reason}: {lang === 'lt' ? status.reasonLt : status.reasonEn}
              </Text>
            )}
            {note && (
              <View style={s.noteBox}>
                <Text style={s.noteText}>⚑ {note}</Text>
              </View>
            )}
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
              ...(waterbody.type !== 'river' ? [{ id: 'depth' as Tab, label: lang === 'lt' ? 'Gyliai' : 'Depths' }] : []),
            ]
          ).map((tb) => {
            const on = tab === tb.id;
            return (
              <Pressable
                key={tb.id}
                onPress={() => setTab(tb.id)}
                style={[s.tabBtn, on && { backgroundColor: theme.ink }]}
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
  const kadastroId = waterbody.id.startsWith('uetk:') ? waterbody.id.slice(5) : null;
  return (
    <View style={{ gap: 10 }}>
      <LakeDepthMap kadastroId={kadastroId ?? ''} lang={lang} height={340} />
      <Text style={{ fontSize: 11, color: theme.inkSubtle, textAlign: 'center' }}>
        {lang === 'lt' ? 'Šaltinis: Aplinkos agentūra (AAD)' : 'Source: Environmental Agency (AAD)'}
      </Text>
    </View>
  );
}

function fmtN(n: number): string {
  return n.toLocaleString('lt-LT');
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function InfoTab({ waterbody, typeLabel }: { waterbody: WaterBody; typeLabel: string }) {
  const { t, lang } = useApp();
  const [stockingOpen, setStockingOpen] = useState(false);
  const regionText = lang === 'lt' ? waterbody.region.lt : waterbody.region.en;
  const kadastroId = waterbody.id.startsWith('uetk:') ? waterbody.id.slice(5) : null;
  const stockingEntry = kadastroId ? (STOCKING[kadastroId] ?? null) : null;
  const isRiver = waterbody.type === 'river';
  const areaLabel = isRiver ? (lang === 'lt' ? 'Ilgis' : 'Length') : (lang === 'lt' ? 'Plotas' : 'Area');
  const areaValue = waterbody.area > 0
    ? isRiver ? `${waterbody.area} km` : `${waterbody.area} ha`
    : null;

  const permitText = waterbody.leased === true
    ? t.permitLeased
    : waterbody.leased === null
    ? '—'
    : t.permitPublic;

  const rows: { label: string; value: string }[] = [
    { label: lang === 'lt' ? 'Tipas' : 'Type', value: typeLabel },
    ...(areaValue ? [{ label: areaLabel, value: areaValue }] : []),
    ...(!isRiver ? [
      { label: t.avgDepth, value: waterbody.avgDepthM != null ? `${waterbody.avgDepthM} m` : '—' },
      { label: t.maxDepth, value: waterbody.maxDepthM != null ? `${waterbody.maxDepthM} m` : '—' },
      { label: t.shoreline, value: waterbody.shorelineKm != null ? `${waterbody.shorelineKm} km` : '—' },
    ] : []),
    ...(regionText ? [{ label: lang === 'lt' ? 'Regionas' : 'Region', value: regionText }] : []),
    ...(kadastroId ? [{ label: 'UETK ID', value: kadastroId }] : []),
    { label: t.fishingPermit, value: '' },
  ];

  const boatKadastroId = waterbody.id.startsWith('uetk:') ? waterbody.id.slice(5) : null;
  const boatSpots = boatKadastroId
    ? BOAT_SPOTS.filter((s) => s.uetkId === boatKadastroId)
    : [];

  return (
    <View style={{ gap: 10 }}>
      <View style={s.generalBox}>
        {rows.map((row, i) => {
          const isPermit = row.label === t.fishingPermit;
          return (
            <View
              key={i}
              style={[
                isPermit ? s.infoRowColumn : s.infoRow,
                i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider },
              ]}
            >
              <Text style={s.infoLabel}>{row.label}</Text>
              {isPermit
                ? <Text style={[s.infoValue, { marginTop: 4, fontSize: 12, lineHeight: 18 }]}>{permitText}</Text>
                : <Text style={s.infoValue}>{row.value}</Text>
              }
            </View>
          );
        })}
      </View>

      {boatSpots.length > 0 && (
        <View style={s.generalBox}>
          <Text style={[s.infoLabel, { marginBottom: 6 }]}>{t.boatLaunch}</Text>
          {boatSpots.map((spot, i) => (
            <Pressable
              key={spot.name}
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${spot.lat},${spot.lng}`)}
              style={[
                s.boatSpotRow,
                i < boatSpots.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider },
              ]}
            >
              <Text style={s.boatSpotText}>{spot.name}</Text>
              <Text style={{ fontSize: 16, color: theme.accent }}>↗</Text>
            </Pressable>
          ))}
        </View>
      )}

      {stockingEntry && (
        <View style={s.generalBox}>
          <Pressable
            style={[s.infoRow, { paddingVertical: 6 }]}
            onPress={() => setStockingOpen((o) => !o)}
          >
            <Text style={[s.infoLabel, { fontWeight: '600', color: theme.ink }]}>{t.stocking}</Text>
            <View style={{ transform: [{ rotate: stockingOpen ? '90deg' : '0deg' }] }}>
              <IconChevron color={theme.inkMuted} size={14} />
            </View>
          </Pressable>
          {stockingOpen && (
            <View style={{ marginTop: 4 }}>
              <View style={[s.infoRow, { borderTopWidth: 1, borderTopColor: theme.divider }]}>
                <Text style={s.infoLabel}>{t.stockingTotal}</Text>
                <Text style={s.infoValue}>{fmtN(stockingEntry.total)}</Text>
              </View>
              {Object.entries(stockingEntry.byYear)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([year, fish]) => (
                  <View key={year} style={{ borderTopWidth: 1, borderTopColor: theme.divider, paddingTop: 8, marginTop: 4 }}>
                    <Text style={s.stockingYear}>{year}</Text>
                    {fish.map((f, i) => (
                      <View key={i} style={s.stockingFishRow}>
                        <Text style={s.stockingFishName}>{cap(f.fish)}</Text>
                        <Text style={s.stockingFishCount}>{fmtN(f.count)}</Text>
                      </View>
                    ))}
                  </View>
                ))}
            </View>
          )}
        </View>
      )}

      <Pressable
        style={s.moreInfoBtn}
        onPress={() => Linking.openURL(`https://lt.wikipedia.org/w/index.php?search=${encodeURIComponent(waterbody.nameLt)}`)}
      >
        <Text style={s.moreInfoText}>
          {t.moreInfo} →
        </Text>
      </Pressable>
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
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 12,
    color: theme.inkSubtle,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bigTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.ink,
    marginTop: 4,
  },
  statusPanel: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  statusDate: { fontSize: 12, color: theme.inkMuted, fontWeight: '600' },
  statusHeadline: { fontSize: 17, fontWeight: '600', color: theme.ink, marginTop: 6 },
  statusReason: { fontSize: 13, color: theme.inkMuted, marginTop: 6 },
  noteBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 8,
  },
  noteText: { fontSize: 12, color: theme.inkMuted },
  tabs: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  tabLabel: { fontSize: 12, fontWeight: '600' },
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
  speciesName: { fontSize: 14, fontWeight: '600', color: theme.ink },
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
  calendarTitle: { fontSize: 14, fontWeight: '600', color: theme.ink, textTransform: 'capitalize' },
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
  infoLabel: { fontSize: 13, color: theme.inkSubtle },
  infoValue: { fontSize: 13, color: theme.ink, fontWeight: '500' },
  stockingYear: {
    fontSize: 12,
    fontWeight: '700',
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
  moreInfoText: { color: theme.accentInk, fontSize: 14, fontWeight: '600' },
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
