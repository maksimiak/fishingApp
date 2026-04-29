import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../state/AppState';
import { theme } from '../theme/colors';
import { SPECIES } from '../data/species';
import { WATERBODIES } from '../data/waterbodies';
import { MY_CATCHES } from '../data/catches';

export function LogScreen() {
  const { t, lang } = useApp();
  const totalFish = MY_CATCHES.length;
  const bySpecies: Record<string, number> = {};
  MY_CATCHES.forEach((c) => {
    bySpecies[c.speciesId] = (bySpecies[c.speciesId] || 0) + 1;
  });
  const top = Object.entries(bySpecies).sort((a, b) => b[1] - a[1])[0];
  const topSp = top ? SPECIES.find((sp) => sp.id === top[0]) : null;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.eyebrow}>{t.thisMonth}</Text>
        <Text style={s.title}>{t.myCatches}</Text>
      </View>

      <View style={s.stats}>
        <StatCard value={String(totalFish)} label={lang === 'lt' ? 'Sugauti' : 'Catches'} />
        <StatCard value={String(Object.keys(bySpecies).length)} label={lang === 'lt' ? 'Rūšys' : 'Species'} />
        <StatCard
          small
          value={topSp ? (lang === 'lt' ? topSp.nameLt : topSp.nameEn) : '—'}
          label={lang === 'lt' ? 'Dažniausia' : 'Most frequent'}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 80 }}>
        {MY_CATCHES.map((c) => {
          const sp = SPECIES.find((x) => x.id === c.speciesId);
          const wb = WATERBODIES.find((x) => x.id === c.waterbodyId);
          if (!sp || !wb) return null;
          return (
            <View key={c.id} style={s.catchCard}>
              <View style={[s.photoBox, { backgroundColor: sp.color + '22' }]}>
                <Text style={{ fontSize: 9, color: theme.inkMuted, letterSpacing: 1 }}>
                  {lang === 'lt' ? 'NUOTR.' : 'PHOTO'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <Text style={s.catchName}>{lang === 'lt' ? sp.nameLt : sp.nameEn}</Text>
                  <Text style={s.catchDate}>{c.date}</Text>
                </View>
                <Text style={s.catchWb}>{lang === 'lt' ? wb.nameLt : wb.nameEn}</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                  <Text style={s.metric}>
                    <Text style={{ color: theme.inkSubtle }}>{t.size} </Text>
                    <Text style={{ fontWeight: '600' }}>{c.size} cm</Text>
                  </Text>
                  <Text style={s.metric}>
                    <Text style={{ color: theme.inkSubtle }}>{t.weight} </Text>
                    <Text style={{ fontWeight: '600' }}>{c.weight} kg</Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function StatCard({ value, label, small }: { value: string; label: string; small?: boolean }) {
  return (
    <View style={s.statCard}>
      <Text numberOfLines={1} style={{ fontSize: small ? 14 : 22, fontWeight: '700', color: theme.ink }}>
        {value}
      </Text>
      <Text style={{ fontSize: 10, color: theme.inkSubtle, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  eyebrow: { fontSize: 11, color: theme.inkSubtle, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '700', color: theme.ink, marginTop: 2 },
  stats: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
  catchCard: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  photoBox: {
    width: 64,
    height: 64,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catchName: { fontSize: 15, fontWeight: '600', color: theme.ink },
  catchDate: { fontSize: 11, color: theme.inkSubtle },
  catchWb: { fontSize: 12, color: theme.inkMuted, marginTop: 2 },
  metric: { fontSize: 12, color: theme.ink },
});
