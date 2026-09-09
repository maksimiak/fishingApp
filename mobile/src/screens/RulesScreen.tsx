import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Linking } from 'react-native';
import { theme, shadows, fonts } from '../theme/colors';
import { IconChevron } from '../components/Icons';
import { useApp } from '../state/AppState';

// ── Data (verbatim from dc.html D1-14 redakcija 2024-04-30) ──────────────────

const GEAR_TILES = [
  { value: '4', label: 'Įrankiai' },
  { value: '2', label: 'Meškerės' },
  { value: '6', label: 'Kabliukai' },
];

const BAG_LIMITS: { what: string; value: string; hard?: boolean; open?: boolean }[] = [
  { what: 'Šamas', value: '1 vnt.', hard: true },
  { what: 'Lydeka, starkis, margasis upėtakis, kiršlys, salatis, ūsorius', value: 'po 2 vnt.' },
  { what: 'Vėgėlė, ungurys', value: 'po 3 vnt.' },
  { what: 'Šapalas, meknė (bendra suma)', value: '≤ 5 vnt.' },
  { what: 'Siauražnypliai vėžiai', value: '≤ 50 vnt.' },
  { what: 'Rainuotasis, žymėtasis vėžiai', value: 'neribojama', open: true },
];

const FREE_DAYS = ['Vasario 16', 'Kovo 11', 'Liepos 6', 'Rugpjūčio 15'];

const BASIC_SECTIONS: { title: string; badge?: string; items: string[] }[] = [
  {
    title: 'Žvejybos leidimai',
    items: [
      'Žvejo mėgėjo bilietas (L05.01) – leidžia žvejoti valstybiniuose žuvininkystės telkiniuose, kuriuose žvejyba nedraudžiama.',
      'Žvejo mėgėjo kortelė – teisė žvejoti konkrečiame telkinyje, kuriame vykdoma limituota žvejyba.',
      'Privačiuose telkiniuose – tik savininko leidimas arba Taisyklėse numatytais atvejais.',
      'Žvejoti leidžiama tik šviesiu paros metu (nuo saulės patekėjimo iki laidos), išskyrus kai telkinio savininkas leidžia ir tai nurodyta leidime.',
    ],
  },
  {
    title: 'Leistinas įrankių kiekis',
    items: [
      'Vienu metu – ne daugiau kaip 5 bučiukai ar samteliai vėžiams ir 4 kiti mėgėjų žvejybos įrankiai.',
      'Iš 4 įrankių – ne daugiau 2 dvikabliukiai ar daugiakabliukiai (netaikoma stintų žvejybai).',
      'Bendras kabliukų skaičius – ne daugiau 6; stintų ar sliavų žvejybai – ne daugiau 12.',
      'Žvejojant iš inkaro ar sustabdytos vandens transporto priemonės – ne daugiau kaip 2 meškerės.',
      'Rainuotųjų ir žymėtųjų vėžių gaudymui įrankių kiekis neribojamas, bet visus sugautus plačiažnyplius, siauražnyplius vėžius ar žuvis reikia nedelsiant paleisti.',
      'Masalui: samtelio skersmuo ≤ 1 m, akutės ≤ 10 mm; ≤ 30 jauniklių vienam žvejui per žvejybą.',
    ],
  },
  {
    title: 'Draudžiami žvejybos būdai',
    badge: '§9',
    items: [
      'Elektros energija, nuodingosios ar sprogstamosios medžiagos, šaunamieji ar pneumatiniai ginklai (išskyrus povandeninės žūklės šautuvus).',
      'Duriamasis būdas – kai žuvis sugaunama kabliuku už bet kurios kūno dalies, išskyrus galvą – bei smogiamasis būdas.',
      'Povandeninė žūklė be ryškiai matomo plūduro žūklės vietoje.',
      'Dvišakiai ar daugiašakiai strėlių antgaliai (išskyrus ungurių žūklę).',
      'Masalui naudoti gyvūnus iš Invazinių rūšių sąrašo.',
      'Būti iki 25 m nuo tinklinių ne mėgėjų žvejybos įrankių, jei tuo metu žvejyba draudžiama ar neturint leidimo.',
      'Prekiauti mėgėjų žvejybos būdu sužvejotomis žuvimis.',
    ],
  },
  {
    title: 'Prievolės žvejojant',
    badge: '§20',
    items: [
      'Turėti ir pareikalavus pateikti galiojantį žvejybos leidimą ir asmens tapatybės dokumentą.',
      'Prieš žvejybą surinkti komunalines atliekas 5 m spinduliu nuo žvejybos vietos.',
      'Pabaigus žvejybą atliekas išvežti į komunalinių atliekų konteinerius.',
      'Sugavus ženklintą žuvį pranešti AAD arba Žuvininkystės tarnybai – vietą, datą, įrankius, rūšį, svorį, ilgį ir ženklo numerį.',
      'Pažeidus Taisykles – atlyginti žalą žuvų ištekliams.',
      'Kiekvienas asmuo savo laimikį privalo laikyti atskirai nuo kitų.',
    ],
  },
];

