import React, { createContext, useState, useEffect, useCallback } from 'react';
import { palette, ColorMode } from './colors';
import { type } from './typography';
import { motion } from './motion';
import { spacing } from './spacing';

export type AppearanceOverride = 'auto' | 'dark' | 'light';

interface ThemeContextValue {
  mode: ColorMode;
  colors: typeof palette.dark;
  type: typeof type;
  motion: typeof motion;
  spacing: typeof spacing;
  appearanceOverride: AppearanceOverride;
  setAppearanceOverride: (v: AppearanceOverride) => void;
}

function getTimeBasedMode(): ColorMode {
  const h = new Date().getHours();
  return h < 6 || h >= 18 ? 'dark' : 'light';
}

function resolveMode(override: AppearanceOverride): ColorMode {
  if (override === 'dark') return 'dark';
  if (override === 'light') return 'light';
  return getTimeBasedMode();
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children, initialOverride = 'auto' }: {
  children: React.ReactNode;
  initialOverride?: AppearanceOverride;
}) {
  const [override, setOverride] = useState<AppearanceOverride>(initialOverride);
  const [mode, setMode] = useState<ColorMode>(() => resolveMode(initialOverride));

  useEffect(() => {
    setMode(resolveMode(override));
    if (override !== 'auto') return;
    const interval = setInterval(() => {
      setMode(getTimeBasedMode());
    }, 60_000);
    return () => clearInterval(interval);
  }, [override]);

  const setAppearanceOverride = useCallback((v: AppearanceOverride) => {
    setOverride(v);
    setMode(resolveMode(v));
  }, []);

  const value: ThemeContextValue = {
    mode,
    colors: palette[mode],
    type,
    motion,
    spacing,
    appearanceOverride: override,
    setAppearanceOverride,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
