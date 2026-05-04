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
      <View style={[s.root, s.errorContainer]}>
        <View style={s.errorIconBox}>
          <Text style={s.errorIcon}>🐟</Text>
        </View>
        <Text style={s.errorTitle}>{lang === 'lt' ? 'Rūšis nerasta' : 'Species not found'}</Text>
        <Text style={s.errorText}>
          {lang === 'lt' ? 'Nepavyko rasti informacijos' : 'Could not find information'}
        </Text>
        <Pressable style={s.errorButton} onPress={() => router.back()}>
          <Text style={s.errorButtonText}>{lang === 'lt' ? 'Grįžti' : 'Go back'}</Text>
        </Pressable>
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
      {/* Header */}
      <View style={s.topbar}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <IconBack color={theme.ink} size={22} />
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={s.heroContainer}>
          {FISH_IMAGES[species.id] ? (
            <Image
              source={FISH_IMAGES[species.id]}
              style={s.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[s.heroPlaceholder, { backgroundColor: species.color + '18' }]}>
              <FishIcon species={species} size={80} />
              <Text style={s.heroCaption}>
                {lang === 'lt' ? 'Rūšies iliustracija' : 'Species illustration'}
              </Text>
            </View>
          )}
          {/* Status Badge */}
          <View style={s.heroBadge}>
            <StatusChip status={open ? 'open' : 'closed'} />
          </View>
        </View>

        {/* Title Section */}
        <View style={s.titleSection}>
          <Text style={s.name}>{name}</Text>
          <Text style={s.latin}>{species.latin}</Text>
          
          {species.licenceRequired && (
            <View style={s.licenceChip}>
              <Text style={s.licenceText}>
                {lang === 'lt' ? 'Speciali licencija' : 'Special licence'}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <View style={s.statIconBox}>
              <IconRuler color={theme.accent} size={20} />
            </View>
            <Text style={s.statLabel}>{t.minSize}</Text>
            <Text style={s.statValue}>
              {species.minSize > 0 ? `${species.minSize} cm` : '—'}
            </Text>
          </View>
          <View style={s.statCard}>
            <View style={s.statIconBox}>
              <IconWeight color={theme.accent} size={20} />
            </View>
            <Text style={s.statLabel}>{t.bagLimit}</Text>
            <Text style={s.statValue}>
              {species.bagLimit != null ? String(species.bagLimit) : t.noLimit}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{lang === 'lt' ? 'Aprašymas' : 'Description'}</Text>
          <Text style={s.desc}>{desc}</Text>
        </View>

        {/* Seasons Calendar */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{lang === 'lt' ? 'Sezonai' : 'Seasons'}</Text>
          <View style={s.monthsGrid}>
            {monthStatus.map((st, i) => (
              <View
                key={i}
                style={[
                  s.monthCell,
                  { backgroundColor: st === 'open' ? theme.successSoft : theme.dangerSoft },
                ]}
              >
                <Text
                  style={[
                    s.monthLabel,
                    { color: st === 'open' ? theme.success : theme.danger },
                  ]}
                >
                  {monthLabels[i]}
                </Text>
              </View>
            ))}
          </View>
          {species.closedSeason && (
            <View style={s.seasonNote}>
              <View style={s.seasonDot} />
              <Text style={s.seasonText}>
                {t.closedSeason}: {monthsLong[species.closedSeason[0][0]]} {species.closedSeason[0][1]} –{' '}
                {monthsLong[species.closedSeason[1][0]]} {species.closedSeason[1][1]}
              </Text>
            </View>
          )}
          <View style={s.legendRow}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: theme.success }]} />
              <Text style={s.legendText}>{lang === 'lt' ? 'Galima' : 'Open'}</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: theme.danger }]} />
              <Text style={s.legendText}>{lang === 'lt' ? 'Draudžiama' : 'Closed'}</Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{lang === 'lt' ? 'Informacija' : 'Information'}</Text>
          <View style={s.infoList}>
            <InfoRow 
              label={t.habitat} 
              value={habitat} 
              icon="🏞️"
            />
            <InfoRow 
              label={t.bestBait} 
              value={bait}
              icon="🎣"
            />
            <InfoRow 
              label={t.bestTime} 
              value={bestTime}
              icon="⏰"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIconBox}>
        <Text style={s.infoIcon}>{icon}</Text>
      </View>
      <View style={s.infoContent}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: theme.bg,
  },
  topbar: { 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    paddingBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  scrollContent: { 
    paddingBottom: 120,
  },
  heroContainer: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  heroPlaceholder: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCaption: {
    fontSize: 11,
    color: theme.inkSubtle,
    marginTop: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  name: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: theme.ink,
    letterSpacing: -0.5,
  },
  latin: { 
    fontSize: 15, 
    color: theme.inkSubtle, 
    fontStyle: 'italic', 
    marginTop: 4,
  },
  licenceChip: {
    backgroundColor: theme.warningSoft,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  licenceText: { 
    color: theme.warning, 
    fontSize: 13, 
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: theme.inkSubtle,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.ink,
    marginTop: 4,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.ink,
    marginBottom: 14,
  },
  desc: { 
    fontSize: 15, 
    color: theme.inkMuted, 
    lineHeight: 24,
  },
  monthsGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  monthCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  seasonNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  seasonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.danger,
  },
  seasonText: {
    fontSize: 13,
    color: theme.inkMuted,
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.divider,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: theme.inkMuted,
    fontWeight: '500',
  },
  infoList: {
    gap: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.divider,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.inkSubtle,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: { 
    fontSize: 15, 
    color: theme.ink, 
    marginTop: 4,
    lineHeight: 22,
  },
  // Error state
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.ink,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: theme.inkMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  errorButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
