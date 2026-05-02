import { Stack } from 'expo-router';
import { OnboardingProvider } from '../../lib/onboarding_context';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
        <Stack.Screen name="pillars" options={{ gestureEnabled: false }} />
        <Stack.Screen name="tradition" options={{ gestureEnabled: false }} />
        <Stack.Screen name="identity" />
        <Stack.Screen name="cue" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="day-zero" options={{ gestureEnabled: false }} />
        <Stack.Screen name="first-close" options={{ gestureEnabled: false }} />
      </Stack>
    </OnboardingProvider>
  );
}