const SEASONS: { name: string; latin: string; window: string }[] = [
  { name: 'Lydeka', latin: 'Esox lucius', window: 'Vas. 1 – Bal. 30' },
  { name: 'Starkis', latin: 'Sander lucioperca', window: 'Kov. 1 – Geg. 31' },
  { name: 'Salatis', latin: 'Aspius aspius', window: 'Bal. 1 – Geg. 15' },
  { name: 'Kiršlys', latin: 'Thymallus thymallus', window: 'Kov. 1 – Geg. 15' },
  { name: 'Margasis upėtakis', latin: 'Salmo trutta fario', window: 'Spa. 1 – Gru. 31' },
  { name: 'Sykas', latin: 'Coregonus lavaretus', window: 'Spa. 1 – Gru. 31' },
  { name: 'Vėgėlė', latin: 'Lota lota', window: 'Gru. 15 – Sau. 31' },
  { name: 'Žiobris', latin: 'Vimba vimba', window: 'Geg. 15 – Birž. 15' },
  { name: 'Šamas', latin: 'Silurus glanis', window: 'Lap. 1 – Bal. 1' },
  { name: 'Siauražnyplis vėžys', latin: 'Astacus leptodactylus', window: 'Spa. 15 – Liep. 15' },
  { name: 'Karšis · Nemuno deltos r. p.', latin: 'Abramis brama', window: 'Geg. 1 – Birž. 20' },
];

const SIZES: { name: string; latin: string; value: string; star?: boolean }[] = [
  { name: 'Šamas', latin: 'Silurus glanis', value: '< 75 cm' },
  { name: 'Lašiša', latin: 'Salmo salar', value: '< 65 cm' },
  { name: 'Šlakys', latin: 'Salmo trutta', value: '< 65 cm' },
  { name: 'Margasis upėtakis', latin: 'Salmo trutta fario', value: '< 65 cm' },
  { name: 'Salatis', latin: 'Aspius aspius', value: '< 55 cm' },
  { name: 'Starkis', latin: 'Sander lucioperca', value: '< 50 arba > 65 cm *', star: true },
  { name: 'Lydeka', latin: 'Esox lucius', value: '< 50 arba > 80 cm *', star: true },
  { name: 'Vėgėlė', latin: 'Lota lota', value: '< 45 cm' },
  { name: 'Ūsorius', latin: 'Barbus barbus', value: '< 45 cm' },
  { name: 'Karpis', latin: 'Cyprinus carpio', value: '< 40 cm' },
  { name: 'Baltasis amūras', latin: 'Ctenopharyngodon idella', value: '< 40 cm' },
  { name: 'Margasis plačiakaktis', latin: 'Aristichthys nobilis', value: '< 40 cm' },
  { name: 'Kiršlys', latin: 'Thymallus thymallus', value: '< 30 cm' },
  { name: 'Šapalas', latin: 'Squalius cephalus', value: '< 30 cm' },
  { name: 'Meknė', latin: 'Leuciscus idus', value: '< 30 cm' },
  { name: 'Lynas', latin: 'Tinca tinca', value: '< 25 cm' },
  { name: 'Siauražnyplis vėžys', latin: 'Astacus leptodactylus', value: '< 10 cm' },
];

const PROTECTED_ALL = [
  'Skersnukis', 'Vijūnas', 'Jūrinė nėgė', 'Mažoji nėgė', 'Nėgių vinglys',
  'Aštriašnipis eršketas', 'Sterlas', 'Plačiažnyplis vėžys', 'Ungurys (Kuršių mariose)',
];

