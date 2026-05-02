import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  variant?: 'outlined' | 'filled';
}

export function Physical({ size = 24, color = 'currentColor', variant = 'outlined' }: Props) {
  const sw = (size / 24) * 1.5;
  const scale = size / 24;

  if (variant === 'filled') {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel="Physical">
        <Rect
          x={4 * scale}
          y={14 * scale}
          width={16 * scale}
          height={6 * scale}
          rx={2 * scale}
          fill={color}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel="Physical">
      <Rect
        x={6 * scale}
        y={14 * scale}
        width={12 * scale}
        height={2 * scale}
        rx={sw}
        fill={color}
      />
      <Rect
        x={4 * scale}
        y={18 * scale}
        width={16 * scale}
        height={2 * scale}
        rx={sw}
        fill={color}
      />
    </Svg>
  );
}
