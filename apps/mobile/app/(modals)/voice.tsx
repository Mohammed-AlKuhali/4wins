import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from '../../components/Text';
import { useTheme } from '../../theme';
import { requestMicPermission, startRecording, stopRecording } from '../../lib/audio_recorder';
import { apiFetch, apiJson } from '../../lib/api';
import { Audio } from 'expo-av';

const MAX_DURATION_MS = 60_000;

type ScreenState = 'recording' | 'processing' | 'review';

export default function VoiceModal() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<ScreenState>('recording');
  const [transcript, setTranscript] = useState('');
  const [metering, setMetering] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseAnim = useSharedValue(1);

  const wavePulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: 0.6 + metering * 0.4,
  }));

  useEffect(() => {
    startSession();
    return () => { if (maxTimer.current) clearTimeout(maxTimer.current); };
  }, []);

  async function startSession() {
    const granted = await requestMicPermission();
    if (!granted) {
      Alert.alert('', 'Microphone access is off. Enable it in Settings to use voice.');
      router.back();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pulseAnim.value = withRepeat(withTiming(1.08, { duration: 800 }), -1, true);

    const recording = await startRecording((status) => {
      if (status.metering !== undefined) {
        const normalized = Math.min(1, Math.max(0, (status.metering + 60) / 60));
        setMetering(normalized);
      }
    });

    recordingRef.current = recording;

    maxTimer.current = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      handleStop();
    }, MAX_DURATION_MS);
  }

  async function handleStop() {
    if (!recordingRef.current) return;
    if (maxTimer.current) clearTimeout(maxTimer.current);
    pulseAnim.value = withTiming(1, { duration: 200 });

    setState('processing');
    const uri = await stopRecording(recordingRef.current);
    recordingRef.current = null;

    if (!uri) {
      Alert.alert('', "We didn't catch that. Try again, or type.");
      router.back();
      return;
    }

    try {
      const formData = new FormData();
      formData.append('audio', { uri, name: 'audio.m4a', type: 'audio/m4a' } as unknown as Blob);

      const res = await apiFetch('/v1/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      if (!res.ok) throw new Error('transcription failed');
      const data = await res.json() as { text: string };
      setTranscript(data.text);
      setState('review');
    } catch {
      Alert.alert('', "We didn't catch that. Try again, or type.");
      router.back();
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
      <Pressable style={styles.close} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Cancel">
        <Text variant="caption" color={colors.textSecondary}>Cancel</Text>
      </Pressable>

      {state === 'recording' && (
        <View style={styles.content}>
          <Animated.View style={[styles.waveRing, { borderColor: '#A04428' }, wavePulse]} />
          <Text variant="caption" color={colors.textSecondary}>Recording...</Text>
          <Pressable
            style={[styles.stopButton, { backgroundColor: '#A04428' }]}
            onPress={handleStop}
            accessibilityRole="button"
            accessibilityLabel="Stop recording"
          >
            <Text variant="bodyEmphasis" color="#FAF7F2">Stop</Text>
          </Pressable>
        </View>
      )}

      {state === 'processing' && (
        <View style={styles.content}>
          <Text variant="body" color={colors.textSecondary}>Processing...</Text>
        </View>
      )}

      {state === 'review' && (
        <View style={styles.reviewContent}>
          <Text variant="body" style={styles.transcript}>{transcript}</Text>
          <View style={styles.reviewActions}>
            <Pressable
              style={[styles.reviewBtn, { backgroundColor: colors.text }]}
              onPress={() => { router.back(); }}
              accessibilityRole="button"
              accessibilityLabel="Save"
            >
              <Text variant="bodyEmphasis" color={colors.bg}>Save</Text>
            </Pressable>
            <Pressable
              style={[styles.reviewBtn, { borderColor: colors.hairline, borderWidth: 1 }]}
              onPress={() => { setState('recording'); setTranscript(''); startSession(); }}
              accessibilityRole="button"
              accessibilityLabel="Re-record"
            >
              <Text variant="body">Re-record</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  close: { alignSelf: 'flex-end', padding: 8 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 },
  waveRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 2 },
  stopButton: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  reviewContent: { flex: 1, gap: 24, paddingTop: 32 },
  transcript: { flex: 1 },
  reviewActions: { gap: 12 },
  reviewBtn: { height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
