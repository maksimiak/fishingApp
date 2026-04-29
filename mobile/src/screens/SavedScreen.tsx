import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme } from '../theme/colors';
import { WATERBODIES } from '../data/waterbodies';
import { getStatus } from '../data/rules';
import { StatusChip } from '../components/StatusChip';

export function SavedScreen() {
  const { t, lang, date, savedIds } = useApp();
  const router = useRouter();
  const spots = WATERBODIES.filter((w) => savedIds.includes(w.id));

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.eyebrow}>
          {spots.length} {lang === 'lt' ? 'vietos' : 'places'}
        </Text>
        <Text style={s.title}>{t.savedSpots}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 12, gap: 8 }}>
        {spots.map((wb) => {
          const st = getStatus(wb, date).status;
          const color = st === 'open' ? theme.success : st === 'closed' ? theme.danger : theme.warning;
          const bg = st === 'open' ? theme.successSoft : st === 'closed' ? theme.dangerSoft : theme.warningSoft;
          return (
            <Pressable key={wb.id} onPress={() => router.push(`/waterbody/${wb.id}`)} style={s.card}>
              <View style={[s.badge, { backgroundColor: bg }]}>
                <Text style={{ fontSize: 20, fontWeight: '700', color }}>{wb.species.length}</Text>
                <Text style={{ fontSize: 9, color: theme.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  {lang === 'lt' ? 'rūšys' : 'species'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardName}>{lang === 'lt' ? wb.nameLt : wb.nameEn}</Text>
                <Text style={s.cardRegion}>{lang === 'lt' ? wb.region.lt : wb.region.en}</Text>
                <View style={{ marginTop: 6 }}>
                  <StatusChip status={st} size="sm" />
                </View>
              </View>
            </Pressable>
          );
        })}
        {spots.length === 0 && (
          <View style={s.empty}>
            <Text style={{ color: theme.inkSubtle, fontSize: 13, textAlign: 'center' }}>
              {lang === 'lt' ? 'Dar nėra išsaugotų vietų.' : 'No saved spots yet.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  eyebrow: { fontSize: 11, color: theme.inkSubtle, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '700', color: theme.ink, marginTop: 2 },
  card: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    width: 70,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { fontSize: 15, fontWeight: '600', color: theme.ink },
  cardRegion: { fontSize: 11, color: theme.inkSubtle, marginTop: 1 },
  empty: {
    padding: 32,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.cardBorder,
    borderRadius: 14,
  },
});
