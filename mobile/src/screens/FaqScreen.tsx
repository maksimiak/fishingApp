import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme, shadows, fonts } from '../theme/colors';
import { IconChevron, IconBack } from '../components/Icons';

interface FaqItem { q: string; a: string }

const FAQ_LT: FaqItem[] = [
  { q: 'Ką reiškia spalvos žemėlapyje?', a: 'Žalia – visos pagrindinės rūšys šiandien leidžiamos. Geltona – dalis rūšių draudžiamos (neršto metas). Raudona – dauguma rūšių draudžiamos.' },
  { q: 'Ar programėlė veikia be interneto?', a: 'Žvejybos taisyklės ir žuvų sezono datos veikia be interneto. Žemėlapiui reikalingas interneto ryšys plytelėms įkelti.' },
  { q: 'Iš kur imamos žvejybos taisyklės?', a: 'Taisyklės grindžiamos oficialiu Lietuvos mėgėjų žvejybos vidaus vandenyse taisyklių aprašu (AAD). Sezono datos ir kvotos reguliariai atnaujinamos pagal oficialius šaltinius.' },
  { q: 'Kas yra UETK?', a: 'UETK – Upių, ežerų ir tvenkinių kadastras, valstybinis Lietuvos vandens telkinių registras. Programėlės žemėlapyje rodomi visi UETK įregistruoti vandens telkiniai.' },
  { q: 'Kaip naudotis žvejybos sezono kalendoriumi?', a: 'Žvejybos kalendoriuje kiekvienai dienai rodoma, kiek rūšių yra draudžiamame sezone. Pasirinkę dieną galite matyti, kurios rūšys leidžiamos, o kurios – ne.' },
  { q: 'Ar visame žemėlapyje esančiame telkinyje galima žvejoti?', a: 'Ne. Dalis telkinių išnuomoti privatiems naudotojams – ten reikalingas nuomininko leidimas. Viešuose vandenyse reikalingas galiojantis Žvejo mėgėjo bilietas.' },
  { q: 'Kokia minimali žuvies dydžio taisyklė?', a: 'Kiekvienai rūšiai taikomas minimalus dydžio reikalavimas. Smulkesnės žuvys turi būti paleistos. Dydžius rasite rūšies kortelėje skyriuje „Taisyklės".' },
  { q: 'Ką daryti, jei radau klaidą taisyklėse?', a: 'Taisyklės atnaujinamos kuo dažniau, tačiau visada rekomenduojama tikrinti oficialius AAD (aad.lrv.lt) ar Aplinkos ministerijos dokumentus.' },
];

const FAQ_EN: FaqItem[] = [
  { q: 'What do the colours on the map mean?', a: 'Green – all main species are open today. Yellow – some species are in closed season (spawning). Red – most species are prohibited.' },
  { q: 'Does the app work offline?', a: 'Fishing rules and species season dates work fully offline. The map requires an internet connection to load tiles.' },
  { q: 'Where do the fishing rules come from?', a: 'Rules are based on the official Lithuanian Amateur Fishing Regulations issued by AAD (Environmental Protection Department). Season dates and quotas are updated to match official sources.' },
  { q: 'What is UETK?', a: 'UETK is the Lithuanian cadastre of rivers, lakes and reservoirs — the official national water body registry. All UETK-registered bodies appear on the map.' },
  { q: 'How do I use the fishing calendar?', a: 'The calendar colours each day by how many species are in closed season. Tap any day to see which species are open or closed on that date.' },
  { q: 'Can I fish in every water body shown on the map?', a: 'Not always. Some bodies are leased to private operators — a permit from the lessee is required. On public waters, a valid Amateur Fishing Licence is required.' },
  { q: 'What is the minimum size rule?', a: 'Each species has a minimum catch size. Fish below that size must be released. You can find the limit on each species card under "Rules".' },
  { q: 'I found an error in the rules. What should I do?', a: 'Rules are updated as often as possible, but always cross-check with official AAD (aad.lrv.lt) or Ministry of Environment documents.' },
];

export function FaqScreen() {
  const { lang } = useApp();
  const router = useRouter();
  const lt = lang === 'lt';
  const items = lt ? FAQ_LT : FAQ_EN;
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backRoundel}>
          <IconBack color={theme.primary} size={20} />
        </Pressable>
        <Text style={s.title}>{lt ? 'Pagalba ir DUK' : 'Help & FAQ'}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60, gap: 8 }}>
        {items.map((item, i) => {
          const open = openIdx === i;
          return (
            <Pressable
              key={i}
              style={s.entry}
              onPress={() => setOpenIdx(open ? -1 : i)}
            >
              <View style={s.entryRow}>
                <Text style={s.question}>{item.q}</Text>
                <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
                  <IconChevron color={theme.outline} size={16} />
                </View>
              </View>
              {open && (
                <Text style={s.answer}>{item.a}</Text>
              )}
            </Pressable>
          );
        })}
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
  entry: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 16,
    ...shadows.card,
  },
  entryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  question: { flex: 1, fontSize: 14, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: theme.ink, lineHeight: 20, letterSpacing: -0.14 },
  answer: { fontSize: 14, fontFamily: fonts.sans, lineHeight: 21, color: theme.inkMuted, marginTop: 12, paddingTop: 0 },
});
