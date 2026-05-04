export interface Theme {
  // Backgrounds
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  
  // Text
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  
  // Borders & Dividers
  divider: string;
  border: string;
  borderLight: string;
  
  // Primary (Water Blue)
  accent: string;
  accentLight: string;
  accentDark: string;
  accentInk: string;
  accentSoft: string;
  
  // Status Colors
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  spawning: string;
  spawningSoft: string;
  
  // Cards
  card: string;
  cardBorder: string;
  
  // Tab Bar
  tabBar: string;
  tabBarBorder: string;
  tabInactive: string;
}

export const FRESH_BLUE: Theme = {
  // Backgrounds - Clean slate tints
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceAlt: '#f1f5f9',
  surfaceElevated: '#ffffff',
  
  // Text - Strong contrast
  ink: '#0f172a',
  inkMuted: '#64748b',
  inkSubtle: '#94a3b8',
  
  // Borders & Dividers
  divider: 'rgba(15, 23, 42, 0.06)',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  
  // Primary - Water Blue
  accent: '#2563eb',
  accentLight: '#3b82f6',
  accentDark: '#1d4ed8',
  accentInk: '#ffffff',
  accentSoft: '#dbeafe',
  
  // Status Colors
  success: '#22c55e',
  successSoft: '#dcfce7',
  danger: '#ef4444',
  dangerSoft: '#fee2e2',
  warning: '#f59e0b',
  warningSoft: '#fef3c7',
  spawning: '#f97316',
  spawningSoft: '#ffedd5',
  
  // Cards - Clean white with subtle border
  card: '#ffffff',
  cardBorder: 'rgba(15, 23, 42, 0.08)',
  
  // Tab Bar - Frosted glass effect base
  tabBar: 'rgba(255, 255, 255, 0.85)',
  tabBarBorder: 'rgba(15, 23, 42, 0.06)',
  tabInactive: '#94a3b8',
};

// Keep legacy export for backwards compatibility
export const NATURE = FRESH_BLUE;

export const theme = FRESH_BLUE;
