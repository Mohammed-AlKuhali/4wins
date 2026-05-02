import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { Text } from '../Text';
import { useTheme } from '../../theme';
import { useReduceMotion } from '../../lib/reduce_motion';

interface Props {
  dayId: string;
}

export function DayCompleteOverlay({ dayId }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const SHOWN_KEY = `dayClosedShown_${dayId}`;

  useEffect(() => {
    SecureStore.getItemAsync(SHOWN_KEY).then((v) => {
      if (!v) setVisible(true);
    });
  }, [dayId]);

  useEffect(() => {
    if (!visible) return;

    if (reduceMotion) {
      opacity.setValue(1);
      textOpacity.setValue(1);
      return;
    }

    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    const hapticTimer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 800);

    const textTimer = setTimeout(() => {
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 1200);

    return () => {
      clearTimeout(hapticTimer);
      clearTimeout(textTimer);
    };
  }, [visible, reduceMotion]);

  async function dismiss() {
    await SecureStore.setItemAsync(SHOWN_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <Pressable style={[styles.overlay, { backgroundColor: colors.bg + 'F2' }]} onPress={dismiss}>
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text variant="display">Closed.</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
