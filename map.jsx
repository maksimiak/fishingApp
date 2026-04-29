// map.jsx — Lithuania SVG map with fishable zones, water bodies
// A stylized (not geographically precise) map of Lithuania.
// Shape is an original simplified outline — not traced from any copyrighted source.

// Simplified LT polygon (~400 x 260 viewport).
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

// — Decorative neighbor shapes (just for composition hint) —
const NEIGHBOR_PATHS = [
  // Latvia, top
  { d: 'M 20 80 L 390 20 L 395 45 C 380 48, 365 50, 350 50 C 330 56, 310 52, 290 48 C 270 45, 250 50, 235 54 C 220 58, 205 50, 190 42 C 175 40, 160 45, 145 50 C 130 54, 115 46, 100 46 C 85 46, 70 55, 55 72 C 45 78, 32 85, 28 95 C 27 98, 22 90, 20 80 Z', fill: 'neighbor' },
  // Belarus, east
  { d: 'M 370 20 L 400 20 L 400 260 L 360 260 C 345 250, 335 235, 330 220 C 325 205, 320 190, 310 178 C 305 172, 315 162, 325 166 C 335 170, 345 172, 355 168 C 365 162, 375 150, 372 135 C 370 120, 360 110, 358 100 C 355 90, 365 78, 375 68 C 382 58, 388 45, 385 30 C 384 25, 380 20, 370 20 Z', fill: 'neighbor' },
  // Poland, south
  { d: 'M 70 210 L 400 260 L 30 260 C 35 245, 40 230, 48 220 C 58 210, 70 210, 70 210 Z', fill: 'neighbor' },
  // Russia (Kaliningrad), southwest
  { d: 'M 0 115 L 60 110 C 65 125, 70 145, 78 160 C 85 172, 75 185, 60 190 C 45 192, 30 185, 18 175 C 5 165, 0 145, 0 115 Z', fill: 'neighbor' },
];

// Style helpers
const MAP_STYLES = {
  minimal: {
    land:     { open: '#e8eadf', closed: '#f2c9c4', partial: '#f4e0b4', neutral: '#edeadb' },
    landStroke: '#8a9378',
    water: '#d9e4e8',
    neighbor: '#f6f4ec',
    neighborStroke: '#c6c2b0',
    label: '#5c6550',
    labelBg: 'rgba(255,255,255,.78)',
    riverStroke: '#9eb3bb',
    waterDot: { lake: '#4a7080', river: '#4a7080', reservoir: '#3f5d6c', lagoon: '#5a8088' },
  },
  topographic: {
    land:     { open: '#d9e0c8', closed: '#e8b6ac', partial: '#edd093', neutral: '#d9dcc6' },
    landStroke: '#6a7759',
    water: '#c6d5d9',
    neighbor: '#ecebd8',
    neighborStroke: '#aba88f',
    label: '#3e4a34',
    labelBg: 'rgba(250,248,238,.85)',
    riverStroke: '#7ea3ae',
    waterDot: { lake: '#2f5564', river: '#2f5564', reservoir: '#274a58', lagoon: '#456e76' },
    contour: true,
  },
  satellite: {
    land:     { open: '#3d5233', closed: '#6d3a33', partial: '#7a5e2a', neutral: '#4a5340' },
    landStroke: '#26301e',
    water: '#1f3a47',
    neighbor: '#2d3529',
    neighborStroke: '#1a1f15',
    label: '#ede9d8',
    labelBg: 'rgba(20,26,18,.65)',
    riverStroke: '#3a7a8f',
    waterDot: { lake: '#7dc3d4', river: '#7dc3d4', reservoir: '#5ea1b5', lagoon: '#8fc8d2' },
    dark: true,
  },
};

function statusFor(waterbody, date) {
  const s = getStatus(waterbody, date);
  return s.status;
}

