import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useApp } from '../state/AppState';
import { theme } from '../theme/colors';
import { SPECIES } from '../data/species';
import { getSpeciesStatus } from '../data/rules';
import { IconChevron, IconCheck, IconX } from '../components/Icons';

function monthDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = (first.getDay() + 6) % 7;
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function getDayStatus(d: Date): 'open' | 'partial' | 'closed' {
  const closed = SPECIES.filter((sp) => getSpeciesStatus(sp, d) === 'closed').length;
  if (closed === 0) return 'open';
  if (closed === SPECIES.length) return 'closed';
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
    <ScrollView style={s.root} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.eyebrow}>{lang === 'lt' ? 'Žvejybos sezonai' : 'Fishing Seasons'}</Text>
        <Text style={s.title}>{t.calendar}</Text>
        <Text style={s.selectedDate}>{selectedDateLabel}</Text>
      </View>

      {/* Calendar Card */}
      <View style={s.calendarCard}>
        <View style={s.calendarNav}>
          <Pressable 
            onPress={() => go(-1)} 
            style={({ pressed }) => [s.navBtn, pressed && s.navBtnPressed]}
          >
            <View style={s.navBtnIconBack}>
              <IconChevron color={theme.inkMuted} size={14} />
            </View>
          </Pressable>
          <Text style={s.calendarTitle}>{title}</Text>
          <Pressable 
            onPress={() => go(1)} 
            style={({ pressed }) => [s.navBtn, pressed && s.navBtnPressed]}
          >
            <IconChevron color={theme.inkMuted} size={14} />
          </Pressable>
        </View>

        {/* Day Headers */}
        <View style={s.dayHeadersRow}>
          {dayHeaders.map((d, i) => (
            <View key={i} style={s.dayHeaderCell}>
              <Text style={s.dayHeaderText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={s.calendarGrid}>
          {cells.map((d, i) => {
            if (!d) return <View key={i} style={s.emptyCellWrap} />;
            const st = getDayStatus(d);
            const bg = st === 'open' ? theme.successSoft : st === 'closed' ? theme.dangerSoft : theme.warningSoft;
            const fg = st === 'open' ? theme.success : st === 'closed' ? theme.danger : theme.warning;
            const isSelected = d.toDateString() === date.toDateString();
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <View key={i} style={s.cellWrap}>
                <Pressable
                  onPress={() => setDate(new Date(d))}
                  style={[
                    s.cell,
                    { backgroundColor: bg },
                    isSelected && s.cellSelected,
                  ]}
                >
                  <Text style={[s.cellText, { color: fg }, isToday && s.cellTextToday]}>
                    {d.getDate()}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={s.legend}>
          {[
            { color: theme.success, label: t.canFish },
            { color: theme.warning, label: t.partial },
            { color: theme.danger, label: t.cannotFish },
          ].map(({ color, label }) => (
            <View key={label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: color }]} />
              <Text style={s.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Species Sections */}
      <View style={s.speciesSection}>
        <Text style={s.sectionTitle}>
          {lang === 'lt' ? 'Rūšių sezonai' : 'Species seasons'}
        </Text>

        {closedSpecies.length > 0 && (
          <View style={s.groupCard}>
            <View style={[s.groupHeader, { backgroundColor: theme.dangerSoft }]}>
              <View style={s.groupHeaderLeft}>
                <View style={[s.groupDot, { backgroundColor: theme.danger }]}>
                  <IconX color={theme.dangerSoft} size={10} />
                </View>
                <Text style={[s.groupTitle, { color: theme.danger }]}>{t.cannotFish}</Text>
              </View>
              <View style={[s.groupCount, { backgroundColor: theme.danger }]}>
                <Text style={s.groupCountText}>{closedSpecies.length}</Text>
              </View>
            </View>
            {closedSpecies.map(({ sp, name }, index) => (
              <View 
                key={sp.id} 
                style={[s.speciesRow, index < closedSpecies.length - 1 && s.speciesRowBorder]}
              >
                <Text style={s.speciesName}>{name}</Text>
                <Text style={s.speciesLatin}>{sp.latin}</Text>
              </View>
            ))}
          </View>
        )}

        {openSpecies.length > 0 && (
          <View style={s.groupCard}>
            <View style={[s.groupHeader, { backgroundColor: theme.successSoft }]}>
              <View style={s.groupHeaderLeft}>
                <View style={[s.groupDot, { backgroundColor: theme.success }]}>
                  <IconCheck color={theme.successSoft} size={10} />
                </View>
                <Text style={[s.groupTitle, { color: theme.success }]}>{t.canFish}</Text>
              </View>
              <View style={[s.groupCount, { backgroundColor: theme.success }]}>
                <Text style={s.groupCountText}>{openSpecies.length}</Text>
              </View>
            </View>
            {openSpecies.map(({ sp, name }, index) => (
              <View 
                key={sp.id} 
                style={[s.speciesRow, index < openSpecies.length - 1 && s.speciesRowBorder]}
              >
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
  scrollContent: { paddingBottom: 140 },
  
  // Header
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 16,
  },
  eyebrow: { 
    fontSize: 12, 
    color: theme.accent, 
    fontWeight: '600', 
    letterSpacing: 0.5, 
    textTransform: 'uppercase',
  },
  title: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: theme.ink, 
    marginTop: 4,
    letterSpacing: -0.5,
  },
  selectedDate: {
    fontSize: 15,
    color: theme.inkMuted,
    marginTop: 4,
  },

  // Calendar Card
  calendarCard: {
    marginHorizontal: 20,
    backgroundColor: theme.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPressed: {
    backgroundColor: theme.border,
  },
  navBtnIconBack: {
    transform: [{ rotate: '180deg' }],
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.ink,
    textTransform: 'capitalize',
  },
  dayHeadersRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderCell: {
    flex: 1,
    padding: 4,
  },
  dayHeaderText: {
    textAlign: 'center',
    fontSize: 11,
    color: theme.inkSubtle,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyCellWrap: {
    width: '14.28%',
    aspectRatio: 1,
  },
  cellWrap: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  cell: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    borderWidth: 2.5,
    borderColor: theme.ink,
  },
  cellText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cellTextToday: {
    fontWeight: '800',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: theme.inkMuted,
  },

  // Species Section
  speciesSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    color: theme.inkMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  groupCard: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  groupCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  groupCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.surface,
  },
  speciesRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  speciesRowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
  },
  speciesName: {
    fontSize: 15,
    color: theme.ink,
    fontWeight: '500',
  },
  speciesLatin: {
    fontSize: 12,
    color: theme.inkSubtle,
    fontStyle: 'italic',
  },
});
