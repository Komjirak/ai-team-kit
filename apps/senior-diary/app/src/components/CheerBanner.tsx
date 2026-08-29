import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * 응원 도착 배너(P1 상태) — 알약형 pill. 💛 + 자녀가 보낸 문구 그대로.
 * 색만으로 상태를 구분하지 않도록 항상 하트 + 문구 동반(§9-5 색 의존 금지).
 */
export function CheerBanner({ message }: { message: string }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`응원 도착: ${message}`}
      style={[
        styles.pill,
        {
          borderRadius: radius.full,
          borderColor: colors.outlineVariant,
          backgroundColor: colors.surfaceContainerLow,
          paddingVertical: 12,
          paddingHorizontal: spacing.gutterBlock,
          gap: 8,
        },
      ]}
    >
      <AppText token="labelMd" color="onSurface" style={styles.emoji}>
        💛
      </AppText>
      <AppText token="labelMd" color="onSurface">
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignSelf: 'center',
  },
  emoji: { fontSize: 20 },
});