const PROTECTED_CARD = ['Lašiša', 'Šlakys', 'Margasis upėtakis', 'Sykas', 'Upinė nėgė'];

const BANNED_WATERS = [
  'Jūra: nuo Tauragės miesto vandenvietės užtvankos iki Tauragės Versmės gimnazijos ir 500 m žemyn nuo Balskų užtvankos',
  'Nemunas: nuo Kauno HE užtvankos iki 500 m žemiau Kauno HE užtvankos',
  'Šventoji: nuo tilto kelyje Kavarskas–Kurkliai iki Kavarsko užtvankos ir nuo tilto Anykščiuose A. Vienuolio g. iki Anykščių užtvankos',
  'Krokų lankos botaninis–zoologinis draustinis',
  'Kuršių marios: tarp Atmatos ir Skirvytės upių mažesniu kaip 1 km atstumu nuo kranto ir Kniaupo įlanka',
  'Valstybinių gamtinių rezervatų, biosferos rezervatų ir valstybinių parkų gamtinių rezervatų vandens telkiniai',
  'Valstybiniai akvakultūros tvenkiniai',
];

const ANNEX_2: [string, string[]][] = [
  ['Nemunas', ['Avirė','Bilsinyčia','Dievogala','Gauja','Karklė','Kerupė','Lapainia','Liekė','Mara','Medukštėlė','Merkys','Ova','Ratnyčia','Rėvuona','Samė','Skirpstauja','Strūzda','Šustis','Šyša','Verknė','Viešvilė','Žvirgždė','Minija (Didovo ež.–Salanto žiotys)']],
  ['Merkys', ['Beržūna','Beržupis','Cirvija','Derežna','Derežnytė','Duobupis D','Geluža','Graužupis','Grūda','Lukna','Maltupis','Mažoji Kena','Nedzingė','Pasgrinda','Skroblus','Spengla','Taurupis','Turė','Ūla','Uosupis','Vardauka','Verseka']],
  ['Neris', ['Bezdonė','Bražuolė','Dūkšta','Juodė','Kamaja','Kena','Laukysta','Lokys','Lomena','Manierka','Mozūriškanka','Musė','Nemenčia','Riešė','Rudamina','Saidė','Strūna','Šešuva','Taurija','Veršupis','Vilnia','Vokė','Žalesa','Žeimena','Žiežmara']],
  ['Žeimena', ['Jusinė','Lakaja','Luknelė','Mera','Peršokšna','Petruškė','Saria','Skerdiksna','Skirda']],
  ['Šventoji', ['Armona','Grabuosta','Nevėža','Pelyša','Siesartis','Storė','Tauražė','Virinta','Želva']],
  ['Dubysa', ['Dratvinys','Gynėvė','Kirkšnovė','Kražantė','Lapišė','Luknė','Mūkė','Šventupis']],
  ['Jūra', ['Agluona','Aitra','Akmena','Ančia','Apusinas','Balčia','Bebirva','Bremena','Egluona','Ežeruona','Giluvė','Irtuona','Ižnė','Lokysta','Šaltuona','Šešuvis','Šunija','Trišiūkštė','Upyna','Upynikė','Vėžus']],
  ['Minija', ['Agluona','Aisė','Alantas','Ašva','Babrungas','Blendžiava','Didžioji Sruoja','Dirsteika','Gerdaujė','Graumena','Judrė','Kapupis','Karkluoja','Lukna','Mišupė','Pala','Salantas','Šalpė','Sausdravas','Šilupis','Skinija','Šlužmė','Šviekšnelė','Trumpė','Upita','Veiviržas','Vieštovė','Žvelesys','Žvelsa']],
  ['Pajūris', ['Apšė','Babrūnė','Bonalė','Darba','Degalas','Juodupis','Kaltis','Kulšė','Luknė','Luoba','Ringelis','Sartis','Šata','Smeltalė','Smeltaitė','Žyba']],
  ['Venta', ['Lūšė','Šerkšnė','Višetė']],
];

