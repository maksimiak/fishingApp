import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useApp } from '../state/AppState';
import { theme } from '../theme/colors';
import { SPECIES } from '../data/species';
import { getSpeciesStatus } from '../data/rules';
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

function getDayStatus(d: Date): 'open' | 'partial' {
  const closed = SPECIES.filter((sp) => getSpeciesStatus(sp, d) === 'closed').length;
  if (closed === 0) return 'open';
  return 'partial';
}

const MONTH_NAMES_LT = ['sausis', 'vasaris', 'kovas', 'balandis', 'gegužė', 'birželis', 'liepa', 'rugpjūtis', 'rugsėjis', 'spalis', 'lapkritis', 'gruodis'];
const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarScreen() {
  const { t, lang, date, setDate } = useApp();
  const [viewMonth, setViewMonth] = useState(new Date(date.getFullYear(), date.getMonth(), 1));

  const cells = monthDays(viewMonth.getFullYear(), viewMonth.getMonth());
  const dayHeaders = lang === 'lt' ? ['P', 'A', 'T', 'K', 'Pn', 'Š', 'S'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthNames = lang === 'lt' ? MONTH_NAMES_LT : MONTH_NAMES_EN;
  const title = monthNames[viewMonth.getMonth()] + ' ' + viewMonth.getFullYear();
  const go = (delta: number) =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));

  const selectedDateLabel = date.toLocaleDateString(lang === 'lt' ? 'lt-LT' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const speciesWithStatus = SPECIES.map((sp) => ({
    sp,
    status: getSpeciesStatus(sp, date),
    name: lang === 'lt' ? sp.nameLt : sp.nameEn,
  }));
  const closedSpecies = speciesWithStatus.filter((x) => x.status === 'closed');
  const openSpecies = speciesWithStatus.filter((x) => x.status === 'open');

  return (
    <ScrollView style={s.root} contentContainerStyle={{ paddingBottom: 48 }}>
      <View style={s.header}>
        <Text style={s.title}>{t.calendar}</Text>
        <Text style={s.subtitle}>{selectedDateLabel}</Text>
      </View>

      <View style={s.calendarBox}>
        <View style={s.calendarNav}>
          <Pressable onPress={() => go(-1)} hitSlop={8} style={{ padding: 6, transform: [{ rotate: '180deg' }] }}>
            <IconChevron color={theme.inkMuted} size={16} />
          </Pressable>
          <Text style={s.calendarTitle}>{title}</Text>
          <Pressable onPress={() => go(1)} hitSlop={8} style={{ padding: 6 }}>
            <IconChevron color={theme.inkMuted} size={16} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row' }}>
          {dayHeaders.map((d, i) => (
            <View key={i} style={{ flex: 1, padding: 4 }}>
              <Text style={s.dayHeader}>{d}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((d, i) => {
            if (!d) return <View key={i} style={{ width: '14.28%', aspectRatio: 1 }} />;
            const st = getDayStatus(d);
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

        <View style={s.legend}>
          {[
            { color: theme.success, label: t.canFish },
            { color: theme.warning, label: t.partial },
          ].map(({ color, label }) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
              <Text style={{ fontSize: 11, color: theme.inkSubtle }}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 12, marginTop: 16, gap: 8 }}>
        <Text style={s.sectionLabel}>
          {lang === 'lt' ? 'Rūšių sezonai' : 'Species seasons'}
        </Text>

        {closedSpecies.length > 0 && (
          <View style={s.groupBox}>
            <View style={[s.groupHeader, { backgroundColor: theme.dangerSoft }]}>
              <View style={[s.dot, { backgroundColor: theme.danger }]} />
              <Text style={[s.groupTitle, { color: theme.danger }]}>{t.cannotFish}</Text>
              <Text style={[s.groupCount, { color: theme.danger }]}>{closedSpecies.length}</Text>
            </View>
            {closedSpecies.map(({ sp, name }) => (
              <View key={sp.id} style={s.speciesRow}>
                <Text style={s.speciesName}>{name}</Text>
                <Text style={s.speciesLatin}>{sp.latin}</Text>
              </View>
            ))}
          </View>
        )}

        {openSpecies.length > 0 && (
          <View style={s.groupBox}>
            <View style={[s.groupHeader, { backgroundColor: theme.successSoft }]}>
              <View style={[s.dot, { backgroundColor: theme.success }]} />
              <Text style={[s.groupTitle, { color: theme.success }]}>{t.canFish}</Text>
              <Text style={[s.groupCount, { color: theme.success }]}>{openSpecies.length}</Text>
            </View>
            {openSpecies.map(({ sp, name }) => (
              <View key={sp.id} style={s.speciesRow}>
                <Text style={s.speciesName}>{name}</Text>
                <Text style={s.speciesLatin}>{sp.latin}</Text>
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
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: theme.ink },
  subtitle: { fontSize: 13, color: theme.inkSubtle, marginTop: 2 },
  calendarBox: {
    marginHorizontal: 12,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 12,
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.ink,
    textTransform: 'capitalize',
  },
  dayHeader: {
    textAlign: 'center',
    fontSize: 10,
    color: theme.inkSubtle,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.divider,
  },
  sectionLabel: {
    fontSize: 11,
    color: theme.inkSubtle,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  groupBox: {
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  groupTitle: { flex: 1, fontSize: 13, fontWeight: '600' },
  groupCount: { fontSize: 13, fontWeight: '700' },
  speciesRow: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: theme.divider,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  speciesName: { fontSize: 14, color: theme.ink, fontWeight: '500' },
  speciesLatin: { fontSize: 11, color: theme.inkSubtle, fontStyle: 'italic' },
});
