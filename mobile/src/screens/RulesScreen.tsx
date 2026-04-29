import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { theme } from '../theme/colors';
import { IconChevron } from '../components/Icons';

// ── Annex 1: waters permanently closed to fishing ────────────────────────────
const BANNED_WATERS: string[] = [
  'Jūra: nuo Tauragės miesto vandenvietės užtvankos iki Tauragės Versmės gimnazijos ir 500 m žemyn nuo Balskų užtvankos',
  'Nemunas: nuo Kauno HE užtvankos iki 500 m žemiau Kauno HE užtvankos',
  'Šventoji: nuo tilto kelyje Kavarskas–Kurkliai iki Kavarsko užtvankos ir nuo tilto Anykščiuose A. Vienuolio g. iki Anykščių užtvankos',
  'Krokų lankos botaninis–zoologinis draustinis',
  'Kuršių marios: tarp Atmatos ir Skirvytės upių mažesniu kaip 1 km atstumu nuo kranto ir Kniaupo įlanka',
  'Valstybinių gamtinių rezervatų, biosferos rezervatų ir valstybinių parkų gamtinių rezervatų vandens telkiniai (kai juose neorganizuota limituota žvejyba)',
  'Valstybiniai akvakultūros tvenkiniai',
];

// ── Annex 2: rivers closed Oct 1 – Dec 31 ────────────────────────────────────
type River = { name: string; basin: string };

