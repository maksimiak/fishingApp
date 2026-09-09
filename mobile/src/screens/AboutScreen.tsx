import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme, shadows, fonts } from '../theme/colors';
import { IconChevron, IconBack } from '../components/Icons';

const VERSION = '1.7.0';

export function AboutScreen() {
  const { lang } = useApp();
  const router = useRouter();
  const lt = lang === 'lt';

  const dataRows = [
    { label: lt ? 'Vandens telkiniai' : 'Water bodies', value: 'uetk.biip.lt', url: 'https://uetk.biip.lt' },
    { label: lt ? 'Žvejybos taisyklės' : 'Fishing rules', value: 'aad.lrv.lt', url: 'https://aad.lrv.lt' },
    { label: lt ? 'Žemėlapio pagrindas' : 'Map tiles', value: 'maptiler.com', url: 'https://www.maptiler.com' },
  ];

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backRoundel}>
          <IconBack color={theme.primary} size={20} />
        </Pressable>
        <Text style={s.title}>{lt ? 'Apie programėlę' : 'About'}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60, gap: 12 }}>
        {/* App identity card */}
        <View style={s.identityCard}>
          <Text style={s.appName}>FisherMap</Text>
          <Text style={s.appTagline}>
            {lt ? 'Mėgėjų žvejybos pagalbininkas Lietuvoje' : 'Lithuanian angling companion'}
          </Text>
          <Text style={s.appVersion}>VERSIJA {VERSION}</Text>
        </View>

        {/* What is it */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{lt ? 'Kas tai?' : 'What is this?'}</Text>
          <Text style={s.cardBody}>
            {lt
              ? 'FisherMap – Lietuvos žvejų programėlė, padedanti sužinoti žvejybos sezono datas, kvotas ir apribojimus pagal rūšis. Žemėlapyje rodomos visos UETK registruotos upės ir ežerai.'
              : 'FisherMap is a Lithuanian angling app that shows season dates, size limits and catch quotas for each fish species. The map displays all UETK-registered rivers and lakes.'}
          </Text>
        </View>

        {/* Data sources */}
        <Text style={s.sectionLabel}>{lt ? 'DUOMENŲ ŠALTINIAI' : 'DATA SOURCES'}</Text>
        <View style={s.card}>
          {dataRows.map((row, i) => (
            <Pressable
              key={row.url}
              style={[s.dataRow, i < dataRows.length - 1 && { borderBottomWidth: 1 }]}
              onPress={() => Linking.openURL(row.url).catch(() => {})}
            >
              <Text style={s.dataLabel}>{row.label}</Text>
              <Text style={s.dataValue}>{row.value}</Text>
              <IconChevron color={theme.outline} size={14} />
            </Pressable>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerTitle}>
            {lt ? 'Atsakomybės apribojimas' : 'Disclaimer'}
          </Text>
          <Text style={s.disclaimerBody}>
            {lt
              ? 'Programėlė teikiama informaciniais tikslais. Prieš žvejodami visada patikrinkite galiojančias taisykles oficialiuose šaltiniuose. Kūrėjai neatsako už galimas netikslybes.'
              : 'This app is provided for informational purposes only. Always verify current regulations through official sources before fishing. The developers are not responsible for any inaccuracies.'}
          </Text>
        </View>

        <Text style={s.sources}>
          {lt ? 'Šaltiniai: UETK · AAD' : 'Sources: UETK · AAD'}
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
  },
  backRoundel: {
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
  title: { fontSize: 28, fontWeight: '700', fontFamily: fonts.sansBold, color: theme.ink, letterSpacing: -0.7, flex: 1, lineHeight: 34 },

  // Identity card
  identityCard: {
    backgroundColor: theme.primary,
    borderRadius: 20,
    padding: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
    ...shadows.raised,
  },
  appName: { fontSize: 28, fontWeight: '800', fontFamily: fonts.sansExtraBold, color: '#ffffff' },
  appTagline: { fontSize: 14, fontFamily: fonts.sansMedium, lineHeight: 21, color: theme.primaryFixed, textAlign: 'center' },
  appVersion: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.mono,
    letterSpacing: 0.44,
    color: theme.primaryLabel,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  // Cards
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink, padding: 14, paddingBottom: 4 },
  cardBody: { fontSize: 14, fontFamily: fonts.sans, lineHeight: 21, color: theme.inkMuted, padding: 14, paddingTop: 6 },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.outline,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    marginBottom: -4,
  },

  // Data source rows
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomColor: theme.divider,
  },
  dataLabel: { flex: 1, fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink },
  dataValue: { fontSize: 11, fontWeight: '500', fontFamily: fonts.mono, color: theme.inkTertiary, letterSpacing: 0.44 },

  // Disclaimer
  disclaimer: {
    backgroundColor: theme.warningSoft,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  disclaimerTitle: { fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink },
  disclaimerBody: { fontSize: 13, fontFamily: fonts.sansMedium, lineHeight: 19, color: theme.inkMuted, marginTop: 4 },

  sources: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.mono,
    color: theme.outline,
    letterSpacing: 0.44,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
