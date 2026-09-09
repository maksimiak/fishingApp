import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme, shadows, fonts } from '../theme/colors';
import { IconPlus, IconShare, IconBook, IconChevron } from '../components/Icons';

const LICENCE_EXPIRY = new Date(2026, 11, 31); // 2026-12-31

function daysLeft(from: Date): number {
  const ms = LICENCE_EXPIRY.getTime() - from.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function MoreScreen() {
  const { t, lang, setLang, date } = useApp();
  const router = useRouter();
  const days = daysLeft(date);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>{t.tabs.more}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60, gap: 12 }}>
        {/* Licence hero */}
        <View style={s.licenceCard}>
          <Text style={s.licenceEyebrow}>
            {lang === 'lt' ? 'ŽVEJO MĖGĖJO BILIETAS' : "ANGLER'S LICENCE"}
          </Text>
          <View style={s.licenceRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.licenceValidity}>
                {lang === 'lt' ? 'Galioja iki 2026-12-31' : 'Valid until 2026-12-31'}
              </Text>
              <Text style={s.licenceDays}>{days}</Text>
            </View>
            <View>
              <Text style={s.licenceDaysLabel}>
                {lang === 'lt' ? 'DIENŲ LIKO' : 'DAYS LEFT'}
              </Text>
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={s.card}>
          <View style={s.langRow}>
            <Text style={s.rowLabel}>{lang === 'lt' ? 'Kalba' : 'Language'}</Text>
            <View style={s.langToggle}>
              {(['lt', 'en'] as const).map((l) => (
                <Pressable
                  key={l}
                  onPress={() => setLang(l)}
                  style={[s.langBtn, lang === l && s.langBtnActive]}
                >
                  <Text style={[s.langBtnText, lang === l && s.langBtnTextActive]}>
                    {l.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={s.card}>
          {[
            {
              label: t.buyLicence,
              Ico: IconPlus,
              onPress: () => Linking.openURL('https://www.vstt.lt').catch(() => {}),
            },
            {
              label: lang === 'lt' ? 'Pranešti apie pažeidimą' : 'Report a violation',
              Ico: IconShare,
              onPress: () => Linking.openURL('https://aad.lrv.lt/lt/pranesk-apie-aplinkosaugos-pazeidimus/').catch(() => {}),
            },
            {
              label: lang === 'lt' ? 'Pagalba ir DUK' : 'Help & FAQ',
              Ico: IconBook,
              onPress: () => router.push({ pathname: '/faq' } as never),
            },
            {
              label: lang === 'lt' ? 'Apie programėlę' : 'About',
              Ico: IconBook,
              onPress: () => router.push({ pathname: '/about' } as never),
            },
          ].map((row, i, arr) => (
            <Pressable
              key={i}
              onPress={row.onPress}
              style={[s.actionRow, i < arr.length - 1 && { borderBottomWidth: 1 }]}
            >
              <View style={s.actionIcon}>
                <row.Ico color={theme.primary} size={18} />
              </View>
              <Text style={s.actionText}>{row.label}</Text>
              <IconChevron color={theme.outline} size={14} />
            </Pressable>
          ))}
        </View>

        <Text style={s.version}>FISHERMAP 1.7.0 · UETK 2026-03</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', fontFamily: fonts.sansBold, color: theme.ink, letterSpacing: -0.7, lineHeight: 34 },

  // Licence hero
  licenceCard: {
    backgroundColor: theme.primary,
    borderRadius: 20,
    padding: 18,
    ...shadows.raised,
  },
  licenceEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.primaryLabel,
  },
  licenceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10 },
  licenceValidity: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: fonts.sansSemiBold,
    color: '#ffffff',
    lineHeight: 24,
  },
  licenceDays: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.statGreen,
    letterSpacing: -0.64,
    lineHeight: 38,
    marginTop: 4,
  },
  licenceDaysLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.primaryLabel,
    textAlign: 'right',
  },

  // Generic card
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    ...shadows.card,
  },

  // Language toggle
  langRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: theme.surfaceAlt,
    borderRadius: 999,
    padding: 3,
  },
  langBtn: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 999 },
  langBtnActive: { backgroundColor: theme.primary },
  langBtnText: { fontSize: 12, fontWeight: '700', fontFamily: fonts.sansBold, color: theme.inkTertiary },
  langBtnTextActive: { color: '#ffffff' },

  // Action rows
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    borderBottomColor: theme.divider,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1, fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink },

  version: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.mono,
    color: theme.outline,
    letterSpacing: 0.44,
    textAlign: 'center',
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
