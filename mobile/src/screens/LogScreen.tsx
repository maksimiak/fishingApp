import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useApp } from '../state/AppState';
import { theme } from '../theme/colors';
import { SPECIES } from '../data/species';
import { WATERBODIES } from '../data/waterbodies';
import { MY_CATCHES } from '../data/catches';
import { IconPlus, IconChevron } from '../components/Icons';

export function LogScreen() {
  const { t, lang } = useApp();
  const totalFish = MY_CATCHES.length;
  const bySpecies: Record<string, number> = {};
  MY_CATCHES.forEach((c) => {
    bySpecies[c.speciesId] = (bySpecies[c.speciesId] || 0) + 1;
  });
  const top = Object.entries(bySpecies).sort((a, b) => b[1] - a[1])[0];
  const topSp = top ? SPECIES.find((sp) => sp.id === top[0]) : null;

  const totalWeight = MY_CATCHES.reduce((sum, c) => sum + c.weight, 0);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerContent}>
          <Text style={s.eyebrow}>{t.thisMonth}</Text>
          <Text style={s.title}>{t.myCatches}</Text>
        </View>
        <Pressable 
          style={({ pressed }) => [s.addBtn, pressed && s.addBtnPressed]}
        >
          <IconPlus color={theme.accentInk} size={20} />
        </Pressable>
      </View>

      {/* Stats Cards */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statValue}>{totalFish}</Text>
          <Text style={s.statLabel}>{lang === 'lt' ? 'Sugauti' : 'Catches'}</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>{Object.keys(bySpecies).length}</Text>
          <Text style={s.statLabel}>{lang === 'lt' ? 'Rūšys' : 'Species'}</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>{totalWeight.toFixed(1)}</Text>
          <Text style={s.statLabel}>{lang === 'lt' ? 'Kg iš viso' : 'Total kg'}</Text>
        </View>
      </View>

      {/* Top Species Card */}
      {topSp && (
        <View style={s.topSpeciesCard}>
          <View style={s.topSpeciesContent}>
            <Text style={s.topSpeciesLabel}>
              {lang === 'lt' ? 'Dažniausia rūšis' : 'Most caught species'}
            </Text>
            <Text style={s.topSpeciesName}>
              {lang === 'lt' ? topSp.nameLt : topSp.nameEn}
            </Text>
            <Text style={s.topSpeciesCount}>
              {top[1]} {lang === 'lt' ? 'kartai' : 'times'}
            </Text>
          </View>
          <View style={[s.topSpeciesIndicator, { backgroundColor: topSp.color + '33' }]}>
            <View style={[s.topSpeciesDot, { backgroundColor: topSp.color }]} />
          </View>
        </View>
      )}

      {/* Catches List */}
      <View style={s.listHeader}>
        <Text style={s.listTitle}>
          {lang === 'lt' ? 'Visi laimikiai' : 'All catches'}
        </Text>
        <View style={s.listCount}>
          <Text style={s.listCountText}>{totalFish}</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MY_CATCHES.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyTitle}>
              {lang === 'lt' ? 'Dar nėra laimikių' : 'No catches yet'}
            </Text>
            <Text style={s.emptyText}>
              {lang === 'lt' 
                ? 'Pradėkite registruoti savo laimikius!' 
                : 'Start logging your catches!'}
            </Text>
          </View>
        )}

        {MY_CATCHES.map((c, index) => {
          const sp = SPECIES.find((x) => x.id === c.speciesId);
          const wb = WATERBODIES.find((x) => x.id === c.waterbodyId);
          if (!sp || !wb) return null;
          return (
            <Pressable 
              key={c.id} 
              style={({ pressed }) => [
                s.catchCard,
                pressed && s.catchCardPressed,
              ]}
            >
              {/* Photo Placeholder */}
              <View style={[s.photoBox, { backgroundColor: sp.color + '18' }]}>
                <View style={[s.photoIcon, { backgroundColor: sp.color + '44' }]}>
                  <Text style={[s.photoIconText, { color: sp.color }]}>
                    {(lang === 'lt' ? sp.nameLt : sp.nameEn).charAt(0)}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View style={s.catchContent}>
                <View style={s.catchHeader}>
                  <Text style={s.catchName}>{lang === 'lt' ? sp.nameLt : sp.nameEn}</Text>
                  <View style={s.dateBadge}>
                    <Text style={s.dateText}>{c.date}</Text>
                  </View>
                </View>
                <Text style={s.catchLocation} numberOfLines={1}>
                  {lang === 'lt' ? wb.nameLt : wb.nameEn}
                </Text>
                <View style={s.metricsRow}>
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>{t.size}</Text>
                    <Text style={s.metricValue}>{c.size} cm</Text>
                  </View>
                  <View style={s.metricDivider} />
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>{t.weight}</Text>
                    <Text style={s.metricValue}>{c.weight} kg</Text>
                  </View>
                </View>
              </View>

              {/* Chevron */}
              <View style={s.chevronWrap}>
                <IconChevron color={theme.inkSubtle} size={12} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  
  // Header
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnPressed: {
    backgroundColor: theme.accentDark,
    transform: [{ scale: 0.95 }],
  },

  // Stats
  statsRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.ink,
  },
  statLabel: {
    fontSize: 11,
    color: theme.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 4,
    fontWeight: '500',
  },

  // Top Species
  topSpeciesCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: theme.accentSoft,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topSpeciesContent: {
    flex: 1,
  },
  topSpeciesLabel: {
    fontSize: 12,
    color: theme.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  topSpeciesName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.ink,
    marginTop: 4,
  },
  topSpeciesCount: {
    fontSize: 13,
    color: theme.inkMuted,
    marginTop: 2,
  },
  topSpeciesIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSpeciesDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },

  // List Header
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 13,
    color: theme.inkMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listCount: {
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  listCountText: {
    fontSize: 12,
    color: theme.inkMuted,
    fontWeight: '600',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 140,
  },

  // Empty State
  emptyState: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.ink,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: theme.inkMuted,
    textAlign: 'center',
  },

  // Catch Card
  catchCard: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  catchCardPressed: {
    backgroundColor: theme.surfaceAlt,
    transform: [{ scale: 0.98 }],
  },
  photoBox: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  catchContent: {
    flex: 1,
    gap: 4,
  },
  catchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catchName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.ink,
  },
  dateBadge: {
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 11,
    color: theme.inkMuted,
    fontWeight: '500',
  },
  catchLocation: {
    fontSize: 13,
    color: theme.inkMuted,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.inkSubtle,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.ink,
  },
  metricDivider: {
    width: 1,
    height: 14,
    backgroundColor: theme.border,
  },
  chevronWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
