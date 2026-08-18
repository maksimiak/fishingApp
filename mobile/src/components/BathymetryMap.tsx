import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { theme } from '../theme/colors';

interface BathyEntry {
  vw: number;
  vh: number;
  maxDepth: number;
  zones: [number, string][];
}

// Lazy-loaded so the 1.8 MB JSON doesn't parse until this component mounts
let _cache: Record<string, BathyEntry> | null = null;
function getBathy(): Record<string, BathyEntry> {
  if (!_cache) _cache = require('../data/bathymetry.json') as Record<string, BathyEntry>;
  return _cache;
}

// Light ice-blue → deep navy gradient
function depthColor(depth: number, maxDepth: number): string {
  const t = maxDepth > 0 ? Math.min(depth / maxDepth, 1) : 0;
  const r = Math.round(219 - (219 - 23) * t);   // 219 → 23
  const g = Math.round(234 - (234 - 37) * t);   // 234 → 37
  const b = Math.round(254 - (254 - 84) * t);   // 254 → 84
  return `rgb(${r},${g},${b})`;
}

interface Props {
  kadastroId: string;
  width: number;   // available width in px
  lang: 'lt' | 'en';
}

export function BathymetryMap({ kadastroId, width, lang }: Props) {
  const entry = useMemo(() => getBathy()[kadastroId] ?? null, [kadastroId]);

  if (!entry) {
    return (
      <View style={[s.empty, { width }]}>
        <Text style={s.emptyText}>
          {lang === 'lt' ? 'Gylio duomenų nėra' : 'No depth data available'}
        </Text>
      </View>
    );
  }

  const { vw, vh, maxDepth, zones } = entry;
  const svgH = Math.round((width * vh) / vw);

  // Legend: pick 4 evenly spaced depth labels
  const legendDepths = useMemo(() => {
    const unique = [...new Set(zones.map(([d]) => d))].sort((a, b) => a - b);
    if (unique.length <= 4) return unique;
    const step = (unique.length - 1) / 3;
    return [0, 1, 2, 3].map((i) => unique[Math.round(i * step)]);
  }, [zones]);

  return (
    <View style={s.root}>
      <View style={[s.svgWrap, { width, height: svgH }]}>
        <Svg
          width={width}
          height={svgH}
          viewBox={`0 0 ${vw} ${vh}`}
          style={{ borderRadius: 12 }}
        >
          {/* Background (land / no-data color) */}
          <Rect x={0} y={0} width={vw} height={vh} fill={theme.surfaceAlt} />

          {zones.map(([depth, pathD], i) => (
            <Path
              key={i}
              d={pathD}
              fill={depthColor(depth, maxDepth)}
              fillRule="evenodd"
              stroke="none"
            />
          ))}
        </Svg>
      </View>

      {/* Depth legend */}
      <View style={s.legend}>
        <Text style={s.legendLabel}>
          {lang === 'lt' ? 'Gylis' : 'Depth'}
        </Text>
        <View style={s.legendBar}>
          {legendDepths.map((d) => (
            <View key={d} style={s.legendItem}>
              <View style={[s.legendSwatch, { backgroundColor: depthColor(d, maxDepth) }]} />
              <Text style={s.legendText}>{d} m</Text>
            </View>
          ))}
        </View>
        <Text style={s.legendMax}>
          {lang === 'lt' ? `Maks. ${maxDepth} m` : `Max ${maxDepth} m`}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { gap: 12 },
  svgWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 13, color: theme.inkSubtle, textAlign: 'center' },
  legend: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 12,
    gap: 8,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.inkSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendBar: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: { width: 14, height: 14, borderRadius: 3 },
  legendText: { fontSize: 12, color: theme.ink },
  legendMax: { fontSize: 11, color: theme.inkSubtle },
});
