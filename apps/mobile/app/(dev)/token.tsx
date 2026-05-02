import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Text } from '../../components/Text';
import { getAccessToken, getRefreshToken } from '../../lib/auth_state';
import { useTheme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

export default function DevTokenScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [access, setAccess] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<string | null>(null);

  useEffect(() => {
    getAccessToken().then(setAccess);
    getRefreshToken().then(setRefresh);
  }, []);

  async function copyToken(t: string | null) {
    if (!t) return;
    await Clipboard.setStringAsync(t);
    Alert.alert('Copied!', t.slice(0, 30) + '...');
  }

  if (!__DEV__) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <Text variant="headline">Dev: Tokens</Text>
      <Pressable onPress={() => copyToken(access)} style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text variant="caption" color={colors.textSecondary}>Access Token</Text>
        <Text variant="caption" numberOfLines={2}>{access ?? 'none'}</Text>
      </Pressable>
      <Pressable onPress={() => copyToken(refresh)} style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text variant="caption" color={colors.textSecondary}>Refresh Token</Text>
        <Text variant="caption" numberOfLines={2}>{refresh ?? 'none'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  card: { borderRadius: 8, padding: 16, gap: 8 },
});
