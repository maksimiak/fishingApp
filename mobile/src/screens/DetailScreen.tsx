import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Image } from 'react-native';
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

type Tab = 'biting' | 'rules' | 'info' | 'weather';

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
        <Text style={{ color: theme.ink }}>Not found</Text>
      </View>
    );
  }

  const status = getStatus(waterbody, date);
  const saved = isSaved(waterbody.id);
  const name = lang === 'lt' ? waterbody.nameLt : waterbody.nameEn;
  const rawRegion = lang === 'lt' ? waterbody.region.lt : waterbody.region.en;
  const region = rawRegion || (lang === 'lt' ? 'Lietuva' : 'Lithuania');
  const note = waterbody.note ? (lang === 'lt' ? waterbody.note.lt : waterbody.note.en) : null;

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
        <Pressable 
          onPress={() => router.back()} 
          style={({ pressed }) => [s.iconBtn, pressed && s.iconBtnPressed]} 
          hitSlop={8}
        >
          <IconBack color={theme.ink} size={20} />
        </Pressable>
        <View style={s.topbarActions}>
          <Pressable
            onPress={() => toggleSave(waterbody.id)}
            style={({ pressed }) => [
              s.iconBtn, 
              saved && s.iconBtnActive,
              pressed && s.iconBtnPressed,
            ]}
            hitSlop={8}
          >
            {saved ? (
              <IconBookmarkFill color={theme.accentInk} size={18} />
            ) : (
              <IconBookmark color={theme.ink} size={18} />
            )}
          </Pressable>
          <Pressable 
            style={({ pressed }) => [s.iconBtn, pressed && s.iconBtnPressed]} 
            hitSlop={8}
          >
            <IconShare color={theme.ink} size={18} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={s.hero}>
          <View style={s.typeBadge}>
            <Text style={s.typeBadgeText}>{typeLabel}</Text>
          </View>
          <Text style={s.bigTitle}>
            {name || (lang === 'lt' ? 'Vandens telkinys' : 'Water body')}
          </Text>
          {region && <Text style={s.regionText}>{region}</Text>}
          <View style={s.statusRow}>
            <StatusChip status={status.status} size="lg" />
          </View>
        </View>

        {/* Status Card */}
        <View style={s.statusCard}>
          <View style={s.statusCardHeader}>
            <View style={[s.statusDot, { backgroundColor: status.status === 'open' ? theme.success : status.status === 'closed' ? theme.danger : theme.warning }]} />
            <Text style={s.statusDate}>{t.today} · {fmtDate(date, lang)}</Text>
          </View>
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
              <Text style={s.noteText}>{note}</Text>
            </View>
          )}
        </View>

        {/* Tab Bar */}
        <View style={s.tabs}>
          {(
            [
              { id: 'biting' as Tab, label: t.tabBiting },
              { id: 'rules' as Tab, label: t.rules },
              { id: 'info' as Tab, label: t.tabInfo },
              { id: 'weather' as Tab, label: t.weather },
            ]
          ).map((tb) => {
            const on = tab === tb.id;
            return (
              <Pressable
                key={tb.id}
                onPress={() => setTab(tb.id)}
                style={[s.tabBtn, on && s.tabBtnActive]}
              >
                <Text style={[s.tabLabel, on && s.tabLabelActive]}>{tb.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tab Content */}
        <View style={s.tabContent}>
          {tab === 'biting' && <BitingTab waterbody={waterbody} />}
          {tab === 'rules' && <RulesTab waterbody={waterbody} />}
          {tab === 'info' && <InfoTab waterbody={waterbody} typeLabel={typeLabel} />}
          {tab === 'weather' && <WeatherTab waterbodyId={waterbody.id} lat={waterbody.lat} lng={waterbody.lng} />}
        </View>
      </ScrollView>
    </View>
  );
}

function BitingTab({ waterbody }: { waterbody: WaterBody }) {
  const { t, lang, date } = useApp();
  const router = useRouter();
  return (
    <View style={s.tabSection}>
      <Text style={s.sectionTitle}>{t.expectedSpecies}</Text>
      {waterbody.species.length === 0 && (
        <View style={s.emptyCard}>
          <Text style={s.emptyText}>
            {lang === 'lt'
              ? 'Šiuo metu nėra informacijos apie tai, kokios žuvys čia galima sugauti.'
              : 'Currently there is no info on what you can catch here.'}
          </Text>
        </View>
      )}
      <View style={s.speciesGrid}>
        {waterbody.species.map((id) => {
          const sp = SPECIES.find((s) => s.id === id)!;
          const eff = getEffectiveSpeciesRule(id, waterbody.id, date);
          const open = eff.status === 'open';
          const minSize = eff.minSizeCm ?? sp.minSize;
          const bag = eff.dailyBagLimit !== null ? eff.dailyBagLimit : sp.bagLimit;
          return (
            <Pressable 
              key={id} 
              onPress={() => router.push(`/species/${id}`)} 
              style={({ pressed }) => [s.speciesCard, pressed && s.speciesCardPressed]}
            >
              <View style={s.speciesCardHeader}>
                <View style={[s.speciesThumb, FISH_IMAGES[id] ? { backgroundColor: theme.surface } : null]}>
                  {FISH_IMAGES[id] ? (
                    <Image source={FISH_IMAGES[id]} style={{ width: 60, height: 36 }} resizeMode="contain" />
                  ) : (
                    <FishIcon species={sp} size={26} />
                  )}
                </View>
                <View style={[s.statusIndicator, { backgroundColor: open ? theme.success : theme.danger }]} />
              </View>
              <Text style={s.speciesCardName} numberOfLines={1}>
                {lang === 'lt' ? sp.nameLt : sp.nameEn}
              </Text>
              <Text style={s.speciesCardLatin} numberOfLines={1}>{sp.latin}</Text>
              <View style={s.speciesCardMeta}>
                <Text style={s.speciesCardMetaText}>
                  {minSize && minSize > 0 ? `${minSize}cm` : '—'} · {bag ?? '∞'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function RulesTab({ waterbody }: { waterbody: WaterBody }) {
  const { t, lang, date } = useApp();
  const router = useRouter();
  return (
    <View style={s.tabSection}>
      <Text style={s.sectionTitle}>{t.rules}</Text>
      <View style={s.rulesListContainer}>
        {waterbody.species.map((id, index) => {
          const sp = SPECIES.find((s) => s.id === id)!;
          const eff = getEffectiveSpeciesRule(id, waterbody.id, date);
          const open = eff.status === 'open';
          const minSize = eff.minSizeCm ?? sp.minSize;
          const bag = eff.dailyBagLimit !== null ? eff.dailyBagLimit : sp.bagLimit;
          return (
            <Pressable 
              key={id} 
              onPress={() => router.push(`/species/${id}`)} 
              style={({ pressed }) => [
                s.rulesRow, 
                index < waterbody.species.length - 1 && s.rulesRowBorder,
                pressed && s.rulesRowPressed,
              ]}
            >
              <View style={s.rulesRowIcon}>
                <FishIcon species={sp} size={20} />
              </View>
              <View style={s.rulesRowContent}>
                <Text style={s.rulesRowName}>{lang === 'lt' ? sp.nameLt : sp.nameEn}</Text>
                <Text style={s.rulesRowMeta}>
                  {t.minSize}: {minSize && minSize > 0 ? `${minSize} cm` : '—'} · {t.bagLimit}: {bag ?? t.noLimit}
                </Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: open ? theme.successSoft : theme.dangerSoft }]}>
                {open ? <IconCheck color={theme.success} size={12} /> : <IconX color={theme.danger} size={12} />}
                <Text style={[s.statusBadgeText, { color: open ? theme.success : theme.danger }]}>
                  {open ? t.yes : t.no}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Season Calendar */}
      <View style={s.calendarSection}>
        <Text style={s.sectionTitle}>{t.seasons}</Text>
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
        <Pressable 
          onPress={() => go(-1)} 
          style={({ pressed }) => [s.calendarNavBtn, pressed && s.calendarNavBtnPressed]}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <IconChevron color={theme.inkMuted} size={14} />
          </View>
        </Pressable>
        <Text style={s.calendarTitle}>{title}</Text>
        <Pressable 
          onPress={() => go(1)} 
          style={({ pressed }) => [s.calendarNavBtn, pressed && s.calendarNavBtnPressed]}
        >
          <IconChevron color={theme.inkMuted} size={14} />
        </Pressable>
      </View>

      <View style={s.calendarDayHeaders}>
        {dayHeaders.map((d, i) => (
          <View key={i} style={s.calendarDayHeader}>
            <Text style={s.calendarDayHeaderText}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={s.calendarGrid}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={s.calendarCellEmpty} />;
          const st = getStatus(waterbody, d).status;
          const bg = st === 'open' ? theme.successSoft : st === 'closed' ? theme.dangerSoft : theme.warningSoft;
          const fg = st === 'open' ? theme.success : st === 'closed' ? theme.danger : theme.warning;
          const isSelected = d.toDateString() === date.toDateString();
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <View key={i} style={s.calendarCellWrap}>
              <Pressable
                onPress={() => setDate(new Date(d))}
                style={[
                  s.calendarCell,
                  { backgroundColor: bg },
                  isSelected && s.calendarCellSelected,
                ]}
              >
                <Text style={[s.calendarCellText, { color: fg }, isToday && s.calendarCellTextToday]}>
                  {d.getDate()}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={s.calendarLegend}>
        {[
          { c: theme.success, l: t.canFish },
          { c: theme.warning, l: t.partial },
          { c: theme.danger, l: t.cannotFish },
        ].map((x, i) => (
          <View key={i} style={s.calendarLegendItem}>
            <View style={[s.calendarLegendDot, { backgroundColor: x.c }]} />
            <Text style={s.calendarLegendText}>{x.l}</Text>
          </View>
        ))}
      </View>
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

  const boatKadastroId = waterbody.id.startsWith('uetk:') ? waterbody.id.slice(5) : null;
  const boatSpots = boatKadastroId
    ? BOAT_SPOTS.filter((s) => s.uetkId === boatKadastroId)
    : [];

  return (
    <View style={s.tabSection}>
      {/* Quick Facts */}
      <Text style={s.sectionTitle}>{lang === 'lt' ? 'Pagrindinė informacija' : 'Quick Facts'}</Text>
      <View style={s.factsGrid}>
        <View style={s.factCard}>
          <Text style={s.factLabel}>{lang === 'lt' ? 'Tipas' : 'Type'}</Text>
          <Text style={s.factValue}>{typeLabel}</Text>
        </View>
        {areaValue && (
          <View style={s.factCard}>
            <Text style={s.factLabel}>{areaLabel}</Text>
            <Text style={s.factValue}>{areaValue}</Text>
          </View>
        )}
        {!isRiver && waterbody.avgDepthM != null && (
          <View style={s.factCard}>
            <Text style={s.factLabel}>{t.avgDepth}</Text>
            <Text style={s.factValue}>{waterbody.avgDepthM} m</Text>
          </View>
        )}
        {!isRiver && waterbody.maxDepthM != null && (
          <View style={s.factCard}>
            <Text style={s.factLabel}>{t.maxDepth}</Text>
            <Text style={s.factValue}>{waterbody.maxDepthM} m</Text>
          </View>
        )}
        {!isRiver && waterbody.shorelineKm != null && (
          <View style={s.factCard}>
            <Text style={s.factLabel}>{t.shoreline}</Text>
            <Text style={s.factValue}>{waterbody.shorelineKm} km</Text>
          </View>
        )}
        {regionText && (
          <View style={s.factCard}>
            <Text style={s.factLabel}>{lang === 'lt' ? 'Regionas' : 'Region'}</Text>
            <Text style={s.factValue}>{regionText}</Text>
          </View>
        )}
      </View>

      {/* Permit Info */}
      <View style={s.permitCard}>
        <Text style={s.permitLabel}>{t.fishingPermit}</Text>
        <Text style={s.permitValue}>{permitText}</Text>
      </View>

      {/* Boat Launch */}
      {boatSpots.length > 0 && (
        <View style={s.infoCard}>
          <Text style={s.infoCardTitle}>{t.boatLaunch}</Text>
          {boatSpots.map((spot, i) => (
            <Pressable
              key={spot.name}
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${spot.lat},${spot.lng}`)}
              style={({ pressed }) => [
                s.boatSpotRow,
                i < boatSpots.length - 1 && s.boatSpotRowBorder,
                pressed && s.boatSpotRowPressed,
              ]}
            >
              <Text style={s.boatSpotText}>{spot.name}</Text>
              <View style={s.boatSpotArrow}>
                <Text style={s.boatSpotArrowText}>Open</Text>
                <IconChevron color={theme.accent} size={12} />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Stocking Info */}
      {stockingEntry && (
        <View style={s.infoCard}>
          <Pressable
            style={s.stockingHeader}
            onPress={() => setStockingOpen((o) => !o)}
          >
            <Text style={s.infoCardTitle}>{t.stocking}</Text>
            <View style={[s.stockingChevron, stockingOpen && s.stockingChevronOpen]}>
              <IconChevron color={theme.inkMuted} size={14} />
            </View>
          </Pressable>
          {stockingOpen && (
            <View style={s.stockingContent}>
              <View style={s.stockingTotalRow}>
                <Text style={s.stockingTotalLabel}>{t.stockingTotal}</Text>
                <Text style={s.stockingTotalValue}>{fmtN(stockingEntry.total)}</Text>
              </View>
              {Object.entries(stockingEntry.byYear)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([year, fish]) => (
                  <View key={year} style={s.stockingYearSection}>
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

      {/* More Info Button */}
      <Pressable
        style={({ pressed }) => [s.moreInfoBtn, pressed && s.moreInfoBtnPressed]}
        onPress={() => Linking.openURL(`https://lt.wikipedia.org/w/index.php?search=${encodeURIComponent(waterbody.nameLt)}`)}
      >
        <Text style={s.moreInfoText}>{t.moreInfo}</Text>
        <IconChevron color={theme.accentInk} size={14} />
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
    <View style={s.tabSection}>
      {/* Bite Index Hero */}
      <View style={s.biteHero}>
        <Text style={s.biteHeroLabel}>{t.biteIndex}</Text>
        <Text style={[s.biteHeroValue, { color: biteColor }]}>
          {labels[forecast.biteLabel]}
        </Text>
        <View style={s.biteProgressBar}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                s.biteProgressSegment,
                { backgroundColor: i <= forecast.biteScore ? biteColor : theme.borderLight },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Weather Metrics */}
      <Text style={s.sectionTitle}>{t.weather}</Text>
      <View style={s.metricsGrid}>
        {[
          { Ico: IconThermo, label: t.waterTemp, value: `${waterTemp}°C` },
          { Ico: IconWind, label: t.wind, value: `${wind} m/s` },
          { Ico: IconCalendar, label: t.pressure, value: `${pressure} hPa` },
          { Ico: null, label: t.moonPhase, value: forecast.moon, emoji: true },
        ].map((m, i) => (
          <View key={i} style={s.metricCard}>
            <View style={s.metricHeader}>
              {m.Ico ? <m.Ico color={theme.accent} size={18} /> : null}
              <Text style={s.metricLabel}>{m.label}</Text>
            </View>
            <Text style={[s.metricValue, m.emoji && s.metricValueEmoji]}>
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
  scrollContent: { paddingBottom: 40 },
  
  // Top Bar
  topbar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    backgroundColor: theme.border,
    transform: [{ scale: 0.95 }],
  },
  iconBtnActive: {
    backgroundColor: theme.accent,
  },

  // Hero Section
  hero: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.accentSoft,
    borderRadius: 6,
    marginBottom: 10,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bigTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.ink,
    letterSpacing: -0.5,
  },
  regionText: {
    fontSize: 15,
    color: theme.inkMuted,
    marginTop: 4,
  },
  statusRow: {
    marginTop: 16,
  },

  // Status Card
  statusCard: {
    marginHorizontal: 20,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDate: { 
    fontSize: 13, 
    color: theme.inkMuted, 
    fontWeight: '500',
  },
  statusHeadline: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: theme.ink,
    lineHeight: 22,
  },
  statusReason: { 
    fontSize: 14, 
    color: theme.inkMuted, 
    marginTop: 8,
    lineHeight: 20,
  },
  noteBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.warningSoft,
    borderRadius: 10,
  },
  noteText: { 
    fontSize: 13, 
    color: theme.warning,
    fontWeight: '500',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: theme.surfaceAlt,
  },
  tabBtnActive: {
    backgroundColor: theme.ink,
  },
  tabLabel: { 
    fontSize: 13, 
    fontWeight: '600',
    color: theme.inkMuted,
  },
  tabLabelActive: {
    color: theme.surface,
  },
  tabContent: {
    paddingTop: 8,
  },

  // Tab Section
  tabSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 13,
    color: theme.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 4,
  },

  // Empty State
  emptyCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyText: {
    fontSize: 14,
    color: theme.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Species Grid (Biting Tab)
  speciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  speciesCard: {
    width: '47%',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  speciesCardPressed: {
    backgroundColor: theme.surfaceAlt,
    transform: [{ scale: 0.98 }],
  },
  speciesCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  speciesThumb: {
    width: 60,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  speciesCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.ink,
  },
  speciesCardLatin: {
    fontSize: 11,
    fontStyle: 'italic',
    color: theme.inkSubtle,
    marginTop: 2,
  },
  speciesCardMeta: {
    marginTop: 8,
  },
  speciesCardMetaText: {
    fontSize: 12,
    color: theme.inkMuted,
    fontWeight: '500',
  },

  // Rules List
  rulesListContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  rulesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  rulesRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  rulesRowPressed: {
    backgroundColor: theme.surfaceAlt,
  },
  rulesRowIcon: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulesRowContent: {
    flex: 1,
    gap: 2,
  },
  rulesRowName: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: theme.ink,
  },
  rulesRowMeta: { 
    fontSize: 12, 
    color: theme.inkMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Calendar
  calendarSection: {
    marginTop: 8,
  },
  calendarBox: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    padding: 16,
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavBtnPressed: {
    backgroundColor: theme.border,
  },
  calendarTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: theme.ink, 
    textTransform: 'capitalize',
  },
  calendarDayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayHeader: {
    flex: 1,
    padding: 4,
  },
  calendarDayHeaderText: {
    textAlign: 'center',
    fontSize: 11,
    color: theme.inkSubtle,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCellEmpty: {
    width: '14.28%',
    aspectRatio: 1,
  },
  calendarCellWrap: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  calendarCell: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCellSelected: {
    borderWidth: 2,
    borderColor: theme.ink,
  },
  calendarCellText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calendarCellTextToday: {
    fontWeight: '800',
  },
  calendarLegend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
  },
  calendarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  calendarLegendText: {
    fontSize: 11,
    color: theme.inkMuted,
  },

  // Info Tab
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  factCard: {
    width: '48%',
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  factLabel: {
    fontSize: 12,
    color: theme.inkMuted,
    marginBottom: 4,
  },
  factValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.ink,
  },
  permitCard: {
    backgroundColor: theme.accentSoft,
    borderRadius: 14,
    padding: 16,
  },
  permitLabel: {
    fontSize: 12,
    color: theme.accent,
    fontWeight: '600',
    marginBottom: 6,
  },
  permitValue: {
    fontSize: 14,
    color: theme.ink,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.ink,
    padding: 14,
    paddingBottom: 8,
  },
  boatSpotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  boatSpotRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  boatSpotRowPressed: {
    backgroundColor: theme.surfaceAlt,
  },
  boatSpotText: {
    fontSize: 14,
    color: theme.ink,
    flex: 1,
    marginRight: 8,
  },
  boatSpotArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  boatSpotArrowText: {
    fontSize: 12,
    color: theme.accent,
    fontWeight: '500',
  },
  stockingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 14,
  },
  stockingChevron: {
    transform: [{ rotate: '0deg' }],
  },
  stockingChevronOpen: {
    transform: [{ rotate: '90deg' }],
  },
  stockingContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  stockingTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  stockingTotalLabel: {
    fontSize: 13,
    color: theme.inkMuted,
  },
  stockingTotalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.ink,
  },
  stockingYearSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    marginTop: 8,
  },
  stockingYear: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  stockingFishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  stockingFishName: {
    fontSize: 14,
    color: theme.ink,
  },
  stockingFishCount: {
    fontSize: 14,
    color: theme.ink,
    fontWeight: '500',
  },
  moreInfoBtn: {
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  moreInfoBtnPressed: {
    backgroundColor: theme.accentDark,
    transform: [{ scale: 0.98 }],
  },
  moreInfoText: { 
    color: theme.accentInk, 
    fontSize: 15, 
    fontWeight: '600',
  },

  // Weather Tab
  biteHero: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  biteHeroLabel: {
    fontSize: 12,
    color: theme.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  biteHeroValue: {
    fontSize: 36,
    fontWeight: '700',
    marginTop: 6,
  },
  biteProgressBar: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
    width: '100%',
  },
  biteProgressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.inkMuted,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.ink,
    marginTop: 8,
  },
  metricValueEmoji: {
    fontSize: 28,
  },
});
