// "Emerald & Mint Angler" design system tokens.
export interface Theme {
  // Canvas
  bg: string;           // #f3f4f1 screen canvas
  surface: string;      // #f3f4f1 (same layer as bg)
  surfaceAlt: string;   // #e8eae5 inset / sage — thumb backplates, chip resting, map land

  // Text
  ink: string;          // #191c1b primary text
  inkMuted: string;     // #414845 secondary text, labels (on-surface-variant)
  inkTertiary: string;  // #4a5850 latin names, mono meta
  inkSubtle: string;    // #7c8c83 placeholder, search lens, outline icons
  outline: string;      // #717975 inactive tabs, chevrons

  // Brand — primary = deep forest green
  primary: string;      // #0f382c CTAs, active pills, dark heroes
  primaryLabel: string; // #79a292 eyebrows / labels on dark primary bg
  primaryFixed: string; // #c1ecda body copy on dark, water fill

  // Accent green stats (on dark backgrounds)
  statGreen: string;    // #4ade80 big open-count stats on dark
  statMint: string;     // #6cf8bb depth ramp upper band

  // Semantic status
  open: string;         // #059669
  openBg: string;       // #d1fae5
  warning: string;      // #d97706
  warningSoft: string;  // #fef3c7
  danger: string;       // #dc2626
  dangerSoft: string;   // #fee2e2

  // Surface + border
  card: string;         // #ffffff cards, inputs, docks
  cardBorder: string;   // rgba(15,56,44,.08)
  divider: string;      // rgba(15,56,44,.08)

  // Legacy aliases kept for components that haven't been restyled yet
  accent: string;       // = primary
  accentInk: string;    // #ffffff
  success: string;      // = open
  successSoft: string;  // = openBg
  secondaryDeep: string;// #006c49 deep links, depth ramp darkest band
}

export const NATURE: Theme = {
  // Canvas
  bg: '#f3f4f1',
  surface: '#f3f4f1',
  surfaceAlt: '#e8eae5',

  // Text
  ink: '#191c1b',
  inkMuted: '#414845',
  inkTertiary: '#4a5850',
  inkSubtle: '#7c8c83',
  outline: '#717975',

  // Brand
  primary: '#0f382c',
  primaryLabel: '#79a292',
  primaryFixed: '#c1ecda',

  // Accent stats
  statGreen: '#4ade80',
  statMint: '#6cf8bb',

  // Status
  open: '#059669',
  openBg: '#d1fae5',
  warning: '#d97706',
  warningSoft: '#fef3c7',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',

  // Surface + border
  card: '#ffffff',
  cardBorder: 'rgba(15,56,44,0.08)',
  divider: 'rgba(15,56,44,0.08)',

  // Legacy aliases
  accent: '#0f382c',
  accentInk: '#ffffff',
  success: '#059669',
  successSoft: '#d1fae5',
  secondaryDeep: '#006c49',
};

export const theme = NATURE;

export const fonts = {
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  sansExtraBold: 'PlusJakartaSans_800ExtraBold',
  mono: 'JetBrainsMono_500Medium',
} as const;

// Elevation shadows (pre-composed for StyleSheet use)
export const shadows = {
  card: {
    shadowColor: '#0f382c',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#0f382c',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  stickyFooter: {
    shadowColor: '#0f382c',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 8,
  },
};