const ANNEX_2: River[] = [
  // Nemuno baseinas
  { name: 'Avirė', basin: 'Nemunas' },
  { name: 'Bilsinyčia', basin: 'Nemunas' },
  { name: 'Dievogala', basin: 'Nemunas' },
  { name: 'Gauja', basin: 'Nemunas' },
  { name: 'Karklė', basin: 'Nemunas' },
  { name: 'Kerupė', basin: 'Nemunas' },
  { name: 'Lapainia', basin: 'Nemunas' },
  { name: 'Liekė', basin: 'Nemunas' },
  { name: 'Mara', basin: 'Nemunas' },
  { name: 'Medukštėlė', basin: 'Nemunas' },
  { name: 'Merkys', basin: 'Nemunas' },
  { name: 'Ova', basin: 'Nemunas' },
  { name: 'Ratnyčia', basin: 'Nemunas' },
  { name: 'Rėvuona', basin: 'Nemunas' },
  { name: 'Samė', basin: 'Nemunas' },
  { name: 'Skirpstauja', basin: 'Nemunas' },
  { name: 'Strūzda', basin: 'Nemunas' },
  { name: 'Šustis', basin: 'Nemunas' },
  { name: 'Šyša', basin: 'Nemunas' },
  { name: 'Verknė', basin: 'Nemunas' },
  { name: 'Viešvilė', basin: 'Nemunas' },
  { name: 'Žvirgždė', basin: 'Nemunas' },
  // Merkio baseinas
  { name: 'Beržūna', basin: 'Merkys' },
  { name: 'Beržupis', basin: 'Merkys' },
  { name: 'Cirvija', basin: 'Merkys' },
  { name: 'Derežna', basin: 'Merkys' },
  { name: 'Derežnytė', basin: 'Merkys' },
  { name: 'Duobupis D', basin: 'Merkys' },
  { name: 'Geluža', basin: 'Merkys' },
  { name: 'Graužupis', basin: 'Merkys' },
  { name: 'Grūda', basin: 'Merkys' },
  { name: 'Lukna', basin: 'Merkys' },
  { name: 'Maltupis', basin: 'Merkys' },
  { name: 'Mažoji Kena', basin: 'Merkys' },
  { name: 'Nedzingė', basin: 'Merkys' },
  { name: 'Pasgrinda', basin: 'Merkys' },
  { name: 'Skroblus', basin: 'Merkys' },
  { name: 'Spengla', basin: 'Merkys' },
  { name: 'Taurupis', basin: 'Merkys' },
  { name: 'Turė', basin: 'Merkys' },
  { name: 'Ūla', basin: 'Merkys' },
  { name: 'Uosupis', basin: 'Merkys' },
  { name: 'Vardauka', basin: 'Merkys' },
  { name: 'Verseka', basin: 'Merkys' },
  // Neries baseinas
  { name: 'Bezdonė', basin: 'Neris' },
  { name: 'Bražuolė', basin: 'Neris' },
  { name: 'Dūkšta', basin: 'Neris' },
  { name: 'Juodė', basin: 'Neris' },
  { name: 'Kamaja', basin: 'Neris' },
  { name: 'Kena', basin: 'Neris' },
  { name: 'Laukysta', basin: 'Neris' },
  { name: 'Lokys', basin: 'Neris' },
  { name: 'Lomena', basin: 'Neris' },
  { name: 'Manierka', basin: 'Neris' },
  { name: 'Mozūriškanka', basin: 'Neris' },
  { name: 'Musė', basin: 'Neris' },
  { name: 'Nemenčia', basin: 'Neris' },
  { name: 'Riešė', basin: 'Neris' },
  { name: 'Rudamina', basin: 'Neris' },
  { name: 'Saidė', basin: 'Neris' },
  { name: 'Strūna', basin: 'Neris' },
  { name: 'Šešuva', basin: 'Neris' },
  { name: 'Taurija', basin: 'Neris' },
  { name: 'Veršupis', basin: 'Neris' },
  { name: 'Vilnia', basin: 'Neris' },
  { name: 'Vokė', basin: 'Neris' },
  { name: 'Žalesa', basin: 'Neris' },
  { name: 'Žeimena', basin: 'Neris' },
  { name: 'Žiežmara', basin: 'Neris' },
  // Žeimenos baseinas
  { name: 'Jusinė', basin: 'Žeimena' },
  { name: 'Lakaja', basin: 'Žeimena' },
  { name: 'Luknelė', basin: 'Žeimena' },
  { name: 'Mera', basin: 'Žeimena' },
  { name: 'Peršokšna', basin: 'Žeimena' },
  { name: 'Petruškė', basin: 'Žeimena' },
  { name: 'Saria', basin: 'Žeimena' },
  { name: 'Skerdiksna', basin: 'Žeimena' },
  { name: 'Skirda', basin: 'Žeimena' },
  // Šventosios baseinas
  { name: 'Armona', basin: 'Šventoji' },
  { name: 'Grabuosta', basin: 'Šventoji' },
  { name: 'Nevėža', basin: 'Šventoji' },
  { name: 'Pelyša', basin: 'Šventoji' },
  { name: 'Siesartis', basin: 'Šventoji' },
  { name: 'Storė', basin: 'Šventoji' },
  { name: 'Tauražė', basin: 'Šventoji' },
  { name: 'Virinta', basin: 'Šventoji' },
  { name: 'Želva', basin: 'Šventoji' },
  // Dubysos baseinas
  { name: 'Dratvinys', basin: 'Dubysa' },
  { name: 'Gynėvė', basin: 'Dubysa' },
  { name: 'Kirkšnovė', basin: 'Dubysa' },
  { name: 'Kražantė', basin: 'Dubysa' },
  { name: 'Lapišė', basin: 'Dubysa' },
  { name: 'Luknė', basin: 'Dubysa' },
  { name: 'Mūkė', basin: 'Dubysa' },
  { name: 'Šventupis', basin: 'Dubysa' },
  // Jūros baseinas
  { name: 'Agluona', basin: 'Jūra' },
  { name: 'Aitra', basin: 'Jūra' },
  { name: 'Akmena', basin: 'Jūra' },
  { name: 'Ančia', basin: 'Jūra' },
  { name: 'Apusinas', basin: 'Jūra' },
  { name: 'Balčia', basin: 'Jūra' },
  { name: 'Bebirva', basin: 'Jūra' },
  { name: 'Bremena', basin: 'Jūra' },
  { name: 'Egluona', basin: 'Jūra' },
  { name: 'Ežeruona', basin: 'Jūra' },
  { name: 'Giluvė', basin: 'Jūra' },
  { name: 'Irtuona', basin: 'Jūra' },
  { name: 'Ižnė', basin: 'Jūra' },
  { name: 'Lokysta', basin: 'Jūra' },
  { name: 'Šaltuona', basin: 'Jūra' },
  { name: 'Šešuvis', basin: 'Jūra' },
  { name: 'Šunija', basin: 'Jūra' },
  { name: 'Trišiūkštė', basin: 'Jūra' },
  { name: 'Upyna', basin: 'Jūra' },
  { name: 'Upynikė', basin: 'Jūra' },
  { name: 'Vėžus', basin: 'Jūra' },
  // Minijos baseinas
  { name: 'Agluona', basin: 'Minija' },
  { name: 'Aisė', basin: 'Minija' },
  { name: 'Alantas', basin: 'Minija' },
  { name: 'Ašva', basin: 'Minija' },
  { name: 'Babrungas', basin: 'Minija' },
  { name: 'Blendžiava', basin: 'Minija' },
  { name: 'Didžioji Sruoja', basin: 'Minija' },
  { name: 'Dirsteika', basin: 'Minija' },
  { name: 'Gerdaujė', basin: 'Minija' },
  { name: 'Graumena', basin: 'Minija' },
  { name: 'Judrė', basin: 'Minija' },
  { name: 'Kapupis', basin: 'Minija' },
  { name: 'Karkluoja', basin: 'Minija' },
  { name: 'Lukna', basin: 'Minija' },
  { name: 'Minija (Didovo ež.–Salanto žiotys)', basin: 'Nemunas' },
  { name: 'Mišupė', basin: 'Minija' },
  { name: 'Pala', basin: 'Minija' },
  { name: 'Salantas', basin: 'Minija' },
  { name: 'Šalpė', basin: 'Minija' },
  { name: 'Sausdravas', basin: 'Minija' },
  { name: 'Šilupis', basin: 'Minija' },
  { name: 'Skinija', basin: 'Minija' },
  { name: 'Šlužmė', basin: 'Minija' },
  { name: 'Šviekšnelė', basin: 'Minija' },
  { name: 'Trumpė', basin: 'Minija' },
  { name: 'Upita', basin: 'Minija' },
  { name: 'Veiviržas', basin: 'Minija' },
  { name: 'Vieštovė', basin: 'Minija' },
  { name: 'Žvelesys', basin: 'Minija' },
  { name: 'Žvelsa', basin: 'Minija' },
  // Lietuvos pajūrio upės
  { name: 'Apšė', basin: 'Pajūris' },
  { name: 'Babrūnė', basin: 'Pajūris' },
  { name: 'Bonalė', basin: 'Pajūris' },
  { name: 'Darba', basin: 'Pajūris' },
  { name: 'Degalas', basin: 'Pajūris' },
  { name: 'Juodupis', basin: 'Pajūris' },
  { name: 'Kaltis', basin: 'Pajūris' },
  { name: 'Kulšė', basin: 'Pajūris' },
  { name: 'Luknė', basin: 'Pajūris' },
  { name: 'Luoba', basin: 'Pajūris' },
  { name: 'Ringelis', basin: 'Pajūris' },
  { name: 'Sartis', basin: 'Pajūris' },
  { name: 'Šata', basin: 'Pajūris' },
  { name: 'Smeltalė', basin: 'Pajūris' },
  { name: 'Smeltaitė', basin: 'Pajūris' },
  { name: 'Žyba', basin: 'Pajūris' },
  // Ventos baseinas
  { name: 'Lūšė', basin: 'Venta' },
  { name: 'Šerkšnė', basin: 'Venta' },
  { name: 'Višetė', basin: 'Venta' },
];

