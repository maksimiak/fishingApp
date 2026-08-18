import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme } from '../theme/colors';
import { IconChevron } from '../components/Icons';

const VERSION = '1.7.0';

export function AboutScreen() {
  const { lang } = useApp();
  const router = useRouter();

  const lt = lang === 'lt';

  const dataRows = [
    {
      label: lt ? 'Vandens telkiniai' : 'Water bodies',
      value: 'UETK (uetk.biip.lt)',
      url: 'https://uetk.biip.lt',
    },
    {
      label: lt ? 'Žvejybos taisyklės' : 'Fishing rules',
      value: lt ? 'AAD – Aplinkos apsaugos departamentas' : 'AAD – Environmental Protection Dept.',
      url: 'https://aad.lrv.lt',
    },
    {
      label: lt ? 'Žemėlapio pagrindas' : 'Map tiles',
      value: 'MapTiler',
      url: 'https://www.maptiler.com',
    },
  ];

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.back}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <IconChevron color={theme.ink} size={20} />
          </View>
          <Text style={s.backText}>{lt ? 'Atgal' : 'Back'}</Text>
        </Pressable>
        <Text style={s.title}>{lt ? 'Apie programėlę' : 'About'}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* App identity */}
        <View style={s.section}>
          <View style={s.appCard}>
            <Text style={s.appName}>FisherMap</Text>
            <Text style={s.appSub}>{lt ? 'Mėgėjų žvejybos pagalbininkas' : 'Lithuanian angling companion'}</Text>
            <Text style={s.appVersion}>{lt ? `Versija ${VERSION}` : `Version ${VERSION}`}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={s.section}>
          <View style={s.card}>
            <Text style={s.cardTitle}>{lt ? 'Kas tai?' : 'What is this?'}</Text>
            <Text style={s.cardBody}>
              {lt
                ? 'FisherMap – Lietuvos žvejų programėlė, padedanti sužinoti žvejybos sezono datas, kvotas ir apribojimus pagal rūšis. Žemėlapyje rodomos visos UETK registruotos upės ir ežerai.'
                : 'FisherMap is a Lithuanian angling app that shows season dates, size limits and catch quotas for each fish species. The map displays all UETK-registered rivers and lakes.'}
            </Text>
          </View>
        </View>

        {/* Data sources */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>{lt ? 'Duomenų šaltiniai' : 'Data sources'}</Text>
          <View style={s.card}>
            {dataRows.map((row, i) => (
              <Pressable
                key={row.value}
                style={[s.row, i < dataRows.length - 1 && { borderBottomWidth: 1 }]}
                onPress={() => Linking.openURL(row.url)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>{row.label}</Text>
                  <Text style={s.rowValue}>{row.value}</Text>
                </View>
                <IconChevron color={theme.inkSubtle} size={14} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={s.section}>
          <View style={s.card}>
            <Text style={s.cardTitle}>{lt ? 'Atsakomybės apribojimas' : 'Disclaimer'}</Text>
            <Text style={s.cardBody}>
              {lt
                ? 'Programėlė teikiama informaciniais tikslais. Prieš žvejodami visada patikrinkite galiojančias taisykles oficialiuose šaltiniuose. Kūrėjai neatsako už galimas netikslybes.'
                : 'This app is provided for informational purposes only. Always verify current regulations through official sources before fishing. The developers are not responsible for any inaccuracies.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  backText: { fontSize: 15, color: theme.ink },
  title: { fontSize: 26, fontWeight: '700', color: theme.ink },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: theme.inkSubtle, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  appCard: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  appName: { fontSize: 28, fontWeight: '800', color: '#fff' },
  appSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  appVersion: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  card: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: theme.ink, padding: 14, paddingBottom: 4 },
  cardBody: { fontSize: 13, color: theme.inkMuted, lineHeight: 20, padding: 14, paddingTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10, borderBottomColor: theme.divider },
  rowLabel: { fontSize: 13, fontWeight: '500', color: theme.ink },
  rowValue: { fontSize: 12, color: theme.inkSubtle, marginTop: 1 },
});
