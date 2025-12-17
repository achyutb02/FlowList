export const colors = {
  // Primary palette - Deep teal for calm productivity
  primary: '#0D9488',
  primaryLight: '#14B8A6',
  primaryDark: '#0F766E',
  
  // Accent - Warm amber for energy/action
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentDark: '#D97706',
  
  // Background - Dark mode for focus
  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  
  // Text
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Energy level colors
  energyLow: '#EF4444',      // Red - Low energy
  energyMedLow: '#F97316',   // Orange
  energyMedium: '#EAB308',   // Yellow - Medium
  energyMedHigh: '#84CC16',  // Lime
  energyHigh: '#22C55E',     // Green - High energy
  
  // Focus level colors
  focusLow: '#A78BFA',       // Light purple
  focusMedium: '#8B5CF6',    // Purple
  focusHigh: '#6D28D9',      // Deep purple
  
  // Border
  border: '#334155',
  borderLight: '#475569',
  
  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Helper function to get energy color
export const getEnergyColor = (level: number): string => {
  switch (level) {
    case 1: return colors.energyLow;
    case 2: return colors.energyMedLow;
    case 3: return colors.energyMedium;
    case 4: return colors.energyMedHigh;
    case 5: return colors.energyHigh;
    default: return colors.energyMedium;
  }
};

// Helper function to get focus color
export const getFocusColor = (level: number): string => {
  switch (level) {
    case 1:
    case 2: return colors.focusLow;
    case 3: return colors.focusMedium;
    case 4:
    case 5: return colors.focusHigh;
    default: return colors.focusMedium;
  }
};

