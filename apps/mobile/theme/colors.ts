export const palette = {
  dark: {
    bg: '#0E0E0C',
    surface: '#15140F',
    text: '#FAF7F2',
    textSecondary: '#A29F9A',
    textTertiary: '#6B6864',
    hairline: '#2A2826',
  },
  light: {
    bg: '#FAF7F2',
    surface: '#F2EEE5',
    text: '#0E0E0C',
    textSecondary: '#6B6864',
    textTertiary: '#A29F9A',
    hairline: '#E8E3DC',
  },
  pillars: {
    mental: '#2E4156',
    financial: '#7C5F26',
    spiritual: '#B8A47E',
    physical: '#A04428',
  },
} as const;

export type ColorMode = 'dark' | 'light';
export type PillarKey = keyof typeof palette.pillars;