// ── Annex 3: Sep 16 – Oct 15, forbidden without kortelė ──────────────────────
const ANNEX_3: { water: string; section: string }[] = [
  { water: 'Neris', section: 'Nuo Jonavos J. Ralio g. tilto iki Karaliaus Mindaugo tilto Vilniuje ir nuo Valakupių tilto iki Lietuvos ir Baltarusijos valstybinės sienos' },
  { water: 'Žeimena', section: 'Nuo žiočių iki Lakajos žiočių' },
  { water: 'Vilnia', section: 'Nuo žiočių iki Kenos žiočių' },
  { water: 'Šventoji', section: 'Nuo žiočių iki Dagios žiočių ir nuo Kavarsko užtvankos iki tilto Anykščiuose A. Vienuolio g., išskyrus Kavarsko tvenkinį' },
  { water: 'Siesartis', section: 'Nuo žiočių iki Želvos–Balninkų tilto' },
  { water: 'Širvinta', section: 'Nuo žiočių iki Liukonių tilto' },
  { water: 'Dubysa', section: 'Nuo žiočių iki Kražantės žiočių' },
  { water: 'Jūra', section: 'Nuo žiočių iki Tauragės Versmės gimnazijos' },
  { water: 'Minija', section: 'Nuo Lankupių iki Salanto žiočių' },
  { water: 'Veiviržas', section: 'Nuo žiočių iki geležinkelio Klaipėda–Šilutė tilto' },
  { water: 'Akmena–Danė', section: 'Nuo Liepų gatvės tęsinio tilto iki Kretingos malūno patvankos' },
  { water: 'Šventoji (pajūrio)', section: 'Nuo žiočių iki Laukžemės malūno užtvankos' },
];

// ── Annex 4: Oct 16 – Dec 31, fully closed river sections ────────────────────
const ANNEX_4: { water: string; section: string }[] = [
  { water: 'Neris', section: 'Nuo kelio Nr. 262 tilto iki Žirmūnų tilto Vilniuje; nuo Valakupių tilto iki geležinkelio Vilnius–Ignalina tilto; nuo Buivydžių pėsčiųjų tilto iki Baluošos žiočių' },
  { water: 'Šventoji', section: 'Nuo žiočių iki Dagios žiočių ir nuo Kavarsko užtvankos iki Anykščių užtvankos, išskyrus Kavarsko tvenkinį' },
  { water: 'Siesartis', section: 'Nuo žiočių iki Želvos–Balninkų tilto' },
  { water: 'Širvinta', section: 'Nuo žiočių iki Liukonių tilto' },
  { water: 'Dubysa', section: 'Nuo žiočių iki Kražantės žiočių' },
  { water: 'Jūra', section: 'Nuo žiočių iki Balskų užtvankos' },
  { water: 'Minija', section: 'Nuo Lankupių iki Salanto žiočių' },
  { water: 'Veiviržas', section: 'Nuo žiočių iki kelio Veiviržėnai–Švėkšna tilto' },
  { water: 'Šventoji (pajūrio)', section: 'Nuo Kopų g. pėsčiųjų tilto iki Luknės žiočių' },
  { water: 'Akmena–Danė', section: 'Nuo Liepų gatvės tęsinio tilto iki Kretingos malūno patvankos' },
];