function LithuaniaMap({
  date,
  mapStyle = 'minimal',
  selectedId = null,
  onSelect = () => {},
  savedIds = [],
  showLabels = true,
  zoneOverlay = true,
  lang = 'lt',
  width = 380,
  height = 260,
}) {
  const style = MAP_STYLES[mapStyle] || MAP_STYLES.minimal;

  // Voronoi-ish: assign each pixel region to the dominant status of nearby water bodies.
  // For visual simplicity, we just tint the whole land based on the average — but it's
  // more informative to draw status bands ourselves around known regions.
  // We'll overlay 4 soft regional blobs whose color reflects the majority water-body
  // status in that region.

  const regions = [
    { cx: 90, cy: 90, r: 70, ids: ['plateliai'] },   // west
    { cx: 230, cy: 110, r: 80, ids: ['galve', 'neris', 'siesikai', 'rubikiai'] }, // center/east
    { cx: 200, cy: 175, r: 75, ids: ['kaunas-res', 'nemunas'] }, // south-center
    { cx: 340, cy: 70, r: 70, ids: ['drukshiai'] },  // northeast
    { cx: 170, cy: 215, r: 55, ids: ['dusia'] },     // south
    { cx: 55, cy: 115, r: 45, ids: ['kursiu'] },     // coast
  ];

  const regionColor = (r) => {
    if (!zoneOverlay) return style.land.neutral;
    const statuses = r.ids.map(id => statusFor(WATERBODIES.find(w => w.id === id), date));
    if (statuses.every(s => s === 'open')) return style.land.open;
    if (statuses.every(s => s === 'closed')) return style.land.closed;
    return style.land.partial;
  };

  return (
    <svg viewBox="0 0 400 260" width={width} height={height} style={{ display: 'block', userSelect: 'none' }}>
      <defs>
        <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <pattern id="stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="transparent"/>
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,.08)" strokeWidth="1"/>
        </pattern>
        <clipPath id="lt-clip">
          <path d={LITHUANIA_PATH} />
        </clipPath>
      </defs>

      {/* water backdrop */}
      <rect x="0" y="0" width="400" height="260" fill={style.water}/>

      {/* neighbors */}
      {NEIGHBOR_PATHS.map((n, i) => (
        <path key={i} d={n.d} fill={style.neighbor} stroke={style.neighborStroke} strokeWidth="0.5" opacity="0.85"/>
      ))}

      {/* LT land base */}
      <path d={LITHUANIA_PATH} fill={style.land.neutral} stroke={style.landStroke} strokeWidth="1.2"/>

      {/* zone overlay (clipped to land) */}
      <g clipPath="url(#lt-clip)">
        {regions.map((r, i) => (
          <circle key={i} cx={r.cx} cy={r.cy} r={r.r} fill={regionColor(r)} opacity={zoneOverlay ? 0.65 : 0} filter="url(#soft-blur)"/>
        ))}
        {/* subtle land texture */}
        <path d={LITHUANIA_PATH} fill="url(#stripes)" opacity={style.dark ? 0.25 : 0.4}/>
        {/* topographic contour lines */}
        {style.contour && (
          <g stroke={style.landStroke} strokeWidth="0.3" fill="none" opacity="0.35">
            <path d="M 60 100 Q 140 80, 220 95 T 360 110"/>
            <path d="M 50 140 Q 160 125, 260 140 T 380 155"/>
            <path d="M 70 180 Q 180 170, 280 180 T 370 200"/>
          </g>
        )}
      </g>

      {/* rivers (Nemunas, Neris) */}
      <g fill="none" stroke={style.riverStroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
        <path d="M 70 160 Q 110 175, 150 180 T 210 175 T 260 160 Q 290 150, 315 140" />
        <path d="M 260 160 Q 280 135, 310 120 T 360 90" />
      </g>

      {/* water body markers */}
      {WATERBODIES.map(wb => {
        const st = statusFor(wb, date);
        const isSelected = wb.id === selectedId;
        const isSaved = savedIds.includes(wb.id);
        const fill = st === 'open' ? '#3d7a4a' : st === 'closed' ? '#b54842' : '#c98a2e';
        const size = wb.type === 'river' ? 0 : Math.max(4, Math.min(10, Math.sqrt(wb.area) / 18));
        return (
          <g key={wb.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(wb.id)}>
            {wb.type !== 'river' && (
              <>
                {/* halo for selected */}
                {isSelected && (
                  <circle cx={wb.x} cy={wb.y} r={size + 6} fill="none" stroke={fill} strokeWidth="1.5" opacity="0.5"/>
                )}
                <circle cx={wb.x} cy={wb.y} r={size + 2} fill={style.labelBg}/>
                <circle cx={wb.x} cy={wb.y} r={size} fill={fill} stroke="white" strokeWidth="1"/>
                {isSaved && (
                  <circle cx={wb.x + size - 1} cy={wb.y - size + 1} r="2.2" fill="#d4a84a" stroke="white" strokeWidth="0.8"/>
                )}
              </>
            )}
            {/* hit target */}
            <circle cx={wb.x} cy={wb.y} r={12} fill="transparent"/>
          </g>
        );
      })}

      {/* labels */}
      {showLabels && WATERBODIES.filter(wb => wb.area > 900 || wb.id === selectedId || savedIds.includes(wb.id)).map(wb => (
        <g key={'l-' + wb.id} pointerEvents="none">
          <text
            x={wb.x} y={wb.y - 11}
            textAnchor="middle"
            fontSize="7"
            fontFamily="ui-sans-serif, system-ui"
            fontWeight="600"
            fill={style.label}
            style={{ paintOrder: 'stroke', stroke: style.labelBg, strokeWidth: 2.5, strokeLinejoin: 'round' }}
          >
            {lang === 'lt' ? wb.nameLt : wb.nameEn}
          </text>
        </g>
      ))}

      {/* compass */}
      <g transform="translate(30, 232)">
        <circle cx="0" cy="0" r="10" fill={style.labelBg} stroke={style.landStroke} strokeWidth="0.5"/>
        <path d="M 0 -6 L 2 0 L 0 6 L -2 0 Z" fill={style.label}/>
        <text x="0" y="-8" fontSize="4.5" fontFamily="ui-sans-serif" textAnchor="middle" fill={style.label} fontWeight="700">N</text>
      </g>
    </svg>
  );
}

Object.assign(window, { LithuaniaMap, MAP_STYLES });
