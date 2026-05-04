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
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>{t.tabs.more}</Text>
        <Text style={s.subtitle}>{lang === 'lt' ? 'Nustatymai ir informacija' : 'Settings and information'}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Licence card */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          <View style={s.licenceCard}>
            <View style={s.licenceCardInner}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.licenceEyebrow}>{t.licence}</Text>
                  <Text style={s.licenceTitle}>
                    {lang === 'lt' ? 'Mėgėjų žvejybos kortelė' : 'Angler licence'}
                  </Text>
                </View>
                <View style={s.licenceShield}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
                    <Path d="M12 2 L20 6 V12 C20 17, 16 21, 12 22 C8 21, 4 17, 4 12 V6 Z" />
                    <Path d="M9 12l2 2 4-4" />
                  </Svg>
                </View>
              </View>
              <View style={s.licenceFooter}>
                <View>
                  <Text style={s.licenceFooterLabel}>{t.validUntil}</Text>
                  <Text style={s.licenceFooterValue}>{validUntil}</Text>
                </View>
                <View style={s.licenceNumber}>
                  <Text style={s.licenceNumberText}>LT · 47 ••• 3201</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.quickActionsContainer}>
          <Pressable style={s.quickAction}>
            <View style={[s.quickActionIcon, { backgroundColor: theme.successSoft }]}>
              <IconPlus color={theme.success} size={22} />
            </View>
            <Text style={s.quickActionText}>{lang === 'lt' ? 'Leidimas' : 'Licence'}</Text>
          </Pressable>
          
          <Pressable style={s.quickAction}>
            <View style={[s.quickActionIcon, { backgroundColor: theme.dangerSoft }]}>
              <IconShare color={theme.danger} size={22} />
            </View>
            <Text style={s.quickActionText}>{lang === 'lt' ? 'Pranešti' : 'Report'}</Text>
          </Pressable>
          
          <Pressable style={s.quickAction}>
            <View style={[s.quickActionIcon, { backgroundColor: theme.accent + '18' }]}>
              <IconBook color={theme.accent} size={22} />
            </View>
            <Text style={s.quickActionText}>{lang === 'lt' ? 'Pagalba' : 'Help'}</Text>
          </Pressable>
        </View>

        {/* Language Section */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={s.sectionTitle}>{lang === 'lt' ? 'Nustatymai' : 'Settings'}</Text>
          <View style={s.card}>
            <View style={s.langRow}>
              <View style={s.langIconBox}>
                <Text style={s.langIcon}>🌐</Text>
              </View>
              <Text style={s.langLabel}>{lang === 'lt' ? 'Kalba' : 'Language'}</Text>
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
        </View>

        {/* Information Section */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={s.sectionTitle}>{lang === 'lt' ? 'Informacija' : 'Information'}</Text>
          <View style={s.card}>
            {[
              { label: t.buyLicence, Ico: IconPlus, subtitle: lang === 'lt' ? 'Zuvininkystės tarnyba' : 'Fishing service' },
              { label: lang === 'lt' ? 'Apie taisykles' : 'About rules', Ico: IconBook, subtitle: lang === 'lt' ? 'LR teisės aktai' : 'Lithuanian regulations' },
            ].map((row, i, arr) => (
              <Pressable
                key={i}
                style={[s.menuItem, i < arr.length - 1 && s.menuItemBorder]}
              >
                <View style={s.menuIconBox}>
                  <row.Ico color={theme.accent} size={20} />
                </View>
                <View style={s.menuContent}>
                  <Text style={s.menuLabel}>{row.label}</Text>
                  <Text style={s.menuSubtitle}>{row.subtitle}</Text>
                </View>
                <IconChevron color={theme.inkSubtle} size={16} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Support Section */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={s.sectionTitle}>{lang === 'lt' ? 'Pagalba' : 'Support'}</Text>
          <View style={s.card}>
            {[
              { label: lang === 'lt' ? 'Pagalba ir DUK' : 'Help & FAQ', Ico: IconBook },
              { label: lang === 'lt' ? 'Pranešti apie pažeidimą' : 'Report a violation', Ico: IconShare },
            ].map((row, i, arr) => (
              <Pressable
                key={i}
                style={[s.menuItem, i < arr.length - 1 && s.menuItemBorder]}
              >
                <View style={s.menuIconBox}>
                  <row.Ico color={theme.accent} size={20} />
                </View>
                <View style={s.menuContent}>
                  <Text style={s.menuLabel}>{row.label}</Text>
                </View>
                <IconChevron color={theme.inkSubtle} size={16} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerTitle}>Žvejyba Lietuvoje</Text>
          <Text style={s.footerVersion}>v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: theme.bg,
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 24,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: theme.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.inkMuted,
    marginTop: 4,
  },
  licenceCard: {
    backgroundColor: theme.accent,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  licenceCardInner: {
    padding: 20,
  },
  licenceEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  licenceTitle: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: '700', 
    marginTop: 8,
    letterSpacing: -0.3,
  },
  licenceShield: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  licenceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 28,
  },
  licenceFooterLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  licenceFooterValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  licenceNumber: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  licenceNumberText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 28,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.ink,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  langIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  langIcon: {
    fontSize: 20,
  },
  langLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.ink,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: theme.surfaceAlt,
    borderRadius: 12,
    padding: 3,
  },
  langBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  langBtnActive: {
    backgroundColor: theme.accent,
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.inkMuted,
  },
  langBtnTextActive: {
    color: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.divider,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.accent + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.ink,
  },
  menuSubtitle: {
    fontSize: 13,
    color: theme.inkMuted,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.inkMuted,
  },
  footerVersion: {
    fontSize: 12,
    color: theme.inkSubtle,
    marginTop: 4,
  },
});
