import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <Stack.Screen name="voice" />
      <Stack.Screen name="paywall" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
