import { useEffect, useState } from 'react';
import { useStreak } from './useStreak';
import { hasPaywallBeenShown } from '../lib/paywall_state';

export function useShouldShowPaywall(subscriptionStatus: string | undefined): boolean {
  const { data: streak } = useStreak();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    async function check() {
      if (subscriptionStatus && subscriptionStatus !== 'free') return;
      if (!streak || streak.totalDaysComplete < 30) return;
      const shown = await hasPaywallBeenShown();
      if (!shown) setShouldShow(true);
    }
    check();
  }, [streak, subscriptionStatus]);

  return shouldShow;
}
