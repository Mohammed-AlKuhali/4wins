import React from 'react';
import { Mental } from './Mental';
import { Financial } from './Financial';
import { Spiritual } from './Spiritual';
import { Physical } from './Physical';

export type PillarGlyphKey = 'mental' | 'financial' | 'spiritual' | 'physical';
export type GlyphVariant = 'outlined' | 'filled';

interface PillarGlyphProps {
  pillar: PillarGlyphKey;
  variant?: GlyphVariant;
  size?: number;
  color?: string;
}

const COMPONENTS = {
  mental: Mental,
  financial: Financial,
  spiritual: Spiritual,
  physical: Physical,
} as const;

export function PillarGlyph({ pillar, variant = 'outlined', size = 24, color }: PillarGlyphProps) {
  const Component = COMPONENTS[pillar];
  return <Component size={size} variant={variant} color={color} />;
}

export default PillarGlyph;
