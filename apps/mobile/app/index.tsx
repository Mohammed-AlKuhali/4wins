import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAccessToken } from '../lib/auth_state';

export default function Index() {
  const [checked, setChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    getAccessToken().then((t) => {
      setHasToken(!!t);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (hasToken) return <Redirect href="/(app)/home" />;
  return <Redirect href="/(onboarding)/welcome" />;
}
