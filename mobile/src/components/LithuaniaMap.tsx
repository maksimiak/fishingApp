import React from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  Pattern,
  Rect,
  Line,
  ClipPath,
  Text as SvgText,
} from 'react-native-svg';
import { WATERBODIES } from '../data/waterbodies';
import { getStatus } from '../data/rules';
import type { Lang } from '../data/types';

const LITHUANIA_PATH = `
M 40 120
C 30 115, 25 108, 28 95
C 32 85, 45 78, 55 72
C 65 65, 72 55, 82 50
C 95 44, 108 42, 120 46
C 135 52, 148 50, 160 45
C 175 40, 190 42, 205 50
C 220 58, 235 54, 250 50
C 270 45, 290 48, 310 52
C 330 56, 350 58, 365 50
C 378 44, 388 50, 385 65
C 382 80, 370 90, 360 100
C 350 110, 358 120, 365 128
C 372 138, 378 148, 372 160
C 365 172, 350 170, 338 166
C 325 162, 312 168, 300 175
C 285 185, 270 190, 258 198
C 245 208, 232 215, 220 218
C 205 222, 190 225, 178 220
C 165 215, 152 210, 140 215
C 128 222, 115 225, 105 218
C 92 210, 80 205, 70 198
C 58 190, 48 180, 42 168
C 35 155, 38 140, 40 120 Z
`;

const NEIGHBOR_PATHS = [
  'M 20 80 L 390 20 L 395 45 C 380 48, 365 50, 350 50 C 330 56, 310 52, 290 48 C 270 45, 250 50, 235 54 C 220 58, 205 50, 190 42 C 175 40, 160 45, 145 50 C 130 54, 115 46, 100 46 C 85 46, 70 55, 55 72 C 45 78, 32 85, 28 95 C 27 98, 22 90, 20 80 Z',
  'M 370 20 L 400 20 L 400 260 L 360 260 C 345 250, 335 235, 330 220 C 325 205, 320 190, 310 178 C 305 172, 315 162, 325 166 C 335 170, 345 172, 355 168 C 365 162, 375 150, 372 135 C 370 120, 360 110, 358 100 C 355 90, 365 78, 375 68 C 382 58, 388 45, 385 30 C 384 25, 380 20, 370 20 Z',
  'M 70 210 L 400 260 L 30 260 C 35 245, 40 230, 48 220 C 58 210, 70 210, 70 210 Z',
  'M 0 115 L 60 110 C 65 125, 70 145, 78 160 C 85 172, 75 185, 60 190 C 45 192, 30 185, 18 175 C 5 165, 0 145, 0 115 Z',
];

const STYLE = {
  land: { open: '#e8eadf', closed: '#f2c9c4', partial: '#f4e0b4', neutral: '#edeadb' },
  landStroke: '#8a9378',
  water: '#d9e4e8',
  neighbor: '#f6f4ec',
  neighborStroke: '#c6c2b0',
  label: '#5c6550',
  labelBg: 'rgba(255,255,255,0.78)',
  riverStroke: '#9eb3bb',
};

function statusFor(waterbodyId: string, date: Date): 'open' | 'closed' | 'partial' {
  const wb = WATERBODIES.find((w) => w.id === waterbodyId);
  if (!wb) return 'open';
  return getStatus(wb, date).status;
}

interface Props {
  date: Date;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  savedIds?: string[];
  lang?: Lang;
  width?: number | string;
  height?: number | string;
}

