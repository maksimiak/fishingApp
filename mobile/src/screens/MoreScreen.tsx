import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../state/AppState';
import { theme } from '../theme/colors';
import { IconPlus, IconShare, IconBook, IconChevron } from '../components/Icons';

export function MoreScreen() {
  const { t, lang, setLang } = useApp();
  const validUntil = '2026-12-31';

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>{t.tabs.more}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Licence card */}
        <View style={{ padding: 12 }}>
          <View style={s.licenceCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={s.licenceEyebrow}>{t.licence}</Text>
                <Text style={s.licenceTitle}>
                  {lang === 'lt' ? 'Mėgėjų žvejybos kortelė' : 'Angler licence'}
                </Text>
              </View>
              <View style={s.licenceShield}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
                  <Path d="M12 2 L20 6 V12 C20 17, 16 21, 12 22 C8 21, 4 17, 4 12 V6 Z" />
                  <Path d="M9 12l2 2 4-4" />
                </Svg>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20 }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10 }}>{t.validUntil}</Text>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 2 }}>{validUntil}</Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontFamily: 'monospace' }}>
                LT · 47 ••• 3201
              </Text>
            </View>
          </View>
        </View>

        {/* Language toggle */}
        <View style={{ padding: 12, paddingTop: 0 }}>
          <View style={s.actionGroup}>
            <View style={s.langRow}>
              <Text style={s.actionLabel}>{lang === 'lt' ? 'Kalba' : 'Language'}</Text>
              <View style={s.langToggle}>
                {(['lt', 'en'] as const).map((l) => (
                  <Pressable
                    key={l}
                    onPress={() => setLang(l)}
                    style={[s.langBtn, lang === l && { backgroundColor: theme.ink }]}
                  >
                    <Text style={[s.langBtnText, { color: lang === l ? theme.card : theme.inkMuted }]}>
                      {l.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={{ padding: 12, paddingTop: 0 }}>
          <View style={s.actionGroup}>
            {[
              { label: t.buyLicence, Ico: IconPlus },
              { label: lang === 'lt' ? 'Pranešti apie pažeidimą' : 'Report a violation', Ico: IconShare },
              { label: lang === 'lt' ? 'Pagalba ir DUK' : 'Help & FAQ', Ico: IconBook },
              { label: lang === 'lt' ? 'Apie taisykles' : 'About rules', Ico: IconBook },
            ].map((row, i, arr) => (
              <Pressable
                key={i}
                style={[s.actionRow, i < arr.length - 1 && { borderBottomWidth: 1 }]}
              >
                <View style={s.actionIcon}>
                  <row.Ico color={theme.inkMuted} size={18} />
                </View>
                <Text style={s.actionText}>{row.label}</Text>
                <IconChevron color={theme.inkSubtle} size={14} />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: theme.ink },
  licenceCard: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    padding: 16,
  },
  licenceEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  licenceTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 6 },
  licenceShield: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGroup: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomColor: theme.divider,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1, fontSize: 14, fontWeight: '500', color: theme.ink },
  actionLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: theme.ink },
  langRow: { padding: 14, flexDirection: 'row', alignItems: 'center' },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: theme.surfaceAlt,
    borderRadius: 999,
    padding: 2,
  },
  langBtn: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999 },
  langBtnText: { fontSize: 12, fontWeight: '700' },
});