// ── Annex 5: Sep 16 – Oct 15, specific sections closed ────────────────────────
const ANNEX_5: { water: string; sections: string[] }[] = [
  {
    water: 'Neris',
    sections: [
      'Nuo Žirmūnų tilto iki Karaliaus Mindaugo tilto',
      'Bezdonės upės žiotyse ir 100 m žemyn ir aukštyn',
      'Bražuolės upės žiotyse ir 100 m žemyn',
      'Musės upės žiotyse ir 200 m žemyn ir aukštyn',
      'Nuo Šventosios upės žiočių iki 100 m žemiau Lokio upės žiočių',
      'Veržuvos upės žiotyse ir 100 m žemyn ir aukštyn',
      'Vokės upės žiotyse ir 100 m žemyn ir aukštyn',
      'Nuo geležinkelio Vilnius–Ignalina tilto iki 500 m žemiau Žeimenos žiočių',
    ],
  },
  {
    water: 'Šventoji',
    sections: [
      'Siesarties upės žiotyse 500 m žemyn (iki salos) ir 100 m aukštyn',
      'Širvintos upės žiotyse ir 100 m žemyn ir aukštyn',
      'Žuvintės upės žiotyse ir 100 m žemyn',
    ],
  },
  {
    water: 'Jūra',
    sections: [
      'Ežeruonos upės žiotyse ir 100 m žemyn',
      'Šešuvio upės žiotyse ir 100 m žemyn',
    ],
  },
  {
    water: 'Minija',
    sections: [
      'Agluonos upės žiotyse ir 100 m žemyn',
      'Salanto upės žiotyse ir 100 m žemyn',
      'Veiviržo upės žiotyse ir 500 m žemyn ir 100 m aukštyn',
    ],
  },
];

// ── Section component ─────────────────────────────────────────────────────────
function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.section}>
      <Pressable onPress={() => setOpen((o) => !o)} style={s.sectionHeader}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={s.sectionTitle}>{title}</Text>
          {badge ? <View style={s.badge}><Text style={s.badgeText}>{badge}</Text></View> : null}
        </View>
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <IconChevron color={theme.inkSubtle} size={16} />
        </View>
      </Pressable>
      {open && <View style={s.sectionBody}>{children}</View>}
    </View>
  );
}

function Bullet({ text, sub }: { text: string; sub?: boolean }) {
  return (
    <View style={[s.bulletRow, sub && { paddingLeft: 16 }]}>
      <Text style={[s.bulletDot, sub && { color: theme.inkSubtle }]}>{sub ? '–' : '•'}</Text>
      <Text style={[s.bulletText, sub && { color: theme.inkSubtle }]}>{text}</Text>
    </View>
  );
}

