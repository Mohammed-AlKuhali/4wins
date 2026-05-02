import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 500,
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="pillar/[pillar]" />
      <Stack.Screen name="history" />
      <Stack.Screen name="history/[date]" />
      <Stack.Screen name="weekly/[isoWeek]" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="settings/tradition" />
      <Stack.Screen name="settings/cue" />
      <Stack.Screen name="settings/identity" />
      <Stack.Screen name="settings/custom-tradition" />
    </Stack>
  );
}
