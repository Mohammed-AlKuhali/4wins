import React, { createContext, useContext, useState, useCallback } from 'react';

export type Tradition = 'christian' | 'stoic' | 'buddhist' | 'secular' | 'custom';
export type CueTimeOfDay = 'morning' | 'evening' | 'before_bed' | 'custom';

export interface OnboardingState {
  tradition: Tradition | null;
  customTraditionText: string | null;
  identityStatement: string | null;
  cueLabel: string | null;
  cueTimeOfDay: CueTimeOfDay | null;
  cueTimeLocal: string | null;
  notificationsPref: 0 | 1 | 2;
  dayZeroPillarIndex: number;
  dayZeroComplete: boolean;
}

interface OnboardingContextValue {
  state: OnboardingState;
  setTradition: (t: Tradition, custom?: string) => void;
  setIdentity: (s: string) => void;
  setCue: (label: string, tod: CueTimeOfDay, time?: string) => void;
  setNotifications: (pref: 0 | 1 | 2) => void;
  advancePillar: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    tradition: null,
    customTraditionText: null,
    identityStatement: null,
    cueLabel: null,
    cueTimeOfDay: null,
    cueTimeLocal: null,
    notificationsPref: 1,
    dayZeroPillarIndex: 0,
    dayZeroComplete: false,
  });

  const setTradition = useCallback((t: Tradition, custom?: string) => {
    setState((s) => ({ ...s, tradition: t, customTraditionText: custom ?? null }));
  }, []);

  const setIdentity = useCallback((identity: string) => {
    setState((s) => ({ ...s, identityStatement: identity }));
  }, []);

  const setCue = useCallback((label: string, tod: CueTimeOfDay, time?: string) => {
    setState((s) => ({ ...s, cueLabel: label, cueTimeOfDay: tod, cueTimeLocal: time ?? null }));
  }, []);

  const setNotifications = useCallback((pref: 0 | 1 | 2) => {
    setState((s) => ({ ...s, notificationsPref: pref }));
  }, []);

  const advancePillar = useCallback(() => {
    setState((s) => ({ ...s, dayZeroPillarIndex: s.dayZeroPillarIndex + 1 }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((s) => ({ ...s, dayZeroComplete: true }));
  }, []);

  return (
    <OnboardingContext.Provider value={{ state, setTradition, setIdentity, setCue, setNotifications, advancePillar, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
