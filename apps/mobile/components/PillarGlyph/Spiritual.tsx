import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  variant?: 'outlined' | 'filled';
}

export function Spiritual({ size = 24, color = 'currentColor', variant = 'outlined' }: Props) {
  const sw = (size / 24) * 1.5;
  const scale = size / 24;
  const r = 8 * scale;
  const cx = size / 2;
  const cy = size / 2;

  if (variant === 'outlined') {
    const startX = cx - r;
    const endX = cx + r;
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel="Spiritual">
        <Path
          d={`M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel="Spiritual">
      <Circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={sw} fill="none" />
    </Svg>
  );
}
