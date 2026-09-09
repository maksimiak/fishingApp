import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme, shadows, fonts } from '../theme/colors';
import { SPECIES } from '../data/species';
import { getSpeciesStatus, daysUntil, isInClosedSeason } from '../data/rules';
import { FishIcon } from '../components/FishIcon';
import { FISH_IMAGES } from '../data/fishImages';
import { StatusChip } from '../components/StatusChip';
import { IconBack, IconBookmark } from '../components/Icons';

const MONTH_LABELS_LT = ['S', 'V', 'K', 'B', 'G', 'B', 'L', 'R', 'R', 'S', 'L', 'G'];
const MONTH_LABELS_EN = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function SpeciesScreen({ id }: { id: string }) {
  const { t, lang, date } = useApp();
  const router = useRouter();
  const species = SPECIES.find((sp) => sp.id === id);

  if (!species) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.ink }}>{t.notFound}</Text>
      </View>
    );
  }

  const spStatus = getSpeciesStatus(species, date);
  const open = spStatus === 'open';
  const name = lang === 'lt' ? species.nameLt : species.nameEn;
  const desc = lang === 'lt' ? species.desc.lt : species.desc.en;
  const habitat = lang === 'lt' ? species.habitat.lt : species.habitat.en;
  const bait = lang === 'lt' ? species.bestBait.lt : species.bestBait.en;
  const bestTime = lang === 'lt' ? species.bestTime.lt : species.bestTime.en;

  const monthStatus = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(date.getFullYear(), i, 15);
    return getSpeciesStatus(species, d);
  });
  const monthLabels = lang === 'lt' ? MONTH_LABELS_LT : MONTH_LABELS_EN;
  const currentMonth = date.getMonth();

  // Season banner countdown
  let seasonDays: number | null = null;
  if (!open && species.closedSeason) {
    const activeWindow = isInClosedSeason(date, species.closedSeason)
      ? species.closedSeason
      : (species.closedSeason2 ?? species.closedSeason);
    const [, [endM, endD]] = activeWindow;
    seasonDays = daysUntil(date, endM, endD);
  }

  const openMonths = monthStatus.filter((m) => m === 'open').length;

  // Family tag from species category (use taxon info if available, else derive from name)
  const familyTag = (lang === 'lt' ? species.latin.split(' ')[0] : species.latin.split(' ')[0]).toUpperCase();

  const lt = lang === 'lt';

  return (
    <View style={s.root}>
      {/* Top bar */}
      <View style={s.topbar}>
        <Pressable onPress={() => router.back()} style={s.roundel} hitSlop={6}>
          <IconBack color={theme.primary} size={20} />
        </Pressable>
        <Text style={s.topEyebrow}>{lt ? 'RŪŠIŲ ŽINYNAS' : 'SPECIES GUIDE'}</Text>
        <Pressable style={s.roundel} hitSlop={6}>
          <IconBookmark color={theme.inkMuted} size={20} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}>
        {/* Hero image */}
        <View style={s.hero}>
          {FISH_IMAGES[species.id] ? (
            <Image source={FISH_IMAGES[species.id]} style={s.heroImage} resizeMode="contain" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <FishIcon species={species} size={80} />
            </View>
          )}
          <Text style={s.heroLatin}>{species.latin}</Text>
          <View style={s.familyTag}>
            <Text style={s.familyTagText}>{familyTag}</Text>
          </View>
        </View>

        {/* Title row */}
        <View style={s.titleRow}>
          <Text style={s.name}>{name}</Text>
          <StatusChip status={open ? 'open' : 'closed'} size="md" />
        </View>

        {/* Description */}
        <Text style={s.desc}>{desc}</Text>

        {/* Season banner */}
        {species.closedSeason && (
          <View style={[s.seasonBanner, open ? s.seasonBannerOpen : s.seasonBannerClosed]}>
            <Text style={[s.seasonBannerLabel, open ? s.seasonBannerLabelOpen : s.seasonBannerLabelClosed]}>
              {open
                ? (lt ? 'SEZONAS ATVIRAS' : 'SEASON OPEN')
                : (lt ? 'DIENOS IKI ATIDARYMO' : 'DAYS TO OPENING')}
            </Text>
            <Text style={[s.seasonBannerStat, open ? s.seasonBannerStatOpen : s.seasonBannerStatClosed]}>
              {open ? '✓' : (seasonDays ?? '—')}
            </Text>
          </View>
        )}

        {/* Stat cards row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statVal}>{species.minSize > 0 ? `${species.minSize}` : '—'}</Text>
            <Text style={s.statUnit}>{species.minSize > 0 ? ' cm' : ''}</Text>
            <Text style={s.statLabel}>{lt ? 'MIN. DYDIS' : 'MIN. SIZE'}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statVal}>{species.bagLimit != null ? String(species.bagLimit) : '∞'}</Text>
            <Text style={s.statUnit}>{species.bagLimit != null ? (lt ? ' vnt.' : ' pc') : ''}</Text>
            <Text style={s.statLabel}>{lt ? 'NORMA / PARĄ' : 'DAILY BAG'}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statVal}>{openMonths}</Text>
            <Text style={s.statUnit}></Text>
            <Text style={s.statLabel}>{lt ? 'ATVIRI MĖN.' : 'OPEN MO.'}</Text>
          </View>
        </View>

        {/* Season strip */}
        <View style={s.seasonStrip}>
          {monthStatus.map((st, i) => (
            <View
              key={i}
              style={[
                s.monthCell,
                st === 'open' ? s.monthOpen : s.monthClosed,
                i === currentMonth && s.monthCurrent,
              ]}
            >
              <Text style={[s.monthLabel, st === 'open' ? s.monthLabelOpen : s.monthLabelClosed]}>
                {monthLabels[i]}
              </Text>
            </View>
          ))}
        </View>

        {/* Info card */}
        <View style={s.infoCard}>
          {[
            { label: lt ? 'Buveinė' : 'Habitat', value: habitat },
            { label: lt ? 'Masalas' : 'Bait', value: bait },
            { label: lt ? 'Laikas' : 'Best time', value: bestTime },
          ].map((row, i, arr) => (
            <View key={i} style={[s.infoRow, i < arr.length - 1 && { borderBottomWidth: 1 }]}>
              <Text style={s.infoLabel}>{row.label.toUpperCase()}</Text>
              <Text style={s.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Licence note */}
        {species.licenceRequired && (
          <View style={s.licenceNote}>
            <Text style={s.licenceText}>
              {lt ? '⚠ Speciali licencija reikalinga' : '⚠ Special licence required'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },

  // Top bar
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  roundel: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  topEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    color: theme.inkMuted,
  },

  // Hero
  hero: {
    height: 172,
    backgroundColor: theme.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 142,
    marginTop: 8,
  },
  heroLatin: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: fonts.sansMedium,
    color: theme.inkTertiary,
    fontWeight: '500',
  },
  familyTag: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: theme.primary,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  familyTagText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.44,
  },

  // Title row
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  name: { fontSize: 28, fontWeight: '700', fontFamily: fonts.sansBold, color: theme.ink, letterSpacing: -0.7, lineHeight: 34, flex: 1 },

  // Description
  desc: { fontSize: 14, fontFamily: fonts.sans, lineHeight: 21, color: theme.inkMuted, letterSpacing: -0.14 },

  // Season banner
  seasonBanner: {
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 18,
    gap: 4,
  },
  seasonBannerClosed: { backgroundColor: theme.primary },
  seasonBannerOpen: { backgroundColor: theme.openBg },
  seasonBannerLabel: { fontSize: 11, fontWeight: '700', fontFamily: fonts.sansBold, letterSpacing: 0.66, textTransform: 'uppercase' },
  seasonBannerLabelClosed: { color: theme.primaryLabel },
  seasonBannerLabelOpen: { color: theme.open },
  seasonBannerStat: { fontSize: 32, fontWeight: '700', fontFamily: fonts.sansBold, lineHeight: 36, letterSpacing: -0.64 },
  seasonBannerStatClosed: { color: theme.statGreen },
  seasonBannerStatOpen: { color: theme.primary },
  seasonBannerNote: { fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: '#ffffff', marginTop: 4, lineHeight: 20 },

  // Stat cards
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    flexDirection: 'column',
    ...shadows.card,
  },
  statVal: { fontSize: 22, fontWeight: '700', fontFamily: fonts.mono, color: theme.ink, lineHeight: 28 },
  statUnit: { fontSize: 13, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.inkTertiary },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.inkMuted,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // Season strip
  seasonStrip: { flexDirection: 'row', gap: 4 },
  monthCell: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthOpen: { backgroundColor: theme.openBg },
  monthClosed: { backgroundColor: theme.dangerSoft },
  monthCurrent: { borderWidth: 2, borderColor: theme.primary },
  monthLabel: { fontSize: 12, fontWeight: '700', fontFamily: fonts.sansBold },
  monthLabelOpen: { color: theme.open },
  monthLabelClosed: { color: theme.danger },

  // Info card
  infoCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomColor: theme.divider,
    gap: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    color: theme.inkMuted,
    width: 80,
  },
  infoValue: { flex: 1, fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink, textAlign: 'right' },

  // Licence note
  licenceNote: {
    backgroundColor: theme.warningSoft,
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  licenceText: { fontSize: 13, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.warning },
});