export function LithuaniaMap({
  date,
  selectedId = null,
  onSelect = () => {},
  savedIds = [],
  lang = 'lt',
  width = '100%',
  height = '100%',
}: Props) {
  const regions = [
    { cx: 90, cy: 90, r: 70, ids: ['plateliai'] },
    { cx: 230, cy: 110, r: 80, ids: ['galve', 'neris', 'siesikai', 'rubikiai'] },
    { cx: 200, cy: 175, r: 75, ids: ['kaunas-res', 'nemunas'] },
    { cx: 340, cy: 70, r: 70, ids: ['drukshiai'] },
    { cx: 170, cy: 215, r: 55, ids: ['dusia'] },
    { cx: 55, cy: 115, r: 45, ids: ['kursiu'] },
  ];

  const regionColor = (ids: string[]) => {
    const statuses = ids.map((id) => statusFor(id, date));
    if (statuses.every((s) => s === 'open')) return STYLE.land.open;
    if (statuses.every((s) => s === 'closed')) return STYLE.land.closed;
    return STYLE.land.partial;
  };

  return (
    <View style={{ width: width as any, height: height as any }}>
      <Svg viewBox="0 0 400 260" width="100%" height="100%">
        <Defs>
          <Pattern id="stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Rect width={6} height={6} fill="transparent" />
            <Line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
          </Pattern>
          <ClipPath id="lt-clip">
            <Path d={LITHUANIA_PATH} />
          </ClipPath>
        </Defs>

        <Rect x={0} y={0} width={400} height={260} fill={STYLE.water} />

        {NEIGHBOR_PATHS.map((d, i) => (
          <Path key={i} d={d} fill={STYLE.neighbor} stroke={STYLE.neighborStroke} strokeWidth={0.5} opacity={0.85} />
        ))}

        <Path d={LITHUANIA_PATH} fill={STYLE.land.neutral} stroke={STYLE.landStroke} strokeWidth={1.2} />

        <G clipPath="url(#lt-clip)">
          {regions.map((r, i) => (
            <Circle key={i} cx={r.cx} cy={r.cy} r={r.r} fill={regionColor(r.ids)} opacity={0.55} />
          ))}
          <Path d={LITHUANIA_PATH} fill="url(#stripes)" opacity={0.4} />
        </G>

        {/* Rivers */}
        <G fill="none" stroke={STYLE.riverStroke} strokeWidth={1.5} strokeLinecap="round" opacity={0.8}>
          <Path d="M 70 160 Q 110 175, 150 180 T 210 175 T 260 160 Q 290 150, 315 140" />
          <Path d="M 260 160 Q 280 135, 310 120 T 360 90" />
        </G>

        {/* Markers */}
        {WATERBODIES.map((wb) => {
          const st = statusFor(wb.id, date);
          const isSelected = wb.id === selectedId;
          const isSaved = savedIds.includes(wb.id);
          const fill = st === 'open' ? '#3d7a4a' : st === 'closed' ? '#b54842' : '#c98a2e';
          const size = wb.type === 'river' ? 0 : Math.max(4, Math.min(10, Math.sqrt(wb.area) / 18));
          return (
            <G key={wb.id} onPress={() => onSelect(wb.id)}>
              {wb.type !== 'river' && (
                <>
                  {isSelected && (
                    <Circle cx={wb.x} cy={wb.y} r={size + 6} fill="none" stroke={fill} strokeWidth={1.5} opacity={0.5} />
                  )}
                  <Circle cx={wb.x} cy={wb.y} r={size + 2} fill={STYLE.labelBg} />
                  <Circle cx={wb.x} cy={wb.y} r={size} fill={fill} stroke="white" strokeWidth={1} />
                  {isSaved && (
                    <Circle cx={wb.x + size - 1} cy={wb.y - size + 1} r={2.2} fill="#d4a84a" stroke="white" strokeWidth={0.8} />
                  )}
                </>
              )}
              <Circle cx={wb.x} cy={wb.y} r={14} fill="transparent" />
            </G>
          );
        })}

        {/* Labels */}
        {WATERBODIES.filter((wb) => wb.area > 900 || wb.id === selectedId || savedIds.includes(wb.id)).map((wb) => (
          <SvgText
            key={'l-' + wb.id}
            x={wb.x}
            y={wb.y - 11}
            textAnchor="middle"
            fontSize={7}
            fontWeight="600"
            fill={STYLE.label}
          >
            {lang === 'lt' ? wb.nameLt : wb.nameEn}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