const ANNEX_3: [string, string][] = [
  ['Neris', 'Nuo Jonavos J. Ralio g. tilto iki Karaliaus Mindaugo tilto Vilniuje ir nuo Valakupių tilto iki Lietuvos ir Baltarusijos valstybinės sienos'],
  ['Žeimena', 'Nuo žiočių iki Lakajos žiočių'],
  ['Vilnia', 'Nuo žiočių iki Kenos žiočių'],
  ['Šventoji', 'Nuo žiočių iki Dagios žiočių ir nuo Kavarsko užtvankos iki tilto Anykščiuose A. Vienuolio g., išskyrus Kavarsko tvenkinį'],
  ['Siesartis', 'Nuo žiočių iki Želvos–Balninkų tilto'],
  ['Širvinta', 'Nuo žiočių iki Liukonių tilto'],
  ['Dubysa', 'Nuo žiočių iki Kražantės žiočių'],
  ['Jūra', 'Nuo žiočių iki Tauragės Versmės gimnazijos'],
  ['Minija', 'Nuo Lankupių iki Salanto žiočių'],
  ['Veiviržas', 'Nuo žiočių iki geležinkelio Klaipėda–Šilutė tilto'],
  ['Akmena–Danė', 'Nuo Liepų gatvės tęsinio tilto iki Kretingos malūno patvankos'],
  ['Šventoji (pajūrio)', 'Nuo žiočių iki Laukžemės malūno užtvankos'],
];

const ANNEX_4: [string, string][] = [
  ['Neris', 'Nuo kelio Nr. 262 tilto iki Žirmūnų tilto Vilniuje; nuo Valakupių tilto iki geležinkelio Vilnius–Ignalina tilto; nuo Buivydžių pėsčiųjų tilto iki Baluošos žiočių'],
  ['Šventoji', 'Nuo žiočių iki Dagios žiočių ir nuo Kavarsko užtvankos iki Anykščių užtvankos, išskyrus Kavarsko tvenkinį'],
  ['Siesartis', 'Nuo žiočių iki Želvos–Balninkų tilto'],
  ['Širvinta', 'Nuo žiočių iki Liukonių tilto'],
  ['Dubysa', 'Nuo žiočių iki Kražantės žiočių'],
  ['Jūra', 'Nuo žiočių iki Balskų užtvankos'],
  ['Minija', 'Nuo Lankupių iki Salanto žiočių'],
  ['Veiviržas', 'Nuo žiočių iki kelio Veiviržėnai–Švėkšna tilto'],
  ['Šventoji (pajūrio)', 'Nuo Kopų g. pėsčiųjų tilto iki Luknės žiočių'],
  ['Akmena–Danė', 'Nuo Liepų gatvės tęsinio tilto iki Kretingos malūno patvankos'],
];

