// ui.jsx — Shared UI primitives for the fishing app
// Theme tokens + small helper components used across all screens.

const THEMES = {
  nature: {
    name: 'Nature',
    bg: '#f4f2ea',
    surface: '#fbfaf4',
    surfaceAlt: '#ede9d9',
    ink: '#1f2619',
    inkMuted: '#5a6550',
    inkSubtle: '#8a9378',
    divider: 'rgba(30,40,20,.09)',
    accent: '#4a7048',         // moss green
    accentInk: '#ffffff',
    success: '#3d7a4a',
    successSoft: '#dfecd6',
    danger: '#b54842',
    dangerSoft: '#f3d6d0',
    warning: '#c98a2e',
    warningSoft: '#f5e4c1',
    card: '#ffffff',
    cardBorder: 'rgba(30,40,20,.08)',
    shadow: '0 1px 2px rgba(30,40,20,.04), 0 4px 14px rgba(30,40,20,.05)',
  },
  light: {
    name: 'Light',
    bg: '#f6f6f6',
    surface: '#ffffff',
    surfaceAlt: '#eeeeee',
    ink: '#121212',
    inkMuted: '#555',
    inkSubtle: '#8a8a8a',
    divider: 'rgba(0,0,0,.08)',
    accent: '#2c6ecb',
    accentInk: '#ffffff',
    success: '#1f8a4c',
    successSoft: '#d7ecd9',
    danger: '#c43c38',
    dangerSoft: '#f3d1cf',
    warning: '#c78b00',
    warningSoft: '#f7e4b8',
    card: '#ffffff',
    cardBorder: 'rgba(0,0,0,.08)',
    shadow: '0 1px 2px rgba(0,0,0,.04), 0 4px 14px rgba(0,0,0,.05)',
  },
  dark: {
    name: 'Dark',
    bg: '#121513',
    surface: '#1b1f1c',
    surfaceAlt: '#262b27',
    ink: '#e9ebe3',
    inkMuted: '#9ca89a',
    inkSubtle: '#6d776c',
    divider: 'rgba(255,255,255,.08)',
    accent: '#7fa87d',
    accentInk: '#0f120e',
    success: '#7fa87d',
    successSoft: 'rgba(127,168,125,.18)',
    danger: '#d77a72',
    dangerSoft: 'rgba(215,122,114,.18)',
    warning: '#e0ab5b',
    warningSoft: 'rgba(224,171,91,.18)',
    card: '#1f2420',
    cardBorder: 'rgba(255,255,255,.06)',
    shadow: '0 1px 2px rgba(0,0,0,.3), 0 4px 14px rgba(0,0,0,.35)',
  },
  marine: {
    name: 'Marine',
    bg: '#eef3f3',
    surface: '#ffffff',
    surfaceAlt: '#dfe8e8',
    ink: '#152126',
    inkMuted: '#4a6269',
    inkSubtle: '#7e9299',
    divider: 'rgba(20,40,50,.09)',
    accent: '#2b6780',
    accentInk: '#ffffff',
    success: '#2e7d7a',
    successSoft: '#d3e7e6',
    danger: '#b33d45',
    dangerSoft: '#f0d3d5',
    warning: '#c78b00',
    warningSoft: '#f4e2b5',
    card: '#ffffff',
    cardBorder: 'rgba(20,40,50,.09)',
    shadow: '0 1px 2px rgba(0,40,50,.05), 0 4px 14px rgba(0,40,50,.05)',
  },
};