function TableRow({ left, right, highlight }: { left: string; right: string; highlight?: boolean }) {
  return (
    <View style={[s.tableRow, highlight && { backgroundColor: theme.dangerSoft }]}>
      <Text style={s.tableLeft}>{left}</Text>
      <Text style={[s.tableRight, highlight && { color: theme.danger }]}>{right}</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export function RulesScreen() {
  const groupedAnnex2 = ANNEX_2.reduce<Record<string, string[]>>((acc, r) => {
    (acc[r.basin] ??= []).push(r.name);
    return acc;
  }, {});

  return (
    <ScrollView style={s.root} contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.eyebrow}>OFICIALIOS TAISYKLĖS</Text>
        <Text style={s.title}>Mėgėjų žvejybos taisyklės</Text>
        <Text style={s.subtitle}>Suvestinė redakcija nuo 2024-04-30</Text>
        <Pressable onPress={() => Linking.openURL('https://www.e-tar.lt/portal/lt/legalAct/TAR.FEC90E6937D4/asr')}>
          <Text style={s.link}>e-tar.lt · D1-14 ↗</Text>
        </Pressable>
      </View>

      <View style={s.sections}>

        {/* ── 1. LEIDIMAI ─────────────────────────────────────────────────── */}
        <Section title="Žvejybos leidimai">
          <Bullet text="Žvejo mėgėjo bilietas (L05.01) – leidžia žvejoti valstybiniuose žuvininkystės vandens telkiniuose, kuriuose žvejyba nedraudžiama." />
          <Bullet text="Žvejo mėgėjo kortelė – suteikia teisę žvejoti konkrečiame valstybiniame telkinyje, kuriame vykdoma limituota žvejyba." />
          <Bullet text="Nemokamos žvejybos dienos (visi valstybiniai telkiniai): vasario 16, kovo 11, liepos 6 ir rugpjūčio 15 d." />
          <Bullet text="Privačiuose telkiniuose – tik savininko leidimas arba Taisyklėse numatytais atvejais." />
          <Bullet text="Žvejoti leidžiama tik švieso paros metu (nuo saulės patekėjimo iki laidos), išskyrus atvejus kai telkinio savininkas leidžia ir tai nurodyta leidime." />
        </Section>

        {/* ── 2. ĮRANKIAI ─────────────────────────────────────────────────── */}
        <Section title="Leistinas įrankių kiekis">
          <Bullet text="Vienu metu galima naudoti ne daugiau kaip 5 bučiukus ar samtelius vėžiams gaudyti ir 4 kitus mėgėjų žvejybos įrankius." />
          <Bullet text="Iš 4 įrankių – ne daugiau 2 dvikabliukiai ar daugiakabliukiai (netaikoma stintų žvejybai)." />
          <Bullet text="Meškeres vienu metu galima naudoti ne daugiau kaip 2." />
          <Bullet text="Bendras kabliukų skaičius vienu metu negali viršyti 6 vienetų; stintų ar sliavų žvejybai – ne daugiau 12." />
          <Bullet text="Žvejojant iš inkaro ar kitomis priemonėmis sustabdytų vandens transporto priemonių – ne daugiau kaip 2 meškeres." />
          <Bullet text="Rainuotųjų ir žymėtųjų vėžių gaudymui bučiukų ir samtelių kiekis neribojamas, tačiau visus sugautus plačiažnyplius, siauražnyplius vėžius ar žuvis reikia nedelsiant paleisti." />
          <Bullet text="Masalui žuvelės ir uodo trūklio lervos: vieno tinklinio samtelio skersmuo ≤ 1 m, akutės ≤ 10 mm; vienam žvejui ≤ 30 karosų, karpių, ešerių ir kitų jauniklių per vieną žvejybą." />
        </Section>

        {/* ── 3. DIENOS LIMITAI ───────────────────────────────────────────── */}
        <Section title="Dienos laimikio normos">
          <Text style={s.subNote}>Per vieną žvejybą leidžiama sugauti:</Text>
          <TableRow left="Šamas (Silurus glanis)" right="1 vnt." />
          <TableRow left="Lydekas, sterkus, marguosios upėtakiai, kiršlius, salačius, ūsorius" right="po 2 vnt." />
          <TableRow left="Vėgėlė, ungurius" right="po 3 vnt." />
          <TableRow left="Šapalas, meknė (bendra suma)" right="≤ 5 vnt." />
          <TableRow left="Siauražnyplius vėžius" right="≤ 50 vnt." />
          <TableRow left="Rainuotasis, žymėtasis vėžiai" right="neribojama" />
          <View style={s.divider} />
          <Bullet text="Bendras vienos žvejybos sugautų žuvų svoris negali viršyti 5 kg (Kuršių mariose – 7 kg), neskaitant stintų." />
          <Bullet text="Jei vienos žuvies svoris didesnis už 5 kg normą, ta žuvis laikoma vienos žvejybos laimikiu." />
          <Bullet text="Kiekvienas asmuo savo laimikį privalo laikyti atskirai nuo kitų." />
        </Section>

        {/* ── 4. DRAUDŽIAMI BŪDAI ─────────────────────────────────────────── */}
        <Section title="Draudžiami žvejybos būdai (§9)">
          <Bullet text="Žvejoti naudojant elektros energiją, nuodingąsias ar sprogstamąsias medžiagas, šaunamuosius ar pneumatinius ginklus (išskyrus povandeninės žūklės šautuvus)." />
          <Bullet text="Braidant ar vaikštant pakrantėmis, žvejoti duriamuoju (kai žuvis gaudoma ar sugaunama kabliuku ar kabliu už bet kurios kūno dalies, išskyrus galvą), smogiamuoju būdu." />
          <Bullet text="Naudoti povandeninę žūklę neturint žūklės vietoje ryškiai matomo plūduro." />
          <Bullet text="Naudoti kitus nei unguriai žuvų povandeninei žūklei dvišakius ar daugiašakius strėlių antgalius." />
          <Bullet text="Naudoti masalui gyvūnus, įrašytus į Invazinių rūšių sąrašą." />
          <Bullet text="Būti iki 25 m nuo tinklinių ne mėgėjų žvejybos įrankių, pažymėtų žvejybos įrankių ženklinimo tvarka reikalavimais, jei tame telkinyje žvejyba tuo metu draudžiama ar neturint žvejybos leidimo." />
          <Bullet text="Būti vandens telkiniuose ant ledo, kai ledo būklė kelia pavojų žmonių gyvybei ar sveikatai." />
          <Bullet text="Prekiauti mėgėjų žvejybos būdu sužvejotomis žuvimis ir jų produktais." />
        </Section>

        {/* ── 5. DRAUDŽIAMA ŽVEJOTI ───────────────────────────────────────── */}
        <Section title="Draudžiama žvejoti (§10)">
          <Bullet text="Be galiojančio leidimo, suteikiančio teisę žvejoti tame telkinyje, išskyrus nemokamas žvejybos dienas ir asmenis, turinčius nemokamos žvejybos teisę." />
          <Bullet text="Draudžiamais žvejybos įrankiais ar būdais." />
          <Bullet text="Salačių naudojant daugiau kaip du masalus." />
          <Bullet text="Žuvų praplaukimo takuose ir arčiau kaip 100 m žemiau tvenkinių vandens nuleistuvų (užtvankų)." />
          <Bullet text="Ant ledo neturint priemonių, kuriomis pasinaudojus būtų galima įlūžus išlipti ant ledo – dviejų lanksčia jungtimi sujungtų smaigų." />
          <Bullet text="Balandžio 20 d. – gegužės 20 d.: 400 m zonoje apie Dabintos pusiasalį Kauno mariose." />
          <Bullet text="Gruodžio 15 d. – sausio 31 d.: Nemuno upėje nuo Gėgės upės žiočių iki Jurbarko tilto ir Nevėžio upėje nuo žiočių iki Babtų tilto – tamsiuoju paros metu (nuo saulės laidos iki patekėjimo)." />
          <Bullet text="Ištisus metus: 1 priedo telkiniuose (žr. skyrių žemiau)." />
          <Bullet text="Spalio 1 d. – gruodžio 31 d.: 2 priedo upėse (žr. skyrių žemiau)." />
          <Bullet text="Rugsėjo 16 d. – spalio 15 d. be žvejo mėgėjo kortelių: 3 priedo upių ruožuose (žr. skyrių žemiau)." />
          <Bullet text="Spalio 16 d. – gruodžio 31 d.: 4 priedo upių ruožuose (žr. skyrių žemiau)." />
          <Bullet text="Rugsėjo 16 d. – spalio 15 d.: 5 priedo upių ruožuose (žr. skyrių žemiau)." />
          <Bullet text="Rugsėjo 16 d. – spalio 15 d. po saulės laidos (pagal kalendorių) 3 priedo upių ruožuose." />
          <Bullet text="Sausio 2 d. – balandžio 30 d.: masalui naudojant žuvelę (išskyrus Kuršių marius ir žuvies gabalėlius)." />
          <Bullet text="Spalio 16 d. – gruodžio 31 d.: Šventosios upėje nuo Dagios žiočių iki Kavarsko užtvankos – dirbtinius masalus ar žuvelę." />
          <Bullet text="Rugsėjo 16 d. – gruodžio 31 d.: Neryje nuo Žirmūnų tilto iki Valakupių tilto Vilniaus mieste – dirbtinus masalus ar žuvelę." />
          <Bullet text="Nuo sausio 2 d. iki balandžio 30 d. masalui naudojant žuvelę (išskyrus Kuršių marius)." />
          <Bullet text="Rokantiškių tvenkinyje daugiau kaip vienu viešakiu kabliuku: spalio 1 d. – balandžio 30 d." />
        </Section>

        {/* ── 6. SAUGOMŲ RŪŠYS ────────────────────────────────────────────── */}
        <Section title="Draudžiama gaudyti – saugomų rūšys (§11.1)">
          <Text style={s.subNote}>Visus metus draudžiama:</Text>
          <Bullet text="Skersnukis (Chondrostoma nasus)" />
          <Bullet text="Vijūnas (Misgurnus fossilis)" />
          <Bullet text="Jūrinės nėgės (Petromyzon marinus)" />
          <Bullet text="Mažasias nėgys (Lampetra planeri)" />
          <Bullet text="Nėgių vinglius" />
          <Bullet text="Aštriašnipis eršketas (Acipenser oxyrinchus)" />
          <Bullet text="Sterlas (Acipenser ruthenus)" />
          <Bullet text="Plačiažnyplius vėžius (Astacus astacus)" />
          <Bullet text="Ungurius (Anguilla anguilla) Kuršių mariose" />
          <View style={s.divider} />
          <Text style={s.subNote}>Be žvejo mėgėjo kortelės draudžiama:</Text>
          <Bullet text="Lašišas (Salmo salar)" />
          <Bullet text="Šlakys (Salmo trutta)" />
          <Bullet text="Marguosios upėtakiai (Salmo trutta fario)" />
          <Bullet text="Sykas (Coregonus lavaretus)" />
          <Bullet text="Upinės nėgės (Lampetra fluviatilis)" />
          <View style={s.divider} />
          <Text style={s.subNote}>Sezoniniai draudimai:</Text>
          <TableRow left="Lydekas (Esox lucius)" right="Vas. 1 – Bal. 30" highlight />
          <TableRow left="Sterkus (Sander lucioperca)" right="Kov. 1 – Geg. 31" highlight />
          <TableRow left="Salačius (Aspius aspius)" right="Bal. 1 – Geg. 15" highlight />
          <TableRow left="Kiršlius (Thymallus thymallus)" right="Kov. 1 – Geg. 15" highlight />
          <TableRow left="Marguosios upėtakiai (S. t. fario)" right="Spa. 1 – Gru. 31" highlight />
          <TableRow left="Sykas (Coregonus lavaretus)" right="Spa. 1 – Gru. 31" highlight />
          <TableRow left="Vėgėlė (Lota lota)" right="Gru. 15 – Sau. 31" highlight />
          <TableRow left="Žiobrys (Vimba vimba)" right="Geg. 15 – Bir. 15" highlight />
          <TableRow left="Šamas (Silurus glanis)" right="Lap. 1 – Bal. 1" highlight />
          <TableRow left="Siauražnyplius vėžius (A. leptodactylus)" right="Spa. 15 – Lie. 15" highlight />
          <TableRow left="Karšis – Nemuno deltos reg. parkas" right="Geg. 1 – Bir. 20" highlight />
        </Section>

        {/* ── 7. MINIMALŪS DYDŽIAI ────────────────────────────────────────── */}
        <Section title="Minimalūs dydžiai – laimikį paleisti (§11¹)">
          <Text style={s.subNote}>Pagautas mažesnis (ar nurodytas didesnis) nei šio dydžio žuvis ar vėžias privalo būti nedelsiant paleistas:</Text>
          <TableRow left="Šamas (Silurus glanis)" right="< 75 cm" />
          <TableRow left="Lašišas (Salmo salar)" right="< 65 cm" />
          <TableRow left="Šlakys (Salmo trutta)" right="< 65 cm" />
          <TableRow left="Marguosios upėtakiai (S. t. fario)" right="< 65 cm" />
          <TableRow left="Salačius (Aspius aspius)" right="< 55 cm" />
          <TableRow left="Vėgėlė (Lota lota)" right="< 45 cm" />
          <TableRow left="Ūsorius (Barbus barbus)" right="< 45 cm" />
          <TableRow left="Sterkus (Sander lucioperca)" right="< 50 cm arba > 65 cm *" />
          <TableRow left="Lydekas (Esox lucius)" right="< 50 cm arba > 80 cm *" />
          <TableRow left="Kiršlius (Thymallus thymallus)" right="< 30 cm" />
          <TableRow left="Šapalas (Leuciscus cephalus)" right="< 30 cm" />
          <TableRow left="Meknė (Leuciscus idus)" right="< 30 cm" />
          <TableRow left="Lynas (Tinca tinca)" right="< 25 cm" />
          <TableRow left="Karpis (Cyprinus carpio)" right="< 40 cm" />
          <TableRow left="Baltuosios amūras (Ctenopharyngodon idella)" right="< 40 cm" />
          <TableRow left="Marguosios plačiakakčius (Aristichtys nobilis)" right="< 40 cm" />
          <TableRow left="Siauražnyplius vėžius (A. leptodactylus)" right="< 10 cm" />
          <Bullet text="* Sterkaus ir lydekos dydžių ribojimas netaikomas žvejojant 2 priedo upėse ir jų ruožuose." sub />
          <Bullet text="Žuvys matuojamos nuo snukio pradžios iki uodegos plokštelės galo, vėžiai – nuo galvos smaigalo iki uodegos plokštelės galo." sub />
        </Section>

        {/* ── 8. 1 PRIEDAS ────────────────────────────────────────────────── */}
        <Section title="1 priedas – Vandenys, kuriuose žvejyba uždrausta visus metus" badge={`${BANNED_WATERS.length}`}>
          {BANNED_WATERS.map((w, i) => (
            <Bullet key={i} text={w} />
          ))}
        </Section>

        {/* ── 9. 2 PRIEDAS ────────────────────────────────────────────────── */}
        <Section title="2 priedas – Upės uždraustos spalio 1 d. – gruodžio 31 d." badge={`${ANNEX_2.length}`}>
          <Text style={s.subNote}>Mėgėjų žvejyba draudžiama nuo spalio 1 d. iki gruodžio 31 d.</Text>
          {Object.entries(groupedAnnex2).map(([basin, rivers]) => (
            <View key={basin} style={{ marginTop: 8 }}>
              <Text style={s.basinLabel}>{basin} baseinas</Text>
              <View style={s.riverChips}>
                {rivers.map((r, i) => (
                  <View key={i} style={s.riverChip}>
                    <Text style={s.riverChipText}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Section>

        {/* ── 10. 3 PRIEDAS ───────────────────────────────────────────────── */}
        <Section title="3 priedas – Rugsėjo 16 d. – spalio 15 d. (be kortelės draudžiama)">
          <Text style={s.subNote}>Žvejyba draudžiama neturint žvejo mėgėjo kortelių ar nemokamos žvejybos teisės. Naktinė žvejyba draudžiama visiems.</Text>
          {ANNEX_3.map((r, i) => (
            <View key={i} style={s.annexRow}>
              <Text style={s.annexWater}>{r.water}</Text>
              <Text style={s.annexSection}>{r.section}</Text>
            </View>
          ))}
          <Bullet text="Pastaba: Vilnios upėje nuo žiočių iki Kenos žiočių ir Žeimenos upėje nuo žiočių iki Lakajos žiočių nuo spalio 1 d. žvejyba draudžiama." sub />
        </Section>

        {/* ── 11. 4 PRIEDAS ───────────────────────────────────────────────── */}
        <Section title="4 priedas – Spalio 16 d. – gruodžio 31 d. upių ruožai (uždrausta)">
          {ANNEX_4.map((r, i) => (
            <View key={i} style={s.annexRow}>
              <Text style={s.annexWater}>{r.water}</Text>
              <Text style={s.annexSection}>{r.section}</Text>
            </View>
          ))}
        </Section>

        {/* ── 12. 5 PRIEDAS ───────────────────────────────────────────────── */}
        <Section title="5 priedas – Rugsėjo 16 d. – spalio 15 d. upių ruožai (uždrausta)">
          {ANNEX_5.map((r) => (
            <View key={r.water} style={{ marginBottom: 8 }}>
              <Text style={s.annexWater}>{r.water}</Text>
              {r.sections.map((sec, j) => (
                <Bullet key={j} text={sec} sub />
              ))}
            </View>
          ))}
        </Section>

        {/* ── 13. PRIEVOLĖS ───────────────────────────────────────────────── */}
        <Section title="Prievolės žvejojant (§20)">
          <Bullet text="Žvejodami turėti ir pareikalavus pareigūnams pateikti galiojantį žvejybos leidimą (arba elektroninio leidimo numerį) ir asmens tapatybę patvirtinantį dokumentą." />
          <Bullet text="Prieš pradedant žvejybą surinkti komunalines atliekas (5 m spinduliu nuo žvejybos vietos) ir maišus ar kitą tarą." />
          <Bullet text="Pabaigus žvejybą surinktas atliekas išvežti į komunalinių atliekų surinkimo konteinerius." />
          <Bullet text="Sugavus ar radus ženklintas žuvis, apie tai pranešti AAD arba Žuvininkystės tarnybai prie Žemės ūkio ministerijos (nurodyti sugavimo vietą, datą, laiką, žvejybos įrankius ir masalus, žuvies rūšį, svorį, ilgį ir ženklo numerį)." />
          <Bullet text="Asmenys, pažeidę Taisykles, privalo atlyginti žalą žuvų ištekliams." />
          <Bullet text="Prie mėgėjų žvejybos įrankių nesant savininko, įrankius iki jų savininko ar naudotojo išaiškinimo gali paimti aplinkos apsaugos valstybinės kontrolės pareigūnai." />
        </Section>

      </View>
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  eyebrow: {
    fontSize: 10,
    color: theme.inkSubtle,
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.ink,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.inkSubtle,
    marginTop: 2,
  },
  link: {
    fontSize: 12,
    color: theme.accent,
    marginTop: 4,
    fontWeight: '600',
  },
  sections: {
    paddingHorizontal: 12,
    gap: 8,
  },
  section: {
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.ink,
    flex: 1,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.inkSubtle,
  },
  sectionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: theme.divider,
    gap: 2,
  },
  subNote: {
    fontSize: 12,
    color: theme.inkSubtle,
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 3,
  },
  bulletDot: {
    fontSize: 13,
    color: theme.accent,
    marginTop: 1,
    width: 10,
  },
  bulletText: {
    fontSize: 13,
    color: theme.ink,
    flex: 1,
    lineHeight: 19,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 1,
  },
  tableLeft: {
    fontSize: 13,
    color: theme.ink,
    flex: 1,
    paddingRight: 8,
  },
  tableRight: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.ink,
    minWidth: 80,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: theme.divider,
    marginVertical: 8,
  },
  basinLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.inkSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  riverChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  riverChip: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  riverChipText: {
    fontSize: 12,
    color: theme.ink,
  },
  annexRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  annexWater: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.ink,
    marginBottom: 2,
  },
  annexSection: {
    fontSize: 12,
    color: theme.inkSubtle,
    lineHeight: 17,
  },
});
