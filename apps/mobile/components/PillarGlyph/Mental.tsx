import React from 'react';
import Svg, { Rect, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  variant?: 'outlined' | 'filled';
}

export function Mental({ size = 24, color = 'currentColor', variant = 'outlined' }: Props) {
  const sw = (size / 24) * 1.5;
  const scale = size / 24;
  const inset = (24 - 16) / 2 * scale;
  const boxSize = 16 * scale;

  if (variant === 'outlined') {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel="Mental">
        <Rect
          x={inset}
          y={inset}
          width={boxSize}
          height={boxSize}
          stroke={color}
          strokeWidth={sw}
          fill="none"
        />
        <Circle cx={size / 2} cy={size / 2} r={sw} fill={color} />
      </Svg>
    );
  }

  const innerSize = 4 * scale;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel="Mental">
      <Rect
        x={inset}
        y={inset}
        width={boxSize}
        height={boxSize}
        stroke={color}
        strokeWidth={sw}
        fill="none"
      />
      <Rect
        x={size / 2 - innerSize / 2}
        y={size / 2 - innerSize / 2}
        width={innerSize}
        height={innerSize}
        fill={color}
      />
    </Svg>
  );
}
