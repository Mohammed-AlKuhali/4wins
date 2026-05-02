import React, { useMemo, useCallback } from 'react';
import { Pressable, View, AccessibilityInfo } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { palette } from '../../theme/colors';
import { motion } from '../../theme/motion';
import { computeArcPaths, strokeWidth } from './arc';
import type { QuadProps, PillarKey, PillarState } from './types';

const PILLAR_ORDER: PillarKey[] = ['mental', 'financial', 'spiritual', 'physical'];

const PILLAR_LABELS: Record<PillarKey, string> = {
  mental: 'Mental',
  financial: 'Financial',
  spiritual: 'Spiritual',
  physical: 'Physical',
};

const STATE_LABELS: Record<PillarState, string> = {
  empty: 'not logged',
  in_progress: 'in progress',
  complete: 'complete',
};

function buildAccessibilityLabel(state: QuadProps['state']): string {
  return (
    'Quad. ' +
    PILLAR_ORDER.map(p => `${PILLAR_LABELS[p]}: ${STATE_LABELS[state[p]]}`).join('. ') +
    '.'
  );
}

export function Quad({ size = 280, state, isRestDay = false, onArcPress, closingAnimation = false }: QuadProps) {
  const arcs = useMemo(() => computeArcPaths(size), [size]);
  const sw = strokeWidth(size);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  React.useEffect(() => {
    if (closingAnimation) {
      scale.value = withSequence(
        withSpring(0.98, motion.ritual),
        withSpring(1.0, { ...motion.ritual, damping: 20 }),
      );
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 800);
    }
  }, [closingAnimation]);

  const getArcProps = useCallback((pillar: PillarKey) => {
    const s = state[pillar];
    const color = palette.pillars[pillar];
    if (isRestDay) {
      return { stroke: color, strokeWidth: sw * 0.5, fill: 'none', strokeDasharray: `${sw * 2} ${sw * 2}`, opacity: 0.6 };
    }
    if (s === 'empty') {
      return { stroke: color, strokeWidth: sw, fill: 'none', opacity: 0.4 };
    }
    if (s === 'in_progress') {
      return { stroke: color, strokeWidth: sw, fill: 'none', opacity: 1 };
    }
    return { stroke: color, strokeWidth: sw * 1.5, fill: 'none', opacity: 1 };
  }, [state, isRestDay, sw]);

  const a11yLabel = buildAccessibilityLabel(state);

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <View
        accessibilityLabel={a11yLabel}
        accessibilityRole="none"
      >
        <Svg width={size} height={size}>
          <G>
            {PILLAR_ORDER.map((pillar) => {
              const geo = arcs[pillar];
              const props = getArcProps(pillar);
              const stateLabel = `${PILLAR_LABELS[pillar]}, ${STATE_LABELS[state[pillar]]}`;

              if (onArcPress) {
                return (
                  <G key={pillar}>
                    <Path
                      d={geo.path}
                      strokeLinecap="round"
                      {...props}
                      accessibilityLabel={stateLabel}
                      accessibilityRole="button"
                      onPress={() => onArcPress(pillar)}
                    />
                  </G>
                );
              }

              return (
                <Path
                  key={pillar}
                  d={geo.path}
                  strokeLinecap="round"
                  {...props}
                />
              );
            })}
          </G>
        </Svg>
      </View>
    </Animated.View>
  );
}

export default Quad;
