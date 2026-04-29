import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme } from '../theme/colors';
import { SPECIES } from '../data/species';
import { getSpeciesStatus } from '../data/rules';
import { FishIcon } from '../components/FishIcon';
import { FISH_IMAGES } from '../data/fishImages';
import { StatusChip } from '../components/StatusChip';
import { IconBack, IconRuler, IconWeight } from '../components/Icons';

export function SpeciesScreen({ id }: { id: string }) {
  const { t, lang, date } = useApp();
  const router = useRouter();
  const species = SPECIES.find((sp) => sp.id === id);

  if (!species) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.ink }}>Not found</Text>
      </View>
    );
  }

  const open = getSpeciesStatus(species, date) === 'open';
  const name = lang === 'lt' ? species.nameLt : species.nameEn;
  const desc = lang === 'lt' ? species.desc.lt : species.desc.en;
  const habitat = lang === 'lt' ? species.habitat.lt : species.habitat.en;
  const bait = lang === 'lt' ? species.bestBait.lt : species.bestBait.en;
  const bestTime = lang === 'lt' ? species.bestTime.lt : species.bestTime.en;

  const monthStatus = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(date.getFullYear(), i, 15);
    return getSpeciesStatus(species, d);
  });
  const monthLabels =
    lang === 'lt'
      ? ['S', 'V', 'K', 'B', 'G', 'B', 'L', 'R', 'R', 'S', 'L', 'G']
      : ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  const monthsLong =
    lang === 'lt'
      ? ['', 'sausis', 'vasaris', 'kovas', 'balandis', 'gegužė', 'birželis', 'liepa', 'rugpjūtis', 'rugsėjis', 'spalis', 'lapkritis', 'gruodis']
      : ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <View style={s.root}>
      <View style={s.topbar}>
        <Pressable onPress={() => router.back()} style={s.iconBtn} hitSlop={6}>
          <IconBack color={theme.ink} size={20} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[
          s.hero,
          FISH_IMAGES[species.id]
            ? { backgroundColor: theme.card, padding: 0 }
            : { backgroundColor: species.color + '22' },
        ]}>
          {FISH_IMAGES[species.id] ? (
            <Image
              source={FISH_IMAGES[species.id]}
              style={s.heroImage}
              resizeMode="contain"
            />
          ) : (
            <>
              <FishIcon species={species} size={60} />
              <Text style={s.heroCaption}>{lang === 'lt' ? 'Rūšies iliustracija' : 'Species illustration'}</Text>
            </>
          )}
        </View>

        <Text style={s.name}>{name}</Text>
        <Text style={s.latin}>{species.latin}</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <StatusChip status={open ? 'open' : 'closed'} />
          {species.licenceRequired && (
            <View style={s.licenceChip}>
              <Text style={s.licenceText}>{lang === 'lt' ? 'Speciali licencija' : 'Special licence'}</Text>
            </View>
          )}
        </View>

        <Text style={s.desc}>{desc}</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <StatBlock label={t.minSize} value={species.minSize > 0 ? `${species.minSize} cm` : '—'} Ico={IconRuler} />
          <StatBlock label={t.bagLimit} value={species.bagLimit != null ? String(species.bagLimit) : t.noLimit} Ico={IconWeight} />
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={s.sectionEyebrow}>{lang === 'lt' ? 'Sezonai' : 'Seasons'}</Text>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {monthStatus.map((st, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  backgroundColor: st === 'open' ? theme.successSoft : theme.dangerSoft,
                  borderRadius: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: st === 'open' ? theme.success : theme.danger,
                  }}
                >
                  {monthLabels[i]}
                </Text>
              </View>
            ))}
          </View>
          {species.closedSeason && (
            <Text style={{ fontSize: 12, color: theme.inkMuted, marginTop: 8 }}>
              {t.closedSeason}: {monthsLong[species.closedSeason[0][0]]} {species.closedSeason[0][1]} –{' '}
              {monthsLong[species.closedSeason[1][0]]} {species.closedSeason[1][1]}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 18, gap: 8 }}>
          <InfoRow label={t.habitat} value={habitat} />
          <InfoRow label={t.bestBait} value={bait} />
          <InfoRow label={t.bestTime} value={bestTime} />
        </View>
      </ScrollView>
    </View>
  );
}

function StatBlock({ label, value, Ico }: { label: string; value: string; Ico: any }) {
  return (
    <View style={s.statBlock}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ico color={theme.inkMuted} size={16} />
        <Text style={{ fontSize: 11, color: theme.inkSubtle, fontWeight: '500' }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 20, fontWeight: '700', color: theme.ink, marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  topbar: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.cardBorder,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  heroCaption: {
    fontSize: 10,
    color: theme.inkSubtle,
    marginTop: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  name: { fontSize: 26, fontWeight: '700', color: theme.ink },
  latin: { fontSize: 13, color: theme.inkSubtle, fontStyle: 'italic', marginTop: 2 },
  licenceChip: {
    backgroundColor: theme.warningSoft,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  licenceText: { color: theme.warning, fontSize: 12, fontWeight: '600' },
  desc: { fontSize: 14, color: theme.inkMuted, marginTop: 14, lineHeight: 22 },
  statBlock: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  sectionEyebrow: {
    fontSize: 11,
    color: theme.inkSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoRow: {
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  infoLabel: {
    fontSize: 11,
    color: theme.inkSubtle,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: { fontSize: 14, color: theme.ink, marginTop: 3 },
});
