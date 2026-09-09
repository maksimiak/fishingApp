import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useApp } from '../state/AppState';
import { theme, shadows, fonts } from '../theme/colors';
import { SPECIES } from '../data/species';
import { getSpeciesStatus, isInClosedSeason } from '../data/rules';
import { IconChevron } from '../components/Icons';

function monthDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = (first.getDay() + 6) % 7;
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

// 3-band status: 0 closed = open, 1-3 = partial, 4+ = closed
function getDayBand(d: Date): 'open' | 'partial' | 'closed' {
  const count = SPECIES.filter((sp) => getSpeciesStatus(sp, d) === 'closed').length;
  if (count === 0) return 'open';
  if (count <= 3) return 'partial';
  return 'closed';
}

const MONTH_NAMES_LT = ['sausis', 'vasaris', 'kovas', 'balandis', 'gegužė', 'birželis', 'liepa', 'rugpjūtis', 'rugsėjis', 'spalis', 'lapkritis', 'gruodis'];
const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarScreen() {
  const { t, lang, date, setDate } = useApp();
  const [viewMonth, setViewMonth] = useState(new Date(date.getFullYear(), date.getMonth(), 1));
  const lt = lang === 'lt';

  const cells = monthDays(viewMonth.getFullYear(), viewMonth.getMonth());
  const dayHeaders = lt ? ['P', 'A', 'T', 'K', 'Pn', 'Š', 'S'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthNames = lt ? MONTH_NAMES_LT : MONTH_NAMES_EN;
  const calTitle = monthNames[viewMonth.getMonth()] + ' ' + viewMonth.getFullYear();
  const go = (delta: number) =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));

  // Eyebrow: selected date formatted
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const eyebrow = `${y}-${m}-${d} · ${lt ? 'PASIRINKTA DIENA' : 'SELECTED DATE'}`;

  const speciesWithStatus = SPECIES.map((sp) => ({
    sp,
    status: getSpeciesStatus(sp, date),
    name: lt ? sp.nameLt : sp.nameEn,
  }));
  const closedSpecies = speciesWithStatus.filter((x) => x.status === 'closed');
  const openSpecies = speciesWithStatus.filter((x) => x.status === 'open');

  const bandColors = {
    open: { bg: theme.openBg, fg: theme.open },
    partial: { bg: theme.warningSoft, fg: theme.warning },
    closed: { bg: theme.dangerSoft, fg: theme.danger },
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.eyebrow}>{eyebrow}</Text>
        <Text style={s.title}>{t.calendar}</Text>
      </View>

      {/* Day hero */}
      <View style={s.heroWrap}>
        <View style={s.hero}>
          <View style={s.heroLeft}>
            <Text style={s.heroLabel}>
              {closedSpecies.length === 0
                ? (lt ? 'VISOS RŪŠYS ATVIROS' : 'ALL SPECIES OPEN')
                : (lt ? 'GALIMA ŽVEJOTI' : 'OPEN TO FISH')}
            </Text>
            <View style={s.heroStatRow}>
              <Text style={s.heroStat}>{openSpecies.length}</Text>
              <Text style={s.heroStatSub}> / {SPECIES.length} {lt ? 'rūšys' : 'species'}</Text>
            </View>
          </View>
          {closedSpecies.length > 0 && (
            <>
              <View style={s.heroDivider} />
              <View style={s.heroRight}>
                <Text style={s.heroRightStat}>{closedSpecies.length}</Text>
                <Text style={s.heroLabel}>{lt ? 'DRAUDŽIAMA' : 'CLOSED'}</Text>
              </View>
            </>
          )}
        </View>
        {closedSpecies.length > 0 && (
          <Text style={s.heroFooter} numberOfLines={2}>
            {closedSpecies.slice(0, 3).map((x) => x.name).join(', ')}
            {closedSpecies.length > 3 ? ` +${closedSpecies.length - 3}` : ''}
          </Text>
        )}
        {closedSpecies.length === 0 && (
          <Text style={s.heroFooter}>
            {lt ? 'Šiandien visas rūšis galima žvejoti.' : 'All species are open today.'}
          </Text>
        )}
      </View>

      {/* Month card */}
      <View style={s.calCard}>
        <View style={s.calNav}>
          <Pressable onPress={() => go(-1)} hitSlop={8} style={s.navBtn}>
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <IconChevron color={theme.primary} size={16} />
            </View>
          </Pressable>
          <Text style={s.calTitle}>{calTitle}</Text>
          <Pressable onPress={() => go(1)} hitSlop={8} style={s.navBtn}>
            <IconChevron color={theme.primary} size={16} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          {dayHeaders.map((dh, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
              <Text style={s.dayHeader}>{dh}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((day, i) => {
            if (!day) return <View key={i} style={{ width: '14.28%', aspectRatio: 1 }} />;
            const band = getDayBand(day);
            const isSelected = day.toDateString() === date.toDateString();
            const { bg, fg } = bandColors[band];
            return (
              <View key={i} style={{ width: '14.28%', aspectRatio: 1, padding: 2 }}>
                <Pressable
                  onPress={() => setDate(new Date(day))}
                  style={[
                    s.dayCell,
                    { backgroundColor: bg },
                    isSelected && { borderWidth: 2, borderColor: theme.primary },
                  ]}
                >
                  <Text style={[s.dayNum, { color: fg }]}>{day.getDate()}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={s.legend}>
          {[
            { band: 'open', label: lt ? 'Viskas atvira' : 'All open' },
            { band: 'partial', label: lt ? '1–3 draudž.' : '1–3 closed' },
            { band: 'closed', label: lt ? '4+ draudž.' : '4+ closed' },
          ].map(({ band, label }) => {
            const { bg, fg } = bandColors[band as 'open' | 'partial' | 'closed'];
            return (
              <View key={band} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  backgroundColor: bg,
                  borderWidth: 1,
                  borderColor: fg,
                }} />
                <Text style={{ fontSize: 11, color: theme.inkMuted }}>{label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Species groups */}
      <View style={{ paddingHorizontal: 16, marginTop: 16, gap: 10 }}>
        <Text style={s.sectionLabel}>
          {lt ? `RŪŠIŲ SEZONAI · ${d}.${m} D.` : `SPECIES SEASONS · ${d}.${m}`}
        </Text>

        {closedSpecies.length > 0 && (
          <View style={s.groupCard}>
            <View style={[s.groupHeader, { backgroundColor: theme.dangerSoft }]}>
              <View style={[s.dot, { backgroundColor: theme.danger }]} />
              <Text style={[s.groupTitle, { color: theme.danger }]}>{t.cannotFish}</Text>
              <Text style={[s.groupCount, { color: theme.danger }]}>{closedSpecies.length}</Text>
            </View>
            {closedSpecies.map(({ sp, name: spName }) => {
              const closureLabel = sp.closedSeason
                ? (() => {
                    const win = (sp.closedSeason2 && isInClosedSeason(date, sp.closedSeason2))
                      ? sp.closedSeason2
                      : sp.closedSeason;
                    const [[sm, sd], [em, ed]] = win;
                    const monthAbbs = lt
                      ? ['SAUS', 'VAS', 'KOV', 'BAL', 'GEG', 'BIRŽ', 'LIEP', 'RUGP', 'RUGS', 'SPAL', 'LAPKR', 'GRUOD']
                      : ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    return `${monthAbbs[sm - 1]}. ${sd} D. – ${monthAbbs[em - 1]}. ${ed} D.`;
                  })()
                : '';
              return (
                <View key={sp.id} style={s.speciesRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.speciesName}>{spName}</Text>
                    <Text style={s.speciesLatin}>{sp.latin}</Text>
                  </View>
                  <Text style={s.closureWindow}>{closureLabel}</Text>
                </View>
              );
            })}
          </View>
        )}

        {openSpecies.length > 0 && (
          <View style={s.groupCard}>
            <View style={[s.groupHeader, { backgroundColor: theme.openBg }]}>
              <View style={[s.dot, { backgroundColor: theme.open }]} />
              <Text style={[s.groupTitle, { color: theme.open }]}>{t.canFish}</Text>
              <Text style={[s.groupCount, { color: theme.open }]}>{openSpecies.length}</Text>
            </View>
            {openSpecies.map(({ sp, name: spName }) => (
              <View key={sp.id} style={s.speciesRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.speciesName}>{spName}</Text>
                  <Text style={s.speciesLatin}>{sp.latin}</Text>
                </View>
                {sp.minSize > 0 && (
                  <Text style={s.minSizeTag}>MIN. {sp.minSize} CM</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.mono,
    color: theme.inkMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: { fontSize: 28, fontWeight: '700', fontFamily: fonts.sansBold, color: theme.ink, letterSpacing: -0.7, lineHeight: 34, marginTop: 2 },

  // Hero
  heroWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: theme.primary,
    borderRadius: 24,
    padding: 16,
    paddingHorizontal: 18,
    ...shadows.raised,
  },
  hero: { flexDirection: 'row', alignItems: 'center' },
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
  heroStatSub: { fontSize: 13, fontWeight: '500', fontFamily: fonts.sansMedium, color: theme.primaryLabel, marginLeft: 2 },
  heroDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginHorizontal: 16,
  },
  heroRight: { alignItems: 'flex-end' },
  heroRightStat: { fontSize: 22, fontWeight: '700', fontFamily: fonts.sansBold, color: '#ffffff', lineHeight: 28 },
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

  // Month card
  calCard: {
    marginHorizontal: 16,
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 14,
    ...shadows.card,
  },
  calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calTitle: { fontSize: 18, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink, textTransform: 'capitalize', lineHeight: 24 },
  dayHeader: { textAlign: 'center', fontSize: 10, fontWeight: '700', fontFamily: fonts.sansBold, letterSpacing: 0.6, color: theme.outline },
  dayCell: { flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', aspectRatio: 1 },
  dayNum: { fontSize: 13, fontWeight: '600', fontFamily: fonts.sansSemiBold },
  legend: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.divider,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.outline,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    marginBottom: -2,
  },

  // Group cards
  groupCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 999 },
  groupTitle: { flex: 1, fontSize: 13, fontWeight: '700', fontFamily: fonts.sansBold },
  groupCount: { fontSize: 13, fontWeight: '700', fontFamily: fonts.sansBold },
  speciesRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speciesName: { fontSize: 14, color: theme.ink, fontWeight: '600', fontFamily: fonts.sansSemiBold },
  speciesLatin: { fontSize: 12, color: theme.inkTertiary, fontStyle: 'italic', fontFamily: fonts.sansMedium },
  closureWindow: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.mono,
    color: theme.inkTertiary,
    letterSpacing: 0.44,
    textTransform: 'uppercase',
  },
  minSizeTag: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.mono,
    color: theme.inkTertiary,
    letterSpacing: 0.44,
    textTransform: 'uppercase',
  },
});