// Format date as DD MMM (e.g. "24 Apr")
function fmtDate(date, lang = 'lt') {
  const months = lang === 'lt'
    ? ['saus.','vas.','kov.','bal.','geg.','birž.','liep.','rugp.','rugs.','spal.','lapkr.','gruod.']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function fmtFullDate(date, lang = 'lt') {
  const months = lang === 'lt'
    ? ['sausio','vasario','kovo','balandžio','gegužės','birželio','liepos','rugpjūčio','rugsėjo','spalio','lapkričio','gruodžio']
    : ['January','February','March','April','May','June','July','August','September','October','November','December'];
  if (lang === 'lt') return `${date.getFullYear()} ${months[date.getMonth()]} ${date.getDate()} d.`;
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Status chip — the core "can I fish?" signal, used across screens
function StatusChip({ status, t, theme, size = 'md' }) {
  const pad = size === 'sm' ? '3px 8px' : size === 'lg' ? '8px 14px' : '5px 10px';
  const fs = size === 'sm' ? 11 : size === 'lg' ? 14 : 12;
  const config = {
    open:    { bg: theme.successSoft, fg: theme.success, label: t.canFish,    dot: theme.success },
    closed:  { bg: theme.dangerSoft,  fg: theme.danger,  label: t.cannotFish, dot: theme.danger },
    partial: { bg: theme.warningSoft, fg: theme.warning, label: t.partial,    dot: theme.warning },
  }[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: config.bg, color: config.fg,
      padding: pad, borderRadius: 999, fontSize: fs, fontWeight: 600, lineHeight: 1.2,
      letterSpacing: '-0.01em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: config.dot, flexShrink: 0 }}/>
      {config.label}
    </span>
  );
}

// Fish silhouette — stylized SVG based on shape type
function FishIcon({ species, size = 40, theme, style = {} }) {
  const color = species.color || theme.inkMuted;
  const shape = species.shape || 'medium';
  // Three silhouette variants: long (pike/catfish), medium (perch/roach), round (bream/tench)
  let path;
  if (shape === 'long') {
    path = 'M 5 12 Q 15 6, 45 6 Q 70 6, 82 10 L 92 4 L 92 20 L 82 14 Q 70 18, 45 18 Q 15 18, 5 12 Z';
  } else if (shape === 'round') {
    path = 'M 10 12 Q 20 3, 45 3 Q 68 3, 80 10 L 92 3 L 92 21 L 80 14 Q 68 21, 45 21 Q 20 21, 10 12 Z';
  } else {
    path = 'M 8 12 Q 18 5, 45 5 Q 68 5, 80 10 L 92 4 L 92 20 L 80 14 Q 68 19, 45 19 Q 18 19, 8 12 Z';
  }
  return (
    <svg width={size * 1.8} height={size * 0.75} viewBox="0 0 100 24" style={style}>
      <path d={path} fill={color} opacity="0.92"/>
      <circle cx={shape === 'long' ? 78 : 72} cy="10" r="1.3" fill="white"/>
      {/* fins */}
      <path d="M 45 4 L 52 0 L 55 5 Z" fill={color} opacity="0.7"/>
      <path d="M 45 20 L 52 24 L 55 19 Z" fill={color} opacity="0.7"/>
    </svg>
  );
}

// Simple divider line
function Divider({ theme, margin = 0 }) {
  return <div style={{ height: 0.5, background: theme.divider, margin }}/>;
}

// Small icon atoms (inline SVG — monochrome, stroke-based)
const Ico = {
  map: (c='currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2Z"/><path d="M9 3v16M15 5v16"/></svg>,
  bookmark: (c='currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  bookmarkFill: (c='currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="1.5" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  book: (c='currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 8h16M8 4v16"/></svg>,
  more: (c='currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>,
  search: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  check: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>,
  x: (c='currentColor') => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  chevron: (c='currentColor') => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>,
  chevronDown: (c='currentColor') => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>,
  back: (c='currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>,
  plus: (c='currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  share: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/></svg>,
  ruler: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l5-5 13 13-5 5z"/><path d="M7 7l2 2M10 4l3 3M13 10l2 2M16 7l3 3"/></svg>,
  weight: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h16l-2 11H6z"/><circle cx="12" cy="6" r="2"/></svg>,
  thermo: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 14V4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0z"/></svg>,
  wind: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h12a3 3 0 1 0-3-3M3 12h17M3 16h11a3 3 0 1 1-3 3"/></svg>,
  calendar: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  location: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11a8 8 0 1 1-16 0c0-4.4 3.6-8 8-8s8 3.6 8 8z"/><circle cx="12" cy="11" r="3"/></svg>,
  layers: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2 8l10 5 10-5z"/><path d="M2 13l10 5 10-5M2 18l10 5 10-5"/></svg>,
  camera: (c='currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="3.5"/></svg>,
};

Object.assign(window, { THEMES, StatusChip, FishIcon, Divider, Ico, fmtDate, fmtFullDate });
