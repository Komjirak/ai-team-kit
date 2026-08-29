import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';
import { colorsFor, type ColorTokens, type ColorScheme } from './colors';
import { spacing, radius } from './tokens';

export type Theme = {
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  fontsLoaded: boolean;
  /** OS "동작 줄이기" 설정. 장식·숨쉬는 모션은 이 값이 true면 정적으로 대체(§9-5). */
  reduceMotion: boolean;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({
  fontsLoaded,
  children,
}: {
  fontsLoaded: boolean;
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) =>
      setReduceMotion(v),
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const value = useMemo<Theme>(
    () => ({ scheme, colors: colorsFor(scheme), spacing, radius, fontsLoaded, reduceMotion }),
    [scheme, fontsLoaded, reduceMotion],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme는 ThemeProvider 안에서만 쓸 수 있어요.');
  return ctx;
}
