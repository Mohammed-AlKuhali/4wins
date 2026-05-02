import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface CenteredPageProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
}

export function CenteredPage({ children, footer, scrollable = false }: CenteredPageProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const content = (
    <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: 0 }]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {footer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
          {footer}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  scrollContent: { flexGrow: 1 },
  footer: { paddingHorizontal: 24, paddingTop: 16 },
});
