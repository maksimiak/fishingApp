import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../state/AppState';
import { theme } from '../theme/colors';
import { IconChevron } from '../components/Icons';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_LT: FaqItem[] = [
  {
    q: 'Ką reiškia spalvos žemėlapyje?',
    a: 'Žalia – visos pagrindinės rūšys šiandien leidžiamos. Geltona – dalis rūšių draudžiamos (neršto metas). Raudona – dauguma rūšių draudžiamos.',
  },
  {
    q: 'Ar programėlė veikia be interneto?',
    a: 'Žvejybos taisyklės ir žuvų sezono datos veikia be interneto. Žemėlapiui reikalingas interneto ryšys plytelėms įkelti.',
  },
  {
    q: 'Iš kur imamos žvejybos taisyklės?',
    a: 'Taisyklės grindžiamos oficialiu Lietuvos mėgėjų žvejybos vidaus vandenyse taisyklių aprašu (AAD). Sezono datos ir kvotos reguliariai atnaujinamos pagal oficialius šaltinius.',
  },
  {
    q: 'Kas yra UETK?',
    a: 'UETK – Upių, ežerų ir tvenkinių kadastras, valstybinis Lietuvos vandens telkinių registras. Programėlės žemėlapyje rodomi visi UETK įregistruoti vandens telkiniai.',
  },
  {
    q: 'Kaip naudotis žvejybos sezono kalendoriumi?',
    a: 'Žvejybos kalendoriuje kiekvienai dienai rodoma, kiek rūšių yra draudžiamame sezone. Pasirinkę dieną galite matyti, kurios rūšys leidžiamos, o kurios – ne.',
  },
  {
    q: 'Ar visame žemėlapyje esančiame telkinyje galima žvejoti?',
    a: 'Ne. Dalis telkinių išnuomoti privatiems naudotojams – ten reikalingas nuomininko leidimas. Viešuose vandenyse reikalingas galiojantis Žvejo mėgėjo bilietas.',
  },
  {
    q: 'Kokia minimali žuvies dydžio taisyklė?',
    a: 'Kiekvienai rūšiai taikomas minimalus dydžio reikalavimas. Smulkesnės žuvys turi būti paleistos. Dydžius rasite rūšies kortelėje skyriuje „Taisyklės".',
  },
  {
    q: 'Ką daryti, jei radau klaidą taisyklėse?',
    a: 'Taisyklės atnaujinamos kuo dažniau, tačiau visada rekomenduojama tikrinti oficialius AAD (aad.lrv.lt) ar Aplinkos ministerijos dokumentus.',
  },
];

const FAQ_EN: FaqItem[] = [
  {
    q: 'What do the colours on the map mean?',
    a: 'Green – all main species are open today. Yellow – some species are in closed season (spawning). Red – most species are prohibited.',
  },
  {
    q: 'Does the app work offline?',
    a: 'Fishing rules and species season dates work fully offline. The map requires an internet connection to load tiles.',
  },
  {
    q: 'Where do the fishing rules come from?',
    a: 'Rules are based on the official Lithuanian Amateur Fishing Regulations issued by AAD (Environmental Protection Department). Season dates and quotas are updated to match official sources.',
  },
  {
    q: 'What is UETK?',
    a: 'UETK is the Lithuanian cadastre of rivers, lakes and reservoirs — the official national water body registry. All UETK-registered bodies appear on the map.',
  },
  {
    q: 'How do I use the fishing calendar?',
    a: 'The calendar colours each day by how many species are in closed season. Tap any day to see which species are open or closed on that date.',
  },
  {
    q: 'Can I fish in every water body shown on the map?',
    a: 'Not always. Some bodies are leased to private operators — a permit from the lessee is required. On public waters, a valid Amateur Fishing Licence is required.',
  },
  {
    q: 'What is the minimum size rule?',
    a: 'Each species has a minimum catch size. Fish below that size must be released. You can find the limit on each species card under "Rules".',
  },
  {
    q: 'I found an error in the rules. What should I do?',
    a: 'Rules are updated as often as possible, but always cross-check with official AAD (aad.lrv.lt) or Ministry of Environment documents.',
  },
];

function FaqEntry({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen((v) => !v)} style={s.entry}>
      <View style={s.entryRow}>
        <Text style={s.question}>{item.q}</Text>
        <View style={{ transform: [{ rotate: open ? '270deg' : '90deg' }] }}>
          <IconChevron color={theme.inkSubtle} size={14} />
        </View>
      </View>
      {open && <Text style={s.answer}>{item.a}</Text>}
    </Pressable>
  );
}

export function FaqScreen() {
  const { lang } = useApp();
  const router = useRouter();
  const lt = lang === 'lt';
  const items = lt ? FAQ_LT : FAQ_EN;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.back}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <IconChevron color={theme.ink} size={20} />
          </View>
          <Text style={s.backText}>{lt ? 'Atgal' : 'Back'}</Text>
        </Pressable>
        <Text style={s.title}>{lt ? 'Pagalba ir DUK' : 'Help & FAQ'}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <View style={s.card}>
            {items.map((item, i) => (
              <View key={i} style={i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider }}>
                <FaqEntry item={item} />
              </View>
            ))}
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
  card: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 14,
    overflow: 'hidden',
  },
  entry: { padding: 14 },
  entryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  question: { flex: 1, fontSize: 14, fontWeight: '600', color: theme.ink, lineHeight: 20 },
  answer: { fontSize: 13, color: theme.inkMuted, lineHeight: 20, marginTop: 8 },
});
