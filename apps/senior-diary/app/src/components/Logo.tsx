import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';
import type { ColorTokens } from '@/theme/colors';

/**
 * 하루담 로고타입 — 명조(고운바탕) 워드마크(BRAND §4-3: 산스 로고 금지).
 * 크기·색은 토큰. 심볼(그릇+해)은 앱 아이콘/스플래시가 담당하고, 인앱 워드마크는 이 컴포넌트.
 */
export function Logo({
  size = 'md',
  color = 'primary',
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: keyof ColorTokens;
}) {
  const { colors } = useTheme();
  const fontSize = size === 'lg' ? 40 : size === 'sm' ? 22 : 28;
  return (
    <View style={styles.wrap}>
      <AppText
        token="headlineLg"
        color={color}
        style={{ fontSize, letterSpacing: -0.5, color: colors[color] }}
        accessibilityRole="header"
      >
        하루담
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { alignItems: 'center' } });
