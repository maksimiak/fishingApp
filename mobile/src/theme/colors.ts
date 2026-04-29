export interface Theme {
  bg: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  divider: string;
  accent: string;
  accentInk: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  card: string;
  cardBorder: string;
}

export const NATURE: Theme = {
  bg: '#f4f2ea',
  surface: '#fbfaf4',
  surfaceAlt: '#ede9d9',
  ink: '#1f2619',
  inkMuted: '#5a6550',
  inkSubtle: '#8a9378',
  divider: 'rgba(30,40,20,0.09)',
  accent: '#4a7048',
  accentInk: '#ffffff',
  success: '#3d7a4a',
  successSoft: '#dfecd6',
  danger: '#b54842',
  dangerSoft: '#f3d6d0',
  warning: '#c98a2e',
  warningSoft: '#f5e4c1',
  card: '#ffffff',
  cardBorder: 'rgba(30,40,20,0.08)',
};

export const theme = NATURE;