const ANNEX_5: [string, string[]][] = [
  ['Neris', ['Nuo Žirmūnų tilto iki Karaliaus Mindaugo tilto','Bezdonės upės žiotyse ir 100 m žemyn ir aukštyn','Bražuolės upės žiotyse ir 100 m žemyn','Musės upės žiotyse ir 200 m žemyn ir aukštyn','Nuo Šventosios upės žiočių iki 100 m žemiau Lokio upės žiočių','Veržuvos upės žiotyse ir 100 m žemyn ir aukštyn','Vokės upės žiotyse ir 100 m žemyn ir aukštyn','Nuo geležinkelio Vilnius–Ignalina tilto iki 500 m žemiau Žeimenos žiočių']],
  ['Šventoji', ['Siesarties upės žiotyse 500 m žemyn (iki salos) ir 100 m aukštyn','Širvintos upės žiotyse ir 100 m žemyn ir aukštyn','Žuvintės upės žiotyse ir 100 m žemyn']],
  ['Jūra', ['Ežeruonos upės žiotyse ir 100 m žemyn','Šešuvio upės žiotyse ir 100 m žemyn']],
  ['Minija', ['Agluonos upės žiotyse ir 100 m žemyn','Salanto upės žiotyse ir 100 m žemyn','Veiviržo upės žiotyse ir 500 m žemyn ir 100 m aukštyn']],
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function norm(s: string): string {
  return s.toLowerCase()
    .replace(/ą/g, 'a').replace(/č/g, 'c').replace(/ę/g, 'e').replace(/ė/g, 'e')
    .replace(/į/g, 'i').replace(/š/g, 's').replace(/ų/g, 'u').replace(/ū/g, 'u')
    .replace(/ž/g, 'z');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BasicSection({ title, badge, items, open, onToggle }: {
  title: string; badge?: string; items: string[]; open: boolean; onToggle: () => void;
}) {
  return (
    <View style={s.card}>
      <Pressable onPress={onToggle} style={s.accordionHeader}>
        <Text style={s.accordionTitle}>{title}</Text>
        {badge ? <Text style={s.accordionBadge}>{badge}</Text> : null}
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <IconChevron color={theme.outline} size={14} />
        </View>
      </Pressable>
      {open && (
        <View style={s.accordionBody}>
          {items.map((text, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={s.bulletDot} />
              <Text style={s.bulletText}>{text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function AnnexCard({ num, title, period, count, note, basins, rows, bullets, danger, open, onToggle }: {
  num: string; title: string; period: string; count: string;
  note?: string;
  basins?: { label: string; rivers: string[] }[];
  rows?: [string, string][];
  bullets?: string[];
  danger?: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={s.card}>
      <Pressable onPress={onToggle} style={s.annexHeader}>
        <View style={[s.annexNum, danger && { backgroundColor: theme.dangerSoft }]}>
          <Text style={[s.annexNumText, danger && { color: theme.danger }]}>{num}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.accordionTitle}>{title}</Text>
          <Text style={s.periodText}>{period}</Text>
        </View>
        <View style={s.countBadge}><Text style={s.countBadgeText}>{count}</Text></View>
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <IconChevron color={theme.outline} size={14} />
        </View>
      </Pressable>
      {open && (
        <View style={[s.accordionBody, { paddingTop: 12 }]}>
          {note ? <Text style={s.annexNote}>{note}</Text> : null}
          {basins?.map((basin) => (
            <View key={basin.label} style={{ marginBottom: 12 }}>
              <Text style={s.basinLabel}>{basin.label}</Text>
              <View style={s.chipRow}>
                {basin.rivers.map((r, i) => (
                  <View key={i} style={s.chip}><Text style={s.chipText}>{r}</Text></View>
                ))}
              </View>
            </View>
          ))}
          {rows?.map(([water, section], i) => (
            <View key={i} style={[s.annexRow, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider }]}>
              <Text style={s.annexWater}>{water}</Text>
              <Text style={s.annexSection}>{section}</Text>
            </View>
          ))}
          {bullets?.map((text, i) => (
            <View key={i} style={s.dangerBulletRow}>
              <View style={s.dangerDot} />
              <Text style={s.bulletText}>{text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Segment views ─────────────────────────────────────────────────────────────

function BasicsSegment() {
  const [openBasic, setOpenBasic] = useState(-1);

  return (
    <View style={s.segContent}>
      {/* Catch limit hero */}
      <View style={[s.heroCard, { backgroundColor: theme.primary }]}>
        <Text style={s.heroEyebrow}>Vienos žvejybos riba</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <Text style={s.heroValue}>5 kg</Text>
          <Text style={s.heroSub}>Kuršių mariose 7 kg</Text>
        </View>
        <View style={s.heroDivider} />
        <Text style={s.heroBody}>Neskaitant stintų. Viena žuvis, sunkesnė nei 5 kg, laikoma visos žvejybos laimikiu.</Text>
      </View>

      {/* Gear tiles */}
      <View style={s.gearGrid}>
        {GEAR_TILES.map((g) => (
          <View key={g.label} style={s.gearTile}>
            <Text style={s.gearValue}>{g.value}</Text>
            <Text style={s.gearLabel}>{g.label}</Text>
          </View>
        ))}
      </View>

      {/* Bag limits */}
      <View>
        <Text style={s.sectionEyebrow}>Dienos laimikio normos</Text>
        <View style={[s.card, { paddingHorizontal: 16, paddingVertical: 2 }]}>
          {BAG_LIMITS.map((b, i) => (
            <View key={i} style={[s.bagRow, i < BAG_LIMITS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider }]}>
              <Text style={s.bagWhat}>{b.what}</Text>
              <Text style={[s.bagValue, b.hard && { color: theme.danger }, b.open && { color: theme.open }]}>
                {b.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Free fishing days */}
      <View style={[s.freeDaysCard, { backgroundColor: theme.openBg }]}>
        <Text style={[s.sectionEyebrow, { color: '#00714d', marginBottom: 9 }]}>Nemokamos žvejybos dienos</Text>
        <View style={s.freeDaysRow}>
          {FREE_DAYS.map((d) => (
            <View key={d} style={s.freeDayPill}>
              <Text style={s.freeDayText}>{d}</Text>
            </View>
          ))}
        </View>
        <Text style={[s.bodyText, { color: theme.inkMuted, marginTop: 10 }]}>
          Visuose valstybiniuose telkiniuose – be žvejo mėgėjo bilieto.
        </Text>
      </View>

      {/* Accordion sections */}
      {BASIC_SECTIONS.map((sec, i) => (
        <BasicSection
          key={i}
          title={sec.title}
          badge={sec.badge}
          items={sec.items}
          open={openBasic === i}
          onToggle={() => setOpenBasic(openBasic === i ? -1 : i)}
        />
      ))}

      {/* e-tar link */}
      <Pressable
        style={s.etarBtn}
        onPress={() => Linking.openURL('https://www.e-tar.lt/portal/lt/legalAct/TAR.FEC90E6937D4/asr').catch(() => {})}
      >
        <Text style={s.etarText}>Visas tekstas e-tar.lt ↗</Text>
      </Pressable>
    </View>
  );
}

function SizesSegment() {
  const { t } = useApp();
  const [query, setQuery] = useState('');
  const q = norm(query.trim());
  const match = (sp: { name: string; latin: string }) =>
    !q || norm(sp.name).includes(q) || norm(sp.latin).includes(q);

  const filteredSeasons = SEASONS.filter(match);
  const filteredSizes = SIZES.filter(match);

  return (
    <View style={s.segContent}>
      {/* Search */}
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t.searchSpecies}
          placeholderTextColor={theme.inkSubtle}
          style={s.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Text style={s.searchClear}>×</Text>
          </Pressable>
        )}
      </View>

      {/* Closed seasons */}
      <View>
        <Text style={s.sectionEyebrow}>Neršto draudimai · sezoniniai</Text>
        <View style={[s.card, { overflow: 'hidden' }]}>
          {filteredSeasons.length === 0 ? (
            <View style={{ paddingVertical: 15, paddingHorizontal: 16 }}>
              <Text style={s.emptyText}>Nėra atitikčių pagal „{query}".</Text>
            </View>
          ) : filteredSeasons.map((sp, i) => (
            <View key={sp.name + sp.latin} style={[s.speciesRow, i < filteredSeasons.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider }]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.speciesName}>{sp.name}</Text>
                <Text style={s.speciesLatin}>{sp.latin}</Text>
              </View>
              <View style={s.seasonPill}>
                <Text style={s.seasonPillText}>{sp.window}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Min sizes */}
      <View>
        <Text style={s.sectionEyebrow}>Minimalūs dydžiai · paleisti</Text>
        <View style={[s.card, { overflow: 'hidden' }]}>
          {filteredSizes.length === 0 ? (
            <View style={{ paddingVertical: 15, paddingHorizontal: 16 }}>
              <Text style={s.emptyText}>Nėra atitikčių pagal „{query}".</Text>
            </View>
          ) : filteredSizes.map((sz, i) => (
            <View key={sz.name + sz.latin} style={[s.speciesRow, i < filteredSizes.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider }]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.speciesName}>{sz.name}</Text>
                <Text style={s.speciesLatin}>{sz.latin}</Text>
              </View>
              <Text style={[s.sizeValue, sz.star && { color: theme.warning }]}>{sz.value}</Text>
            </View>
          ))}
        </View>
        <Text style={s.footnote}>
          * Sterkio ir lydekos viršutinė riba netaikoma 2 priedo upėse. Žuvys matuojamos nuo snukio iki uodegos plokštelės galo.
        </Text>
      </View>

      {/* Protected species */}
      <View>
        <Text style={s.sectionEyebrow}>Saugomos rūšys</Text>
        <View style={[s.protectedCard, { backgroundColor: theme.dangerSoft }]}>
          <Text style={[s.protectedTitle, { color: theme.danger }]}>Draudžiama visus metus</Text>
          <View style={s.chipRow}>
            {PROTECTED_ALL.map((name) => (
              <View key={name} style={s.protectedChip}><Text style={s.protectedChipText}>{name}</Text></View>
            ))}
          </View>
        </View>
        <View style={[s.protectedCard, { backgroundColor: theme.warningSoft, marginTop: 10 }]}>
          <Text style={[s.protectedTitle, { color: theme.warning }]}>Tik su žvejo mėgėjo kortele</Text>
          <View style={s.chipRow}>
            {PROTECTED_CARD.map((name) => (
              <View key={name} style={s.protectedChip}><Text style={s.protectedChipText}>{name}</Text></View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function AnnexesSegment() {
  const [openAnnex, setOpenAnnex] = useState(0);
  const annex2Count = ANNEX_2.reduce((n, [, rs]) => n + rs.length, 0);
  const annex5Count = ANNEX_5.reduce((n, [, ss]) => n + ss.length, 0);

  const annexDefs = [
    {
      num: '1', title: 'Žvejyba uždrausta visus metus', period: 'Ištisus metus', danger: true,
      count: String(BANNED_WATERS.length), bullets: BANNED_WATERS,
    },
    {
      num: '2', title: 'Upės, uždarytos rudenį', period: 'Spa. 1 – Gru. 31',
      count: String(annex2Count),
      basins: ANNEX_2.map(([label, rivers]) => ({ label: `${label} baseinas`, rivers })),
    },
    {
      num: '3', title: 'Ruožai be žvejo mėgėjo kortelės', period: 'Rugs. 16 – Spa. 15',
      count: String(ANNEX_3.length),
      note: 'Žvejyba draudžiama neturint žvejo mėgėjo kortelės ar nemokamos žvejybos teisės. Naktinė žvejyba draudžiama visiems.',
      rows: ANNEX_3,
    },
    {
      num: '4', title: 'Visiškai uždaryti ruožai', period: 'Spa. 16 – Gru. 31',
      count: String(ANNEX_4.length), rows: ANNEX_4,
    },
    {
      num: '5', title: 'Uždaryti ruožai ir žiotys', period: 'Rugs. 16 – Spa. 15',
      count: String(annex5Count),
      basins: ANNEX_5.map(([label, sections]) => ({ label, rivers: sections })),
    },
  ];

  return (
    <View style={s.segContent}>
      <Text style={s.annexIntro}>
        Penki priedai nustato, kur ir kada žvejyba draudžiama neatsižvelgiant į rūšį.
      </Text>
      {annexDefs.map((a, i) => (
        <AnnexCard
          key={a.num}
          num={a.num}
          title={a.title}
          period={a.period}
          count={a.count}
          note={a.note}
          basins={a.basins}
          rows={a.rows as [string, string][] | undefined}
          bullets={a.bullets}
          danger={a.danger}
          open={openAnnex === i}
          onToggle={() => setOpenAnnex(openAnnex === i ? -1 : i)}
        />
      ))}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

type Segment = 'basics' | 'sizes' | 'annexes';
const SEGMENTS: { id: Segment; label: string }[] = [
  { id: 'basics', label: 'Pagrindai' },
  { id: 'sizes', label: 'Rūšys ir dydžiai' },
  { id: 'annexes', label: 'Priedai' },
];

export function RulesScreen() {
  const [seg, setSeg] = useState<Segment>('basics');

  return (
    <View style={s.root}>
      <View style={s.headerArea}>
        <Text style={s.headerMono}>D1-14 · REDAKCIJA 2024-04-30</Text>
        <Text style={s.headerTitle}>Taisyklės</Text>
      </View>

      <View style={s.segTabsRow}>
        {SEGMENTS.map((sg) => (
          <Pressable
            key={sg.id}
            onPress={() => setSeg(sg.id)}
            style={[s.segTab, sg.id === seg && s.segTabActive]}
          >
            <Text style={[s.segTabText, sg.id === seg && s.segTabTextActive]} numberOfLines={1}>
              {sg.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {seg === 'basics' && <BasicsSegment />}
        {seg === 'sizes' && <SizesSegment />}
        {seg === 'annexes' && <AnnexesSegment />}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexShrink: 0,
  },
  headerMono: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.mono,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.inkMuted,
    lineHeight: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: -0.5,
    color: theme.ink,
    lineHeight: 34,
    marginTop: 3,
  },
  segTabsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexShrink: 0,
  },
  segTab: {
    flex: 1,
    height: 34,
    borderRadius: 999,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segTabActive: {
    backgroundColor: theme.primary,
  },
  segTabText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.1,
    color: theme.inkTertiary,
  },
  segTabTextActive: {
    color: theme.card,
  },
  segContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 12,
  },
  // Hero
  heroCard: {
    borderRadius: 20,
    padding: 16,
    ...shadows.raised,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.primaryLabel,
    lineHeight: 14,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: -0.5,
    color: theme.statGreen,
    lineHeight: 36,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    color: theme.primaryLabel,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginVertical: 11,
  },
  heroBody: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    lineHeight: 18,
    color: theme.primaryFixed,
  },
  bodyText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    lineHeight: 18,
  },
  // Gear tiles
  gearGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  gearTile: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 12,
    ...shadows.card,
  },
  gearValue: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: -0.5,
    color: theme.ink,
    lineHeight: 28,
  },
  gearLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.inkMuted,
    marginTop: 3,
    lineHeight: 14,
  },
  // Eyebrow
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.inkMuted,
    marginBottom: 8,
    lineHeight: 14,
  },
  // Card surface
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    ...shadows.card,
  },
  // Bag limits
  bagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 11,
  },
  bagWhat: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    lineHeight: 19,
    color: theme.ink,
  },
  bagValue: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    lineHeight: 19,
    color: theme.ink,
    flexShrink: 0,
  },
  // Free days
  freeDaysCard: {
    borderRadius: 16,
    padding: 15,
  },
  freeDaysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  freeDayPill: {
    backgroundColor: theme.card,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  freeDayText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fonts.sansSemiBold,
    color: theme.primary,
    lineHeight: 16,
  },
  // Accordion
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.1,
    color: theme.ink,
    lineHeight: 20,
  },
  accordionBadge: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.mono,
    letterSpacing: 0.4,
    color: theme.inkTertiary,
    flexShrink: 0,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: theme.divider,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.open,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    lineHeight: 19,
    color: theme.ink,
  },
  dangerBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 7,
  },
  dangerDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.danger,
    marginTop: 7,
    flexShrink: 0,
  },
  // e-tar
  etarBtn: {
    height: 48,
    backgroundColor: theme.surfaceAlt,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etarText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.1,
    color: theme.primary,
  },
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: theme.card,
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    ...shadows.card,
  },
  searchIcon: {
    fontSize: 18,
    color: theme.inkSubtle,
    flexShrink: 0,
    lineHeight: 22,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    color: theme.ink,
    padding: 0,
  },
  searchClear: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: fonts.sansSemiBold,
    color: theme.outline,
    lineHeight: 22,
  },
  // Species rows
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  speciesName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.1,
    color: theme.ink,
    lineHeight: 20,
  },
  speciesLatin: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    fontStyle: 'italic',
    color: theme.inkTertiary,
    lineHeight: 17,
  },
  seasonPill: {
    backgroundColor: theme.dangerSoft,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexShrink: 0,
  },
  seasonPillText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.sansSemiBold,
    color: theme.danger,
    lineHeight: 16,
  },
  sizeValue: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.mono,
    letterSpacing: 0.3,
    color: theme.ink,
    flexShrink: 0,
  },
  footnote: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    lineHeight: 17,
    color: theme.inkMuted,
    marginTop: 9,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    lineHeight: 19,
    color: theme.inkMuted,
  },
  // Protected
  protectedCard: {
    borderRadius: 16,
    padding: 14,
  },
  protectedTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 9,
  },
  protectedChip: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  protectedChipText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    lineHeight: 17,
    color: theme.ink,
  },
  // Annexes
  annexIntro: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    lineHeight: 19,
    color: theme.inkMuted,
  },
  annexHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  annexNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  annexNumText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.inkMuted,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    color: theme.inkMuted,
    marginTop: 1,
    lineHeight: 17,
  },
  countBadge: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sansBold,
    color: theme.inkSubtle,
  },
  annexNote: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    lineHeight: 17,
    color: theme.inkMuted,
    marginBottom: 10,
  },
  basinLabel: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.mono,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.inkMuted,
    marginBottom: 6,
    lineHeight: 14,
  },
  chip: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    lineHeight: 17,
    color: theme.ink,
  },
  annexRow: {
    paddingVertical: 8,
  },
  annexWater: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.1,
    color: theme.ink,
    lineHeight: 20,
  },
  annexSection: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.sansMedium,
    lineHeight: 17,
    color: theme.inkMuted,
    marginTop: 2,
  },
});
