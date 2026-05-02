import { FONT_FAMILY } from '../lib/fonts';

export const type = {
  display: {
    family: FONT_FAMILY.frauncesLight,
    weight: '300' as const,
    size: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  headline: {
    family: FONT_FAMILY.frauncesRegular,
    weight: '400' as const,
    size: 28,
    lineHeight: 36,
  },
  title: {
    family: FONT_FAMILY.frauncesRegular,
    weight: '400' as const,
    size: 22,
    lineHeight: 28,
  },
  body: {
    family: FONT_FAMILY.plexSans,
    weight: '400' as const,
    size: 17,
    lineHeight: 24,
  },
  bodyEmphasis: {
    family: FONT_FAMILY.plexSansMedium,
    weight: '500' as const,
    size: 17,
    lineHeight: 24,
  },
  caption: {
    family: FONT_FAMILY.plexSans,
    weight: '400' as const,
    size: 13,
    lineHeight: 18,
  },
  numericLarge: {
    family: FONT_FAMILY.plexMono,
    weight: '400' as const,
    size: 32,
    lineHeight: 36,
  },
  numericInline: {
    family: FONT_FAMILY.plexMono,
    weight: '400' as const,
    size: 17,
    lineHeight: 24,
  },
} as const;

export type TypeVariant = keyof typeof type;
