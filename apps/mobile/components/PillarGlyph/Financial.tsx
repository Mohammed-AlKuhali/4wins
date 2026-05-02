import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  variant?: 'outlined' | 'filled';
}

export function Financial({ size = 24, color = 'currentColor', variant = 'outlined' }: Props) {
  const sw = (size / 24) * 1.5;
  const scale = size / 24;
  const outerInset = (24 - 16) / 2 * scale;
  const outerSize = 16 * scale;
  const innerInset = (24 - 8) / 2 * scale;
  const innerSize = 8 * scale;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel="Financial">
      <Rect
        x={outerInset}
        y={outerInset}
        width={outerSize}
        height={outerSize}
        stroke={color}
        strokeWidth={sw}
        fill="none"
      />
      <Rect
        x={innerInset}
        y={innerInset}
        width={innerSize}
        height={innerSize}
        stroke={variant === 'outlined' ? color : 'none'}
        strokeWidth={sw}
        fill={variant === 'filled' ? color : 'none'}
      />
    </Svg>
  );
}
